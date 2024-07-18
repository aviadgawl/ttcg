import {
    GameCard,
    GearCard,
    ClassCard,
    ChampionCard,
    isChampion,
    ActionCard,
    OrderCard,
    ValidationResult,
    BoardLocation,
    AllowedBoardLocationResponse,
    AllowedHandCardSelectResponse,
    OrderCardRequirement,
    PlayerActionLogRecord,
    StatusEffect,
    isOrder
} from './game-card';
import { calculateStats, setRepeatableActionActivations, getPlayer } from './champion';
import { Stats, GameStatus, PlayerActionsName, ChampionDirection, BodyPart, CardType } from './enums';

import { Game, } from './game';

export interface Player {
    name: string;
    deck: GameCard[];
    hand: GameCard[];
    usedCards: GameCard[];
    didDraw: boolean;
    summonsLeft: number;
    actionsLog: PlayerActionLogRecord[];
}

const isCardRequirementsValid = (orderCard: OrderCard, orderCardRequirements: OrderCardRequirement, card: GameCard): boolean => {
    if(card.guid === orderCard.guid) return false;

    switch (orderCardRequirements.cardType) {
        case CardType.OrderCard:
            return isOrder(card);
        default:
            return false
    }
}

const getValidCardsForDiscard = (player: Player, cards: GameCard[], orderCard: OrderCard): { cardToDiscard: GameCard[], amountToDiscard: number | undefined } => {
    const orderCardRequirements: OrderCardRequirement | undefined = orderCard.requirement.find(x => x.name === 'discard');
    
    if(cards.length === 0 && orderCardRequirements?.amount === -1) {
        cards = player.hand;
    }
    
    let cardAllowedToDiscard: GameCard[] = [];
    
    if (orderCardRequirements !== undefined) {
        const newCardAllowedToDiscard =
            cards.filter(card => isCardRequirementsValid(orderCard, orderCardRequirements, card));
        cardAllowedToDiscard = [...cardAllowedToDiscard, ...newCardAllowedToDiscard];
    }

    return { cardToDiscard: cardAllowedToDiscard, amountToDiscard: orderCardRequirements?.amount };
}

const getSummonBoardLocation = (game: Game, startingRow: number, endRow: number): BoardLocation[] => {
    let locations: BoardLocation[] = [];

    for (let rowIndex = startingRow; rowIndex < endRow; rowIndex++) {
        for (let columnIndex = 0; columnIndex < game.board[rowIndex].length; columnIndex++) {
            const boardLocation = game.board[rowIndex][columnIndex];

            if (boardLocation === null)
                locations.push({ rowIndex: rowIndex, columnIndex: columnIndex });
        }
    }

    return locations;
}

const getSummonBoardLocations = (game: Game): AllowedBoardLocationResponse => {
    let locations: BoardLocation[] = [];

    const player = getPlayer(game);

    if (player.summonsLeft === 0) return { message: 'Player used his all his summons', locations: locations };

    if (game.playerIndex === 0)
        locations = getSummonBoardLocation(game, game.board.length - 2, game.board.length);
    else if (game.playerIndex === 1)
        locations = getSummonBoardLocation(game, 0, 2);
    else
        return { message: `PlayerIndex: ${game.playerIndex} is not supported`, locations: locations };

    return { message: 'success', locations: locations };
}

const getValidChampionsBoardLocations = (game: Game, selectedCard: GameCard | null, predicate: Function): AllowedBoardLocationResponse => {
    const locations: BoardLocation[] = [];

    if (selectedCard !== null)
        for (let rowIndex = 0; rowIndex < game.board.length; rowIndex++) {
            for (let columnIndex = 0; columnIndex < game.board[rowIndex].length; columnIndex++) {
                const boardCell = game.board[rowIndex][columnIndex];

                if (isChampion(boardCell) && boardCell.playerIndex === game.playerIndex && predicate(boardCell, selectedCard).isValid)
                    locations.push({ rowIndex: rowIndex, columnIndex: columnIndex });
            }
        }

    return { message: 'success', locations: locations };
}

