import { Gear, GameCard, isCrystal } from './game-card';
import { Game, GameStatus } from './game';

export enum ChampionActionsName {
    Step = 'Step',
    BasicHit = 'Basic Hit',
    DaggerThrow = 'Dagger Throw',
    Block = 'Block'
}

enum ChampionActionsDirections {
    Straight = 'Straight'
}

export interface Class extends GameCard {
    str: number;
    dex: number;
    int: number;
    action: ChampionActionsName;
    requiredClass: string;
    class: string;
}

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

    actions: ChampionActionsName[];
    calActions: string[];

    body: Gear | null;
    rightHand: Gear | null;
    leftHand: Gear | null;

    class: string;
    calClass: string;
    upgrade: Class | null;
}

interface ChampionActionResult {
    status: string,
    targetedCard: GameCard | null
}

export class GameChampionActions {
    championAction = (game: Game, action: string, sourceX: number, sourceY: number, targetX: number, targetY: number): string => {
        const sourceChampion = game.board[sourceX][sourceY];
        if (sourceChampion === null) return 'Entity was not found';
        if (!isChampion(sourceChampion)) return 'Entity is not a champion';
        if (sourceChampion.playerIndex !== game.playingPlayerIndex)
            return `Player number ${game.playingPlayerIndex + 1} can not use card of player number ${sourceChampion.playerIndex + 1}`;
        if (sourceChampion.stm <= 0) return 'Champion stamina is depleted';

        let result: ChampionActionResult | null = null;

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
                result = {status: `Action ${action} is not implemented yet`, targetedCard: null};
                break;
        }

        if (result.status === 'success') {
            sourceChampion.stm--;

            if(result.targetedCard !== null && isCrystal(result.targetedCard) && result.targetedCard.currentHp < 0){
                const loosingPlayer = game.players[result.targetedCard.playerIndex];
                game.looser = loosingPlayer;
                game.status = GameStatus.over;
            }
        }

        return result.status;
    }

    moveChampion = (board: (GameCard | null)[][], entityToMove: Champion, rowIndex: number, columnIndex: number, targetRowIndex: number, targetColumnIndex: number): ChampionActionResult => {
        const targetCell = board[targetRowIndex][targetColumnIndex];
        if (targetCell !== null) return {status: 'Target location isn\'t empty', targetedCard: null };

        if (entityToMove.calDex <= 0) return {status: 'Dex must be higher than zero', targetedCard: null};

        const distance = this.distance(rowIndex, columnIndex, targetRowIndex, targetColumnIndex);
        if (distance > entityToMove.calDex) return { status: 'Location to far', targetedCard: null };

        board[targetRowIndex][targetColumnIndex] = entityToMove;
        board[rowIndex][columnIndex] = null;

        return {status: 'success', targetedCard: null};
    }

    basicHit = (board: (GameCard | null)[][], attackingChampion: Champion,
        sourceRowIndex: number, sourceColumnIndex: number, targetRowIndex: number, targetColumnIndex: number): ChampionActionResult => {

        const target = board[targetRowIndex][targetColumnIndex];

        if (target === null) return { status: 'Target is not found', targetedCard: null };

        const validTarget = this.checkValidTarget(target);
        if (!validTarget) return { status: 'Target is not a champion or crystal', targetedCard: target };

        const validDistance = this.checkAllowedDistance(1, 1, sourceRowIndex, sourceColumnIndex, targetRowIndex, targetColumnIndex);
        if (!validDistance) return { status: 'Location to far', targetedCard: target };

        this.applyPhysicalDamage(target, attackingChampion.calStr);
        if (target.currentHp === 0) board[targetRowIndex][targetColumnIndex] = null;

        return { status: 'success', targetedCard: target };
    }

    daggerThrow = (board: (GameCard | null)[][], attackingChampion: Champion, sourceRowIndex: number, sourceColumnIndex: number, targetRowIndex: number, targetColumnIndex: number): ChampionActionResult => {

        const target = board[targetRowIndex][targetColumnIndex];

        if (target === null) return { status: 'Target is not found', targetedCard: null };

        const validTarget = this.checkValidTarget(target);
        if (!validTarget) return { status: 'Target is not a champion or crystal', targetedCard: target };

        const validDistance = this.checkAllowedDistance(3, 1, sourceRowIndex, sourceColumnIndex, targetRowIndex, targetColumnIndex);
        if (!validDistance) return { status: 'Location to far', targetedCard: target };

        const validDirection = this.checkAllowedDirection(ChampionActionsDirections.Straight, sourceRowIndex, sourceColumnIndex, targetRowIndex, targetColumnIndex);
        if (!validDirection) return { status: `Not a valid direction for direction: ${ChampionActionsDirections.Straight}`, targetedCard: null };

        const isPathBlocked = this.checkBlockingObjects(board, sourceRowIndex, sourceColumnIndex, targetRowIndex, targetColumnIndex);
        if (isPathBlocked) return { status: 'Hit path is blocked', targetedCard: null };

        this.applyPhysicalDamage(target, attackingChampion.calDex);
        if (target.currentHp <= 0) board[targetRowIndex][targetColumnIndex] = null;

        return { status: 'success', targetedCard: target };
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

    checkValidTarget = (target: GameCard): boolean => {
        return isChampion(target) || isCrystal(target);
    }

    getColumnDirection = (sourceColumnIndex: number, targetColumnIndex: number): string => {
        if (sourceColumnIndex === targetColumnIndex) return 'none';

        return (sourceColumnIndex - targetColumnIndex) > 0 ? 'left' : 'right';
    }

    getRowDirection = (sourceRowIndex: number, targetRowIndex: number): string => {
        if (sourceRowIndex === targetRowIndex) return 'none';

        return (sourceRowIndex - targetRowIndex) > 0 ? 'up' : 'down';
    }

    applyPhysicalDamage = (target: GameCard, damage: number) => {
        let pureDmg = damage;

        if (isChampion(target)) {
            const dmg = pureDmg - target.armor;

            if (dmg > 0) {
                target.armor = 0;
                pureDmg -= dmg;
            }
            else if (dmg < 0) target.armor -= Math.abs(dmg);
            else if (dmg === 0) return;
        }

        target.currentHp -= pureDmg;
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

export const stringToChampionActionName = (actionName: string | undefined): ChampionActionsName => {
    return ChampionActionsName[actionName as keyof typeof ChampionActionsName];
}

export const isClass = (value: any): value is Class => !!value?.action;

export const isChampion = (value: any): value is Champion => !!value?.actions;