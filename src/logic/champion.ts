import { GameCard, isCrystal, SummoningCard, ChampionCard, isChampion, ActionCard, AllowedBoardLocationResponse, BoardLocation, PlayerActionLogRecord, StatusEffect, isGear, HitArea } from './game-card';
import { ActionDirections, GameStatus, ActionType, Stats, EffectStatus, MathModifier, ChampionDirection } from './enums';
import { Game } from './game';
import { Player } from './player';

interface ChampionActionResult {
    status: string,
    targetedCard: SummoningCard | null
}

const checkRepeatableAction = (actionCard: ActionCard): boolean => {
    if (!actionCard.isRepeatable || actionCard.repeatableActivationLeft === null) return false;
    return actionCard.repeatableActivationLeft > 0;
}

const checkValidTarget = (target: GameCard): boolean => {
    return isChampion(target) || isCrystal(target);
}

const applyPhysicalDamage = (sourceChampion: ChampionCard, actionCard: ActionCard, target: SummoningCard) => {
    const pureDmg = getChampionStatValueByStat(sourceChampion, actionCard.dmgStat);
    let calDamage = calculateDamageWithModifier(pureDmg, actionCard);

    if (isChampion(target)) {
        const dmg = (pureDmg + calDamage) - target.armor;

        if (dmg > 0) {
            target.armor = 0;
            target.currentHp -= dmg;
        }
        else if (dmg < 0) target.armor -= Math.abs(dmg);
        else if (dmg === 0) return;
    }
}

const calculateDamageWithModifier = (baseDamage: number, actionCard: ActionCard): number => {
    if (actionCard.dmgModifier === null || actionCard.dmgModifierValue === null) return 0;

    switch (actionCard.dmgModifier) {
        case MathModifier.Plus:
            return baseDamage + actionCard.dmgModifierValue;
        case MathModifier.Multiply:
            return baseDamage * actionCard.dmgModifierValue;
        default:
            return 0;
    }
}

const getChampionDirection = (sourceLocation: BoardLocation, targetLocation: BoardLocation): ChampionDirection | null => {
    if (sourceLocation.rowIndex < targetLocation.rowIndex) return ChampionDirection.Down;
    if (sourceLocation.rowIndex > targetLocation.rowIndex) return ChampionDirection.Up;
    if (sourceLocation.columnIndex < targetLocation.columnIndex) return ChampionDirection.Right;
    if (sourceLocation.columnIndex > targetLocation.columnIndex) return ChampionDirection.Left;

    return null;
}

const removeChampionFromBoard = (game: Game, targetLocation: BoardLocation) => {
    const championCardToRemove = game.board[targetLocation.rowIndex][targetLocation.columnIndex];

    if (championCardToRemove === null) return;

    game.players[championCardToRemove.playerIndex].usedCards.push(championCardToRemove);

    game.board[targetLocation.rowIndex][targetLocation.columnIndex] = null;
}

const moveChampion = (board: (GameCard | null)[][], entityToMove: ChampionCard, actionCard: ActionCard, sourceLocation: BoardLocation, targetLocation: BoardLocation): ChampionActionResult => {
    const targetCell = board[targetLocation.rowIndex][targetLocation.columnIndex] as unknown as SummoningCard;

    if (targetCell !== null) return { status: 'Target location isn\'t empty', targetedCard: null };

    if (entityToMove.calDex <= 0) return { status: 'Dex must be higher than zero', targetedCard: null };

    if (entityToMove.statusEffects.some(x => x.name === EffectStatus.Immobilize))
        return { status: `Champion is under the effect of ${EffectStatus.Immobilize}`, targetedCard: null };

    if (sourceLocation.rowIndex !== targetLocation.rowIndex && sourceLocation.columnIndex !== targetLocation.columnIndex)
        return { status: 'Champion must move in one direction', targetedCard: null };

    const distance = calculateDistance(sourceLocation, targetLocation);
    if (distance > actionCard.distance[1]) return { status: 'Location to far', targetedCard: null };

    const championDirection = getChampionDirection(sourceLocation, targetLocation);

    if (championDirection === null)
        return { status: 'Could not find movement direction', targetedCard: null };

    entityToMove.direction = championDirection;

    board[targetLocation.rowIndex][targetLocation.columnIndex] = entityToMove;
    board[sourceLocation.rowIndex][sourceLocation.columnIndex] = null;

    return { status: 'success', targetedCard: null };
}

