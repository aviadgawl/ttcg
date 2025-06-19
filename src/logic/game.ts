import { Player } from './player';
import {
    GameCard,
    GearCard,
    CrystalCard,
    ChampionCard,
    ClassCard,
    ActionCard,
    OrderCard,
    OrderCardReward,
    GameEffect,
    Damage
} from './game-card';
import {
    ActionType,
    Stats,
    ActionDirections,
    GameStatus,
    GearCategory,
    EffectStatus,
    ChampionDirection,
    Race,
    CardType
} from './enums';
import { getImage } from '../helpers/image-helper';
import cardsListJson from '../assets/cards/cards-list.json';

const createGuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c === 'x' ? r : ((r & 0x3) | 0x8);
            return v.toString(16);
        });
};

export const cardsJsonToObjects = (cardsListJson: any): GameCard[] => cardsListJson.flatMap((x: any) => {
    const newCardsArray: GameCard[] = [];

    for (let index = 0; index < 3; index++) {
        switch (x.type) {
            case CardType.ChampionCard:
                newCardsArray.push({
                    guid: createGuid(), name: x.name, image: getImage(x.name), playerIndex: 0,
                    isBlocking: x.isBlocking ?? false, hp: x.hp, currentHp: x.hp,
                    armor: x.str, str: x.str, calStr: x.str,
                    dex: x.dex, calDex: x.dex,
                    int: x.int, calInt: x.int, mental: x.int,
                    stm: 2, learnedActions: x.actionsName, learnedActionsCards: [], attachedActionsCards: [], buffs: [], statusEffects: [],
                    body: null, rightHand: null, leftHand: null,
                    class: x.class, calClass: x.class, upgrade: null, calHp: x.hp,
                    direction: ChampionDirection.Up,
                    race: x.race
                } as ChampionCard);
                break;
            case 'Class':
                newCardsArray.push({
                    guid: createGuid(), name: x.name, class: x.class,
                    str: x.str, dex: x.dex, int: x.int, hp: x.hp, learnedAction: x.action,
                    requiredClassName: x.requiredClass ?? null, currentHp: 0,
                    image: getImage(x.name), playerIndex: 0, isBlocking: x.isBlocking ?? false
                } as ClassCard);
                break;
            case CardType.GearCard:
                newCardsArray.push({
                    guid: createGuid(), name: x.name, str: x.str,
                    dex: x.dex, int: x.int, hp: x.hp, currentHp: x.hp, bodyPart: x.bodyPart,
                    image: getImage(x.name), playerIndex: 0, isBlocking: x.isBlocking ?? false,
                    category: x.category
                } as GearCard);
                break;
            case CardType.ActionCard:
                newCardsArray.push({
                    playerIndex: 0,
                    guid: createGuid(),
                    name: x.name,
                    image: getImage(x.name),
                    actionType: ActionType[x.actionType as keyof typeof ActionType],
                    distance: x.distance,
                    direction: ActionDirections[(x.direction ?? '') as keyof typeof ActionDirections],
                    requiredClassName: x.requiredClassName ?? null,
                    requiredStat: x.requiredStat ?? null,
                    requiredStatValue: x.requiredStatValue ?? null,
                    requiredGearCategory: x.requiredGearCategory ?? null,
                    isFreeTargeting: x.isFreeTargeting ?? false,
                    isBackTargeting: x.isBackTargeting ?? false,
                    targetEffects: x.targetEffects?.map((effect: any) => {
                        return {
                            name: effect.name,
                            duration: effect.duration ?? 0,
                            stat: effect.stat ?? null,
                            value: effect.value ?? null
                        }
                    }),
                    isRepeatable: x.isRepeatable ?? false,
                    repeatableStat: x.repeatableStat ?? null,
                    repeatableActivationLeft: null,
                    wasPlayed: false,
                    hitAreas: x.hitAreas ?? null,
                    isHeal: x.isHeal ?? false,
                    damages: x.damages ? x.damages.map((damage: any) =>
                    ({
                        dmgStat: damage.dmgStat ?? null,
                        dmgModifier: damage.dmgModifier ?? null,
                        dmgModifierValue: damage.dmgModifierValue ?? null
                    } as Damage)) : [] as Damage[]
                } as ActionCard);
                break;
            case CardType.OrderCard:
                newCardsArray.push({
                    playerIndex: 0,
                    guid: createGuid(),
                    name: x.name,
                    image: getImage(x.name),
                    duration: x.duration,
                    info: x.info,
                    requirement: x.requirement,
                    reward: x.reward as OrderCardReward
                } as OrderCard);
                break;
            default:
                break;
        }
    }
    return newCardsArray;
});

export const cardsList = cardsJsonToObjects(cardsListJson);

export interface Game {
    code: string;
    playingPlayerIndex: number;
    playerIndex: number;
    players: Player[];
    loser: Player | null,
    board: (GameCard | null)[][];
    status: GameStatus;
};

export const createGame = (): Game => {
    const maxRows = 11;
    const board = new Array(new Array<GameCard | null>(7))

    for (let index = 0; index < maxRows; index++) {
        if (index === (maxRows - 1)) board[index] = [null, null, null, mockCrystalOne, null, null, null];
        else if (index === 0) board[index] = [null, null, null, mockCrystalTwo, null, null, null];
        else board[index] = [null, null, null, null, null, null, null];
    }

    return { board: board, players: [mockPlayerOne], status: GameStatus.over, playerIndex: 0, playingPlayerIndex: 0, loser: null, code: '' };
};

const mockPlayerOne: Player = { name: 'Player One', hand: [], deck: [], usedCards: [], didDraw: false, summonsLeft: 1, actionsLog: [], effects: [], startingChampion: null };
const mockCrystalOne: CrystalCard = {
    image: 'https://img.freepik.com/premium-photo/magical-crystal-with-swirling-colors-digital-art-style-illustration_812426-6398.jpg',
    hp: 30, currentHp: 30, name: 'Warrior Spirit', guid: '5', effect: {} as GameEffect, playerIndex: 0, isBlocking: true, calHp: 30
};

const mockCrystalTwo: CrystalCard = {
    image: 'https://img.freepik.com/premium-photo/magical-crystal-with-swirling-colors-digital-art-style-illustration_812426-6466.jpg?w=740',
    hp: 30, currentHp: 30, name: 'Warrior Spirit', guid: '5', effect: {} as GameEffect, playerIndex: 1, isBlocking: true, calHp: 30
};