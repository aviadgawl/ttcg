import { Game } from './game';
import { Player } from './player';
import { GameCard, ChampionCard, ActionCard, GearCard, ClassCard, OrderCard, isChampion, isGear, isAction, isOrder, isClass } from './game-card';
import { PlayerActionsName, CardType } from './enums';
import { BoardLocation } from './game-card';
import { getPlayerActionsAllowedBoardLocations, getValidCardsForDiscard, playerAction } from './player';

export class GameBot {
    private playerTwo: Player;
    private botPlayerIndex: number = 1;

    constructor(private game: Game) {
        const player = this.game.players[this.game.playerIndex];
        this.playerTwo = structuredClone(player);

        this.game.players.push(this.playerTwo);
    }

    makeMove(): void {
        // Priority of actions
        if (!this.playerTwo.didDraw) {
            this.performDraw();
            return;
        }

        // Try to play cards in order of priority
        if (this.tryPlayChampion()) return;
        if (this.tryPlayGear()) return;
        if (this.tryPlayClass()) return;
        if (this.tryPlayAction()) return;
        if (this.tryPlayOrder()) return;
        
        // If no other moves, end turn
        this.endTurn();
    }

    private performDraw(): void {
        this.executeAction(PlayerActionsName.TurnDraw, null, null);
    }

    private tryPlayChampion(): boolean {
        const champion = this.findPlayableCard(player => 
            player.hand.find(card => isChampion(card))) as ChampionCard;
        
        if (!champion) return false;

        const locations = getPlayerActionsAllowedBoardLocations(
            this.game,
            PlayerActionsName.Summon,
            champion
        );

        if (locations.locations.length === 0) return false;

        // Choose first available location
        const targetLocation = locations.locations[0];
        return this.executeAction(PlayerActionsName.Summon, champion, targetLocation);
    }

    private tryPlayGear(): boolean {
        const gear = this.findPlayableCard(player => 
            player.hand.find(card => isGear(card))) as GearCard;
        
        if (!gear) return false;

        const locations = getPlayerActionsAllowedBoardLocations(
            this.game,
            PlayerActionsName.Equip,
            gear
        );

        if (locations.locations.length === 0) return false;

        // Choose first available champion
        const targetLocation = locations.locations[0];
        return this.executeAction(PlayerActionsName.Equip, gear, targetLocation);
    }

    private tryPlayClass(): boolean {
        const classCard = this.findPlayableCard(player => 
            player.hand.find(card => isClass(card))) as ClassCard;
        
        if (!classCard) return false;

        const locations = getPlayerActionsAllowedBoardLocations(
            this.game,
            PlayerActionsName.Upgrade,
            classCard
        );

        if (locations.locations.length === 0) return false;

        // Choose first available champion to upgrade
        const targetLocation = locations.locations[0];
        return this.executeAction(PlayerActionsName.Upgrade, classCard, targetLocation);
    }

    private tryPlayAction(): boolean {
        const action = this.findPlayableCard(player => 
            player.hand.find(card => isAction(card))) as ActionCard;
        
        if (!action) return false;

        const locations = getPlayerActionsAllowedBoardLocations(
            this.game,
            PlayerActionsName.Attach,
            action
        );

        if (locations.locations.length === 0) return false;

        // Choose first available target
        const targetLocation = locations.locations[0];
        return this.executeAction(PlayerActionsName.Attach, action, targetLocation);
    }

    private tryPlayOrder(): boolean {
        const order = this.findPlayableCard(player => 
            player.hand.find(card => isOrder(card))) as OrderCard;
        
        if (!order) return false;

        // Find valid cards for discard requirement
        const player = this.game.players[this.game.playerIndex];
        const { cardToDiscard } = getValidCardsForDiscard(player, player.hand, order);

        if (cardToDiscard.length === 0) return false;

        return this.executeAction(PlayerActionsName.PlayOrder, order, null, cardToDiscard);
    }

    private findPlayableCard(finder: (player: Player) => GameCard | undefined): GameCard | null {
        return finder(this.playerTwo) || null;
    }

    private executeAction(
        action: PlayerActionsName,
        card: GameCard | null,
        targetLocation: BoardLocation | null,
        extraData?: any
    ): boolean {
        const result = playerAction(action, [], this.game, targetLocation || extraData);

        return result === 'success';
    }

    private endTurn(): void {
        this.executeAction(PlayerActionsName.EndTurn, null, null);
    }

    // Helper method to evaluate board state and make strategic decisions
    private evaluateBoard(): number {
        const player = this.game.players[this.game.playerIndex];
        const opponent = this.game.players[1 - this.game.playerIndex];

        let score = 0;

        // Count champions on board
        this.game.board.forEach(row => row.forEach(cell => {
            if (isChampion(cell)) {
                if (cell.playerIndex === this.game.playerIndex) {
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
} 