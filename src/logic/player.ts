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
    isOrder,
    isGear,
    isAction,
    PlayerEffect
} from './game-card';
import { calculateStats, setRepeatableActionActivations, getPlayer } from './champion';
import { Stats, GameStatus, PlayerActionsName, ChampionDirection, BodyPart, CardType, RewardType, EffectStatus } from './enums';

import { Game, } from './game';

export interface Player {
    name: string;
    deck: GameCard[];
    hand: GameCard[];
    usedCards: GameCard[];
    didDraw: boolean;
    summonsLeft: number;
    actionsLog: PlayerActionLogRecord[];
    effects: PlayerEffect[];
    startingChampion: ChampionCard | null;
}

const isCardRequirementsValid = (orderCard: OrderCard, orderCardRequirements: OrderCardRequirement, card: GameCard): boolean => {
    if (card.guid === orderCard.guid) return false;
    if (orderCardRequirements.cardType === null) return true;

    return checkCardType(card, orderCardRequirements.cardType);
}

const removeFromArray = <T>(array: T[], predicate: (item: T) => boolean) => {
    const index = array.findIndex(predicate);
    if (index === -1) return;

    array.splice(index, 1);
}

const getValidCardsForDiscard = (player: Player, cards: GameCard[], orderCard: OrderCard): { cardToDiscard: GameCard[], amountToDiscard: number | undefined } => {
    const orderCardDiscardRequirement: OrderCardRequirement | undefined = orderCard.requirement.find(x => x.name === 'discard');

    if (orderCardDiscardRequirement === undefined)
        return { cardToDiscard: [], amountToDiscard: 0 };

    if (cards.length === 0 && orderCardDiscardRequirement?.amount === -1) {
        cards = player.hand;
    }

    let cardAllowedToDiscard: GameCard[] = [];

    if (orderCardDiscardRequirement !== undefined) {
        const newCardAllowedToDiscard =
            cards.filter(card => isCardRequirementsValid(orderCard, orderCardDiscardRequirement, card));
        cardAllowedToDiscard = [...cardAllowedToDiscard, ...newCardAllowedToDiscard];
    }

    return { cardToDiscard: cardAllowedToDiscard, amountToDiscard: orderCardDiscardRequirement?.amount };
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

const getAmountToDraw = (game: Game, condition: string | null): number => {
    let amountToDraw: number = 0;

    switch (condition) {
        case 'SummonedChampions':
            game.board.forEach(row => {
                row.forEach(col => {
                    if (isChampion(col) && col.playerIndex === game.playerIndex)
                        amountToDraw++;
                });
            });
            break;
        default:
            return -1;
    }

    return amountToDraw;
}

const orderCardDrawLogic = (drawRewardType: RewardType, game: Game, player: Player, playedOrderCard: OrderCard, cardsToDraw: GameCard[]|undefined): string => {
    switch (drawRewardType) {
        case RewardType.ReturnUsedCardToDeck:
            return drawFrom(player.usedCards,
                player.deck,
                playedOrderCard.reward.amount,
                playedOrderCard.reward.cardType,
                playedOrderCard.reward.cardNameContains,
                playedOrderCard.reward.condition);
        case RewardType.Draw:
            return drawFrom(player.deck,
                player.hand,
                playedOrderCard.reward.amount,
                playedOrderCard.reward.cardType,
                playedOrderCard.reward.cardNameContains,
                playedOrderCard.reward.condition);
        case RewardType.ConditionedDraw:
            const amountToDraw = getAmountToDraw(game, playedOrderCard.reward.condition);
            return drawFrom(player.deck, player.hand, amountToDraw, playedOrderCard.reward.cardType, playedOrderCard.reward.cardNameContains, null);
        case RewardType.ReturnUsedCard:
            return drawFrom(player.usedCards,
                player.hand,
                playedOrderCard.reward.amount,
                playedOrderCard.reward.cardType,
                playedOrderCard.reward.cardNameContains,
                playedOrderCard.reward.condition);
        case RewardType.SpecificDraw:
            if (cardsToDraw === undefined || cardsToDraw === null || cardsToDraw.length <= 0) return 'Must select a card from deck';

            for (const card of cardsToDraw) {
                const result = drawSpecificCard(player.deck, player.hand, card, playedOrderCard.reward.cardType);
                if(result !== 'success') return result;
            }
            return 'success';
        default:
            return 'success';
    }
}

const playOrder = (game: Game, playedOrderCard: OrderCard, cardsPayment: GameCard[] | undefined, cardsToDraw: GameCard[] | undefined): string => {
    if (cardsPayment === undefined) return 'cardsPayment can not be undefined';

    const player = getPlayer(game);

    if (playedOrderCard.reward.name === RewardType.Draw && player.deck.length < playedOrderCard.reward.amount)
        return `Not enough cards in deck, in deck ${player.deck.length} amount to draw: ${playedOrderCard.reward.amount}`;

    const { cardToDiscard, amountToDiscard } = getValidCardsForDiscard(player, cardsPayment, playedOrderCard);

    if (cardToDiscard.some(x => x.guid === playedOrderCard.guid))
        return 'You cant not discard the played order card as payment';

    if (amountToDiscard === -1) {
        if (cardToDiscard.length !== player.hand.length - 1) return 'Player must discard his entire hand';
    }
    else {
        if (cardToDiscard.length !== amountToDiscard)
            return `Valid cards to discard (${cardToDiscard.length}) is not equal to the requirement ${amountToDiscard}`;
    }

    if (playedOrderCard.reward.name === RewardType.PlayExtraClassUpgrade) {
        player.effects.push({ type: RewardType.PlayExtraClassUpgrade, duration: playedOrderCard.duration });
    }

    const drawResult = orderCardDrawLogic(playedOrderCard.reward.name, game, player, playedOrderCard, cardsToDraw);

    if(drawResult !== 'success') return drawResult;

    cardToDiscard.forEach(card => {
        removeCard(player.hand, card);
        player.usedCards.push(card);
    });

    removeCard(player.hand, playedOrderCard);
    player.usedCards.push(playedOrderCard);

    return 'success';
}

const turnDraw = (player: Player): string => {
    if (player.didDraw) return 'Player already draw this turn';

    const result = drawFrom(player.deck, player.hand, 1, null, null, null);

    if (result === 'success') player.didDraw = true;

    return result;
}

const initialDraw = (player: Player): string => {
    if (player.startingChampion)
        player.hand.push(player.startingChampion);

    const result = drawFrom(player.deck, player.hand, 4, null, null, null);

    if (result === 'success') player.didDraw = true;

    return result;
}

const drawSpecificCard = (drawFromPool: GameCard[],
    drawTo: GameCard[],
    cardToDraw: GameCard,
    requiredCardType: CardType | null): string => {

    if (drawFromPool.length < 1)
        return 'Must be at least one card in pool';

    if (requiredCardType && !checkCardType(cardToDraw, requiredCardType))
        return `Selected Card: ${cardToDraw.name}, do not much the required type ${requiredCardType}`;

    drawTo.push(cardToDraw);
    removeCard(drawFromPool, cardToDraw);

    return 'success';
}

const drawFrom = (drawFromPool: GameCard[],
    drawTo: GameCard[],
    amount: number | undefined,
    filterByCardType: CardType | null,
    filterByCardName: string | null,
    condition: string | null): string => {

    if (amount === undefined) return 'Amount can not be undefined';

    if (drawFromPool.length < amount) return `Cant draw ${amount} from pool of ${drawFromPool.length}`;

    let filteredCards: GameCard[] = drawFromPool;

    if (filterByCardType !== null)
        filteredCards = filteredCards.filter(card => checkCardType(card, filterByCardType));

    if (filterByCardName !== null)
        filteredCards = filteredCards.filter(card => card.name.includes(filterByCardName));

    for (let index = 0; index < amount; index++) {

        let cardToAdd = null;

        switch (condition) {
            case "LastOne":
                cardToAdd = filteredCards.pop();
                break;
            default:
                const maxIndex = filteredCards.length === 0 ? 0 : filteredCards.length - 1;
                const randomIndex = Math.floor(Math.random() * maxIndex);
                cardToAdd = filteredCards[randomIndex];
                break;
        }

        if (!cardToAdd) return `The card ${index}/${amount} is null`;

        drawTo.push(cardToAdd);
        removeCard(filteredCards, cardToAdd);
        removeCard(drawFromPool, cardToAdd);
    }

    return 'success';
};

const surrender = (game: Game): string => {
    game.status = GameStatus.over;
    game.loser = getPlayer(game);
    return 'success'
};

const canSummon = (player: Player, game: Game, targetLocation: BoardLocation, championToSummon: ChampionCard): ValidationResult => {
    if (player.summonsLeft === 0) return { message: 'Player used his all his summons', isValid: false };

    if ((game.playerIndex === 0 && targetLocation.rowIndex < 11) || (game.playerIndex === 1 && targetLocation.rowIndex > 2))
        return { message: `Player ${game.playerIndex + 1} can not summon here ${targetLocation.rowIndex}-${targetLocation.columnIndex}`, isValid: false };

    const boardLocation = game.board[targetLocation.rowIndex][targetLocation.columnIndex];

    if (boardLocation !== null) return { message: 'Location is not empty', isValid: false };

    const playerSummonedChampions: ChampionCard[] = [];

    game.board.forEach(row => row.filter(boardPanel => (isChampion(boardPanel) && boardPanel.playerIndex === game.playerIndex)).forEach(championCard => {
        playerSummonedChampions.push(championCard as ChampionCard);
    }));

    if (playerSummonedChampions.length >= 3) return { message: `Player ${player.name} has already 3 champions on board`, isValid: false };

    const championWithSameName = playerSummonedChampions.some(championCard => championCard.name === championToSummon.name);

    if (championWithSameName) return { message: `Champion named ${championToSummon.name} is already on board`, isValid: false };

    return { isValid: true, message: '' };
}

const setChampionLearnedActions = (game: Game, championCard: ChampionCard) => {
    championCard.learnedActions.forEach(action => {
        const actionCard = getAndRemoveActionCard(game, action);

        if (actionCard !== null) {
            setRepeatableActionActivations(actionCard, championCard);
            championCard.learnedActionsCards.push(actionCard);
        }
    });
}

const summon = (game: Game, selectedCard: ChampionCard, targetLocation: BoardLocation | undefined): string => {
    if (targetLocation === undefined) return 'targetLocation can not be undefined';

    const player = getPlayer(game);

    const validationResult = canSummon(player, game, targetLocation, selectedCard);
    if (!validationResult.isValid) return validationResult.message;

    game.board[targetLocation.rowIndex][targetLocation.columnIndex] = selectedCard;

    removeCard(player.hand, selectedCard);
    player.summonsLeft--;

    selectedCard.direction = selectedCard.playerIndex === 0 ? ChampionDirection.Up : ChampionDirection.Down;

    if (selectedCard.learnedActions.length !== 2) return 'Champion can have no less or more than two learned actions';

    setChampionLearnedActions(game, selectedCard);

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

const equip = (game: Game, player: Player, selectedCard: GearCard, targetLocation: BoardLocation | undefined): string => {
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

    removeCard(player.hand, selectedCard);

    return 'success';
}

const upgrade = (game: Game, player: Player, selectedCard: ClassCard, targetLocation: BoardLocation | undefined): string => {
    if (targetLocation === undefined) return 'targetLocation can not be undefined';

    if (selectedCard === null) return 'Upgrade card can not be null';

    const extraUpgrade = player.effects.some(effect => effect.type === RewardType.PlayExtraClassUpgrade);
    if (player.summonsLeft <= 0 && !extraUpgrade) return 'Player has used all his summons';

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

    removeCard(player.hand, selectedCard);

    if (extraUpgrade)
        removeFromArray<PlayerEffect>(player.effects, effect => effect.type === RewardType.PlayExtraClassUpgrade);
    else
        player.summonsLeft--;

    return 'success';
}

const addCardToDeck = (game: Game, cardsList: GameCard[], selectedCard: GameCard) => {
    if (selectedCard === null) return 'Card can not be null';

    const player = getPlayer(game);

    if (player.deck.filter(card => card.name === selectedCard.name).length === 3)
        return `Can not add more copies of ${selectedCard.name}`;

    if (isChampion(selectedCard) && player.deck.filter(card => isChampion(card)).length === 9)
        return 'Can not add more champions';

    const deletedCards = removeCard(cardsList, selectedCard);
    if (deletedCards === null) return 'Error removing card from cards list';

    player.deck.push(selectedCard);

    return 'success';
}

const attachAction = (game: Game, player: Player, actionCard: ActionCard, targetLocation: BoardLocation | undefined) => {
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
    removeCard(player.hand, actionCard);

    return 'success';
}

const removeCardFromDeck = (game: Game, cardsList: GameCard[], selectedCard: GameCard) => {
    if (selectedCard === null) return 'Card can not be null';

    const player = getPlayer(game);
    const removedCards = removeCard(player.deck, selectedCard);

    if (removedCards === null) return 'Error removing card from deck';

    cardsList.push(...removedCards)

    return 'success';
}

const clearDeck = (game: Game, cardsList: GameCard[]) => {
    const player: Player = game.players[game.playerIndex];
    const deckCopy = [...player.deck];

    deckCopy.forEach(card => {
        removeCardFromDeck(game, cardsList, card);
    });

    if (player.startingChampion) {
        cardsList.push(player.startingChampion);
        player.startingChampion = null;
    }

    return 'success';
}

const removeCard = (cards: GameCard[], selectedCard: GameCard): GameCard[] | null => {
    const cardIndexToRemove = cards.findIndex(card => card.guid === selectedCard.guid);

    if (cardIndexToRemove === -1) return null;

    return cards.splice(cardIndexToRemove, 1);
}

const updateChampionStatusEffects = (championCard: ChampionCard) => {
    const updatedStatusEffects: StatusEffect[] = [];

    championCard.statusEffects.forEach((statusEffect) => {
        if (statusEffect.duration > 1) {
            if (statusEffect.name === EffectStatus.Burn && statusEffect.value !== null) {
                championCard.calHp -= statusEffect.value;
            }

            statusEffect.duration--;
            updatedStatusEffects.push(statusEffect);
        }
    });

    championCard.statusEffects = updatedStatusEffects;
}

const refreshLearnedActions = (championCard: ChampionCard) => {
    championCard.learnedActionsCards.forEach(learnedActionCard => {
        setRepeatableActionActivations(learnedActionCard, championCard);
        learnedActionCard.wasPlayed = false;
    });
}

const refreshArmorAndMental = (championCard: ChampionCard) => {
    championCard.armor = championCard.calStr;
    championCard.mental = championCard.calInt;
}

const refreshResources = (game: Game, nextPlayerIndex: number) => {
    const player = game.players[nextPlayerIndex];
    player.didDraw = false;
    player.summonsLeft = 1;
    player.effects.forEach(effect => effect.duration--);

    game.board.forEach(row => row.forEach(boardPanel => {
        if (isChampion(boardPanel) && boardPanel.playerIndex === nextPlayerIndex) {

            boardPanel.stm = 2;

            refreshLearnedActions(boardPanel);
            updateChampionStatusEffects(boardPanel);
            refreshArmorAndMental(boardPanel);
            calculateStats(boardPanel);
        };
    }));
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

const setStartingChampion = (player: Player, championCard: ChampionCard): string => {
    if (player.startingChampion?.name === championCard.name) return 'Same card is already set';

    if (player.startingChampion) {
        player.deck.push(player.startingChampion);
    }

    player.startingChampion = championCard;

    const removedCard = removeCard(player.deck, championCard);

    if (removedCard === null) return `Set starting champion card name: ${championCard.name} is not in deck`;

    return 'success';
}

export const checkCardType = (card: GameCard, cardType: CardType) => {
    switch (cardType) {
        case CardType.OrderCard:
            return isOrder(card);
        case CardType.GearCard:
            return isGear(card);
        case CardType.ActionCard:
            return isAction(card);
        case CardType.ChampionCard:
            return isChampion(card);
        default:
            return false
    }
}

export const playerAction = (action: string | null, cardsList: GameCard[], game: Game, data: any) => {
    if (action === null) return 'Action can not be null';

    if (game.playingPlayerIndex !== game.playerIndex && action !== PlayerActionsName.Draw)
        return `Player ${game.playerIndex + 1} can not play on other player (${game.playingPlayerIndex + 1}) turn`;

    const player = getPlayer(game);

    let result: string;

    switch (action) {
        case PlayerActionsName.SetStartingChampion:
            result = setStartingChampion(player, data.selectedCard as ChampionCard);
            break;
        case PlayerActionsName.TurnDraw:
            result = turnDraw(player);
            break;
        case PlayerActionsName.InitialDraw:
            result = initialDraw(player);
            break;
        case PlayerActionsName.Draw:
            result = drawFrom(player.deck, player.hand, data.extendedData as number, null, null, null);
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
            result = equip(game, player, data.selectedCard as GearCard, data.extendedData as BoardLocation);
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
            result = attachAction(game, player, data.selectedCard as ActionCard, data.extendedData as BoardLocation);
            break;
        case PlayerActionsName.PlayOrder:
            result = playOrder(game, data.selectedCard as OrderCard, data.extendedData as GameCard[], data.cardsToDraw as GameCard[]);
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
        case PlayerActionsName.AddCardToDeck:
        case PlayerActionsName.ClearDeck:
        case PlayerActionsName.Draw:
        case PlayerActionsName.InitialDraw:
        case PlayerActionsName.PlayOrder:
        case PlayerActionsName.RemoveCardFromDeck:
        case PlayerActionsName.SetStartingChampion:
        case PlayerActionsName.Surrender:
        case PlayerActionsName.EndTurn:
        case PlayerActionsName.TurnDraw:
            return { message: 'success', locations: [] };
        default:
            return { message: `Player allowed board locations ${actionName} is not implemented yet`, locations: [] };
    }
}

export const shouldUpdateMultiplayerGame = (playerAction: PlayerActionsName) => {
    switch (playerAction) {
        case PlayerActionsName.Surrender:
        case PlayerActionsName.Summon:
        case PlayerActionsName.EndTurn:
        case PlayerActionsName.Equip:
        case PlayerActionsName.Upgrade:
        case PlayerActionsName.Attach:
        case PlayerActionsName.PlayOrder:
            return true;
        default:
            return false
    }
}