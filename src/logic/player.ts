import { GameCard, Gear } from './game-card';
import { Champion, calculateStats, Class, isChampion } from './champion';

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
    removeCardFromDeck = 'Remove Card From Deck'
}

export interface Player {
    name: string;
    deck: GameCard[];
    hand: GameCard[];
    didDraw: boolean;
    summonsLeft: number;
}

export class GamePlayerActions {
    playerAction = (action: string | null, game: Game, data: any) => {
        if (action === null) return 'Action can not be null';

        const player = game.players[game.playerIndex];

        switch (action) {
            case PlayerActionsName.InitialDraw:
                return this.initialDraw(player);
            case PlayerActionsName.Draw:
                return this.draw(player, data.extendedData as number);
            case PlayerActionsName.Surrender:
                return this.surrender(player, game);
            case PlayerActionsName.Summon:
                return this.summon(game, data.selectedCard as GameCard, data.extendedData as number[]);
            case PlayerActionsName.EndTurn:
                return this.endTurn(game);
            case PlayerActionsName.Equip:
                return this.equip(game, data.selectedCard as Gear, data.extendedData as number[]);
            case PlayerActionsName.Upgrade:
                return this.upgrade(game, data.selectedCard as Class, data.extendedData as number[]);
            case PlayerActionsName.AddCardToDeck:
                return this.addCardToDeck(game, data.selectedCard as GameCard);
            default:
                return `Player action ${action} is not implemented yet`;
        }
    }

    initialDraw = (player: Player): string => {
        if (player.didDraw) return 'Player already draw this turn';

        const result = this.draw(player, 1);

        if (result === 'success') player.didDraw = true;

        return result;
    }

    draw = (player: Player, amount: number): string => {

        if (player?.deck && player.deck.length < amount) return 'Not enough cards in deck';

        for (let index = 0; index < amount; index++) {
            const cardToAdd = player.deck.pop();

            if (!cardToAdd) return `the card ${index} is null`;

            player.hand.push(cardToAdd);
        }

        return 'success';
    };

    surrender = (player: Player, game: Game) => {
        game.status = GameStatus.over;
    };

    summon = (game: Game, selectedCard: GameCard, targetLocation: number[]): string => {

        const targetRow = targetLocation[0],
            targetColumn = targetLocation[1];

        const player = game.players[game.playerIndex];

        if (player.summonsLeft === 0) return 'Player used his all his summons';

        if ((game.playerIndex === 0 && targetRow < 11) || (game.playerIndex === 1 && targetRow > 2))
            return `Player ${game.playerIndex + 1} can not summon here ${targetRow}-${targetColumn}`;

        game.board[targetRow][targetColumn] = selectedCard;

        removeCardFromHand(game, selectedCard);

        player.summonsLeft--;

        return 'success';
    }

    endTurn = (game: Game): string => {
        let nextPlayerIndex = 0;

        if (game.playingPlayerIndex === 0)
            nextPlayerIndex = 1;
        else if (game.playingPlayerIndex === 1)
            nextPlayerIndex = 0;

        game.playingPlayerIndex = nextPlayerIndex;

        this.refreshResources(game, nextPlayerIndex)

        return 'success';
    }

    equip = (game: Game, selectedCard: Gear, targetLocation: number[]): string => {
        const targetRow = targetLocation[0],
            targetColumn = targetLocation[1];

        var targetChampion = game.board[targetRow][targetColumn] as Champion;

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

    upgrade = (game: Game, selectedCard: Class, targetLocation: number[]): string => {
        if (selectedCard === null) return 'Upgrade card can not be null';

        const targetRow = targetLocation[0],
            targetColumn = targetLocation[1];

        var targetChampion = game.board[targetRow][targetColumn] as Champion;

        if (targetChampion === null) return 'Champion was not found';

        if (selectedCard.requiredClass !== targetChampion.calClass) return `Champion das not have the required class of ${selectedCard.requiredClass}`;

        targetChampion.upgrade = selectedCard;
        targetChampion.actions = [...targetChampion.actions, targetChampion.upgrade.action];
        targetChampion.calClass = targetChampion.upgrade.class;

        calculateStats(targetChampion);

        removeCardFromHand(game, selectedCard);

        return 'success';
    }

    addCardToDeck = (game: Game, selectedCard: GameCard) => {
        if (selectedCard === null) return 'Card can not be null';

        const player = game.players[game.playerIndex];

        player.deck.push(selectedCard);

        return 'success';
    }

    refreshResources = (game: Game, playerIndex: number) => {
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
}

const removeCardFromHand = (game: Game, selectedCard: GameCard) => {
    const player = game.players[game.playerIndex];
    const cardIndex = player.hand.findIndex((x) => x.guid === selectedCard.guid);
    player.hand.splice(cardIndex, 1);
}