const getAmountToDraw = (game: Game, condition: string|null): number => {
    let amountToDraw: number = 0;
    
    switch (condition) {
        case 'SummonedChampions':
            game.board.forEach(row => {
                row.forEach(col => {
                    if(isChampion(col) && col.playerIndex === game.playerIndex)
                        amountToDraw++;
                });
            });
            break;
        default:
            return -1;
    }

    return amountToDraw;
}

const playOrder = (game: Game, selectedCard: OrderCard, cardsPayment: GameCard[] | undefined): string => {
    if (cardsPayment === undefined) return 'cardsPayment can not be undefined';

    const player = getPlayer(game);

    const { cardToDiscard, amountToDiscard } = getValidCardsForDiscard(player, cardsPayment, selectedCard);

    if (cardToDiscard.some(x => x.guid === selectedCard.guid))
        return 'You cant not discard the played order card as payment';

    if (amountToDiscard === -1) {
        if (cardToDiscard.length !== player.hand.length - 1) return 'Player must discard his entire hand';
    }
    else {
        if (cardToDiscard.length !== amountToDiscard)
            return `Valid cards to discard (${cardToDiscard.length}) is not equal to the requirement ${amountToDiscard}`;
    }

    if (selectedCard.reward.name === 'Draw' && player.deck.length < selectedCard.reward.amount)
        return `Not enough cards in deck, in deck ${player.deck.length} amount to draw: ${selectedCard.reward.amount}`;

    cardToDiscard.forEach(card => {
        removeCardFromHand(game, card);
        player.usedCards.push(card);
    });

    if (selectedCard.reward.name === 'Draw')
        draw(player, selectedCard.reward.amount);

    if(selectedCard.reward.name === 'ConditionedDraw'){
        const amountToDraw = getAmountToDraw(game, selectedCard.reward.condition);
        draw(player, amountToDraw);
    }

    removeCardFromHand(game, selectedCard);
    player.usedCards.push(selectedCard);

    return 'success';
}

const initialDraw = (player: Player): string => {
    if (player.didDraw) return 'Player already draw this turn';

    const result = draw(player, 1);

    if (result === 'success') player.didDraw = true;

    return result;
}

const draw = (player: Player, amount: number | undefined): string => {
    if (amount === undefined) return 'Amount can not be undefined';

    if (player?.deck && player.deck.length < amount) return 'Not enough cards in deck';

    for (let index = 0; index < amount; index++) {
        const cardToAdd = player.deck.pop();

        if (!cardToAdd) return `the card ${index} is null`;

        player.hand.push(cardToAdd);
    }

    return 'success';
};

const surrender = (game: Game): string => {
    game.status = GameStatus.over;
    return 'success'
};

const summon = (game: Game, selectedCard: ChampionCard, targetLocation: BoardLocation | undefined): string => {
    if (targetLocation === undefined) return 'targetLocation can not be undefined';

    const player = getPlayer(game);

    if (player.summonsLeft === 0) return 'Player used his all his summons';

    if ((game.playerIndex === 0 && targetLocation.rowIndex < 11) || (game.playerIndex === 1 && targetLocation.rowIndex > 2))
        return `Player ${game.playerIndex + 1} can not summon here ${targetLocation.rowIndex}-${targetLocation.columnIndex}`;

    const boardLocation = game.board[targetLocation.rowIndex][targetLocation.columnIndex];

    if (boardLocation !== null) return 'Location is not empty';

    game.board[targetLocation.rowIndex][targetLocation.columnIndex] = selectedCard;

    removeCardFromHand(game, selectedCard);

    player.summonsLeft--;

    selectedCard.direction = selectedCard.playerIndex === 0 ? ChampionDirection.Up : ChampionDirection.Down;

    if (selectedCard.learnedActions.length !== 2) return 'Champion can no have less or more than two learned actions';

    selectedCard.learnedActions.forEach(action => {
        const actionCard = getAndRemoveActionCard(game, action);

        if (actionCard !== null) {
            setRepeatableActionActivations(actionCard, selectedCard);
            selectedCard.learnedActionsCards.push(actionCard);
        }
    });

    return 'success';
}

