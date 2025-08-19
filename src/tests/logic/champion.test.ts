import {
    GameCard,
    ChampionCard,
    ActionCard,
    BoardLocation,
    StatusEffect,
    GameEffect,
    SummoningCard,
    GearCard,
    Damage
} from '../../logic/game-card';
import {
    Stats,
    ActionType,
    MathModifier,
    EffectStatus,
    GameStatus,
    ActionDirections,
    ChampionDirection,
    Race,
    GearCategory,
    BodyPart
} from '../../logic/enums';
import { Game } from '../../logic/game';
import { Player } from '../../logic/player';
import {
    checkRepeatableAction,
    calculateAndUpdateRepeatableActions,
    getPlayer,
    setRepeatableActionActivations,
    getChampionDamageValueByStat,
    championAction,
    calculateStats,
    checkValidTarget,
    calculateDamageWithModifier,
    getChampionDirection,
    moveChampion,
    calculateDistance,
    applyDamage,
    applyHeal,
    breakGear,
    applyTargetEffects,
    getActionCardFromChampion,
    checkAndPushAllowedLocation,
    checkAndPushHitAreaUpDownLocations,
    checkAndPushHitAreaLeftRightLocations,
    getBoardLocationInStraightPath,
    removeChampionFromBoard,
    getLastPlayedActionGuid,
    successfulAttackGameUpdate,
    attack,
    checkAndRemoveFromAttachedActions
} from '../../logic/champion';