const breakGear = (targetChampion: ChampionCard) => {
    const bodyPartsWithGear: string[] = [];

    if (isGear(targetChampion.body)) bodyPartsWithGear.push('body');
    if (isGear(targetChampion.rightHand)) bodyPartsWithGear.push('rightHand');
    if (isGear(targetChampion.leftHand)) bodyPartsWithGear.push('leftHand');

    if (bodyPartsWithGear.length === 0) return;

    let gearIndexToRemove = 0;

    if (bodyPartsWithGear.length > 1) {
        gearIndexToRemove = Math.floor(Math.random() * bodyPartsWithGear.length);
    }

    const randomBodyPart = bodyPartsWithGear[gearIndexToRemove] as keyof typeof targetChampion;

    switch (randomBodyPart) {
        case 'rightHand':
            targetChampion.rightHand = null;
            break;
        case 'leftHand':
            targetChampion.leftHand = null;
            break;
        case 'body':
            targetChampion.body = null;
            break;
        default:
            break;
    }
}

const applyTargetEffects = (effects: StatusEffect[], targetChampion: ChampionCard) => {

    const durationEffects = effects.filter(effect => effect.duration > 0);
    targetChampion.statusEffects = targetChampion.statusEffects.concat(durationEffects);

    const immediateEffects = effects.filter(effect => effect.duration === 0);

    immediateEffects.forEach(effects => {
        switch (effects.name) {
            case EffectStatus.BreakGear:
                breakGear(targetChampion);
                break;
            default:
                break;
        }
    });
}

const attack = (game: Game, attackingChampion: ChampionCard,
    actionCard: ActionCard, sourceLocation: BoardLocation, targetLocation: BoardLocation): ChampionActionResult => {

    const target = game.board[targetLocation.rowIndex][targetLocation.columnIndex] as unknown as SummoningCard;;

    if (attackingChampion.statusEffects.some(x => x.name === EffectStatus.Silence))
        return { status: `Champion is under the effect of ${EffectStatus.Silence}`, targetedCard: null };

    if (target === null) return { status: 'Target is not found', targetedCard: null };

    const validTarget = checkValidTarget(target);
    if (!validTarget) return { status: 'Target is not a champion or crystal', targetedCard: target };

    if (isChampion(target) && target.statusEffects.some(effect => effect.name === EffectStatus.PhysicalImmunity))
        return { status: 'Target is immune to physical damage', targetedCard: target };

    const allowedLocation = getBoardLocationInStraightPath(game.board, sourceLocation, actionCard);

    if (!allowedLocation.some(allowedLocation => (allowedLocation.rowIndex === targetLocation.rowIndex && allowedLocation.columnIndex === targetLocation.columnIndex)))
        return {
            status: `Target location row index: ${targetLocation.rowIndex} and column index: ${targetLocation.columnIndex} is not in allowed locations`,
            targetedCard: target
        };

    if (actionCard.dmgStat !== null)
        applyPhysicalDamage(attackingChampion, actionCard, target);

    if (actionCard.targetEffects.length > 0 && isChampion(target)) {
        applyTargetEffects(actionCard.targetEffects, target);
        calculateStats(target);
    }

    if (target.currentHp <= 0) removeChampionFromBoard(game, targetLocation);

    return { status: 'success', targetedCard: target };
}

const calculateDistance = (sourceLocation: BoardLocation, targetLocation: BoardLocation): number => {
    const distanceX = Math.abs(sourceLocation.rowIndex - targetLocation.rowIndex);
    const distanceY = Math.abs(sourceLocation.columnIndex - targetLocation.columnIndex);
    const distance = distanceX + distanceY;

    return distance;
}

const checkAndPushAllowedLocation = (board: (GameCard | null)[][], allowedLocations: BoardLocation[], newLocation: BoardLocation, stopOnBlockers: boolean) => {
    if (board.length < newLocation.rowIndex) {
        console.log(`checkAndPushAllowedLocation newLocation.rowIndex: ${newLocation.rowIndex} is more then max row are ${board.length}`);
        return;
    }

    if (board[newLocation.rowIndex].length < newLocation.columnIndex) {
        console.log(`checkAndPushAllowedLocation newLocation.columnIndex: ${newLocation.columnIndex} is more then max column are ${board[newLocation.rowIndex].length}`);
        return;
    }

    const currentLocation = board[newLocation.rowIndex][newLocation.columnIndex];

    if (stopOnBlockers && currentLocation !== null) return true;

    if (!allowedLocations.some(location => (location.rowIndex === newLocation.rowIndex && location.columnIndex === newLocation.columnIndex)))
        allowedLocations.push(newLocation);
}

