import { GameCard, GearCard, ClassCard, ChampionCard, isChampion, ActionCard } from './game-card';
import { calculateStats } from './champion';
import { Stats } from './enums';

import { Game, GameStatus } from './game';

export enum PlayerActionsName {
    Draw = 'Draw',
    Surrender = 'Surrender',
    Summon = 'Summon',
    EndTurn = 'End Turn',
    InitialDraw = 'Initial Draw',
    Equip = 'Equip',
    Upgrade = 'Upgrade',
    AddCardToDeck = 'Add Card To Deck',
    removeCardFromDeck = 'Remove Card From Deck',
    Attach = 'Attach'
}

export interface Player {
    name: string;
    deck: GameCard[];
    hand: GameCard[];
    usedCards: GameCard[];
    didDraw: boolean;
    summonsLeft: number;
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
            return surrender(player, game);
        case PlayerActionsName.Summon:
            return summon(game, data.selectedCard as ChampionCard, data.extendedData as number[]);
        case PlayerActionsName.EndTurn:
            return endTurn(game);
        case PlayerActionsName.Equip:
            return equip(game, data.selectedCard as GearCard, data.extendedData as number[]);
        case PlayerActionsName.Upgrade:
            return upgrade(game, data.selectedCard as ClassCard, data.extendedData as number[]);
        case PlayerActionsName.AddCardToDeck:
            return addCardToDeck(game, data.selectedCard as GameCard);
        case PlayerActionsName.removeCardFromDeck:
            return removeCardFromDeck(game, data.selectedCard as GameCard);
        case PlayerActionsName.Attach:
            return attachAction(game, data.selectedCard as ActionCard, data.extendedData as number[]);
        default:
            return `Player action ${action} is not implemented yet`;
    }
}

const initialDraw = (player: Player): string => {
    if (player.didDraw) return 'Player already draw this turn';

    const result = draw(player, 1);

    if (result === 'success') player.didDraw = true;

    return result;
}

const draw = (player: Player, amount: number): string => {

    if (player?.deck && player.deck.length < amount) return 'Not enough cards in deck';

    for (let index = 0; index < amount; index++) {
        const cardToAdd = player.deck.pop();

        if (!cardToAdd) return `the card ${index} is null`;

        player.hand.push(cardToAdd);
    }

    return 'success';
};

const surrender = (player: Player, game: Game) => {
    game.status = GameStatus.over;
};

const summon = (game: Game, selectedCard: ChampionCard, targetLocation: number[]): string => {

    const targetRow = targetLocation[0],
        targetColumn = targetLocation[1];

    const player = game.players[game.playerIndex];

    if (player.summonsLeft === 0) return 'Player used his all his summons';

    if ((game.playerIndex === 0 && targetRow < 11) || (game.playerIndex === 1 && targetRow > 2))
        return `Player ${game.playerIndex + 1} can not summon here ${targetRow}-${targetColumn}`;

    game.board[targetRow][targetColumn] = selectedCard;

    removeCardFromHand(game, selectedCard);

    player.summonsLeft--;

    if(selectedCard.learnedActions.length !== 2) return 'Champion can no have less or more than two learned actions';

    const firstActionCard = getAndRemoveActionCard(game, selectedCard.learnedActions[0]);

    if(firstActionCard !== null) selectedCard.learnedActionsCards.push(firstActionCard);

    const secondActionCard = getAndRemoveActionCard(game, selectedCard.learnedActions[1]);

    if(secondActionCard !== null) selectedCard.learnedActionsCards.push(secondActionCard);

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

const equip = (game: Game, selectedCard: GearCard, targetLocation: number[]): string => {
    const targetRow = targetLocation[0],
        targetColumn = targetLocation[1];

    var targetChampion = game.board[targetRow][targetColumn] as ChampionCard;

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

const upgrade = (game: Game, selectedCard: ClassCard, targetLocation: number[]): string => {
    if (selectedCard === null) return 'Upgrade card can not be null';

    const targetRow = targetLocation[0],
        targetColumn = targetLocation[1];

    var targetChampion = game.board[targetRow][targetColumn] as ChampionCard;

    if (targetChampion === null) return 'Champion was not found';

    if (selectedCard.requiredClass !== targetChampion.calClass) return `Champion das not have the required class of ${selectedCard.requiredClass}`;

    if (selectedCard.action === null) return 'Class card action can not be null';

    targetChampion.upgrade = selectedCard;
    targetChampion.learnedActionsCards = [...targetChampion.learnedActionsCards, selectedCard.action];
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

const attachAction = (game: Game, selectedCard: ActionCard, targetLocation: number[]) => {
    if (selectedCard === null)
        return 'Action card can not be null';

    const targetRow = targetLocation[0],
        targetColumn = targetLocation[1];

    var targetChampion = game.board[targetRow][targetColumn] as ChampionCard;

    if (targetChampion === null)
        return 'Champion was not found';

    if (selectedCard.requiredClassName !== targetChampion.calClass)
        return `Champion das not have the required class of ${selectedCard.requiredClassName}`;

    if (selectedCard.requiredGearName !== null) {
        const isRequiredGearFound = targetChampion.body?.guid === selectedCard.requiredGearName
            || targetChampion.rightHand?.guid === selectedCard.requiredGearName
            || targetChampion.leftHand?.guid === selectedCard.requiredGearName
        
        if(!isRequiredGearFound) return `Champion das not meet the gear requirement of this action ${selectedCard.requiredGearName}`;
    }

    if (selectedCard.requiredStat !== null && selectedCard.requiredStatValue !== null) {
        const championRequiredStatValue = getChampionStatValue(targetChampion, selectedCard.requiredStat);

        if (championRequiredStatValue < selectedCard.requiredStatValue)
            return `Champion stat ${selectedCard.requiredStat} ${championRequiredStatValue} das not meet the required value ${selectedCard.requiredStatValue}`;
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

    if(deletedCards.length !== 1) return 'Error removing card from deck';

    return 'success';
}

const removeCard = (cards: GameCard[], selectedCard: GameCard) : GameCard[] => {
    const cardIndexToRemove = cards.findIndex(card => card.guid === selectedCard.guid);
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

const getAndRemoveActionCard = (game: Game, actionCardName: string): ActionCard|null => {
    const player = game.players[game.playerIndex];

    let actionCard = findCard(player.usedCards, actionCardName);

    if(actionCard !== undefined) {
        removeCard(player.usedCards, actionCard as GameCard);
        return actionCard as ActionCard;
    }

    actionCard = findCard(player.deck, actionCardName);

    if(actionCard !== undefined) {
        removeCard(player.deck, actionCard as GameCard);
        return actionCard as ActionCard;
    }

    actionCard = findCard(player.hand, actionCardName);

    if(actionCard !== undefined) {
        removeCard(player.deck, actionCard as GameCard);
        return actionCard as ActionCard;
    }

    return null;
}

const findCard = (cards: GameCard[], selectedCardName: string) => {
    const card = cards.find((x) => x.name === selectedCardName);
    return card;
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