describe('Champion Logic Tests', () => {
    let mockGame: Game;
    let mockPlayer: Player;
    let mockChampion: ChampionCard;
    let mockActionCard: ActionCard;
    let mockCrystal: SummoningCard;
    let mockGearCard: GearCard;

    beforeEach(() => {
        // Setup basic mocks before each test
        mockChampion = {
            guid: 'champion1',
            playerIndex: 0,
            name: 'Test Champion',
            str: 5,
            dex: 5,
            int: 5,
            hp: 10,
            calStr: 5,
            calDex: 5,
            calInt: 5,
            calHp: 10,
            currentHp: 10,
            stm: 3,
            armor: 2,
            mental: 2,
            direction: ChampionDirection.Down,
            body: null,
            rightHand: null,
            leftHand: null,
            upgrade: null,
            learnedActionsCards: [],
            attachedActionsCards: [],
            statusEffects: [],
            // Add missing required properties
            learnedActions: [],
            class: 'TestClass',
            calClass: 'TestClass',
            race: Race.Humans,
            effects: [],
            hitPoints: 10,
            isBlocking: false,
            image: 'test-image.png',
        } as ChampionCard;

        mockActionCard = {
            guid: 'action1',
            name: 'Test Action',
            playerIndex: 0,
            actionType: ActionType.Melee,
            damages: [{
                dmgStat: Stats.Str,
                dmgModifier: null,
                dmgModifierValue: null,
            }],
            isRepeatable: false,
            repeatableStat: null,
            repeatableActivationLeft: null,
            wasPlayed: false,
            distance: [1, 1],
            direction: ActionDirections.Straight,
            isHeal: false,
            targetEffects: [],
            isFreeTargeting: false,
            isBackTargeting: false,
            // Add missing properties
            requiredClassName: null,
            requiredStat: null,
            requiredStatValue: null,
            requiredGearCategory: null,
            hitAreas: {},
            image: 'test-action.png',
            description: 'Test description'
        } as ActionCard;

        mockPlayer = {
            playerIndex: 0,
            name: 'Test Player',
            hand: [],
            deck: [],
            usedCards: [],
            actionsLog: [],
            crystals: [],
            didDraw: false,
            summonsLeft: 1,
            effects: [],
            startingChampion: null
        } as Player;

        mockGame = {
            playerIndex: 0,
            playingPlayerIndex: 0,
            players: [mockPlayer],
            board: Array(8).fill(null).map(() => Array(8).fill(null)),
            status: GameStatus.onGoing,
            loser: null
        } as Game;

        mockCrystal = {
            guid: 'crystal1',
            playerIndex: 0,
            name: 'Test Crystal',
            currentHp: 10,
            isCrystal: true,
            image: 'test-crystal.png',
            effect: {} as GameEffect,
            hp: 10,
            calHp: 10,
            isBlocking: false
        } as SummoningCard;

        mockGearCard = {
            guid: 'gear1',
            name: 'Test Gear',
            playerIndex: 0,
            image: 'test.png',
            str: 1,
            dex: 1,
            int: 1,
            hp: 1,
            category: GearCategory.Armors,
            bodyPart: BodyPart.Body,
            description: 'Test gear',
            effect: null
        } as GearCard;

        // Place champion on board
        mockGame.board[3][3] = mockChampion;
    });

    describe('checkRepeatableAction', () => {
        it('should return false for non-repeatable action', () => {
            const result = checkRepeatableAction(mockPlayer, mockActionCard);
            expect(result).toBe(false);
        });

        it('should return true for valid repeatable action', () => {
            mockActionCard.isRepeatable = true;
            mockActionCard.repeatableActivationLeft = 2;
            mockPlayer.actionsLog.push({ card: mockActionCard, timestamp: Date.now(), name: mockActionCard.name });

            const result = checkRepeatableAction(mockPlayer, mockActionCard);
            expect(result).toBe(true);
        });
    });

    describe('getChampionDamageValueByStat', () => {
        it('should return correct Strength value', () => {
            const result = getChampionDamageValueByStat(mockChampion, Stats.Str);
            expect(result).toBe(5);
        });

        it('should return correct Dexterity value', () => {
            const result = getChampionDamageValueByStat(mockChampion, Stats.Dex);
            expect(result).toBe(5);
        });

        it('should return correct Intelligence value', () => {
            const result = getChampionDamageValueByStat(mockChampion, Stats.Int);
            expect(result).toBe(5);
        });

        it('should return 0 for null stat', () => {
            const result = getChampionDamageValueByStat(mockChampion, null);
            expect(result).toBe(0);
        });
    });

    describe('calculateStats', () => {
        it('should calculate base stats correctly', () => {
            calculateStats(mockChampion);
            expect(mockChampion.calStr).toBe(5);
            expect(mockChampion.calDex).toBe(5);
            expect(mockChampion.calInt).toBe(5);
            expect(mockChampion.calHp).toBe(10);
        });

        it('should apply status effect buffs', () => {
            mockChampion.statusEffects = [
                { name: EffectStatus.StrBoost, stat: Stats.Str, value: 2, duration: 2 }
            ];

            calculateStats(mockChampion);
            expect(mockChampion.calStr).toBe(7);
        });

        it('should not allow negative stats', () => {
            mockChampion.str = -5;
            calculateStats(mockChampion);
            expect(mockChampion.calStr).toBe(0);
        });
    });

    describe('championAction', () => {
        it('should prevent action when champion has no stamina', () => {
            mockChampion.stm = 0;
            mockChampion.learnedActionsCards.push(mockActionCard);
            const sourceLocation: BoardLocation = { rowIndex: 3, columnIndex: 3 };
            const targetLocation: BoardLocation = { rowIndex: 3, columnIndex: 4 };

            const result = championAction(mockGame, mockActionCard, sourceLocation, targetLocation, false);
            expect(result).toContain('Champion is not allowed to make action');
        });

        it('should prevent action on wrong player turn', () => {
            mockGame.playingPlayerIndex = 1;
            const sourceLocation: BoardLocation = { rowIndex: 3, columnIndex: 3 };
            const targetLocation: BoardLocation = { rowIndex: 3, columnIndex: 4 };

            const result = championAction(mockGame, mockActionCard, sourceLocation, targetLocation, false);
            expect(result).toContain('can not play on other player');
        });
    });

    describe('setRepeatableActionActivations', () => {
        it('should set correct number of activations based on stat', () => {
            mockActionCard.isRepeatable = true;
            mockActionCard.repeatableStat = Stats.Str;
            mockChampion.calStr = 3;

            setRepeatableActionActivations(mockActionCard, mockChampion);
            expect(mockActionCard.repeatableActivationLeft).toBe(3);
        });

        it('should not set activations for non-repeatable action', () => {
            mockActionCard.isRepeatable = false;
            mockActionCard.repeatableStat = Stats.Str;

            setRepeatableActionActivations(mockActionCard, mockChampion);
            expect(mockActionCard.repeatableActivationLeft).toBeNull();
        });
    });

    describe('getPlayer', () => {
        it('should return correct player', () => {
            const result = getPlayer(mockGame);
            expect(result).toBe(mockGame.players[0]);
        });
    });

    describe('checkValidTarget', () => {
        it('should return true for champion targets', () => {
            const result = checkValidTarget(mockChampion);
            expect(result).toBe(true);
        });

        it('should return true for crystal targets', () => {
            const result = checkValidTarget(mockCrystal);
            expect(result).toBe(true);
        });

        it('should return false for non-champion non-crystal targets', () => {
            const invalidTarget = {
                guid: 'invalid1',
                playerIndex: 0,
                name: 'Invalid Target'
            } as GameCard;

            const result = checkValidTarget(invalidTarget);
            expect(result).toBe(false);
        });
    });

    describe('calculateDamageWithModifier', () => {
        it('should return base damage when no modifier', () => {
            const result = calculateDamageWithModifier(5, null, null);
            expect(result).toBe(5);
        });

        it('should add modifier value', () => {
            const result = calculateDamageWithModifier(5, MathModifier.Plus, 2);
            expect(result).toBe(7);
        });

        it('should multiply by modifier value', () => {
            const result = calculateDamageWithModifier(5, MathModifier.Multiply, 2);
            expect(result).toBe(10);
        });
    });

    describe('getChampionDirection', () => {
        it('should return Down when target is below', () => {
            const source: BoardLocation = { rowIndex: 1, columnIndex: 1 };
            const target: BoardLocation = { rowIndex: 2, columnIndex: 1 };
            expect(getChampionDirection(source, target)).toBe(ChampionDirection.Down);
        });

        it('should return Up when target is above', () => {
            const source: BoardLocation = { rowIndex: 2, columnIndex: 1 };
            const target: BoardLocation = { rowIndex: 1, columnIndex: 1 };
            expect(getChampionDirection(source, target)).toBe(ChampionDirection.Up);
        });

        it('should return Right when target is to the right', () => {
            const source: BoardLocation = { rowIndex: 1, columnIndex: 1 };
            const target: BoardLocation = { rowIndex: 1, columnIndex: 2 };
            expect(getChampionDirection(source, target)).toBe(ChampionDirection.Right);
        });

        it('should return Left when target is to the left', () => {
            const source: BoardLocation = { rowIndex: 1, columnIndex: 2 };
            const target: BoardLocation = { rowIndex: 1, columnIndex: 1 };
            expect(getChampionDirection(source, target)).toBe(ChampionDirection.Left);
        });
    });

    describe('moveChampion', () => {
        it('should prevent movement to occupied space', () => {
            const board = Array(8).fill(null).map(() => Array(8).fill(null));
            board[3][4] = mockCrystal; // Place blocker
            const source: BoardLocation = { rowIndex: 3, columnIndex: 3 };
            const target: BoardLocation = { rowIndex: 3, columnIndex: 4 };

            const result = moveChampion(board, mockChampion, mockActionCard, source, target);
            expect(result.status).toContain('Target location isn\'t empty');
        });

        it('should prevent movement with zero dexterity', () => {
            const board = Array(8).fill(null).map(() => Array(8).fill(null));
            mockChampion.calDex = 0;
            const source: BoardLocation = { rowIndex: 3, columnIndex: 3 };
            const target: BoardLocation = { rowIndex: 3, columnIndex: 4 };

            const result = moveChampion(board, mockChampion, mockActionCard, source, target);
            expect(result.status).toBe('Dex must be higher than zero');
        });

        it('should prevent diagonal movement', () => {
            const board = Array(8).fill(null).map(() => Array(8).fill(null));
            const source: BoardLocation = { rowIndex: 3, columnIndex: 3 };
            const target: BoardLocation = { rowIndex: 4, columnIndex: 4 };

            const result = moveChampion(board, mockChampion, mockActionCard, source, target);
            expect(result.status).toBe('Champion must move in one direction');
        });
    });

    describe('calculateDistance', () => {
        it('should calculate Manhattan distance correctly', () => {
            const source: BoardLocation = { rowIndex: 1, columnIndex: 1 };
            const target: BoardLocation = { rowIndex: 3, columnIndex: 4 };

            const result = calculateDistance(source, target);
            expect(result).toBe(5); // |3-1| + |4-1| = 2 + 3 = 5
        });
    });

    describe('applyDamage', () => {
        it('should apply physical damage correctly', () => {
            const target = { ...mockChampion, armor: 2, currentHp: 10 };
            const action = { ...mockActionCard, damages: [{ dmgStat: Stats.Str, dmgModifierValue: null, dmgModifier: null }] as Damage[] };

            applyDamage(mockChampion, action, target);
            expect(target.currentHp).toBe(7); // 5 (str) - 2 (armor) = 3 damage
        });

        it('should apply magical damage correctly', () => {
            const target = { ...mockChampion, mental: 1, currentHp: 10 };
            const action = { ...mockActionCard, damages: [{ dmgStat: Stats.Int, dmgModifierValue: null, dmgModifier: null }] as Damage[] };

            applyDamage(mockChampion, action, target);
            expect(target.currentHp).toBe(6); // 5 (int) - 1 (mental) = 4 damage
        });
    });

    describe('applyHeal', () => {
        it('should heal up to missing health', () => {
            const target = { ...mockChampion, calHp: 10, currentHp: 5 };
            const action = { ...mockActionCard, isHeal: true, dmgStat: Stats.Int };

            applyHeal(mockChampion, action, target);
            expect(target.currentHp).toBe(10);
        });

        it('should not heal above max health', () => {
            const target = { ...mockChampion, calHp: 10, currentHp: 8 };
            const action = { ...mockActionCard, isHeal: true, dmgStat: Stats.Int };

            applyHeal(mockChampion, action, target);
            expect(target.currentHp).toBe(10);
        });
    });

    describe('breakGear', () => {
        it('should break random gear piece', () => {
            mockChampion.body = {
                guid: 'gear1',
                name: 'Test Gear',
                playerIndex: 0,
                image: 'test.png',
                str: 1,
                dex: 1,
                int: 1,
                hp: 1,
                category: GearCategory.Armors,
                bodyPart: BodyPart.Body
            };
            mockChampion.rightHand = {
                guid: 'gear2',
                name: 'Test Gear',
                playerIndex: 0,
                image: 'test.png',
                str: 1,
                dex: 1,
                int: 1,
                hp: 1,
                category: GearCategory.Swords,
                bodyPart: BodyPart.Hand
            };

            breakGear(mockChampion);

            const hasGearBroken =
                mockChampion.body === null ||
                mockChampion.rightHand === null;
            expect(hasGearBroken).toBe(true);
        });
    });

    describe('applyTargetEffects', () => {
        it('should apply duration effects to champion', () => {
            const effects: StatusEffect[] = [
                { name: EffectStatus.StrBoost, stat: Stats.Str, value: 2, duration: 2 }
            ];

            applyTargetEffects(effects, mockChampion);
            expect(mockChampion.statusEffects).toHaveLength(1);
            expect(mockChampion.statusEffects[0]).toEqual(effects[0]);
        });

        it('should apply break gear effect immediately', () => {
            mockChampion.body = {
                guid: 'gear1',
                name: 'Test Gear',
                playerIndex: 0,
                image: 'test.png',
                str: 1,
                dex: 1,
                int: 1,
                hp: 1,
                category: GearCategory.Armors,
                bodyPart: BodyPart.Body
            };

            const effects: StatusEffect[] = [
                { name: EffectStatus.BreakGear, duration: 0, stat: null, value: null }
            ];

            applyTargetEffects(effects, mockChampion);
            expect(mockChampion.body).toBeNull();
        });
    });

    describe('getActionCardFromChampion', () => {
        it('should find card in learned actions', () => {
            mockChampion.learnedActionsCards = [mockActionCard];
            const result = getActionCardFromChampion(mockChampion, mockActionCard.guid);
            expect(result).toBe(mockActionCard);
        });

        it('should find card in attached actions', () => {
            mockChampion.attachedActionsCards = [mockActionCard];
            const result = getActionCardFromChampion(mockChampion, mockActionCard.guid);
            expect(result).toBe(mockActionCard);
        });

        it('should return null if card not found', () => {
            const result = getActionCardFromChampion(mockChampion, 'nonexistent-guid');
            expect(result).toBeNull();
        });
    });

    describe('checkAndPushAllowedLocation', () => {
        let board: (GameCard | null)[][];
        let allowedLocations: BoardLocation[];

        beforeEach(() => {
            board = Array(8).fill(null).map(() => Array(8).fill(null));
            allowedLocations = [];
        });

        it('should add valid location to allowed locations', () => {
            const newLocation: BoardLocation = { rowIndex: 3, columnIndex: 3 };
            checkAndPushAllowedLocation(board, allowedLocations, newLocation, true);
            expect(allowedLocations).toContainEqual(newLocation);
        });

        it('should not add location if blocked and stopOnBlockers is true', () => {
            board[3][3] = mockChampion;
            const newLocation: BoardLocation = { rowIndex: 3, columnIndex: 3 };
            checkAndPushAllowedLocation(board, allowedLocations, newLocation, true);
            expect(allowedLocations).toHaveLength(0);
        });
    });

    describe('calculateAndUpdateRepeatableActions', () => {
        it('should update repeatable actions that were not played', () => {
            const actionCard = { ...mockActionCard, isRepeatable: true, repeatableStat: Stats.Str };
            mockChampion.calStr = 3;

            calculateAndUpdateRepeatableActions([actionCard], mockChampion);
            expect(actionCard.repeatableActivationLeft).toBe(3);
        });

        it('should not update non-repeatable actions', () => {
            const actionCard = { ...mockActionCard, isRepeatable: false };
            calculateAndUpdateRepeatableActions([actionCard], mockChampion);
            expect(actionCard.repeatableActivationLeft).toBeNull();
        });
    });

    describe('checkAndPushHitAreaUpDownLocations', () => {
        let board: (GameCard | null)[][];
        let allowedLocations: BoardLocation[];

        beforeEach(() => {
            board = Array(8).fill(null).map(() => Array(8).fill(null));
            allowedLocations = [];
        });

        it('should add right hit area location', () => {
            const hitArea = { right: 1, left: 0 };
            checkAndPushHitAreaUpDownLocations(hitArea, board, allowedLocations, 3, 3, true);
            expect(allowedLocations).toContainEqual({ rowIndex: 3, columnIndex: 4 });
        });

        it('should add left hit area location', () => {
            const hitArea = { right: 0, left: 1 };
            checkAndPushHitAreaUpDownLocations(hitArea, board, allowedLocations, 3, 3, true);
            expect(allowedLocations).toContainEqual({ rowIndex: 3, columnIndex: 2 });
        });

        it('should not add locations when hitArea is undefined', () => {
            checkAndPushHitAreaUpDownLocations(undefined, board, allowedLocations, 3, 3, true);
            expect(allowedLocations).toHaveLength(0);
        });
    });

    describe('checkAndPushHitAreaLeftRightLocations', () => {
        let board: (GameCard | null)[][];
        let allowedLocations: BoardLocation[];

        beforeEach(() => {
            board = Array(8).fill(null).map(() => Array(8).fill(null));
            allowedLocations = [];
        });

        it('should add right hit area location', () => {
            const hitArea = { right: 1, left: 0 };
            checkAndPushHitAreaLeftRightLocations(hitArea, board, allowedLocations, 3, 3, true);
            expect(allowedLocations).toContainEqual({ rowIndex: 4, columnIndex: 3 });
        });

        it('should add left hit area location', () => {
            const hitArea = { right: 0, left: 1 };
            checkAndPushHitAreaLeftRightLocations(hitArea, board, allowedLocations, 3, 3, true);
            expect(allowedLocations).toContainEqual({ rowIndex: 2, columnIndex: 3 });
        });

        it('should not add locations when hitArea is undefined', () => {
            checkAndPushHitAreaLeftRightLocations(undefined, board, allowedLocations, 3, 3, true);
            expect(allowedLocations).toHaveLength(0);
        });
    });

    describe('getBoardLocationInStraightPath', () => {
        let board: (GameCard | null)[][];

        beforeEach(() => {
            board = Array(8).fill(null).map(() => Array(8).fill(null));
        });

        it('should return initial location for zero distance', () => {
            const initialLocation = { rowIndex: 3, columnIndex: 3 };
            const action = { ...mockActionCard, distance: [0, 0] };

            const result = getBoardLocationInStraightPath(board, initialLocation, action);
            expect(result).toEqual([initialLocation]);
        });

        it('should return locations in all directions within range', () => {
            const initialLocation = { rowIndex: 3, columnIndex: 3 };
            const action = { ...mockActionCard, distance: [1, 1] };

            const result = getBoardLocationInStraightPath(board, initialLocation, action);
            expect(result).toContainEqual({ rowIndex: 2, columnIndex: 3 }); // Up
            expect(result).toContainEqual({ rowIndex: 4, columnIndex: 3 }); // Down
            expect(result).toContainEqual({ rowIndex: 3, columnIndex: 2 }); // Left
            expect(result).toContainEqual({ rowIndex: 3, columnIndex: 4 }); // Right
        });

        it('should stop at blockers when not free targeting', () => {
            const initialLocation = { rowIndex: 3, columnIndex: 3 };
            const action = { ...mockActionCard, distance: [1, 2], isFreeTargeting: false };
            board[3][4] = mockChampion; // Place blocker

            const result = getBoardLocationInStraightPath(board, initialLocation, action);
            expect(result.some(loc => loc.rowIndex === 3 && loc.columnIndex === 5)).toBe(false);
        });

        it('should include hit areas in path', () => {
            const initialLocation = { rowIndex: 3, columnIndex: 3 };
            const action = {
                ...mockActionCard,
                distance: [1, 1],
                hitAreas: { 1: { right: 1, left: 1 } }
            };

            const result = getBoardLocationInStraightPath(board, initialLocation, action);
            // Check for side locations at distance 1
            expect(result).toContainEqual({ rowIndex: 4, columnIndex: 4 }); // Diagonal right
            expect(result).toContainEqual({ rowIndex: 4, columnIndex: 2 }); // Diagonal left
        });
    });

    describe('removeChampionFromBoard', () => {
        it('should remove champion and all equipment', () => {
            mockChampion.body = mockGearCard;
            mockChampion.rightHand = mockGearCard;
            mockGame.board[3][3] = mockChampion;

            removeChampionFromBoard(mockGame, { rowIndex: 3, columnIndex: 3 });

            expect(mockGame.board[3][3]).toBeNull();
            expect(mockPlayer.usedCards).toContain(mockChampion);
            expect(mockPlayer.usedCards).toContain(mockGearCard);
        });

        it('should remove attached and learned actions', () => {
            mockChampion.learnedActionsCards = [mockActionCard];
            mockChampion.attachedActionsCards = [mockActionCard];
            mockGame.board[3][3] = mockChampion;

            removeChampionFromBoard(mockGame, { rowIndex: 3, columnIndex: 3 });

            expect(mockPlayer.usedCards).toContain(mockActionCard);
            expect(mockChampion.learnedActionsCards).toHaveLength(0);
            expect(mockChampion.attachedActionsCards).toHaveLength(0);
        });
    });

    describe('getLastPlayedActionGuid', () => {
        it('should return last played action record', () => {
            const actionRecord = { card: null, timestamp: Date.now(), name: 'Test Action' };
            mockPlayer.actionsLog.push(actionRecord);

            const result = getLastPlayedActionGuid(mockPlayer);
            expect(result).toBe(actionRecord);
        });
    });

    describe('successfulAttackGameUpdate', () => {
        it('should update game state after successful attack', () => {
            const sourceLocation = { rowIndex: 3, columnIndex: 3 };
            const targetLocation = { rowIndex: 3, columnIndex: 4 };
            const result = { status: 'success', targetedCard: null };

            successfulAttackGameUpdate(mockGame, mockPlayer, mockChampion, mockActionCard, result, sourceLocation, targetLocation);

            expect(mockActionCard.wasPlayed).toBe(true);
            expect(mockChampion.stm).toBe(2);
            expect(mockChampion.direction).toBe(ChampionDirection.Right);
        });

        it('should handle repeatable actions', () => {
            mockActionCard.isRepeatable = true;
            mockActionCard.repeatableActivationLeft = 2;

            const result = { status: 'success', targetedCard: null };
            successfulAttackGameUpdate(mockGame, mockPlayer, mockChampion, mockActionCard, result,
                { rowIndex: 0, columnIndex: 0 }, { rowIndex: 0, columnIndex: 1 });

            expect(mockActionCard.repeatableActivationLeft).toBe(1);
        });

        it('should end game when crystal is destroyed', () => {
            mockCrystal.currentHp = -1;
            const result = { status: 'success', targetedCard: mockCrystal };

            successfulAttackGameUpdate(mockGame, mockPlayer, mockChampion, mockActionCard, result,
                { rowIndex: 0, columnIndex: 0 }, { rowIndex: 0, columnIndex: 1 });

            expect(mockGame.status).toBe(GameStatus.over);
            expect(mockGame.loser).toBe(mockPlayer);
        });
    });

    describe('attack', () => {
        it('should prevent attack when champion is paralyzed', () => {
            mockChampion.statusEffects = [{ name: EffectStatus.Paralyze, duration: 1, stat: null, value: null }];
            const sourceLocation: BoardLocation = { rowIndex: 3, columnIndex: 3 };
            const targetLocation: BoardLocation = { rowIndex: 3, columnIndex: 4 };

            const result = attack(mockGame, mockChampion, mockActionCard, sourceLocation, targetLocation);
            expect(result.status).toContain('Paralyze');
        });

        it('should prevent attack when champion is silenced', () => {
            mockChampion.statusEffects = [{ name: EffectStatus.Silence, duration: 1, stat: null, value: null }];
            const sourceLocation: BoardLocation = { rowIndex: 3, columnIndex: 3 };
            const targetLocation: BoardLocation = { rowIndex: 3, columnIndex: 4 };

            const result = attack(mockGame, mockChampion, mockActionCard, sourceLocation, targetLocation);
            expect(result.status).toContain('Silence');
        });

        it('should prevent attack on invalid target', () => {
            const sourceLocation: BoardLocation = { rowIndex: 3, columnIndex: 3 };
            const targetLocation: BoardLocation = { rowIndex: 3, columnIndex: 4 };
            mockGame.board[3][4] = { ...mockActionCard, hp: 10, calHp: 10, currentHp: 10, isBlocking: false } as unknown as SummoningCard;

            const result = attack(mockGame, mockChampion, mockActionCard, sourceLocation, targetLocation);
            expect(result.status).toContain('Target is not a champion or crystal');
        });

        it('should successfully damage target', () => {
            const sourceLocation: BoardLocation = { rowIndex: 3, columnIndex: 3 };
            const targetLocation: BoardLocation = { rowIndex: 3, columnIndex: 4 };
            const actionCard = { ...mockActionCard, isFreeTargeting: true } as ActionCard;
            const target = { ...mockChampion, currentHp: 10, armor: 0 } as unknown as SummoningCard;
            mockGame.board[3][4] = target;

            const result = attack(mockGame, mockChampion, actionCard, sourceLocation, targetLocation);
            expect(result.status).toBe('success');
            expect(target.currentHp).toBeLessThan(10);
        });
    });

    describe('checkAndRemoveFromAttachedActions', () => {
        it('should remove action from attached cards', () => {
            mockChampion.attachedActionsCards = [mockActionCard];
            checkAndRemoveFromAttachedActions(mockPlayer, mockChampion, mockActionCard);
            expect(mockChampion.attachedActionsCards).not.toContain(mockActionCard);
            expect(mockPlayer.usedCards).toContain(mockActionCard);
        });

        it('should do nothing if action not found', () => {
            mockChampion.attachedActionsCards = [];
            checkAndRemoveFromAttachedActions(mockPlayer, mockChampion, mockActionCard);
            expect(mockPlayer.usedCards).not.toContain(mockActionCard);
        });
    });
}); 