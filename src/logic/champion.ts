import { GameCard, isCrystal, SummoningCard, ChampionCard, isChampion, ActionCard, AllowedBoardLocationResponse, BoardLocation, PlayerActionLogRecord, StatusEffect, isGear, HitArea } from './game-card';
import { ActionDirections, GameStatus, ActionType, Stats, EffectStatus, MathModifier, ChampionDirection } from './enums';
import { Game } from './game';
import { Player } from './player';

interface ChampionActionResult {
    status: string,
    targetedCard: SummoningCard | null
}

export const checkValidTarget = (target: GameCard): boolean => {
    return isChampion(target) || isCrystal(target);
}

export const applyHeal = (sourceChampion: ChampionCard, actionCard: ActionCard, target: SummoningCard) => {
    const amountToHeal = calculateDamage(sourceChampion, actionCard);

    if (amountToHeal === 0) return;

    if (isChampion(target)) {
        const missingHp = target.calHp - target.currentHp;

        if (missingHp === 0)
            return;

        if (missingHp > amountToHeal) {
            target.currentHp += amountToHeal;
            return;
        }

        target.currentHp = target.calHp;
    };
};

export const applyDamage = (sourceChampion: ChampionCard, actionCard: ActionCard, target: SummoningCard) => {
    if (actionCard.damages.length === 0) return;

    const calDamage = calculateDamage(sourceChampion, actionCard);

    if (calDamage === 0) return;

    if (isChampion(target)) {
        const isMagicDmg = actionCard.damages[0].dmgStat === Stats.Int;
        const mitigation = isMagicDmg ? target.mental : target.armor;
        const dmg = calDamage - mitigation;

        let mitigationReduction = 0;

        if (dmg > 0) {
            target.currentHp -= dmg;
        }
        else mitigationReduction = Math.abs(dmg);

        if (isMagicDmg) target.mental = mitigationReduction;
        else target.armor = mitigationReduction;
    }
    else {
        target.currentHp -= calDamage;
    }
}

export const calculateDamage = (champion: ChampionCard, actionCard: ActionCard): number => {
    let calculatedDamage = 0;

    actionCard.damages.forEach((damage) => {
        const statDamage = damage.dmgStat ? getChampionDamageValueByStat(champion, damage.dmgStat) : 0;
        const regularDamage = damage.dmgModifierValue ?? 0;

        calculatedDamage = calculateDamageWithModifier(statDamage + regularDamage, damage.dmgModifier, calculatedDamage);
    });

    return calculatedDamage;
}

export const calculateDamageWithModifier = (baseDamage: number, dmgModifier: MathModifier | null, dmgModifierValue: number | null): number => {
    if (dmgModifier === null || dmgModifierValue === null) return baseDamage;

    switch (dmgModifier) {
        case MathModifier.Plus:
            return baseDamage + dmgModifierValue;
        case MathModifier.Multiply:
            return baseDamage * dmgModifierValue;
        default:
            return 0;
    }
}

export const getChampionDirection = (sourceLocation: BoardLocation, targetLocation: BoardLocation): ChampionDirection | null => {
    if (sourceLocation.rowIndex < targetLocation.rowIndex) return ChampionDirection.Down;
    if (sourceLocation.rowIndex > targetLocation.rowIndex) return ChampionDirection.Up;
    if (sourceLocation.columnIndex < targetLocation.columnIndex) return ChampionDirection.Right;
    if (sourceLocation.columnIndex > targetLocation.columnIndex) return ChampionDirection.Left;

    return null;
}

