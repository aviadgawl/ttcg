import { Gear, GameCard, Class } from './card';
import { Game } from './game';

export enum ChampionActionsName {
    Step = 'Step',
    BasicHit = 'Basic Hit',
    DaggerThrow = 'Dagger Throw'
}

enum ChampionActionsDirections {
    Straight = 'Straight'
}

export const isChampion = (value: any): value is Champion => !!value?.actions;

export interface Champion extends GameCard {

    str: number;
    calStr: number;
    armor: number;
    dex: number;
    calDex: number;

    int: number;
    calInt: number;
    mental: number;

    stm: number;

    actions: string[];
    calActions: string[];

    body: Gear | null;
    rightHand: Gear | null;
    leftHand: Gear | null;

    class: string;
    calClass: string;
    upgrade: Class | null;
}

export class GameChampionActions {
    championAction = (game: Game, action: string, sourceX: number, sourceY: number, targetX: number, targetY: number) => {
        const sourceChampion = game.board[sourceX][sourceY];
        if (sourceChampion === null) return 'Entity was not found';
        if (!isChampion(sourceChampion)) return 'Entity is not a champion';
        if (sourceChampion.playerIndex !== game.playingPlayerIndex)
            return `Player number ${game.playingPlayerIndex + 1} can not use card of player number ${sourceChampion.playerIndex + 1}`;
        if (sourceChampion.stm <= 0) return 'Champion stamina is depleted';

        let result: string | null = null;

        switch (action) {
            case ChampionActionsName.Step:
                result = this.moveChampion(game.board, sourceChampion, sourceX, sourceY, targetX, targetY);
                break;
            case ChampionActionsName.BasicHit:
                result = this.basicHit(game.board, sourceChampion, sourceX, sourceY, targetX, targetY);
                break;
            case ChampionActionsName.DaggerThrow:
                result = this.daggerThrow(game.board, sourceChampion, sourceX, sourceY, targetX, targetY);
                break;
            default:
                result = `Action ${action} is not implemented yet`;
                break;
        }

        if (result === 'success') sourceChampion.stm--;

        return result;
    }

    moveChampion = (board: (GameCard | null)[][], entityToMove: Champion, rowIndex: number, columnIndex: number, targetRowIndex: number, targetColumnIndex: number): string => {
        const targetCell = board[targetRowIndex][targetColumnIndex];
        if (targetCell !== null) return 'Target location isn\'t empty';

        if (entityToMove.calDex <= 0) return 'Dex must be higher than zero';

        const distance = this.distance(rowIndex, columnIndex, targetRowIndex, targetColumnIndex);
        if (distance > entityToMove.calDex) return 'Location to far';

        board[targetRowIndex][targetColumnIndex] = entityToMove;
        board[rowIndex][columnIndex] = null;

        return "success";
    }

    basicHit = (board: (GameCard | null)[][], attackingChampion: Champion, sourceRowIndex: number, sourceColumnIndex: number, targetRowIndex: number, targetColumnIndex: number) => {

        const targetChampion = board[targetRowIndex][targetColumnIndex];

        if (!isChampion(targetChampion)) return "Target champion is not a champion";

        const validDistance = this.checkAllowedDistance(1, 1, sourceRowIndex, sourceColumnIndex, targetRowIndex, targetColumnIndex);
        if (!validDistance) return "Location to far";

        const dmg = attackingChampion.calStr - targetChampion.armor;

        if (dmg <= 0) {
            targetChampion.armor -= attackingChampion.calStr;
        }
        else {
            targetChampion.currentHp -= dmg;
            if (targetChampion.currentHp === 0) board[targetRowIndex][targetColumnIndex] = null;
        }

        return "success";
    }