const endTurn = (game: Game): string => {
    let nextPlayerIndex = 0;

    if (game.playingPlayerIndex === 0)
        nextPlayerIndex = 1;
    else if (game.playingPlayerIndex === 1)
        nextPlayerIndex = 0;

    game.playingPlayerIndex = nextPlayerIndex;

    refreshResources(game, nextPlayerIndex);

    return 'success';
}

const equip = (game: Game, selectedCard: GearCard, targetLocation: BoardLocation | undefined): string => {
    if (targetLocation === undefined) return 'targetLocation can not be undefined';

    var targetChampion = game.board[targetLocation.rowIndex][targetLocation.columnIndex] as ChampionCard;

    if (targetChampion === null) return 'Champion was not found';

    if (selectedCard.bodyPart === BodyPart.Hand) {
        if (targetChampion.rightHand === null) targetChampion.rightHand = selectedCard;
        else if (targetChampion.leftHand === null && targetChampion.rightHand.bodyPart !== BodyPart.Hands) targetChampion.leftHand = selectedCard;
        else targetChampion.rightHand = selectedCard;
    }
    else if (selectedCard.bodyPart === BodyPart.Body)
        targetChampion.body = selectedCard;
    else if (selectedCard.bodyPart === BodyPart.Hands) {
        targetChampion.rightHand = selectedCard;
        targetChampion.leftHand = null;
    }

    calculateStats(targetChampion);

    removeCardFromHand(game, selectedCard);

    return 'success';
}

const upgrade = (game: Game, player: Player, selectedCard: ClassCard, targetLocation: BoardLocation | undefined): string => {
    if (player.summonsLeft <= 0) return 'Player has used all his summons';

    if (targetLocation === undefined) return 'targetLocation can not be undefined';

    if (selectedCard === null) return 'Upgrade card can not be null';

    const targetChampion = game.board[targetLocation.rowIndex][targetLocation.columnIndex] as ChampionCard;

    if (targetChampion === null) return 'Champion was not found';

    if (selectedCard.learnedAction === null) return 'Class card learned Action can not be null';

    const isValidForUpgradeResult = isValidForUpgrade(targetChampion, selectedCard);

    if (!isValidForUpgradeResult.isValid) return isValidForUpgradeResult.message;

    const classActionCard = getAndRemoveActionCard(game, selectedCard.learnedAction);

    if (classActionCard !== null)
        targetChampion.learnedActionsCards = [...targetChampion.learnedActionsCards, classActionCard];

    targetChampion.upgrade = selectedCard;
    targetChampion.calClass = targetChampion.upgrade.class;

    calculateStats(targetChampion);

    removeCardFromHand(game, selectedCard);

    return 'success';
}

const addCardToDeck = (game: Game, cardsList: GameCard[], selectedCard: GameCard) => {
    if (selectedCard === null) return 'Card can not be null';

    const player = getPlayer(game);

    if (player.deck.filter(card => card.name === selectedCard.name).length === 3)
        return `Can not add more copies of ${selectedCard.name}`;

    const deletedCards = removeCard(cardsList, selectedCard);
    if (deletedCards === null) return 'Error removing card from cards list';

    player.deck.push(selectedCard);

    return 'success';
}

const attachAction = (game: Game, actionCard: ActionCard, targetLocation: BoardLocation | undefined) => {
    if (targetLocation === undefined) return 'targetLocation can not be undefined';

    if (actionCard === null)
        return 'Action card can not be null';

    var targetChampion = game.board[targetLocation.rowIndex][targetLocation.columnIndex] as ChampionCard;

    if (targetChampion === null)
        return 'Champion was not found';

    const isChampionValidForAttachAction = isValidForAttach(targetChampion, actionCard);

    if (!isChampionValidForAttachAction.isValid) {
        return isChampionValidForAttachAction.message;
    }

    if (actionCard.isRepeatable && actionCard.repeatableActivationLeft === null)
        setRepeatableActionActivations(actionCard, targetChampion);

    targetChampion.attachedActionsCards.push(actionCard);
    calculateStats(targetChampion);
    removeCardFromHand(game, actionCard);

    return 'success';
}