const checkAndPushHitAreaUpDownLocations = (hitArea: HitArea | undefined,
    board: (GameCard | null)[][], allowedLocations: BoardLocation[], rowIndex: number, columnIndex: number, stopOnBlockers: boolean) => {

    if (!hitArea) return;

    if (hitArea.right > 0) {
        const rightAreaLocation: BoardLocation = { rowIndex: rowIndex, columnIndex: columnIndex + hitArea.right }
        checkAndPushAllowedLocation(board, allowedLocations, rightAreaLocation, stopOnBlockers);
    }

    if (hitArea.left > 0) {
        const rightAreaLocation: BoardLocation = { rowIndex: rowIndex, columnIndex: columnIndex - hitArea.left }
        checkAndPushAllowedLocation(board, allowedLocations, rightAreaLocation, stopOnBlockers);
    }
}

const checkAndPushHitAreaLeftRightLocations = (hitArea: HitArea | undefined,
    board: (GameCard | null)[][], allowedLocations: BoardLocation[], rowIndex: number, columnIndex: number, stopOnBlockers: boolean) => {

    if (!hitArea) return;

    if (hitArea.right > 0) {
        const rightAreaLocation: BoardLocation = { rowIndex: rowIndex + hitArea.right, columnIndex: columnIndex }
        checkAndPushAllowedLocation(board, allowedLocations, rightAreaLocation, stopOnBlockers);
    }

    if (hitArea.left > 0) {
        const rightAreaLocation: BoardLocation = { rowIndex: rowIndex - hitArea.left, columnIndex: columnIndex }
        checkAndPushAllowedLocation(board, allowedLocations, rightAreaLocation, stopOnBlockers);
    }
}

const getBoardLocationInStraightPath = (board: (GameCard | null)[][],
    initialLocation: BoardLocation, actionCard: ActionCard): BoardLocation[] => {

    const minDistance = actionCard.distance[0];
    const maxDistance = actionCard.distance[1];

    if (maxDistance === 0) return [initialLocation];

    const allowedLocations: BoardLocation[] = [];

    const stopOnBlockers = !actionCard.isFreeTargeting;
    const initialRowIndex = initialLocation.rowIndex;
    const initialColumnIndex = initialLocation.columnIndex;

    const maxRowIndex: number = initialRowIndex + maxDistance;

    for (let i = initialRowIndex + minDistance, distanceIndex = minDistance; i < board.length && i <= maxRowIndex; i++, distanceIndex++) {

        const newLocation: BoardLocation = { rowIndex: i, columnIndex: initialColumnIndex };
        const shouldStopOnBlockers = checkAndPushAllowedLocation(board, allowedLocations, newLocation, stopOnBlockers);

        const hitArea = actionCard?.hitAreas && actionCard.hitAreas[distanceIndex];
        checkAndPushHitAreaUpDownLocations(hitArea, board, allowedLocations, i, initialColumnIndex, stopOnBlockers);

        if (shouldStopOnBlockers) break;
    }

    const minRowIndex: number = initialRowIndex - maxDistance;

    for (let i = initialRowIndex - minDistance, distanceIndex = minDistance; i >= 0 && i >= minRowIndex; i--, distanceIndex++) {

        const newLocation: BoardLocation = { rowIndex: i, columnIndex: initialColumnIndex };
        const shouldStopOnBlockers = checkAndPushAllowedLocation(board, allowedLocations, newLocation, stopOnBlockers);

        const hitArea = actionCard?.hitAreas && actionCard.hitAreas[distanceIndex];
        checkAndPushHitAreaUpDownLocations(hitArea, board, allowedLocations, i, initialColumnIndex, stopOnBlockers);

        if (shouldStopOnBlockers) break;
    }

    const maxColumnIndex: number = initialColumnIndex + maxDistance;

    for (let i = initialColumnIndex + minDistance, distanceIndex = minDistance; i < board[initialRowIndex].length && i <= maxColumnIndex; i++, distanceIndex++) {

        const newLocation: BoardLocation = { rowIndex: initialRowIndex, columnIndex: i };
        const shouldStopOnBlockers = checkAndPushAllowedLocation(board, allowedLocations, newLocation, stopOnBlockers);

        const hitArea = actionCard?.hitAreas && actionCard.hitAreas[distanceIndex];
        checkAndPushHitAreaLeftRightLocations(hitArea, board, allowedLocations, initialRowIndex, i, stopOnBlockers);

        if (shouldStopOnBlockers) break;
    }

    const minColumnIndex: number = initialColumnIndex - maxDistance;

    for (let i = initialColumnIndex - minDistance, distanceIndex = minDistance; i >= 0 && i >= minColumnIndex; i--, distanceIndex++) {

        const newLocation: BoardLocation = { rowIndex: initialRowIndex, columnIndex: i };
        const shouldStopOnBlockers = checkAndPushAllowedLocation(board, allowedLocations, newLocation, stopOnBlockers);

        const hitArea = actionCard?.hitAreas && actionCard.hitAreas[distanceIndex];
        checkAndPushHitAreaLeftRightLocations(hitArea, board, allowedLocations, initialRowIndex, i, stopOnBlockers);

        if (shouldStopOnBlockers) break;
    }

    return allowedLocations;
}

