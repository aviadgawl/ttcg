import { Game } from './game';
import { Player } from './player';
import { GameCard, ChampionCard, ActionCard, GearCard, ClassCard, OrderCard, isChampion, isGear, isAction, isOrder, isClass } from './game-card';
import { ActionType, PlayerActionsName } from './enums';
import { BoardLocation } from './game-card';
import { getPlayerActionsAllowedBoardLocations, getValidCardsForDiscard, playerAction } from './player';
import { getChampionsActionsAllowedBoardLocations } from './champion';

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
    botPlayer.summonsLeft > 0 && tryPlayClass(game, botPlayer);
    tryPlayAction(game, botPlayer);
    tryPlayOrder(game, botPlayer);

    // If no other moves, end turn
    endTurn(game);
}

export const performDraw = (game: Game): void => {
    executeAction(game, PlayerActionsName.TurnDraw, null, null);
}

export const tryPlayChampion = (game: Game, botPlayer: Player): boolean => {
    const champion = findPlayableCard(botPlayer, player =>
        player.hand.find(card => isChampion(card))) as ChampionCard;

    if (!champion) return false;

    const locations = getPlayerActionsAllowedBoardLocations(
        game,
        PlayerActionsName.Summon,
        champion
    );

    if (locations.locations.length === 0) return false;

    // Choose first available location
    const targetLocation = locations.locations[0];
    return executeAction(game, PlayerActionsName.Summon, champion, targetLocation);
}

export const tryToChampionsLearnedActions = (game: Game): boolean => {
    const champions = getPlayerSummonedChampions(game);

    champions.forEach(summonedChampion => {
        if(summonedChampion.championCard.stm > 0 && summonedChampion.championCard.learnedActionsCards.length > 0) {
            const unplayedActionCards = summonedChampion.championCard.learnedActionsCards.filter(actionCard => actionCard.wasPlayed === false);

            unplayedActionCards.forEach( actionCard => {
                if(actionCard.actionType === ActionType.Movement) {

                    const locations = getChampionsActionsAllowedBoardLocations(game, actionCard, summonedChampion.sourceLocation);

                }
            });
        }
    });

    return true;
}

export const tryPlayGear = (game: Game, botPlayer: Player): boolean => {
    const gear = findPlayableCard(botPlayer, player =>
        player.hand.find(card => isGear(card))) as GearCard;

    if (!gear) return false;

    const locations = getPlayerActionsAllowedBoardLocations(
        game,
        PlayerActionsName.Equip,
        gear
    );

    if (locations.locations.length === 0) return false;

    // Choose first available champion
    const targetLocation = locations.locations[0];
    return executeAction(game, PlayerActionsName.Equip, gear, targetLocation);
}

export const tryPlayClass = (game: Game, botPlayer: Player): boolean => {
    const classCard = findPlayableCard(botPlayer, player =>
        player.hand.find(card => isClass(card))) as ClassCard;

    if (!classCard) return false;

    const locations = getPlayerActionsAllowedBoardLocations(
        game,
        PlayerActionsName.Upgrade,
        classCard
    );

    if (locations.locations.length === 0) return false;

    // Choose first available champion to upgrade
    const targetLocation = locations.locations[0];
    return executeAction(game, PlayerActionsName.Upgrade, classCard, targetLocation);
}

export const tryPlayAction = (game: Game, botPlayer: Player): boolean => {
    const action = findPlayableCard(botPlayer, player =>
        player.hand.find(card => isAction(card))) as ActionCard;

    if (!action) return false;

    const locations = getPlayerActionsAllowedBoardLocations(
        game,
        PlayerActionsName.Attach,
        action
    );

    if (locations.locations.length === 0) return false;

    // Choose first available target
    const targetLocation = locations.locations[0];
    return executeAction(game, PlayerActionsName.Attach, action, targetLocation);
}

export const tryPlayOrder = (game: Game, botPlayer: Player): boolean => {
    const order = findPlayableCard(botPlayer, player =>
        player.hand.find(card => isOrder(card))) as OrderCard;

    if (!order) return false;

    // Find valid cards for discard requirement
    const { cardToDiscard } = getValidCardsForDiscard(botPlayer, botPlayer.hand, order);

    if (cardToDiscard.length === 0) return false;

    return executeAction(game, PlayerActionsName.PlayOrder, order, null, cardToDiscard);
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
    const result = playerAction(action, [], game, { selectedCard: card, extendedData: targetLocation || extraData });
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
                champions.push({sourceLocation: {rowIndex, columnIndex} ,championCard: card});

        });
    });

    return champions;
}