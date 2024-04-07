import { Card, Gear, Champion, Class, calculateStats } from './card';
import { Game } from './game';

export interface Player {
    name: string;
    deck: Card[];
    hand: Card[];
    didDraw: boolean;
    summonsLeft: number;
}

export class GamePlayerActions {
    playerAction = (action: string | null, game: Game, data: any) => {
        if (action === null) return 'Action can not be null';

        const player = game.players[game.playerIndex];

        switch (action) {
            case playerActionsName.initialDraw:
                return this.initialDraw(player);
            case playerActionsName.draw:
                return this.draw(player, data.extendedData as number);
            case playerActionsName.surrender:
                return this.surrender(player, game);
            case playerActionsName.summon:
                return this.summon(game, data.selectedCard as Card, data.extendedData as number[]);
            case playerActionsName.endTurn:
                return this.endTurn(game);
            case playerActionsName.equip:
                return this.equip(game, data.selectedCard as Gear, data.extendedData as number[]);
            case playerActionsName.upgrade:
                return this.upgrade(game, data.selectedCard as Class, data.extendedData as number[]);
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
        game.status = `Player ${player.name} has surrendered`;
    };

    summon = (game: Game, selectedCard: Card, targetLocation: number[]): string => {

        const targetRow = targetLocation[0],
            targetColumn = targetLocation[1];

        const player = game.players[game.playerIndex];

        if(player.summonsLeft === 0) return 'Player used his all his summons';

        if ((game.playerIndex === 0 && targetRow < 11) || (game.playerIndex === 1 && targetRow > 2))
            return `Player ${game.playerIndex + 1} can not summon here ${targetRow}-${targetColumn}`;

        game.board[targetRow][targetColumn] = selectedCard;

        removeCardFromHand(game, selectedCard);
        
        player.summonsLeft--;

        return 'success';
    }

    endTurn = (game: Game): string => {
        if (game.playerIndex === 0)
            game.playingPlayer = 1;
        else if (game.playerIndex === 0)
            game.playingPlayer = 0;

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
}

const removeCardFromHand = (game: Game, selectedCard: Card) => {
    const player = game.players[game.playerIndex];
    const cardIndex = player.hand.findIndex((x) => x.guid === selectedCard.guid);
    player.hand.splice(cardIndex, 1);
}

export const playerActionsName = {
    draw: 'Draw',
    surrender: 'Surrender',
    summon: 'Summon',
    endTurn: 'End Turn',
    initialDraw: 'Initial Draw',
    equip: 'Equip',
    upgrade: 'Upgrade'
}