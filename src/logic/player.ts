import {
    GameCard, GearCard, ClassCard, ChampionCard, isChampion, ActionCard, OrderCard, ValidationResult, BoardLocation, AllowedBoardLocationResponse,
    AllowedHandCardSelectResponse, OrderCardRequirement
} from './game-card';
import { calculateStats } from './champion';
import { Stats, GameStatus, PlayerActionsName } from './enums';

import { Game, } from './game';

export interface Player {
    name: string;
    deck: GameCard[];
    hand: GameCard[];
    usedCards: GameCard[];
    didDraw: boolean;
    summonsLeft: number;
}

const getValidCardsForDiscard = (cards: GameCard[], orderCard: OrderCard): { cardToDiscard: GameCard[], amountToDiscard: number | undefined } => {
    let cardAllowedToDiscard: GameCard[] = [];

    const orderCardRequirements: OrderCardRequirement | undefined = orderCard.requirement.find(x => x.name === 'discard');

    if (orderCardRequirements !== undefined) {
        const newCardAllowedToDiscard =
            cards.filter(card => (orderCardRequirements.cardType === null || (typeof card) === orderCardRequirements.cardType?.toString()) && card.guid !== orderCard.guid);
        cardAllowedToDiscard = [...cardAllowedToDiscard, ...newCardAllowedToDiscard];
    }

    return { cardToDiscard: cardAllowedToDiscard, amountToDiscard: orderCardRequirements?.amount };
}