    daggerThrow = (board: (GameCard | null)[][], attackingChampion: Champion, sourceRowIndex: number, sourceColumnIndex: number, targetRowIndex: number, targetColumnIndex: number) => {

        const targetChampion = board[targetRowIndex][targetColumnIndex];

        if (!isChampion(targetChampion)) return 'Target champion is not a champion';

        const validDistance = this.checkAllowedDistance(3, 1, sourceRowIndex, sourceColumnIndex, targetRowIndex, targetColumnIndex);
        if (!validDistance) return 'Location to far';

        const validDirection = this.checkAllowedDirection(ChampionActionsDirections.Straight, sourceRowIndex, sourceColumnIndex, targetRowIndex, targetColumnIndex);
        if(!validDirection) return `Not a valid direction for direction: ${ChampionActionsDirections.Straight}`;

        const isPathBlocked = this.checkBlockingObjects(board, sourceRowIndex, sourceColumnIndex, targetRowIndex, targetColumnIndex);
        if (isPathBlocked) return 'Hit path is blocked';

        const dmg = attackingChampion.calDex - targetChampion.armor;

        if (dmg <= 0) {
            targetChampion.armor -= attackingChampion.calDex;
        }
        else {
            targetChampion.currentHp -= dmg;
            if (targetChampion.currentHp === 0) board[targetRowIndex][targetColumnIndex] = null;
        }

        return "success";
    }

    checkAllowedDistance = (allowedMaxDistance: number,
        allowedMinDistance: number, sourceRowIndex: number, sourceColumnIndex: number, targetRowIndex: number, targetColumnIndex: number) => {

        const distance = this.distance(sourceRowIndex, sourceColumnIndex, targetRowIndex, targetColumnIndex);
        return allowedMinDistance <= distance && distance <= allowedMaxDistance;
    }

    checkAllowedDirection = (allowedDirection: ChampionActionsDirections,
        sourceRowIndex: number, sourceColumnIndex: number, targetRowIndex: number, targetColumnIndex: number) => {

        switch (allowedDirection) {
            case ChampionActionsDirections.Straight:
                return sourceColumnIndex === targetColumnIndex || sourceRowIndex === targetRowIndex;
            default:
                break;
        }
    }

    distance = (sourceX: number, sourceY: number, targetX: number, targetY: number): number => {
        const distanceX = Math.abs(sourceX - targetX);
        const distanceY = Math.abs(sourceY - targetY);
        const distance = distanceX + distanceY;
        return distance;
    }

    checkBlockingObjects = (board: (GameCard | null)[][], sourceRowIndex: number, sourceColumnIndex: number, targetRowIndex: number, targetColumnIndex: number): boolean => {
        const distance = this.distance(sourceRowIndex, sourceColumnIndex, targetRowIndex, targetColumnIndex);

        if (distance <= 1) return false;

        const rowDirection = this.getRowDirection(sourceRowIndex, targetRowIndex);
        const columnDirection = this.getColumnDirection(sourceColumnIndex, targetColumnIndex);

        for (let index = 0, rowIndex = sourceRowIndex, columnIndex = sourceRowIndex; index < distance; index++) {

            rowIndex += rowDirection === 'up' ? -1 : 1;
            columnIndex += columnDirection === 'left' ? -1 : 1;

            const targetCell = board[rowIndex][columnIndex];

            return targetCell !== undefined && targetCell !== null && targetCell.isBlocking;
        }

        return false;
    }

    getColumnDirection = (sourceColumnIndex: number, targetColumnIndex: number): string => {
        if (sourceColumnIndex === targetColumnIndex) return 'none';

        return (sourceColumnIndex - targetColumnIndex) > 0 ? 'left' : 'right';
    }

    getRowDirection = (sourceRowIndex: number, targetRowIndex: number): string => {
        if (sourceRowIndex === targetRowIndex) return 'none';

        return (sourceRowIndex - targetRowIndex) > 0 ? 'up' : 'down';
    }
}

export const calculateStats = (champion: Champion) => {
    champion.calStr = champion.str + (champion.body?.str ?? 0) + (champion.rightHand?.str ?? 0) + (champion.leftHand?.str ?? 0) + (champion.upgrade?.str ?? 0);
    champion.calDex = champion.dex + (champion.body?.dex ?? 0) + (champion.rightHand?.dex ?? 0) + (champion.leftHand?.dex ?? 0) + (champion.upgrade?.dex ?? 0);
    champion.calInt = champion.int + (champion.body?.int ?? 0) + (champion.rightHand?.int ?? 0) + (champion.leftHand?.int ?? 0) + (champion.upgrade?.int ?? 0);
    champion.armor = champion.calStr;

    const calHp = (champion.body?.hp ?? 0) + (champion.rightHand?.hp ?? 0) + (champion.leftHand?.hp ?? 0) + (champion.upgrade?.hp ?? 0);
    champion.hp += calHp
    champion.currentHp += calHp;
}