export const removeChampionFromBoard = (game: Game, targetLocation: BoardLocation) => {
    const championCardToRemove = game.board[targetLocation.rowIndex][targetLocation.columnIndex];

    if (championCardToRemove === null) return;

    if (!isChampion(championCardToRemove)) return;

    if (championCardToRemove.body) {
        game.players[championCardToRemove.playerIndex].usedCards.push(championCardToRemove.body);
        championCardToRemove.body = null;
    }

    if (championCardToRemove.rightHand) {
        game.players[championCardToRemove.playerIndex].usedCards.push(championCardToRemove.rightHand);
        championCardToRemove.rightHand = null;
    }

    if (championCardToRemove.leftHand) {
        game.players[championCardToRemove.playerIndex].usedCards.push(championCardToRemove.leftHand);
        championCardToRemove.leftHand = null;
    }

    if (championCardToRemove.learnedActionsCards.length > 0) {
        championCardToRemove.learnedActionsCards.forEach(card => game.players[championCardToRemove.playerIndex].usedCards.push(card));
        championCardToRemove.learnedActionsCards = [];
    }

    if (championCardToRemove.attachedActionsCards.length > 0) {
        championCardToRemove.attachedActionsCards.forEach(card => game.players[championCardToRemove.playerIndex].usedCards.push(card));
        championCardToRemove.attachedActionsCards = [];
    }

    if (championCardToRemove.statusEffects.length > 0)
        championCardToRemove.statusEffects = [];

    game.players[championCardToRemove.playerIndex].usedCards.push(championCardToRemove);

    game.board[targetLocation.rowIndex][targetLocation.columnIndex] = null;
}

export const moveChampion = (board: (GameCard | null)[][], entityToMove: ChampionCard, actionCard: ActionCard, sourceLocation: BoardLocation, targetLocation: BoardLocation): ChampionActionResult => {
    const targetCell = board[targetLocation.rowIndex][targetLocation.columnIndex] as unknown as SummoningCard;

    if (targetCell !== null) return { status: 'Target location isn\'t empty', targetedCard: null };

    if (entityToMove.calDex <= 0) return { status: 'Dex must be higher than zero', targetedCard: null };

    if (entityToMove.statusEffects.some(x => x.name === EffectStatus.Immobilize))
        return { status: `Champion is under the effect of ${EffectStatus.Immobilize}`, targetedCard: null };

    if (sourceLocation.rowIndex !== targetLocation.rowIndex && sourceLocation.columnIndex !== targetLocation.columnIndex)
        return { status: 'Champion must move in one direction', targetedCard: null };

    const distance = calculateDistance(sourceLocation, targetLocation);
    if (distance > actionCard.distance[1]) return { status: 'Location to far', targetedCard: null };

    board[targetLocation.rowIndex][targetLocation.columnIndex] = entityToMove;
    board[sourceLocation.rowIndex][sourceLocation.columnIndex] = null;

    return { status: 'success', targetedCard: null };
}

