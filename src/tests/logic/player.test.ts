import {
    GameCard,
    ChampionCard,
    ActionCard,
    OrderCard,
    GearCard,
    ClassCard
} from '../../logic/game-card';
import {
    Stats,
    GameStatus,
    PlayerActionsName,
    ChampionDirection,
    BodyPart,
    CardType,
    RewardType,
    EffectStatus,
    GearCategory,
    Race,
    ActionType,
    ActionDirections
} from '../../logic/enums';
import { Game } from '../../logic/game';
import { Player } from '../../logic/player';
import {
    isCardRequirementsValid,
    getValidCardsForDiscard,
    getSummonBoardLocations,
    drawFrom,
    drawSpecificCard,
    surrender,
    canSummon,
    summon,
    equip,
    upgrade,
    attachAction,
    removeFromArray,
    removeCard,
    findCard,
    turnDraw,
    initialDraw,
    getAmountToDraw,
    addCardToDeck,
    removeCardFromDeck,
    clearDeck,
    updateChampionStatusEffects,
    refreshLearnedActions,
    refreshArmorAndMental,
    refreshResources,
    isValidForUpgrade,
    isValidForAttach,
    playerAction,
    getPlayerActionsAllowedBoardLocations,
    shouldUpdateMultiplayerGame,
    getPlayerAllowedHandCardSelect,
    getValidChampionsBoardLocations,
    orderCardDrawLogic,
    setChampionLearnedActions,
    endTurn,
    isValidForEquip,
    playOrder,
    setStartingChampion,
    checkCardType,
    getAndRemoveActionCard,
    getChampionStatValue,
    getSummonBoardLocation
} from '../../logic/player';