const checkAndRemoveFromAttachedActions = (player: Player, sourceChampion: ChampionCard, actionCard: ActionCard) => {
    const index = sourceChampion.attachedActionsCards.findIndex(x => x.guid === actionCard.guid);

    if (index === -1) return;

    const newUsedCards = sourceChampion.attachedActionsCards.splice(index, 1);

    player.usedCards.push(newUsedCards[0]);
}

const getActionCardFromChampion = (sourceChampion: ChampionCard, actionCardGuid: string): ActionCard | null => {
    let actionCard: ActionCard | undefined = undefined;

    actionCard = sourceChampion.learnedActionsCards.find(card => card.guid === actionCardGuid);

    if (actionCard === undefined)
        actionCard = sourceChampion.attachedActionsCards.find(card => card.guid === actionCardGuid);

    return actionCard ?? null;
}

const getLastPlayedActionGuid = (player: Player): PlayerActionLogRecord => {
    return player.actionsLog[player.actionsLog.length - 1];
}

const successfulAttackGameUpdate = (game: Game, player: Player, sourceChampion: ChampionCard, actionCard: ActionCard,
    isAttachedAction: boolean, result: ChampionActionResult) => {

    if (!actionCard.wasPlayed) actionCard.wasPlayed = true;

    if (actionCard.isRepeatable && actionCard.repeatableActivationLeft !== null)
        actionCard.repeatableActivationLeft--;

    const lastPlayedActionRecord = getLastPlayedActionGuid(player);

    const validRepeatable = checkRepeatableAction(actionCard);

    if (isAttachedAction && !validRepeatable)
        checkAndRemoveFromAttachedActions(game.players[game.playerIndex], sourceChampion, actionCard);
    else if (lastPlayedActionRecord.guid !== actionCard.guid || !actionCard.isRepeatable)
        sourceChampion.stm--;

    if (result.targetedCard !== null && isCrystal(result.targetedCard) && result.targetedCard.currentHp < 0) {
        const loosingPlayer = game.players[result.targetedCard.playerIndex];
        game.loser = loosingPlayer;
        game.status = GameStatus.over;
    }

    player.actionsLog.push({ name: actionCard.name, guid: actionCard.guid });
}

export const getPlayer = (game: Game): Player => {
    return game.players[game.playerIndex];
}

export const setRepeatableActionActivations = (actionCard: ActionCard, sourceChampion: ChampionCard) => {
    if (!actionCard.isRepeatable) return;

    const statValue = getChampionStatValueByStat(sourceChampion, actionCard.repeatableStat);
    actionCard.repeatableActivationLeft = statValue;
}

