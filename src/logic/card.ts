export interface Card {
    playerIndex: number;
    image: string;
    name: string;
    hp: number;
    currentHp: number;
    guid: string;
}

export interface Champion extends Card {

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

export interface Gear extends Card {
    str: number;
    dex: number;
    int: number;
    hp: number;
    bodyPart: string;
}

export interface Class extends Card {
    str: number;
    dex: number;
    int: number;
    action: string;
    requiredClass: string;
    class: string;
}

export const isChampion = (value: any): value is Champion => !!value?.actions;

export const isGear = (value: any): value is Gear => !!value?.bodyPart;

export const isClass = (value: any): value is Class => !!value?.action;

export class GameChampionActions {
    championAction = (board: (Card | null)[][], action: string, sourceX: number, sourceY: number, targetX: number, targetY: number) => {
        const sourceChampion = board[sourceX][sourceY];
        if (sourceChampion === null) return "Entity was not found";
        if (!isChampion(sourceChampion)) return "Entity is not a champion";
        if (sourceChampion.stm <= 0) return 'Champion stamina is depleted';

        let result: string|null = null;

        switch (action) {
            case championActionsName.step:
                result = this.moveChampion(board, sourceChampion, sourceX, sourceY, targetX, targetY);
                break;
            case championActionsName.basicHit:
                result = this.basicHit(board, sourceChampion, sourceX, sourceY, targetX, targetY);
                break;
            default:
                result = `Action ${action} is not implemented yet`;
                break;
        }

        if(result === 'success') sourceChampion.stm--;

        return result;
    }

    moveChampion = (board: (Card | null)[][], entityToMove: Champion, rowIndex: number, columnIndex: number, targetRowIndex: number, targetColumnIndex: number): string => {
        const targetCell = board[targetRowIndex][targetColumnIndex];
        if (targetCell !== null) return 'Target location isn\'t empty';

        if (entityToMove.calDex <= 0) return 'Dex must be higher than zero';

        const distance = this.distance(rowIndex, columnIndex, targetRowIndex, targetColumnIndex);
        if (distance > entityToMove.calDex) return 'Location to far';

        board[targetRowIndex][targetColumnIndex] = entityToMove;
        board[rowIndex][columnIndex] = null;

        return "success";
    }

    basicHit = (board: (Card | null)[][], attackingChampion: Champion, rowIndex: number, columnIndex: number, targetRowIndex: number, targetColumnIndex: number) => {
        
        const targetChampion = board[targetRowIndex][targetColumnIndex];

        if (!isChampion(targetChampion)) return "Target champion is not a champion";

        const distance = this.distance(rowIndex, columnIndex, targetRowIndex, targetColumnIndex);
        if (distance > 1) return "Location to far";

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

    distance = (sourceX: number, sourceY: number, targetX: number, targetY: number): number => {
        const distanceX = Math.abs(sourceX - targetX);
        const distanceY = Math.abs(sourceY - targetY);
        const distance = distanceX + distanceY;
        return distance;
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

export const championActionsName = {
    step: 'Step',
    basicHit: 'Basic Hit'
}