describe('Player Logic Tests', () => {
    let mockGame: Game;
    let mockPlayer: Player;
    let mockChampion: ChampionCard;
    let mockActionCard: ActionCard;
    let mockOrderCard: OrderCard;
    let mockGearCard: GearCard;
    let mockClassCard: ClassCard;

    beforeEach(() => {
        mockPlayer = {
            name: 'Test Player',
            deck: [],
            hand: [],
            usedCards: [],
            didDraw: false,
            summonsLeft: 1,
            actionsLog: [],
            effects: [],
            startingChampion: null
        } as Player;

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
            learnedActions: ['action1', 'action2'],
            class: 'TestClass',
            calClass: 'TestClass',
            effects: [],
            isBlocking: false,
            image: 'test.png',
            race: Race.Humans,
            hitPoints: 10,
            hitArea: {},
            description: 'Test champion',
            effect: null
        } as ChampionCard;

        mockActionCard = {
            guid: 'action1',
            name: 'Test Action',
            playerIndex: 0,
            requiredClassName: null,
            requiredStat: null,
            requiredStatValue: null,
            requiredGearCategory: null,
            image: 'test.png',
            actionType: ActionType.Melee,
            dmgStat: Stats.Str,
            dmgModifier: null,
            dmgModifierValue: null,
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
            hitAreas: {},
            description: 'Test action',
            effect: null
        } as ActionCard;

        mockOrderCard = {
            guid: 'order1',
            name: 'Test Order',
            playerIndex: 0,
            requirement: [{ name: 'discard', amount: 1, cardType: CardType.ActionCard }],
            reward: {
                name: RewardType.Draw,
                amount: 1,
                cardType: null,
                cardNameContains: null,
                condition: null
            },
            duration: 0,
            image: 'test.png',
            description: 'Test order',
            info: 'Test order info'
        } as OrderCard;

        mockGearCard = {
            guid: 'gear1',
            name: 'Test Gear',
            playerIndex: 0,
            str: 1,
            dex: 1,
            int: 1,
            hp: 1,
            category: GearCategory.Armors,
            bodyPart: BodyPart.Body,
            image: 'test.png',
            description: 'Test gear',
            effect: null
        } as GearCard;

        mockClassCard = {
            guid: 'class1',
            name: 'Test Class',
            playerIndex: 0,
            class: 'NewClass',
            requiredClassName: 'TestClass',
            learnedAction: 'action1',
            image: 'test.png',
            description: 'Test class',
            effect: null,
            str: 1,
            dex: 1,
            int: 1,
            hp: 1
        } as ClassCard;

        mockGame = {
            playerIndex: 0,
            playingPlayerIndex: 0,
            players: [mockPlayer],
            board: Array(8).fill(null).map(() => Array(8).fill(null)),
            status: GameStatus.onGoing,
            loser: null
        } as Game;
    });

    describe('isCardRequirementsValid', () => {
        it('should return false for same card', () => {
            const result = isCardRequirementsValid(mockOrderCard, mockOrderCard.requirement[0], mockOrderCard);
            expect(result).toBe(false);
        });

        it('should return true when no card type requirement', () => {
            const requirement = { ...mockOrderCard.requirement[0], cardType: null };
            const result = isCardRequirementsValid(mockOrderCard, requirement, mockActionCard);
            expect(result).toBe(true);
        });
    });

    describe('getValidCardsForDiscard', () => {
        it('should return valid cards for discard', () => {
            mockPlayer.hand = [mockActionCard, mockOrderCard];
            const result = getValidCardsForDiscard(mockPlayer, [mockActionCard], mockOrderCard);
            expect(result.cardToDiscard).toContain(mockActionCard);
            expect(result.amountToDiscard).toBe(1);
        });
    });

    describe('getSummonBoardLocations', () => {
        it('should return valid locations for player 0', () => {
            const result = getSummonBoardLocations(mockGame);
            expect(result.locations.length).toBeGreaterThan(0);
            expect(result.locations[0].rowIndex).toBeGreaterThanOrEqual(6);
        });

        it('should return no locations when no summons left', () => {
            mockPlayer.summonsLeft = 0;
            const result = getSummonBoardLocations(mockGame);
            expect(result.locations.length).toBe(0);
        });
    });

    describe('drawFrom', () => {
        it('should draw specified number of cards', () => {
            mockPlayer.deck = [mockActionCard, mockOrderCard];
            const result = drawFrom(mockPlayer.deck, mockPlayer.hand, 1, null, null, null);
            expect(result).toBe('success');
            expect(mockPlayer.hand.length).toBe(1);
        });
    });

    describe('drawSpecificCard', () => {
        it('should draw specific card', () => {
            const pool = [mockActionCard];
            const hand: GameCard[] = [];
            const result = drawSpecificCard(pool, hand, mockActionCard, null);
            expect(result).toBe('success');
            expect(hand).toContain(mockActionCard);
        });
    });

    describe('surrender', () => {
        it('should set game status to over', () => {
            surrender(mockGame);
            expect(mockGame.status).toBe(GameStatus.over);
            expect(mockGame.loser).toBe(mockPlayer);
        });
    });

    describe('canSummon', () => {
        it('should allow valid summon', () => {
            const location = { rowIndex: 6, columnIndex: 0 };
            const result = canSummon(mockPlayer, mockGame, location, mockChampion);
            expect(result.isValid).toBe(true);
        });

        it('should prevent summon when no summons left', () => {
            mockPlayer.summonsLeft = 0;
            const location = { rowIndex: 6, columnIndex: 0 };
            const result = canSummon(mockPlayer, mockGame, location, mockChampion);
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('used his all his summons');
        });

        it('should prevent summon in wrong area', () => {
            const location = { rowIndex: 3, columnIndex: 0 }; // Middle of board
            const result = canSummon(mockPlayer, mockGame, location, mockChampion);
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('can not summon here');
        });

        it('should prevent summon on occupied space', () => {
            const location = { rowIndex: 6, columnIndex: 0 };
            mockGame.board[6][0] = mockChampion;
            const result = canSummon(mockPlayer, mockGame, location, mockChampion);
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('Location is not empty');
        });
    });

    describe('summon', () => {
        it('should successfully summon champion', () => {
            const location = { rowIndex: 6, columnIndex: 0 };
            mockPlayer.hand = [mockChampion];
            const result = summon(mockGame, mockChampion, location);
            expect(result).toBe('success');
            expect(mockGame.board[6][0]).toBe(mockChampion);
        });
    });

    describe('equip', () => {
        it('should equip gear to champion', () => {
            mockGame.board[0][0] = mockChampion;
            mockPlayer.hand = [mockGearCard];
            const result = equip(mockGame, mockPlayer, mockGearCard, { rowIndex: 0, columnIndex: 0 });
            expect(result).toBe('success');
            expect(mockChampion.body).toBe(mockGearCard);
        });
    });

    describe('upgrade', () => {
        it('should upgrade champion class', () => {
            mockGame.board[0][0] = mockChampion;
            mockPlayer.hand = [mockClassCard];
            const result = upgrade(mockGame, mockPlayer, mockClassCard, { rowIndex: 0, columnIndex: 0 });
            expect(result).toBe('success');
            expect(mockChampion.calClass).toBe('NewClass');
        });
    });

    describe('attachAction', () => {
        it('should attach action to champion', () => {
            mockGame.board[0][0] = mockChampion;
            mockPlayer.hand = [mockActionCard];
            const result = attachAction(mockGame, mockPlayer, mockActionCard, { rowIndex: 0, columnIndex: 0 });
            expect(result).toBe('success');
            expect(mockChampion.attachedActionsCards).toContain(mockActionCard);
        });
    });

    describe('Array and Card Operations', () => {
        describe('removeFromArray', () => {
            it('should remove item matching predicate', () => {
                const array = [mockActionCard, mockOrderCard];
                removeFromArray(array, item => item.guid === mockActionCard.guid);
                expect(array).not.toContain(mockActionCard);
                expect(array.length).toBe(1);
            });
        });

        describe('removeCard', () => {
            it('should remove specified card', () => {
                const cards = [mockActionCard, mockOrderCard];
                const removed = removeCard(cards, mockActionCard);
                expect(cards).not.toContain(mockActionCard);
                expect(removed).toContain(mockActionCard);
            });

            it('should return null if card not found', () => {
                const cards = [mockOrderCard];
                const removed = removeCard(cards, mockActionCard);
                expect(removed).toBeNull();
            });
        });

        describe('findCard', () => {
            it('should find card by name', () => {
                const cards = [mockActionCard];
                const found = findCard(cards, mockActionCard.name);
                expect(found).toBe(mockActionCard);
            });

            it('should return null if card not found', () => {
                const cards = [mockActionCard];
                const found = findCard(cards, 'nonexistent');
                expect(found).toBeNull();
            });
        });
    });

    describe('Draw Operations', () => {
        describe('turnDraw', () => {
            it('should draw one card on turn', () => {
                mockPlayer.deck = [mockActionCard];
                const result = turnDraw(mockPlayer);
                expect(result).toBe('success');
                expect(mockPlayer.didDraw).toBe(true);
                expect(mockPlayer.hand).toContain(mockActionCard);
            });

            it('should prevent drawing twice', () => {
                mockPlayer.didDraw = true;
                const result = turnDraw(mockPlayer);
                expect(result).toContain('already draw');
            });
        });

        describe('initialDraw', () => {
            it('should draw initial hand with starting champion', () => {
                mockPlayer.deck = [mockActionCard, mockOrderCard, mockGearCard, mockClassCard];
                mockPlayer.startingChampion = mockChampion;
                const result = initialDraw(mockPlayer);
                expect(result).toBe('success');
                expect(mockPlayer.hand.length).toBe(5); // 4 cards + champion
            });
        });

        describe('getAmountToDraw', () => {
            it('should count summoned champions', () => {
                mockGame.board[0][0] = mockChampion;
                const amount = getAmountToDraw(mockGame, 'SummonedChampions');
                expect(amount).toBe(1);
            });
        });
    });

    describe('Deck Management', () => {
        describe('addCardToDeck', () => {
            it('should add card to deck', () => {
                const cardsList = [mockActionCard];
                const result = addCardToDeck(mockGame, cardsList, mockActionCard);
                expect(result).toBe('success');
                expect(mockPlayer.deck).toContain(mockActionCard);
                expect(cardsList).not.toContain(mockActionCard);
            });

            it('should prevent more than 3 copies', () => {
                mockPlayer.deck = [mockActionCard, mockActionCard, mockActionCard];
                const cardsList = [mockActionCard];
                const result = addCardToDeck(mockGame, cardsList, mockActionCard);
                expect(result).toContain('Can not add more copies');
            });
        });

        describe('removeCardFromDeck', () => {
            it('should remove card from deck', () => {
                mockPlayer.deck = [mockActionCard];
                const cardsList: GameCard[] = [];
                const result = removeCardFromDeck(mockGame, cardsList, mockActionCard);
                expect(result).toBe('success');
                expect(mockPlayer.deck).not.toContain(mockActionCard);
                expect(cardsList).toContain(mockActionCard);
            });
        });

        describe('clearDeck', () => {
            it('should clear entire deck', () => {
                mockPlayer.deck = [mockActionCard, mockOrderCard];
                mockPlayer.startingChampion = mockChampion;
                const cardsList: GameCard[] = [];
                const result = clearDeck(mockGame, cardsList);
                expect(result).toBe('success');
                expect(mockPlayer.deck).toHaveLength(0);
                expect(cardsList).toContain(mockActionCard);
                expect(cardsList).toContain(mockOrderCard);
                expect(cardsList).toContain(mockChampion);
                expect(mockPlayer.startingChampion).toBeNull();
            });
        });
    });

    describe('Champion Status Management', () => {
        describe('updateChampionStatusEffects', () => {
            it('should reduce duration and remove expired effects', () => {
                mockChampion.statusEffects = [
                    { name: EffectStatus.StrBoost, duration: 1, stat: Stats.Str, value: 2 },
                    { name: EffectStatus.Burn, duration: 2, stat: null, value: 1 }
                ];
                updateChampionStatusEffects(mockChampion);
                expect(mockChampion.statusEffects).toHaveLength(1);
                expect(mockChampion.statusEffects[0].duration).toBe(1);
            });

            it('should apply burn damage', () => {
                const initialHp = mockChampion.currentHp;
                mockChampion.statusEffects = [
                    { name: EffectStatus.Burn, duration: 2, stat: null, value: 1 }
                ];
                updateChampionStatusEffects(mockChampion);
                expect(mockChampion.currentHp).toBe(initialHp - 1);
            });
        });

        describe('refreshLearnedActions', () => {
            it('should reset action states', () => {
                const action = { ...mockActionCard, wasPlayed: true };
                mockChampion.learnedActionsCards = [action];
                refreshLearnedActions(mockChampion);
                expect(mockChampion.learnedActionsCards[0].wasPlayed).toBe(false);
            });
        });

        describe('refreshArmorAndMental', () => {
            it('should reset armor and mental to calculated stats', () => {
                mockChampion.calStr = 5;
                mockChampion.calInt = 3;
                mockChampion.armor = 1;
                mockChampion.mental = 1;
                refreshArmorAndMental(mockChampion);
                expect(mockChampion.armor).toBe(5);
                expect(mockChampion.mental).toBe(3);
            });
        });
    });

    describe('Validation Functions', () => {
        describe('isValidForUpgrade', () => {
            it('should validate class requirements', () => {
                const result = isValidForUpgrade(mockChampion, mockClassCard);
                expect(result.isValid).toBe(true);
            });

            it('should reject invalid class', () => {
                mockChampion.calClass = 'WrongClass';
                const result = isValidForUpgrade(mockChampion, mockClassCard);
                expect(result.isValid).toBe(false);
            });
        });

        describe('isValidForAttach', () => {
            it('should validate stat requirements', () => {
                const action = { ...mockActionCard, requiredStat: Stats.Str, requiredStatValue: 5 };
                const result = isValidForAttach(mockChampion, action);
                expect(result.isValid).toBe(true);
            });

            it('should validate class requirements', () => {
                const action = { ...mockActionCard, requiredClassName: 'TestClass' };
                const result = isValidForAttach(mockChampion, action);
                expect(result.isValid).toBe(true);
            });
        });
    });

    describe('Game State Management', () => {
        describe('refreshResources', () => {
            it('should refresh player and champion resources', () => {
                mockGame.board[0][0] = mockChampion;
                refreshResources(mockGame, 0);
                expect(mockPlayer.didDraw).toBe(false);
                expect(mockPlayer.summonsLeft).toBe(1);
                expect(mockChampion.stm).toBe(2);
            });
        });

        describe('playerAction', () => {
            it('should handle draw action', () => {
                mockPlayer.deck = [mockActionCard];
                const result = playerAction(PlayerActionsName.TurnDraw, [], mockGame, {});
                expect(result).toBe('success');
                expect(mockPlayer.hand).toContain(mockActionCard);
            });

            it('should prevent actions on wrong turn', () => {
                mockGame.playingPlayerIndex = 1;
                const result = playerAction(PlayerActionsName.Summon, [], mockGame, {});
                expect(result).toContain('can not play on other player');
            });
        });
    });

    describe('UI Helper Functions', () => {
        let mockGame: Game;
        let mockPlayer: Player;
        let mockChampion: ChampionCard;

        beforeEach(() => {
            mockPlayer = {
                name: 'Test Player',
                deck: [],
                hand: [],
                usedCards: [],
                didDraw: false,
                summonsLeft: 1,
                actionsLog: [],
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
        });

        describe('getPlayerActionsAllowedBoardLocations', () => {
            it('should return summon locations', () => {
                const result = getPlayerActionsAllowedBoardLocations(mockGame, PlayerActionsName.Summon, null);
                expect(result.message).toBe('success');
                expect(result.locations.length).toBeGreaterThan(0);
            });
        });

        describe('shouldUpdateMultiplayerGame', () => {
            it('should return true for game-changing actions', () => {
                expect(shouldUpdateMultiplayerGame(PlayerActionsName.Summon)).toBe(true);
                expect(shouldUpdateMultiplayerGame(PlayerActionsName.EndTurn)).toBe(true);
            });

            it('should return false for local actions', () => {
                expect(shouldUpdateMultiplayerGame(PlayerActionsName.Draw)).toBe(false);
                expect(shouldUpdateMultiplayerGame(PlayerActionsName.TurnDraw)).toBe(false);
            });
        });
    });

    describe('Board Location Functions', () => {
        describe('getValidChampionsBoardLocations', () => {
            it('should return locations of valid champions', () => {
                mockGame.board[0][0] = mockChampion;
                const result = getValidChampionsBoardLocations(mockGame, mockGearCard, isValidForEquip);
                expect(result.locations).toContainEqual({ rowIndex: 0, columnIndex: 0 });
            });

            it('should return empty locations for null card', () => {
                mockGame.board[0][0] = mockChampion;
                const result = getValidChampionsBoardLocations(mockGame, null, isValidForEquip);
                expect(result.locations).toHaveLength(0);
            });
        });
    });

    describe('Order Card Functions', () => {
        describe('orderCardDrawLogic', () => {
            it('should handle ReturnUsedCardToDeck', () => {
                mockPlayer.usedCards = [mockActionCard];
                const orderCard = { ...mockOrderCard, reward: { ...mockOrderCard.reward, name: RewardType.ReturnUsedCardToDeck }};
                const result = orderCardDrawLogic(RewardType.ReturnUsedCardToDeck, mockGame, mockPlayer, orderCard, undefined);
                expect(result).toBe('success');
                expect(mockPlayer.deck).toContain(mockActionCard);
            });

            it('should handle ConditionedDraw', () => {
                mockPlayer.deck = [mockActionCard];
                mockGame.board[0][0] = mockChampion;
                const orderCard = { ...mockOrderCard, reward: { ...mockOrderCard.reward, name: RewardType.ConditionedDraw, condition: 'SummonedChampions' }};
                const result = orderCardDrawLogic(RewardType.ConditionedDraw, mockGame, mockPlayer, orderCard, undefined);
                expect(result).toBe('success');
                expect(mockPlayer.hand).toContain(mockActionCard);
            });
        });
    });

    describe('Champion Management', () => {
        describe('setChampionLearnedActions', () => {
            it('should set learned actions from deck', () => {
                mockPlayer.deck = [mockActionCard];
                mockChampion.learnedActions = [mockActionCard.name];
                setChampionLearnedActions(mockGame, mockChampion);
                expect(mockChampion.learnedActionsCards).toContain(mockActionCard);
                expect(mockPlayer.deck).not.toContain(mockActionCard);
            });
        });
    });

    describe('Game Flow', () => {
        describe('endTurn', () => {
            it('should switch to next player', () => {
                const result = endTurn(mockGame);
                expect(result).toBe('success');
                expect(mockGame.playingPlayerIndex).toBe(1);
            });

            it('should refresh resources for next player', () => {
                mockGame.board[0][0] = mockChampion;
                mockGame.players[1] = { ...mockPlayer };
                endTurn(mockGame);
                expect(mockGame.players[1].didDraw).toBe(false);
                expect(mockGame.players[1].summonsLeft).toBe(1);
            });
        });
    });

    describe('Validation Functions', () => {
        describe('isValidForEquip', () => {
            it('should validate equipment requirements', () => {
                const result = isValidForEquip(mockChampion, mockGearCard);
                expect(result.isValid).toBe(true);
            });
        });
    });

    describe('UI Helper Functions', () => {
        describe('getPlayerAllowedHandCardSelect', () => {
            it('should return valid cards for order requirements', () => {
                mockPlayer.hand = [mockActionCard, mockOrderCard];
                const result = getPlayerAllowedHandCardSelect(mockGame, mockOrderCard);
                expect(result.message).toBe('success');
                expect(result.handCards).toContain(mockActionCard);
            });
        });
    });

    describe('Order Card Management', () => {
        describe('playOrder', () => {
            it('should handle card discard and draw', () => {
                mockPlayer.deck = [mockActionCard];
                mockPlayer.hand = [mockOrderCard, mockActionCard];
                const result = playOrder(mockGame, mockOrderCard, [mockActionCard], undefined);
                expect(result).toBe('success');
                expect(mockPlayer.usedCards).toContain(mockActionCard);
            });

            it('should handle extra class upgrade effect', () => {
                const orderCard = {
                    ...mockOrderCard,
                    reward: { name: RewardType.PlayExtraClassUpgrade, amount: 1, duration: 1, cardType: null, cardNameContains: null, condition: null }
                };

                const result = playOrder(mockGame, orderCard, [], undefined);
                expect(result).toBe('success');
                expect(mockPlayer.effects[0].type).toBe(RewardType.PlayExtraClassUpgrade);
            });

            it('should prevent playing with insufficient cards', () => {
                mockPlayer.deck = [];
                const orderCard = {
                    ...mockOrderCard,
                    reward: { name: RewardType.Draw, amount: 1, cardType: null, cardNameContains: null, condition: null }
                };
                const result = playOrder(mockGame, orderCard, [], undefined);
                expect(result).toContain('Not enough cards in deck');
            });
        });
    });

    describe('Champion Selection', () => {
        describe('setStartingChampion', () => {
            it('should set initial champion', () => {
                mockPlayer.deck = [mockChampion];
                const result = setStartingChampion(mockPlayer, mockChampion);
                expect(result).toBe('success');
                expect(mockPlayer.startingChampion).toBe(mockChampion);
                expect(mockPlayer.deck).not.toContain(mockChampion);
            });

            it('should replace existing champion', () => {
                const oldChampion = { ...mockChampion, guid: 'old-champion' };
                mockPlayer.startingChampion = oldChampion;
                mockPlayer.deck = [mockChampion];
                
                const result = setStartingChampion(mockPlayer, mockChampion);
                expect(result).toBe('success');
                expect(mockPlayer.startingChampion).toBe(mockChampion);
                expect(mockPlayer.deck).toContain(oldChampion);
            });

            it('should prevent setting same champion', () => {
                mockPlayer.startingChampion = mockChampion;
                const result = setStartingChampion(mockPlayer, mockChampion);
                expect(result).toContain('Same card is already set');
            });
        });
    });

    describe('Card Type Validation', () => {
        describe('checkCardType', () => {
            it('should identify order cards', () => {
                expect(checkCardType(mockOrderCard, CardType.OrderCard)).toBe(true);
                expect(checkCardType(mockActionCard, CardType.OrderCard)).toBe(false);
            });

            it('should identify gear cards', () => {
                expect(checkCardType(mockGearCard, CardType.GearCard)).toBe(true);
                expect(checkCardType(mockActionCard, CardType.GearCard)).toBe(false);
            });

            it('should identify action cards', () => {
                expect(checkCardType(mockActionCard, CardType.ActionCard)).toBe(true);
                expect(checkCardType(mockOrderCard, CardType.ActionCard)).toBe(false);
            });

            it('should identify champion cards', () => {
                expect(checkCardType(mockChampion, CardType.ChampionCard)).toBe(true);
                expect(checkCardType(mockActionCard, CardType.ChampionCard)).toBe(false);
            });

            it('should handle invalid card types', () => {
                expect(checkCardType(mockActionCard, 'InvalidType' as CardType)).toBe(false);
            });
        });
    });

    describe('Card Search and Removal', () => {
        describe('getAndRemoveActionCard', () => {
            it('should find and remove card from deck', () => {
                mockPlayer.deck = [mockActionCard];
                const result = getAndRemoveActionCard(mockGame, mockActionCard.name);
                expect(result).toBe(mockActionCard);
                expect(mockPlayer.deck).not.toContain(mockActionCard);
            });

            it('should find and remove card from hand', () => {
                mockPlayer.hand = [mockActionCard];
                const result = getAndRemoveActionCard(mockGame, mockActionCard.name);
                expect(result).toBe(mockActionCard);
                expect(mockPlayer.hand).not.toContain(mockActionCard);
            });

            it('should find and remove card from used cards', () => {
                mockPlayer.usedCards = [mockActionCard];
                const result = getAndRemoveActionCard(mockGame, mockActionCard.name);
                expect(result).toBe(mockActionCard);
                expect(mockPlayer.usedCards).not.toContain(mockActionCard);
            });

            it('should return null if card not found', () => {
                const result = getAndRemoveActionCard(mockGame, 'nonexistent');
                expect(result).toBeNull();
            });
        });
    });

    describe('getChampionStatValue', () => {
        it('should return correct Strength value', () => {
            mockChampion.calStr = 5;
            const result = getChampionStatValue(mockChampion, Stats.Str);
            expect(result).toBe(5);
        });

        it('should return correct Dexterity value', () => {
            mockChampion.calDex = 4;
            const result = getChampionStatValue(mockChampion, Stats.Dex);
            expect(result).toBe(4);
        });

        it('should return correct Intelligence value', () => {
            mockChampion.calInt = 3;
            const result = getChampionStatValue(mockChampion, Stats.Int);
            expect(result).toBe(3);
        });

        it('should return -1 for invalid stat', () => {
            const result = getChampionStatValue(mockChampion, 'invalid' as Stats);
            expect(result).toBe(-1);
        });
    });

    describe('getSummonBoardLocation', () => {
        it('should return valid locations in specified rows', () => {
            const result = getSummonBoardLocation(mockGame, 6, 8);
            expect(result.length).toBeGreaterThan(0);
            result.forEach(location => {
                expect(location.rowIndex).toBeGreaterThanOrEqual(6);
                expect(location.rowIndex).toBeLessThan(8);
            });
        });

        it('should only return empty locations', () => {
            mockGame.board[6][0] = mockChampion;
            const result = getSummonBoardLocation(mockGame, 6, 8);
            expect(result.some(loc => loc.rowIndex === 6 && loc.columnIndex === 0)).toBe(false);
        });
    });
});

