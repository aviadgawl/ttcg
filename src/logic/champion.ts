import { GameCard, isCrystal, SummoningCard, ChampionCard, isChampion, ActionCard } from './game-card';
import { ActionDirections, GameStatus, ActionType, Stats, DamageModifier } from './enums';
import { Game } from './game';
import { AllowedBoardLocationResponse, BoardLocation, } from './common';
import { Player } from './player';

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

export const applyPhysicalDamage = (sourceChampion: ChampionCard, damageStat: Stats | null, target: SummoningCard) => {
    let pureDmg = getStatByDmgStat(sourceChampion, damageStat);

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

const getStatByDmgStat = (champion: ChampionCard, damageStat: Stats | null): number => {
    switch (damageStat) {
        case Stats.Str:
            return champion.calStr;
        case Stats.Dex:
            return champion.calDex;
        case Stats.Int:
            return champion.calInt;
        default:
            return 0;
    }
}

export const calculateStats = (champion: ChampionCard) => {
    const strBuffsValue = champion.buffs.filter(x => x.effectStat === Stats.Str).reduce((accumulator, buff) => accumulator + (buff.effectModifierValue ?? 0), 0)
    console.log(champion.buffs.filter(x => x.effectStat === Stats.Str));
    const dexBuffsValue = champion.buffs.filter(x => x.effectStat === Stats.Dex).reduce((accumulator, buff) => accumulator + (buff.effectModifierValue ?? 0), 0)
    const intBuffsValue = champion.buffs.filter(x => x.effectStat === Stats.Int).reduce((accumulator, buff) => accumulator + (buff.effectModifierValue ?? 0), 0)

    champion.calStr = champion.str + (champion.body?.str ?? 0) + (champion.rightHand?.str ?? 0) + (champion.leftHand?.str ?? 0) + (champion.upgrade?.str ?? 0) + strBuffsValue;
    champion.calDex = champion.dex + (champion.body?.dex ?? 0) + (champion.rightHand?.dex ?? 0) + (champion.leftHand?.dex ?? 0) + (champion.upgrade?.dex ?? 0) + dexBuffsValue;
    champion.calInt = champion.int + (champion.body?.int ?? 0) + (champion.rightHand?.int ?? 0) + (champion.leftHand?.int ?? 0) + (champion.upgrade?.int ?? 0) + intBuffsValue;
    champion.armor = champion.calStr;

    const newCalHp = champion.hp + (champion.body?.hp ?? 0) + (champion.rightHand?.hp ?? 0) + (champion.leftHand?.hp ?? 0) + (champion.upgrade?.hp ?? 0);
    const hpDiff = newCalHp - champion.calHp;
    champion.calHp = newCalHp;
    champion.currentHp += hpDiff;
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

export const attack = (board: (GameCard | null)[][], attackingChampion: ChampionCard,
    actionCard: ActionCard, sourceLocation: BoardLocation, targetLocation: BoardLocation): ChampionActionResult => {

    const target = board[targetLocation.rowIndex][targetLocation.columnIndex] as unknown as SummoningCard;;

    if (target === null) return { status: 'Target is not found', targetedCard: null };

    const validTarget = checkValidTarget(target);
    if (!validTarget) return { status: 'Target is not a champion or crystal', targetedCard: target };

    const validDistance = checkAllowedDistance(actionCard.distance[1], actionCard.distance[0], sourceLocation, targetLocation);
    if (!validDistance) return { status: 'Location to far', targetedCard: target };

    const validDirection = checkAllowedDirection(actionCard.direction, sourceLocation, targetLocation);
    if (!validDirection) return { status: `Not a valid direction for direction: ${ActionDirections.Straight}`, targetedCard: null };

    const isPathBlocked = checkBlockingObjects(board, sourceLocation, targetLocation);
    if (isPathBlocked) return { status: 'Hit path is blocked', targetedCard: null };

    if (actionCard.dmgStat !== null)
        applyPhysicalDamage(attackingChampion, actionCard.dmgStat, target);

    if (actionCard.effectStat !== null && isChampion(target)) {
        target.buffs.push(actionCard);
        calculateStats(target);
    }

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

export const championAction = (game: Game, actionCard: ActionCard, sourceLocation: BoardLocation, targetLocation: BoardLocation): string => {
    const sourceChampion = game.board[sourceLocation.rowIndex][sourceLocation.columnIndex];

    if (sourceChampion === null) return 'Entity was not found';
    if (!isChampion(sourceChampion)) return 'Entity is not a champion';
    if (sourceChampion.playerIndex !== game.playingPlayerIndex)
        return `Player number ${game.playingPlayerIndex + 1} can not use card of player number ${sourceChampion.playerIndex + 1}`;
    if (sourceChampion.stm <= 0) return 'Champion stamina is depleted';

    let result: ChampionActionResult | null = null;

    switch (actionCard.actionType) {
        case ActionType.Movement:
            result = moveChampion(game.board, sourceChampion, sourceLocation, targetLocation);
            break;
        case ActionType.Attack:
        case ActionType.Buff:
            result = attack(game.board, sourceChampion, actionCard, sourceLocation, targetLocation);
            break;
        default:
            result = { status: `Action ${actionCard.actionType} is not implemented yet`, targetedCard: null };
            break;
    }

    if (result.status === 'success') {
        sourceChampion.stm--;

        checkAndRemoveFromAttachedActions(game.players[game.playerIndex], sourceChampion, actionCard);

        if (result.targetedCard !== null && isCrystal(result.targetedCard) && result.targetedCard.currentHp < 0) {
            const loosingPlayer = game.players[result.targetedCard.playerIndex];
            game.loser = loosingPlayer;
            game.status = GameStatus.over;
        }
    }

    return result.status;
}

const getBoardLocationInStraightPath = (board: (GameCard | null)[][],
    initialLocation: BoardLocation, sourceChampion: ChampionCard, actionCard: ActionCard): BoardLocation[] => {

    const distance = actionCard.actionType === ActionType.Movement ? sourceChampion.calDex : actionCard.distance[1];

    if (distance === 0) return [initialLocation];

    const allowedLocations: BoardLocation[] = [];

    const stopOnBlockers = !actionCard.isFreeTargeting;
    const initialRowIndex = initialLocation.rowIndex;
    const initialColumnIndex = initialLocation.columnIndex;

    const maxRowIndex: number = initialRowIndex + distance;

    for (let i = initialRowIndex + 1; i < board.length && i <= maxRowIndex; i++) {

        const currentLocation = board[i][initialColumnIndex];

        if (stopOnBlockers && currentLocation !== null) break;

        allowedLocations.push({ rowIndex: i, columnIndex: initialColumnIndex })
    }

    const minRowIndex: number = initialRowIndex - distance;

    for (let i = initialRowIndex - 1; i > 0 && i >= minRowIndex; i--) {

        const currentLocation = board[i][initialColumnIndex];

        if (stopOnBlockers && currentLocation !== null) break;

        allowedLocations.push({ rowIndex: i, columnIndex: initialColumnIndex })
    }

    const maxColumnIndex: number = initialColumnIndex + distance;

    for (let i = initialColumnIndex + 1; i < board[initialRowIndex].length && i <= maxColumnIndex; i++) {

        const currentLocation = board[initialRowIndex][i];

        if (stopOnBlockers && currentLocation !== null) break;

        allowedLocations.push({ rowIndex: initialRowIndex, columnIndex: i })
    }

    const minColumnIndex: number = initialColumnIndex - distance;

    for (let i = initialColumnIndex - 1; i > 0 && i >= minColumnIndex; i--) {

        const currentLocation = board[initialRowIndex][i];

        if (stopOnBlockers && currentLocation !== null) break;

        allowedLocations.push({ rowIndex: initialRowIndex, columnIndex: i })
    }

    return allowedLocations;
}

const checkAndRemoveFromAttachedActions = (player: Player, sourceChampion: ChampionCard, actionCard: ActionCard) => {
    const index = sourceChampion.attachedActionsCards.findIndex(x => x.guid === actionCard.guid);

    if (index === -1) return;

    const newUsedCards = sourceChampion.attachedActionsCards.splice(index, 1);

    player.usedCards.push(newUsedCards[0]);
}

export const getChampionsActionsAllowedBoardLocations = (game: Game, actionCard: ActionCard, sourceBoardLocation: BoardLocation | null): AllowedBoardLocationResponse => {
    let resultLocations: BoardLocation[] = [];

    if (sourceBoardLocation === null) return { message: 'No source location', locations: resultLocations };

    const sourceChampion = game.board[sourceBoardLocation.rowIndex][sourceBoardLocation.columnIndex];

    if (sourceChampion === null || !isChampion(sourceChampion))
        return { message: 'Champion was not found', locations: resultLocations };

    switch (actionCard.direction) {
        case ActionDirections.Straight:
            resultLocations = getBoardLocationInStraightPath(game.board, sourceBoardLocation, sourceChampion, actionCard);
            break;
        default:
            return { message: `Champion allowed board locations ${actionCard.name} is not implemented yet`, locations: resultLocations };
    }

    return { message: 'success', locations: resultLocations };
}