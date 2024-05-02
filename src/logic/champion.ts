import { GameCard, isCrystal, isSummoning, SummoningCard, ChampionCard, isChampion } from './game-card';
import { ChampionActionsName, ActionDirections } from './enums';
import { BoardLocation, Game, GameStatus } from './game';

interface ChampionActionResult {
    status: string,
    targetedCard: SummoningCard | null
}

export const checkValidTarget = (target: GameCard): boolean => {
    return isChampion(target) || isCrystal(target);
}

export const getColumnDirection = (sourceColumnIndex: number, targetColumnIndex: number): string => {
    if (sourceColumnIndex === targetColumnIndex) return 'none';

    return (sourceColumnIndex - targetColumnIndex) > 0 ? 'left' : 'right';
}

export const getRowDirection = (sourceRowIndex: number, targetRowIndex: number): string => {
    if (sourceRowIndex === targetRowIndex) return 'none';

    return (sourceRowIndex - targetRowIndex) > 0 ? 'up' : 'down';
}

export const applyPhysicalDamage = (target: SummoningCard, damage: number) => {
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

export const calculateStats = (champion: ChampionCard) => {
    champion.calStr = champion.str + (champion.body?.str ?? 0) + (champion.rightHand?.str ?? 0) + (champion.leftHand?.str ?? 0) + (champion.upgrade?.str ?? 0);
    champion.calDex = champion.dex + (champion.body?.dex ?? 0) + (champion.rightHand?.dex ?? 0) + (champion.leftHand?.dex ?? 0) + (champion.upgrade?.dex ?? 0);
    champion.calInt = champion.int + (champion.body?.int ?? 0) + (champion.rightHand?.int ?? 0) + (champion.leftHand?.int ?? 0) + (champion.upgrade?.int ?? 0);
    champion.armor = champion.calStr;

    const calHp = (champion.body?.hp ?? 0) + (champion.rightHand?.hp ?? 0) + (champion.leftHand?.hp ?? 0) + (champion.upgrade?.hp ?? 0);
    champion.hp += calHp
    champion.currentHp += calHp;
}

export const moveChampion = (board: (GameCard | null)[][], entityToMove: ChampionCard, sourceLocation: BoardLocation, targetLocation: BoardLocation): ChampionActionResult => {
    const targetCell = board[targetLocation.rowIndex][targetLocation.columnIndex] as unknown as SummoningCard;
    if (targetCell !== null) return { status: 'Target location isn\'t empty', targetedCard: null };

    if (entityToMove.calDex <= 0) return { status: 'Dex must be higher than zero', targetedCard: null };

    const distance = calculateDistance(sourceLocation, targetLocation);
    if (distance > entityToMove.calDex) return { status: 'Location to far', targetedCard: null };

    board[targetLocation.rowIndex][targetLocation.columnIndex] = entityToMove;
    board[sourceLocation.rowIndex][sourceLocation.columnIndex] = null;

    return { status: 'success', targetedCard: null };
}

export const basicHit = (board: (GameCard | null)[][], attackingChampion: ChampionCard,
    sourceLocation: BoardLocation, targetLocation: BoardLocation): ChampionActionResult => {

    const target = board[targetLocation.rowIndex][targetLocation.columnIndex] as unknown as SummoningCard;

    if (target === null) return { status: 'Target is not found', targetedCard: null };

    if (!isSummoning(target)) return { status: 'Target is not a summoning card', targetedCard: null };

    const validTarget = checkValidTarget(target);
    if (!validTarget) return { status: 'Target is not a champion or crystal', targetedCard: target };

    const validDistance = checkAllowedDistance(1, 1, sourceLocation, targetLocation);
    if (!validDistance) return { status: 'Location to far', targetedCard: target };

    applyPhysicalDamage(target, attackingChampion.calStr);
    if (target.currentHp === 0) board[targetLocation.rowIndex][targetLocation.columnIndex] = null;

    return { status: 'success', targetedCard: target };
}

export const daggerThrow = (board: (GameCard | null)[][], attackingChampion: ChampionCard,
    sourceLocation: BoardLocation, targetLocation: BoardLocation): ChampionActionResult => {

    const target = board[targetLocation.rowIndex][targetLocation.columnIndex] as unknown as SummoningCard;;

    if (target === null) return { status: 'Target is not found', targetedCard: null };

    const validTarget = checkValidTarget(target);
    if (!validTarget) return { status: 'Target is not a champion or crystal', targetedCard: target };

    const validDistance = checkAllowedDistance(3, 1, sourceLocation, targetLocation);
    if (!validDistance) return { status: 'Location to far', targetedCard: target };

    const validDirection = checkAllowedDirection(ActionDirections.Straight, sourceLocation, targetLocation);
    if (!validDirection) return { status: `Not a valid direction for direction: ${ActionDirections.Straight}`, targetedCard: null };

    const isPathBlocked = checkBlockingObjects(board, sourceLocation, targetLocation);
    if (isPathBlocked) return { status: 'Hit path is blocked', targetedCard: null };

    applyPhysicalDamage(target, attackingChampion.calDex);
    if (target.currentHp <= 0) board[targetLocation.rowIndex][targetLocation.columnIndex] = null;

    return { status: 'success', targetedCard: target };
}

export const checkAllowedDistance = (allowedMaxDistance: number,
    allowedMinDistance: number, sourceLocation: BoardLocation, targetLocation: BoardLocation) => {

    const distance = calculateDistance(sourceLocation, targetLocation);
    return allowedMinDistance <= distance && distance <= allowedMaxDistance;
}

export const checkAllowedDirection = (allowedDirection: ActionDirections,
    sourceLocation: BoardLocation, targetLocation: BoardLocation) => {

    switch (allowedDirection) {
        case ActionDirections.Straight:
            return sourceLocation.columnIndex === targetLocation.columnIndex || sourceLocation.rowIndex === targetLocation.columnIndex;
        default:
            break;
    }
}

export const calculateDistance = (sourceLocation: BoardLocation, targetLocation: BoardLocation): number => {
    const distanceX = Math.abs(sourceLocation.rowIndex - targetLocation.rowIndex);
    const distanceY = Math.abs(sourceLocation.columnIndex - targetLocation.columnIndex);
    const distance = distanceX + distanceY;

    return distance;
}

export const checkBlockingObjects = (board: (GameCard | null)[][], sourceLocation: BoardLocation, targetLocation: BoardLocation): boolean => {
    const distance = calculateDistance(sourceLocation, targetLocation);

    if (distance <= 1) return false;

    const rowDirection = getRowDirection(sourceLocation.rowIndex, targetLocation.rowIndex);
    const columnDirection = getColumnDirection(sourceLocation.columnIndex, targetLocation.columnIndex);

    for (let index = 0, rowIndex = sourceLocation.rowIndex, columnIndex = sourceLocation.columnIndex; index < distance; index++) {

        rowIndex += rowDirection === 'up' ? -1 : 1;
        columnIndex += columnDirection === 'left' ? -1 : 1;

        const targetCell = board[rowIndex][columnIndex] as unknown as SummoningCard;;

        return targetCell !== undefined && targetCell !== null && targetCell.isBlocking;
    }

    return false;
}

export const championAction = (game: Game, action: string, sourceLocation: BoardLocation, targetLocation: BoardLocation): string => {
    const sourceChampion = game.board[sourceLocation.rowIndex][sourceLocation.columnIndex];
    if (sourceChampion === null) return 'Entity was not found';
    if (!isChampion(sourceChampion)) return 'Entity is not a champion';
    if (sourceChampion.playerIndex !== game.playingPlayerIndex)
        return `Player number ${game.playingPlayerIndex + 1} can not use card of player number ${sourceChampion.playerIndex + 1}`;
    if (sourceChampion.stm <= 0) return 'Champion stamina is depleted';

    let result: ChampionActionResult | null = null;

    switch (action) {
        case ChampionActionsName.Step:
            result = moveChampion(game.board, sourceChampion, sourceLocation, targetLocation);
            break;
        case ChampionActionsName.BasicHit:
            result = basicHit(game.board, sourceChampion, sourceLocation, targetLocation);
            break;
        case ChampionActionsName.DaggerThrow:
            result = daggerThrow(game.board, sourceChampion, sourceLocation, targetLocation);
            break;
        default:
            result = { status: `Action ${action} is not implemented yet`, targetedCard: null };
            break;
    }

    if (result.status === 'success') {
        sourceChampion.stm--;

        if (result.targetedCard !== null && isCrystal(result.targetedCard) && result.targetedCard.currentHp < 0) {
            const loosingPlayer = game.players[result.targetedCard.playerIndex];
            game.loser = loosingPlayer;
            game.status = GameStatus.over;
        }
    }

    return result.status;
}