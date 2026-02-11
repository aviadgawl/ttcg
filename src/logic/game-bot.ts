import { Game } from './game';
import { Player } from './player';
import { GameCard, ChampionCard, ActionCard, GearCard, ClassCard, OrderCard, isChampion, isGear, isAction, isOrder, isClass } from './game-card';
import { ActionType, PlayerActionsName } from './enums';
import { BoardLocation } from './game-card';
import { getPlayerActionsAllowedBoardLocations, getValidCardsForDiscard, playerAction } from './player';
import { getChampionsActionsAllowedBoardLocations, championAction } from './champion';

type GetPlayerSummonedChampionsResult = {
    sourceLocation: BoardLocation;
    championCard: ChampionCard;
}

export const makeMove = (game: Game): void => {
    const botPlayer = game.players[game.playerIndex];
    // Try to play cards in order of priority
    performDraw(game);
    tryPlayChampion(game, botPlayer);
    tryPlayGear(game, botPlayer);
    tryPlayClass(game, botPlayer);
    tryPlayAction(game, botPlayer);
    tryPlayOrder(game, botPlayer);
    tryChampionLearnedActions(game);

    // If no other moves, end turn
    endTurn(game);
}

export const performDraw = (game: Game): void => {
    executeAction(game, PlayerActionsName.TurnDraw, null, null);
}

export const tryPlayChampion = (game: Game, botPlayer: Player): boolean => {
    let playedAny = false;

    while (true) {
        const champion = findPlayableCard(botPlayer, player =>
            player.hand.find(card => isChampion(card))) as ChampionCard;

        if (!champion) break;

        const locations = getPlayerActionsAllowedBoardLocations(
            game,
            PlayerActionsName.Summon,
            champion
        );

        if (locations.locations.length === 0) break;

        // Choose first available location
        const targetLocation = locations.locations[0];
        const success = executeAction(game, PlayerActionsName.Summon, champion, targetLocation);

        if (!success) break;
        playedAny = true;
    }

    return playedAny;
}

export const tryChampionLearnedActions = (game: Game): boolean => {
    let playedAny = false;
    // Re-fetch champions each iteration since board state changes (movement, kills)
    let champions = getPlayerSummonedChampions(game);

    for (const summonedChampion of champions) {
        if (summonedChampion.championCard.stm <= 0) continue;

        // Try learned actions
        const allActions = [
            ...summonedChampion.championCard.learnedActionsCards.map(card => ({ card, isAttached: false })),
            ...summonedChampion.championCard.attachedActionsCards.map(card => ({ card, isAttached: true }))
        ];

        for (const { card: actionCard, isAttached } of allActions) {
            if (actionCard.wasPlayed) continue;

            const locations = getChampionsActionsAllowedBoardLocations(game, actionCard, summonedChampion.sourceLocation);

            if (locations.locations.length === 0) continue;

            const targetLocation = pickTargetLocation(game, actionCard, locations.locations, summonedChampion.sourceLocation);

            if (!targetLocation) continue;

            const result = championAction(game, actionCard, summonedChampion.sourceLocation, targetLocation, isAttached);

            if (result === 'success') {
                playedAny = true;
                console.log('Bot champion action: ', { action: actionCard.name, result, sourceLocation: summonedChampion.sourceLocation, targetLocation });
                // After movement, the champion's source location changes — re-fetch
                if (actionCard.actionType === ActionType.Movement) {
                    champions = getPlayerSummonedChampions(game);
                    break; // Re-evaluate this champion's new position
                }
            }
        }
    }

    return playedAny;
}

const pickTargetLocation = (
    game: Game,
    actionCard: ActionCard,
    locations: BoardLocation[],
    sourceLocation: BoardLocation
): BoardLocation | null => {
    if (actionCard.actionType === ActionType.Movement) {
        // For movement, pick an empty cell (prefer moving toward the opponent's side)
        const emptyLocations = locations.filter(loc => game.board[loc.rowIndex][loc.columnIndex] === null);
        if (emptyLocations.length === 0) return null;

        // Bot is player index 1, so prefer moving toward higher row indices (toward player 0's side)
        const opponentDirection = game.playerIndex === 1 ? 1 : -1;
        emptyLocations.sort((a, b) => (b.rowIndex - a.rowIndex) * opponentDirection);
        return emptyLocations[0];
    }

    if (actionCard.actionType === ActionType.Buff) {
        // For buffs, target own champions
        const ownChampionLocations = locations.filter(loc => {
            const cell = game.board[loc.rowIndex][loc.columnIndex];
            return isChampion(cell) && cell.playerIndex === game.playerIndex;
        });
        // Also allow self-targeting (distance 0)
        if (ownChampionLocations.length === 0) {
            const selfLocation = locations.find(loc =>
                loc.rowIndex === sourceLocation.rowIndex && loc.columnIndex === sourceLocation.columnIndex);
            return selfLocation ?? null;
        }
        return ownChampionLocations[0];
    }

    // For attacks (Melee, Ranged, Magic), pick a cell containing an enemy entity
    const enemyLocations = locations.filter(loc => {
        const cell = game.board[loc.rowIndex][loc.columnIndex];
        return cell !== null && cell.playerIndex !== game.playerIndex;
    });

    if (enemyLocations.length === 0) return null;
    return enemyLocations[0];
}

