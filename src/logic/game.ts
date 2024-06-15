import { Player } from './player';
import { GameCard, GearCard, CrystalCard, ChampionCard, ClassCard, ActionCard, OrderCard } from './game-card';
import { ActionType, Stats, ActionDirections, GameStatus, GearCategory, MathModifier, EffectStatus } from './enums';
import { getImage } from '../helpers/image-helper';
import cardsListJson from '../assets/cards/cards-list.json';

export const cardsList = cardsListJson.map(x => {
    switch (x.type) {
        case 'Champion':
            return {
                guid: x.guid, name: x.name, image: getImage(x.name), playerIndex: 0,
                isBlocking: x.isBlocking, hp: x.hp, currentHp: x.hp,
                armor: x.str, str: x.str, calStr: x.str,
                dex: x.dex, calDex: x.dex,
                int: x.int, calInt: x.int, mental: x.int,
                stm: 2, learnedActions: x.actionsName, learnedActionsCards: [], attachedActionsCards: [], buffs: [], statusEffects: [],
                body: null, rightHand: null, leftHand: null,
                class: x.class, calClass: x.class, upgrade: null, calHp: x.hp
            } as ChampionCard;
        case 'Class':
            return {
                guid: x.guid, name: x.name, class: x.class,
                str: x.str, dex: x.dex, int: x.int, hp: x.hp, learnedAction: x.action,
                requiredClassName: x.requiredClass, currentHp: 0,
                image: getImage(x.name), playerIndex: 0, isBlocking: x.isBlocking
            } as ClassCard
        case 'Gear':
            return {
                guid: x.guid, name: x.name, str: x.str,
                dex: x.dex, int: x.int, hp: x.hp, currentHp: x.hp, bodyPart: x.bodyPart,
                image: getImage(x.name), playerIndex: 0, isBlocking: x.isBlocking,
                category: GearCategory[x.category as keyof typeof GearCategory]
            } as GearCard
        case 'Action':
            return {
                playerIndex: 0,
                guid: x.guid,
                name: x.name,
                image: getImage(x.name),
                actionType: ActionType[x.actionType as keyof typeof ActionType],
                duration: x.duration,
                calDuration: x.duration,
                distance: x.distance,
                direction: ActionDirections[(x.direction ?? '') as keyof typeof ActionDirections],
                dmgStat: Stats[(x.dmgStat ?? '') as keyof typeof Stats],
                dmgModifier: MathModifier[(x.dmgModifier ?? '') as keyof typeof MathModifier],
                dmgModifierValue: x.dmgModifierValue,
                requiredClassName: x.requiredClassName,
                requiredStat: Stats[(x.requiredStat ?? '') as keyof typeof Stats],
                requiredStatValue: x.requiredStatValue,
                requiredGearCategory: x.requiredGearCategory,
                isFreeTargeting: x.isFreeTargeting,
                targetEffects: x.targetEffects?.map(effect => {return {
                    name: EffectStatus[(effect.name ?? '') as keyof typeof EffectStatus],
                    duration: effect.duration,
                    stat: effect.stat === null ? null : Stats[(effect.stat) as keyof typeof Stats],
                    value: effect.value}})
            } as ActionCard
        case 'Order':
            return {
                playerIndex: 0,
                guid: x.guid,
                name: x.name,
                image: getImage(x.name),
                duration: x.duration,
                info: x.info,
                requirement: x.requirement,
                reward: x.reward
            } as OrderCard
        default:
            return null;
    }
});

export interface Game {
    code: string;
    playingPlayerIndex: number;
    playerIndex: number;
    players: Player[];
    loser: Player | null,
    board: (GameCard | null)[][];
    status: GameStatus;
}

export const createGame = (): Game => {

    const board = new Array(new Array<GameCard | null>(7))

    for (let index = 0; index < 13; index++) {
        if (index === 12) board[index] = [null, null, null, mockCrystalOne, null, null, null, null];
        else if (index === 0) board[index] = [null, null, null, mockCrystalTwo, null, null, null, null];
        else board[index] = [null, null, null, null, null, null, null, null];
    }

    return { board: board, players: [mockPlayerOne, mockPlayerOne], status: GameStatus.started, playerIndex: 1, playingPlayerIndex: 1, loser: null, code: '' };
}

const mockOrder: OrderCard = cardsList[6] as OrderCard;
const mockChampion1: ChampionCard = cardsList[0] as ChampionCard;
//const mockChampion2: ChampionCard = cardsList[7] as ChampionCard;
const actionBasicHit: ActionCard = cardsList[3] as ActionCard;
const actionStep: ActionCard = cardsList[4] as ActionCard;
const actionEnrage: ActionCard = cardsList[8] as ActionCard;
const actionCardDaggerThrow: ActionCard = cardsList[5] as ActionCard;
const mockClass: ClassCard = cardsList[1] as ClassCard;
const gearSword: GearCard = cardsList[2] as GearCard;
const gearDagger: GearCard = cardsList[10] as GearCard;
const mockPlayerOne: Player = { name: 'Player One', hand: [actionStep, mockChampion1, actionBasicHit], deck: [], usedCards: [], didDraw: false, summonsLeft: 1 };
const mockCrystalOne: CrystalCard = { image: 'https://img.freepik.com/premium-photo/magical-crystal-with-swirling-colors-digital-art-style-illustration_812426-6398.jpg',
 hp: 20, currentHp: 20, name: 'Warrior Spirit', guid: '5', effect: null, playerIndex: 0, isBlocking: true, calHp: 20 }
const mockCrystalTwo: CrystalCard = { image: 'https://img.freepik.com/premium-photo/magical-crystal-with-swirling-colors-digital-art-style-illustration_812426-6466.jpg?w=740',
 hp: 20, currentHp: 20, name: 'Warrior Spirit', guid: '5', effect: null, playerIndex: 1, isBlocking: true, calHp: 20 }