export const getPlayerAllowedHandCardSelect = (game: Game, selectedCard: OrderCard): AllowedHandCardSelectResponse => {
    const { cardToDiscard } = getValidCardsForDiscard(game.players[game.playerIndex].hand, selectedCard);
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

const getSummonBoardLocations = (game: Game): AllowedBoardLocationResponse => {
    let locations: BoardLocation[] = [];

    if (game.playerIndex === 0) {
        for (let rowIndex = game.board.length - 2; rowIndex < game.board.length; rowIndex++) {
            for (let columnIndex = 0; columnIndex < game.board[rowIndex].length; columnIndex++) {
                const boardLocation = game.board[rowIndex][columnIndex];

                if (boardLocation === null)
                    locations.push({ rowIndex: rowIndex, columnIndex: columnIndex });
            }
        }
    }

    return { message: 'success', locations: locations };
}

const getValidChampionsBoardLocations = (game: Game, selectedCard: GameCard | null, predicate: Function): AllowedBoardLocationResponse => {
    const locations: BoardLocation[] = [];

    if (selectedCard !== null)
        for (let rowIndex = 0; rowIndex < game.board.length; rowIndex++) {
            for (let columnIndex = 0; columnIndex < game.board[rowIndex].length; columnIndex++) {
                const boardCell = game.board[rowIndex][columnIndex];

                if (isChampion(boardCell) && predicate(boardCell, selectedCard).isValid)
                    locations.push({ rowIndex: rowIndex, columnIndex: columnIndex });
            }
        }

    return { message: 'success', locations: locations };
}

export const playerAction = (action: string | null, game: Game, data: any) => {
    if (action === null) return 'Action can not be null';

    const player = game.players[game.playerIndex];

    switch (action) {
        case PlayerActionsName.InitialDraw:
            return initialDraw(player);
        case PlayerActionsName.Draw:
            return draw(player, data.extendedData as number);
        case PlayerActionsName.Surrender:
            return surrender(game);
        case PlayerActionsName.Summon:
            return summon(game, data.selectedCard as ChampionCard, data.extendedData as BoardLocation);
        case PlayerActionsName.EndTurn:
            return endTurn(game);
        case PlayerActionsName.Equip:
            return equip(game, data.selectedCard as GearCard, data.extendedData as BoardLocation);
        case PlayerActionsName.Upgrade:
            return upgrade(game, data.selectedCard as ClassCard, data.extendedData as BoardLocation);
        case PlayerActionsName.AddCardToDeck:
            return addCardToDeck(game, data.selectedCard as GameCard);
        case PlayerActionsName.removeCardFromDeck:
            return removeCardFromDeck(game, data.selectedCard as GameCard);
        case PlayerActionsName.Attach:
            return attachAction(game, data.selectedCard as ActionCard, data.extendedData as BoardLocation);
        case PlayerActionsName.PlayOrder:
            return playOrder(game, data.selectedCard as OrderCard, data.extendedData as GameCard[]);
        default:
            return `Player action ${action} is not implemented yet`;
    }
}

const playOrder = (game: Game, selectedCard: OrderCard, cardsPayment: GameCard[] | undefined): string => {
    if (cardsPayment === undefined) return 'cardsPayment can not be undefined';

    const { cardToDiscard, amountToDiscard } = getValidCardsForDiscard(cardsPayment, selectedCard);

    if (cardToDiscard.some(x => x.guid === selectedCard.guid))
        return 'You cant not discard the played order card as payment';

    if (cardToDiscard.length !== amountToDiscard)
        return `Valid cards to discard (${cardToDiscard.length}) is not equal to the requirement ${amountToDiscard}`;

    const player = game.players[game.playerIndex];

    cardToDiscard.forEach(card => {
        removeCardFromHand(game, card);
        player.usedCards.push(card);
    });

    if (selectedCard.reward.name === 'Draw')
        draw(player, selectedCard.reward.amount);

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

const surrender = (game: Game) => {
    game.status = GameStatus.over;
};

const summon = (game: Game, selectedCard: ChampionCard, targetLocation: BoardLocation | undefined): string => {
    if (targetLocation === undefined) return 'targetLocation can not be undefined';

    const player = game.players[game.playerIndex];

    if (player.summonsLeft === 0) return 'Player used his all his summons';

    if ((game.playerIndex === 0 && targetLocation.rowIndex < 11) || (game.playerIndex === 1 && targetLocation.rowIndex > 2))
        return `Player ${game.playerIndex + 1} can not summon here ${targetLocation.rowIndex}-${targetLocation.columnIndex}`;

    const boardLocation = game.board[targetLocation.rowIndex][targetLocation.columnIndex];

    if (boardLocation !== null) return 'Location is not empty';

    game.board[targetLocation.rowIndex][targetLocation.columnIndex] = selectedCard;

    removeCardFromHand(game, selectedCard);

    player.summonsLeft--;

    if (selectedCard.learnedActions.length !== 2) return 'Champion can no have less or more than two learned actions';

    const firstActionCard = getAndRemoveActionCard(game, selectedCard.learnedActions[0]);

    if (firstActionCard !== null) selectedCard.learnedActionsCards.push(firstActionCard);

    const secondActionCard = getAndRemoveActionCard(game, selectedCard.learnedActions[1]);

    if (secondActionCard !== null) selectedCard.learnedActionsCards.push(secondActionCard);

    return 'success';
}

const endTurn = (game: Game): string => {
    let nextPlayerIndex = 0;

    if (game.playingPlayerIndex === 0)
        nextPlayerIndex = 1;
    else if (game.playingPlayerIndex === 1)
        nextPlayerIndex = 0;

    game.playingPlayerIndex = nextPlayerIndex;

    refreshResources(game, nextPlayerIndex)

    return 'success';
}

const equip = (game: Game, selectedCard: GearCard, targetLocation: BoardLocation | undefined): string => {
    if (targetLocation === undefined) return 'targetLocation can not be undefined';

    var targetChampion = game.board[targetLocation.rowIndex][targetLocation.columnIndex] as ChampionCard;

    if (targetChampion === null) return 'Champion was not found';

    if (selectedCard.bodyPart === 'Hand') {
        if (targetChampion.rightHand === null) targetChampion.rightHand = selectedCard;
        else if (targetChampion.leftHand === null) targetChampion.leftHand = selectedCard;
        else targetChampion.rightHand = selectedCard;
    }
    else if (selectedCard.bodyPart === 'Body')
        targetChampion.body = selectedCard;

    calculateStats(targetChampion);

    removeCardFromHand(game, selectedCard);

    return 'success';
}

const upgrade = (game: Game, selectedCard: ClassCard, targetLocation: BoardLocation | undefined): string => {
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

const addCardToDeck = (game: Game, selectedCard: GameCard) => {
    if (selectedCard === null) return 'Card can not be null';

    const player = game.players[game.playerIndex];

    player.deck.push(selectedCard);

    return 'success';
}

const attachAction = (game: Game, selectedCard: ActionCard, targetLocation: BoardLocation | undefined) => {
    if (targetLocation === undefined) return 'targetLocation can not be undefined';

    if (selectedCard === null)
        return 'Action card can not be null';

    var targetChampion = game.board[targetLocation.rowIndex][targetLocation.columnIndex] as ChampionCard;

    if (targetChampion === null)
        return 'Champion was not found';

    const isChampionValidForAttachAction = isValidForAttach(targetChampion, selectedCard);

    if (!isChampionValidForAttachAction.isValid) {
        return isChampionValidForAttachAction.message;
    }

    targetChampion.attachedActionsCards.push(selectedCard);

    calculateStats(targetChampion);

    removeCardFromHand(game, selectedCard);

    return 'success';
}

const removeCardFromDeck = (game: Game, selectedCard: GameCard) => {
    if (selectedCard === null) return 'Card can not be null';

    const player = game.players[game.playerIndex];
    const deletedCards = removeCard(player.deck, selectedCard);

    if (deletedCards.length !== 1) return 'Error removing card from deck';

    return 'success';
}

const removeCard = (cards: GameCard[], selectedCard: GameCard): GameCard[] => {
    const cardIndexToRemove = cards.findIndex(card => card.guid === selectedCard.guid);

    if (cardIndexToRemove === -1) return cards;

    return cards.splice(cardIndexToRemove, 1);
}

const refreshResources = (game: Game, playerIndex: number) => {
    const player = game.players[playerIndex];
    player.didDraw = false;
    player.summonsLeft = 1;

    const board = game.board;

    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
            const card = board[rowIndex][columnIndex];

            if (isChampion(card) && card.playerIndex === playerIndex) card.stm = 2;
        }
    }
}

const removeCardFromHand = (game: Game, selectedCard: GameCard) => {
    const player = game.players[game.playerIndex];
    const cardIndex = player.hand.findIndex((x) => x.guid === selectedCard.guid);
    player.hand.splice(cardIndex, 1);
}

const getAndRemoveActionCard = (game: Game, actionCardName: string): ActionCard | null => {
    const player = game.players[game.playerIndex];

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