export const tryPlayGear = (game: Game, botPlayer: Player): boolean => {
    let playedAny = false;

    while (true) {
        const gear = findPlayableCard(botPlayer, player =>
            player.hand.find(card => isGear(card))) as GearCard;

        if (!gear) break;

        const locations = getPlayerActionsAllowedBoardLocations(
            game,
            PlayerActionsName.Equip,
            gear
        );

        if (locations.locations.length === 0) break;

        // Choose first available champion
        const targetLocation = locations.locations[0];
        const success = executeAction(game, PlayerActionsName.Equip, gear, targetLocation);

        if (!success) break;
        playedAny = true;
    }

    return playedAny;
}

export const tryPlayClass = (game: Game, botPlayer: Player): boolean => {
    let playedAny = false;

    while (true) {
        const classCard = findPlayableCard(botPlayer, player =>
            player.hand.find(card => isClass(card))) as ClassCard;

        if (!classCard) break;

        const locations = getPlayerActionsAllowedBoardLocations(
            game,
            PlayerActionsName.Upgrade,
            classCard
        );

        if (locations.locations.length === 0) break;

        // Choose first available champion to upgrade
        const targetLocation = locations.locations[0];
        const success = executeAction(game, PlayerActionsName.Upgrade, classCard, targetLocation);

        if (!success) break;
        playedAny = true;
    }

    return playedAny;
}

export const tryPlayAction = (game: Game, botPlayer: Player): boolean => {
    let playedAny = false;

    while (true) {
        const action = findPlayableCard(botPlayer, player =>
            player.hand.find(card => isAction(card))) as ActionCard;

        if (!action) break;

        const locations = getPlayerActionsAllowedBoardLocations(
            game,
            PlayerActionsName.Attach,
            action
        );

        if (locations.locations.length === 0) break;

        // Choose first available target
        const targetLocation = locations.locations[0];
        const success = executeAction(game, PlayerActionsName.Attach, action, targetLocation);

        if (!success) break;
        playedAny = true;
    }

    return playedAny;
}

export const tryPlayOrder = (game: Game, botPlayer: Player): boolean => {
    let playedAny = false;

    while (true) {
        const order = findPlayableCard(botPlayer, player =>
            player.hand.find(card => isOrder(card))) as OrderCard;

        if (!order) break;

        // Find valid cards for discard requirement
        const { cardToDiscard, amountToDiscard } = getValidCardsForDiscard(botPlayer, botPlayer.hand, order);

        // Select only the required number of discard cards
        const selectedDiscard = amountToDiscard === -1
            ? cardToDiscard
            : cardToDiscard.slice(0, amountToDiscard);

        if (amountToDiscard !== 0 && selectedDiscard.length === 0) break;

        const success = executeAction(game, PlayerActionsName.PlayOrder, order, null, selectedDiscard);

        if (!success) break;
        playedAny = true;
    }

    return playedAny;
}

export const findPlayableCard = (botPlayer: Player, finder: (player: Player) => GameCard | undefined): GameCard | null => {
    return finder(botPlayer) || null;
}

export const executeAction = (
    game: Game,
    action: PlayerActionsName,
    card: GameCard | null,
    targetLocation: BoardLocation | null,
    extraData?: any
): boolean => {
    const result = playerAction(action, [], game, { selectedCard: card, extendedData: targetLocation ?? extraData, cardsToDraw: null });
    console.log('Bot: ', { action, result, player: game.players[1] });
    return result === 'success';
}

export const endTurn = (game: Game): void => {
    executeAction(game, PlayerActionsName.EndTurn, null, null);
}

// Helper method to evaluate board state and make strategic decisions
export const evaluateBoard = (game: Game): number => {
    const player = game.players[game.playerIndex];
    const opponent = game.players[1 - game.playerIndex];

    let score = 0;

    // Count champions on board
    game.board.forEach(row => row.forEach(cell => {
        if (isChampion(cell)) {
            if (cell.playerIndex === game.playerIndex) {
                score += 10; // Own champion
                score += cell.currentHp; // Add HP value
                score += (cell.calStr + cell.calDex + cell.calInt) / 3; // Add stats value
            } else {
                score -= 10; // Opponent's champion
                score -= cell.currentHp;
                score -= (cell.calStr + cell.calDex + cell.calInt) / 3;
            }
        }
    }));

    // Value cards in hand
    score += player.hand.length * 2;
    score -= opponent.hand.length * 2;

    return score;
}

export const getPlayerSummonedChampions = (game: Game): GetPlayerSummonedChampionsResult[] => {
    const champions: GetPlayerSummonedChampionsResult[] = [];

    game.board.forEach((row, rowIndex) => {
        row.forEach((card, columnIndex) => {
            if (isChampion(card) && card.playerIndex === game.playerIndex)
                champions.push({ sourceLocation: { rowIndex, columnIndex }, championCard: card });

        });
    });

    return champions;
}