const removeCardFromDeck = (game: Game, cardsList: GameCard[], selectedCard: GameCard) => {
    if (selectedCard === null) return 'Card can not be null';

    const player = getPlayer(game);
    const deletedCards = removeCard(player.deck, selectedCard);

    if (deletedCards === null) return 'Error removing card from deck';
    cardsList.push(selectedCard);

    return 'success';
}

const clearDeck = (game: Game, cardsList: GameCard[]) => {
    const player: Player = game.players[game.playerIndex];
    const deckCopy = [...player.deck];

    deckCopy.forEach(card => {
        removeCardFromDeck(game, cardsList, card);
    });

    return 'success';
}

const removeCard = (cards: GameCard[], selectedCard: GameCard): GameCard[] | null => {
    const cardIndexToRemove = cards.findIndex(card => card.guid === selectedCard.guid);

    if (cardIndexToRemove === -1) return null;

    return cards.splice(cardIndexToRemove, 1);
}

const updateStatusEffects = (championCard: ChampionCard) => {
    const updatedStatusEffects: StatusEffect[] = [];

    championCard.statusEffects.forEach((statusEffect) => {
        if (statusEffect.duration > 1) {
            statusEffect.duration--;
            updatedStatusEffects.push(statusEffect);
        }
    });

    championCard.statusEffects = updatedStatusEffects;
}

const updateLearnedActions = (championCard: ChampionCard) => {
    championCard.learnedActionsCards.forEach(learnedActionCard => {
        setRepeatableActionActivations(learnedActionCard, championCard);
        learnedActionCard.wasPlayed = false;
    });
}

const refreshResources = (game: Game, nextPlayerIndex: number) => {
    const player = game.players[nextPlayerIndex];
    player.didDraw = false;
    player.summonsLeft = 1;

    const board = game.board;

    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
            const card = board[rowIndex][columnIndex];

            if (isChampion(card) && card.playerIndex === nextPlayerIndex) {
                card.stm = 2;
                updateLearnedActions(card);
                updateStatusEffects(card);
                calculateStats(card);
            };
        }
    }
}

const removeCardFromHand = (game: Game, selectedCard: GameCard) => {
    const player = getPlayer(game);
    const cardIndex = player.hand.findIndex((x) => x.guid === selectedCard.guid);
    player.hand.splice(cardIndex, 1);
}

const getAndRemoveActionCard = (game: Game, actionCardName: string): ActionCard | null => {
    const player = getPlayer(game);

    let actionCard = findCard(player.usedCards, actionCardName);

    if (actionCard !== null) {
        removeCard(player.usedCards, actionCard as GameCard);
        return actionCard as ActionCard;
    }

    actionCard = findCard(player.deck, actionCardName);

    if (actionCard !== null) {
        removeCard(player.deck, actionCard as GameCard);
        return actionCard as ActionCard;
    }

    actionCard = findCard(player.hand, actionCardName);

    if (actionCard !== null) {
        removeCard(player.hand, actionCard as GameCard);
        return actionCard as ActionCard;
    }

    return null;
}

const findCard = (cards: GameCard[], selectedCardName: string): GameCard | null => {
    const card = cards.find((x) => x.name === selectedCardName);
    return card ?? null;
}

const getChampionStatValue = (champion: ChampionCard, stat: Stats): number => {
    switch (stat) {
        case Stats.Str:
            return champion.calStr;
        case Stats.Dex:
            return champion.calDex;
        case Stats.Int:
            return champion.calInt;
        default:
            return -1;
    }
}

const isValidForUpgrade = (championCard: ChampionCard, classCard: ClassCard): ValidationResult => {
    const isClassValid = championCard.calClass === classCard.requiredClassName;

    if (!isClassValid)
        return { message: `Champion das not have the required class of ${classCard.requiredClassName}`, isValid: false };

    return { message: 'success', isValid: true };
}

const isValidForEquip = (championCard: ChampionCard, gearCard: GearCard): ValidationResult => {
    return { message: 'success', isValid: true };
}