export const breakGear = (targetChampion: ChampionCard) => {
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

export const applyTargetEffects = (effects: StatusEffect[], targetChampion: ChampionCard) => {

    const durationEffects = effects.filter(effect => effect.duration > 0);
    targetChampion.statusEffects = [...targetChampion.statusEffects, ...durationEffects];

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

export const attack = (game: Game, attackingChampion: ChampionCard,
    actionCard: ActionCard, sourceLocation: BoardLocation, targetLocation: BoardLocation): ChampionActionResult => {

    const target = game.board[targetLocation.rowIndex][targetLocation.columnIndex] as unknown as SummoningCard;;

    if (attackingChampion.statusEffects.some(x => x.name === EffectStatus.Paralyze))
        return { status: `Champion is under the effect of ${EffectStatus.Paralyze} and can not move or attack`, targetedCard: null };

    if (attackingChampion.statusEffects.some(x => x.name === EffectStatus.Silence))
        return { status: `Champion is under the effect of ${EffectStatus.Silence}`, targetedCard: null };

    if (target === null) return { status: 'Target is not found', targetedCard: null };

    const validTarget = checkValidTarget(target);
    if (!validTarget) return { status: 'Target is not a champion or crystal', targetedCard: target };

    const targetIsChampion = isChampion(target);

    if (targetIsChampion) {

        if (actionCard.isBackTargeting) {
            const attackDirection = getChampionDirection(sourceLocation, targetLocation);
            if (target.direction !== attackDirection)
                return { status: 'This attack can only hit champions from behind', targetedCard: target };
        }

        if (target.statusEffects.some(effect => effect.name === EffectStatus.DamageImmunity))
            return { status: 'Target is immune to damage', targetedCard: target };

        if (actionCard.damages.length > 0 && actionCard.damages[0].dmgStat === Stats.Str && target.statusEffects.some(effect => effect.name === EffectStatus.MeleeImmunity))
            return { status: 'Target is immune to melee damage', targetedCard: target };

        if (actionCard.damages.length > 0 && actionCard.damages[0].dmgStat === Stats.Int && target.statusEffects.some(effect => effect.name === EffectStatus.MagicalImmunity))
            return { status: 'Target is immune to magical damage', targetedCard: target };
    }

    const allowedLocation = getBoardLocationInStraightPath(game.board, sourceLocation, actionCard);

    if (!allowedLocation.some(allowedLocation => (allowedLocation.rowIndex === targetLocation.rowIndex && allowedLocation.columnIndex === targetLocation.columnIndex)))
        return {
            status: `Target location row index: ${targetLocation.rowIndex} and column index: ${targetLocation.columnIndex} is not in allowed locations`,
            targetedCard: target
        };

    if (actionCard.damages.length > 0) {
        if (actionCard.isHeal)
            applyHeal(attackingChampion, actionCard, target);
        else
            applyDamage(attackingChampion, actionCard, target);
    }

    if (actionCard.targetEffects.length > 0 && targetIsChampion) {
        const existingSameCardEffect = target.statusEffects?.find(effect => effect.cardName === actionCard.name);
        
        if(!existingSameCardEffect){
            applyTargetEffects(actionCard.targetEffects, target);
            calculateStats(target);
        }
    }

    if (target.currentHp <= 0) removeChampionFromBoard(game, targetLocation);

    return { status: 'success', targetedCard: target };
}

export const calculateDistance = (sourceLocation: BoardLocation, targetLocation: BoardLocation): number => {
    const distanceX = Math.abs(sourceLocation.rowIndex - targetLocation.rowIndex);
    const distanceY = Math.abs(sourceLocation.columnIndex - targetLocation.columnIndex);
    const distance = distanceX + distanceY;

    return distance;
}

export const checkAndPushAllowedLocation = (board: (GameCard | null)[][], allowedLocations: BoardLocation[], newLocation: BoardLocation, stopOnBlockers: boolean) => {
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

export const checkAndPushHitAreaUpDownLocations = (hitArea: HitArea | undefined,
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

export const checkAndPushHitAreaLeftRightLocations = (hitArea: HitArea | undefined,
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

export const getBoardLocationInStraightPath = (board: (GameCard | null)[][],
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

export const checkAndRemoveFromAttachedActions = (player: Player, sourceChampion: ChampionCard, actionCard: ActionCard) => {
    const index = sourceChampion.attachedActionsCards.findIndex(x => x.guid === actionCard.guid);

    if (index === -1) return;

    const newUsedCards = sourceChampion.attachedActionsCards.splice(index, 1);

    player.usedCards.push(newUsedCards[0]);
}

export const getActionCardFromChampion = (sourceChampion: ChampionCard, actionCardGuid: string): ActionCard | null => {
    let actionCard: ActionCard | undefined = undefined;

    actionCard = sourceChampion.learnedActionsCards.find(card => card.guid === actionCardGuid);

    if (actionCard === undefined)
        actionCard = sourceChampion.attachedActionsCards.find(card => card.guid === actionCardGuid);

    return actionCard ?? null;
};

export const getLastPlayedActionGuid = (player: Player): PlayerActionLogRecord | null => {
    if (player.actionsLog.length === 0)
        return null;

    return player.actionsLog[player.actionsLog.length - 1];
};

export const removeUsedAttachedActionCards = (sourceChampion: ChampionCard, player: Player) => {
    const usedAttachedActionCards = sourceChampion.attachedActionsCards
        .filter(actionCard => (!actionCard.isRepeatable && actionCard.wasPlayed) || (actionCard.isRepeatable && actionCard.repeatableActivationLeft === 0));

        usedAttachedActionCards.forEach((actionCard) => {
        checkAndRemoveFromAttachedActions(player, sourceChampion, actionCard);
    });
};

export const shouldLowerStamina = (player: Player, actionCard: ActionCard, isAttachedAction: boolean) => {
    if(isAttachedAction)
        return false;
    
    if(actionCard.isRepeatable){
        const lastPlayedActionRecord = getLastPlayedActionGuid(player);
        return lastPlayedActionRecord?.card?.guid !== actionCard.guid;
    };

    return true;
};

export const successfulAttackGameUpdate = (game: Game, player: Player, sourceChampion: ChampionCard, actionCard: ActionCard,
    result: ChampionActionResult, sourceLocation: BoardLocation, targetLocation: BoardLocation, isAttachedAction: boolean) => {

    if (actionCard.isRepeatable && actionCard.repeatableActivationLeft !== null)
        actionCard.repeatableActivationLeft--;

    const lowerStamina = shouldLowerStamina(player, actionCard, isAttachedAction);

    if (lowerStamina)
        sourceChampion.stm--;

    if (!actionCard.wasPlayed) actionCard.wasPlayed = true;

    if (result.targetedCard !== null && isCrystal(result.targetedCard) && result.targetedCard.currentHp < 0) {
        const loosingPlayer = game.players[result.targetedCard.playerIndex];
        game.loser = loosingPlayer;
        game.status = GameStatus.over;
    }

    const championDirection = getChampionDirection(sourceLocation, targetLocation);

    if (championDirection === null)
        return { status: 'Could not find movement direction', targetedCard: null };

    sourceChampion.direction = championDirection;

    player.actionsLog.push({ name: actionCard.name, timestamp: Date.now(), card: actionCard });

    removeUsedAttachedActionCards(sourceChampion, player);
};

export const checkValidRepeatableAction = (player: Player, actionCard: ActionCard): boolean => {
    if (!actionCard.isRepeatable || actionCard.repeatableActivationLeft === null) return false;

    const lastActionPlayed = player.actionsLog.at(-1);

    return actionCard.repeatableActivationLeft > 0 && (!actionCard.wasPlayed || lastActionPlayed?.card?.guid === actionCard.guid);
}

export const calculateAndUpdateRepeatableActions = (actionCards: ActionCard[], championCard: ChampionCard) => {
    actionCards.forEach(actionCard => {
        if (actionCard.isRepeatable && !actionCard.wasPlayed)
            setRepeatableActionActivations(actionCard, championCard);
    });
}

export const getPlayer = (game: Game): Player => {
    return game.players[game.playerIndex];
}

export const setRepeatableActionActivations = (actionCard: ActionCard, sourceChampion: ChampionCard) => {
    if (!actionCard.isRepeatable) return;

    const statValue = getChampionDamageValueByStat(sourceChampion, actionCard.repeatableStat);
    actionCard.repeatableActivationLeft = statValue;
}

export const getChampionDamageValueByStat = (champion: ChampionCard, damageStat: Stats | null): number => {
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

    const player = getPlayer(game);

    if (actionCard.isRepeatable) {
        const validRepeatable = checkValidRepeatableAction(player, actionCard);
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
        case ActionType.Melee:
        case ActionType.Magic:
        case ActionType.Ranged:
        case ActionType.Buff:
            result = attack(game, sourceChampion, actionCard, sourceLocation, targetLocation);
            break;
        default:
            result = { status: `Action ${actionCard.actionType} is not implemented yet`, targetedCard: null };
            break;
    }

    if (result.status === 'success')
        successfulAttackGameUpdate(game, player, sourceChampion, actionCard, result, sourceLocation, targetLocation, isAttachedAction);

    return result.status;
}

export const calculateStats = (champion: ChampionCard) => {
    const strBuffsValue = champion.statusEffects.filter(x => x.stat === Stats.Str).reduce((accumulator, effect) => accumulator + (effect.value ?? 0), 0)
    const dexBuffsValue = champion.statusEffects.filter(x => x.stat === Stats.Dex).reduce((accumulator, effect) => accumulator + (effect.value ?? 0), 0)
    const intBuffsValue = champion.statusEffects.filter(x => x.stat === Stats.Int).reduce((accumulator, effect) => accumulator + (effect.value ?? 0), 0)

    const newStr = champion.str + (champion.body?.str ?? 0) + (champion.rightHand?.str ?? 0) + (champion.leftHand?.str ?? 0) + (champion.upgrade?.str ?? 0) + strBuffsValue;
    const strDiff = newStr - champion.calStr;
    champion.calStr = newStr > 0 ? newStr : 0;
    champion.armor += strDiff;

    const newInt = champion.int + (champion.body?.int ?? 0) + (champion.rightHand?.int ?? 0) + (champion.leftHand?.int ?? 0) + (champion.upgrade?.int ?? 0) + intBuffsValue;
    const intDiff = newInt - champion.calInt;
    champion.calInt = newInt > 0 ? newInt : 0;
    champion.mental += intDiff;

    const newDex = champion.dex + (champion.body?.dex ?? 0) + (champion.rightHand?.dex ?? 0) + (champion.leftHand?.dex ?? 0) + (champion.upgrade?.dex ?? 0) + dexBuffsValue;
    champion.calDex = newDex > 0 ? newDex : 0;

    const newCalHp = champion.hp + (champion.body?.hp ?? 0) + (champion.rightHand?.hp ?? 0) + (champion.leftHand?.hp ?? 0) + (champion.upgrade?.hp ?? 0);
    const hpDiff = newCalHp - champion.calHp;
    champion.calHp = newCalHp;
    champion.currentHp += hpDiff;

    calculateAndUpdateRepeatableActions(champion.attachedActionsCards, champion);
    calculateAndUpdateRepeatableActions(champion.learnedActionsCards, champion);
}

export const getChampionsActionsAllowedBoardLocations = (game: Game, actionCard: ActionCard, sourceBoardLocation: BoardLocation | null): AllowedBoardLocationResponse => {
    let resultLocations: BoardLocation[] = [];

    if (sourceBoardLocation === null) return { message: 'No source location', locations: resultLocations };

    const sourceChampion = game.board[sourceBoardLocation.rowIndex][sourceBoardLocation.columnIndex];

    if (sourceChampion === null || !isChampion(sourceChampion))
        return { message: 'Champion was not found', locations: resultLocations };

    if (sourceChampion.statusEffects.some(x => x.name === EffectStatus.Paralyze))
        return { message: `Champion is under the effect of ${EffectStatus.Paralyze} and can not move or attack`, locations: resultLocations };

    const isMovementCard = actionCard.actionType === ActionType.Movement;

    if (isMovementCard) {
        if (sourceChampion.statusEffects.some(x => x.name === EffectStatus.Immobilize))
            return { message: `Champion is under the effect of ${EffectStatus.Immobilize} and can not move`, locations: resultLocations };
    }
    else {
        if (sourceChampion.statusEffects.some(x => x.name === EffectStatus.Silence))
            return { message: `Champion is under the effect of ${EffectStatus.Silence} and can not attack`, locations: resultLocations };
    }

    switch (actionCard.direction) {
        case ActionDirections.Straight:
            resultLocations = getBoardLocationInStraightPath(game.board, sourceBoardLocation, actionCard);
            break;
        default:
            return { message: `Champion allowed board locations ${actionCard.name} is not implemented yet`, locations: resultLocations };
    }

    return { message: 'success', locations: resultLocations };
}