export const getChampionStatValueByStat = (champion: ChampionCard, damageStat: Stats | null): number => {
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

export const championAction = (game: Game, actionCardData: ActionCard, sourceLocation: BoardLocation, targetLocation: BoardLocation, isAttachedAction: boolean): string => {
    if (game.playingPlayerIndex !== game.playerIndex)
        return `Player ${game.playerIndex + 1} can not play on other player (${game.playingPlayerIndex + 1}) turn`;

    const sourceChampion = game.board[sourceLocation.rowIndex][sourceLocation.columnIndex];

    if (sourceChampion === null) return 'Entity was not found';

    if (!isChampion(sourceChampion)) return 'Entity is not a champion';

    if (sourceChampion.playerIndex !== game.playingPlayerIndex)
        return `Player number ${game.playingPlayerIndex + 1} can not use card of player number ${sourceChampion.playerIndex + 1}`;

    const actionCard = getActionCardFromChampion(sourceChampion, actionCardData.guid);

    if (actionCard === null) return `Action ${actionCardData.name} card was not found on champion`;

    if (actionCard.isRepeatable) {
        const validRepeatable = checkRepeatableAction(actionCard);

        if (!validRepeatable) return `Repeatable action depleted`;
    }
    else {
        if (actionCard.wasPlayed) return 'Card was played once this turn';

        if (sourceChampion.stm <= 0 && !isAttachedAction) return `Champion is not allowed to make action, 
                stamina: ${sourceChampion.stm}, is attached action ${isAttachedAction}`;
    }

    let result: ChampionActionResult | null = null;

    switch (actionCard.actionType) {
        case ActionType.Movement:
            result = moveChampion(game.board, sourceChampion, actionCard, sourceLocation, targetLocation);
            break;
        case ActionType.Attack:
        case ActionType.Buff:
            result = attack(game, sourceChampion, actionCard, sourceLocation, targetLocation);
            break;
        default:
            result = { status: `Action ${actionCard.actionType} is not implemented yet`, targetedCard: null };
            break;
    }

    const player = getPlayer(game);

    if (result.status === 'success')
        successfulAttackGameUpdate(game, player, sourceChampion, actionCard, isAttachedAction, result);

    return result.status;
}

export const calculateStats = (champion: ChampionCard) => {
    const strBuffsValue = champion.statusEffects.filter(x => x.stat === Stats.Str).reduce((accumulator, effect) => accumulator + (effect.value ?? 0), 0)
    const dexBuffsValue = champion.statusEffects.filter(x => x.stat === Stats.Dex).reduce((accumulator, effect) => accumulator + (effect.value ?? 0), 0)
    const intBuffsValue = champion.statusEffects.filter(x => x.stat === Stats.Int).reduce((accumulator, effect) => accumulator + (effect.value ?? 0), 0)

    champion.calStr = champion.str + (champion.body?.str ?? 0) + (champion.rightHand?.str ?? 0) + (champion.leftHand?.str ?? 0) + (champion.upgrade?.str ?? 0) + strBuffsValue;
    champion.calDex = champion.dex + (champion.body?.dex ?? 0) + (champion.rightHand?.dex ?? 0) + (champion.leftHand?.dex ?? 0) + (champion.upgrade?.dex ?? 0) + dexBuffsValue;
    champion.calInt = champion.int + (champion.body?.int ?? 0) + (champion.rightHand?.int ?? 0) + (champion.leftHand?.int ?? 0) + (champion.upgrade?.int ?? 0) + intBuffsValue;
    champion.armor = champion.calStr;

    const newCalHp = champion.hp + (champion.body?.hp ?? 0) + (champion.rightHand?.hp ?? 0) + (champion.leftHand?.hp ?? 0) + (champion.upgrade?.hp ?? 0);
    const hpDiff = newCalHp - champion.calHp;
    champion.calHp = newCalHp;
    champion.currentHp += hpDiff;

    // champion.learnedActionsCards.forEach(actionCard => {
    //     if (!actionCard.wasPlayed)
    //         setRepeatableActionActivations(actionCard, champion);
    // });
}

export const getChampionsActionsAllowedBoardLocations = (game: Game, actionCard: ActionCard, sourceBoardLocation: BoardLocation | null): AllowedBoardLocationResponse => {
    let resultLocations: BoardLocation[] = [];

    if (sourceBoardLocation === null) return { message: 'No source location', locations: resultLocations };

    const sourceChampion = game.board[sourceBoardLocation.rowIndex][sourceBoardLocation.columnIndex];

    if (sourceChampion === null || !isChampion(sourceChampion))
        return { message: 'Champion was not found', locations: resultLocations };

    const isMovementCard = actionCard.actionType === ActionType.Movement;

    if (isMovementCard) {
        if (sourceChampion.statusEffects.some(x => x.name === EffectStatus.Immobilize))
            return { message: `Champion is under the effect of ${EffectStatus.Immobilize} and can not move`, locations: resultLocations };
    }
    else {
        if (sourceChampion.statusEffects.some(x => x.name === EffectStatus.Silence))
            return { message: `Champion is under the effect of ${EffectStatus.Silence} and can not attack`, locations: resultLocations };
    }

    if (isMovementCard && sourceChampion.statusEffects.some(x => x.name === EffectStatus.Immobilize))
        return { message: `Champion is under the effect of ${EffectStatus.Immobilize} and can not move`, locations: resultLocations };

    switch (actionCard.direction) {
        case ActionDirections.Straight:
            resultLocations = getBoardLocationInStraightPath(game.board, sourceBoardLocation, actionCard);
            break;
        default:
            return { message: `Champion allowed board locations ${actionCard.name} is not implemented yet`, locations: resultLocations };
    }

    return { message: 'success', locations: resultLocations };
}