const isValidForAttach = (championCard: ChampionCard, actionCard: ActionCard): ValidationResult => {
    if (actionCard.requiredClassName !== null && championCard.calClass !== actionCard.requiredClassName)
        return { message: `Champion das not have the required class of ${actionCard.requiredClassName}`, isValid: false };

    if (actionCard.requiredGearCategory !== null) {
        const isRequiredGearFound = championCard.body?.category === actionCard.requiredGearCategory
            || championCard.rightHand?.category === actionCard.requiredGearCategory
            || championCard.leftHand?.category === actionCard.requiredGearCategory

        if (!isRequiredGearFound)
            return { message: `Champion das not meet the gear requirement of this action ${actionCard.requiredGearCategory}`, isValid: false };
    }

    if (actionCard.requiredStat !== null && actionCard.requiredStatValue !== null) {
        const championRequiredStatValue = getChampionStatValue(championCard, actionCard.requiredStat);

        if (championRequiredStatValue < actionCard.requiredStatValue)
            return {
                message: `Champion stat ${actionCard.requiredStat} ${championRequiredStatValue} das not meet the required value ${actionCard.requiredStatValue}`,
                isValid: false
            };
    }

    return { message: 'success', isValid: true };
}

export const playerAction = (action: string | null, cardsList: GameCard[], game: Game, data: any) => {
    if (action === null) return 'Action can not be null';

    if (game.playingPlayerIndex !== game.playerIndex && action !== PlayerActionsName.Draw)
        return `Player ${game.playerIndex + 1} can not play on other player (${game.playingPlayerIndex + 1}) turn`;

    const player = getPlayer(game);

    let result: string;

    switch (action) {
        case PlayerActionsName.InitialDraw:
            result = initialDraw(player);
            break;
        case PlayerActionsName.Draw:
            result = draw(player, data.extendedData as number);
            break;
        case PlayerActionsName.Surrender:
            result = surrender(game);
            break;
        case PlayerActionsName.Summon:
            result = summon(game, data.selectedCard as ChampionCard, data.extendedData as BoardLocation);
            break;
        case PlayerActionsName.EndTurn:
            result = endTurn(game);
            break;
        case PlayerActionsName.Equip:
            result = equip(game, data.selectedCard as GearCard, data.extendedData as BoardLocation);
            break;
        case PlayerActionsName.Upgrade:
            result = upgrade(game, player, data.selectedCard as ClassCard, data.extendedData as BoardLocation);
            break;
        case PlayerActionsName.AddCardToDeck:
            result = addCardToDeck(game, cardsList, data.selectedCard as GameCard);
            break;
        case PlayerActionsName.RemoveCardFromDeck:
            result = removeCardFromDeck(game, cardsList, data.selectedCard as GameCard);
            break;
        case PlayerActionsName.Attach:
            result = attachAction(game, data.selectedCard as ActionCard, data.extendedData as BoardLocation);
            break;
        case PlayerActionsName.PlayOrder:
            result = playOrder(game, data.selectedCard as OrderCard, data.extendedData as GameCard[]);
            break;
        case PlayerActionsName.ClearDeck:
            result = clearDeck(game, cardsList);
            break;
        default:
            return `Player action ${action} is not implemented yet`;
    }

    if (result === 'success')
        player.actionsLog.push({ name: action, guid: data?.selectedCard?.guid });

    return result;
}

export const getPlayerAllowedHandCardSelect = (game: Game, selectedCard: OrderCard): AllowedHandCardSelectResponse => {
    const player = getPlayer(game);
    const { cardToDiscard } = getValidCardsForDiscard(player, player.hand, selectedCard);
    return { message: 'success', handCards: cardToDiscard };
}

export const getPlayerActionsAllowedBoardLocations = (game: Game, actionName: string, selectedCard: GameCard | null): AllowedBoardLocationResponse => {
    switch (actionName) {
        case PlayerActionsName.Summon:
            return getSummonBoardLocations(game);
        case PlayerActionsName.Upgrade:
            return getValidChampionsBoardLocations(game, selectedCard, isValidForUpgrade);
        case PlayerActionsName.Equip:
            return getValidChampionsBoardLocations(game, selectedCard, isValidForEquip);
        case PlayerActionsName.Attach:
            return getValidChampionsBoardLocations(game, selectedCard, isValidForAttach);
        default:
            return { message: `Player allowed board locations ${actionName} is not implemented yet`, locations: [] };
    }
}