import { cardsJsonToObjects } from '../../logic/game';
import { ActionCard } from '../../logic/game-card';
import { Stats } from '../../logic/enums';

describe('Game Logic Tests', () => {
    let actionCardJson: string;
    let gearCardJson: string;
    let championCardJson: string;
    let orderCardJson: string;

    beforeEach(() => {
        actionCardJson = `[{
            "type": "ActionCard",
            "actionType": "Magic",
            "name": "Ether Blade Swipe",
            "distance": [
                1,
                1
            ],
            "requiredClassName": "War Mage",
            "requiredStat": "INT",
            "requiredStatValue": 5,
            "direction": "Straight",
            "hitAreas": {
                "1": {
                    "right": 1,
                    "left": 1
                }
            },
            "damages": [
                {
                    "dmgStat": "INT"
                },
                {
                    "dmgModifier": "+",
                    "dmgStat": "STR"
                },
                {
                    "dmgModifier": "+",
                    "dmgModifierValue": 1
                }
            ],
            "isFreeTargeting": true,
            "targetEffects": []
        }]`;
    });

    describe('check cards json to object conversion', () => {
        it('check gear card conversion', () => {

        });

        it('check champion card conversion', () => {

        });

        it('check action card conversion', () => {
            const cards = cardsJsonToObjects(actionCardJson);

            expect(cards.length).toBe(1);

            const actionCard = cards[0] as ActionCard;
            expect(actionCard.requiredStat).toBe(Stats.Int);
        });
    });
});