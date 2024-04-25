import { Player } from './player';
import { GameCard, GearCard, CrystalCard, ChampionCard, ClassCard, ActionCard } from './game-card';
import { ActionType, Stats, ActionDirections } from './enums';
import cardsListJson from '../assets/cards/cards-list.json';

export const cardsList = cardsListJson.map(x => {
    switch (x.type) {
        case 'Champion':
            return {
                guid: x.guid, name: x.name, image: x.image, playerIndex: 0,
                isBlocking: x.isBlocking, hp: x.hp, currentHp: x.hp,
                armor: x.str, str: x.str, calStr: x.str,
                dex: x.dex, calDex: x.dex,
                int: x.int, calInt: x.int, mental: x.int,
                stm: 2, learnedActions: x.actionsName, learnedActionsCards: [], attachedActionsCards: [],
                body: null, rightHand: null, leftHand: null,
                class: x.class, calClass: x.class, upgrade: null
            } as ChampionCard;
        case 'Class':
            return {
                guid: x.guid, name: x.name, class: x.class,
                str: x.str, dex: x.dex, int: x.int, hp: x.hp, learnedAction: x.action,
                requiredClass: x.requiredClass, currentHp: 0,
                image: x.image, playerIndex: 0, isBlocking: x.isBlocking
            } as ClassCard
        case 'Gear':
            return {
                guid: x.guid, name: x.name, str: x.str,
                dex: x.dex, int: x.int, hp: x.hp, currentHp: x.hp, bodyPart: x.bodyPart,
                image: x.image, playerIndex: 0, isBlocking: x.isBlocking
            } as GearCard
        case 'Action':
            return {
                playerIndex: 0,
                guid: x.guid,
                name: x.name,
                image: x.image,
                actionType: ActionType[x.actionType as keyof typeof ActionType],
                distance: x.distance,
                direction: ActionDirections[(x.direction ?? '') as keyof typeof ActionDirections],
                dmgStat: Stats[(x.dmgStat ?? '') as keyof typeof Stats],
                dmgModifier: x.dmgModifier,
                dmgModifierValue: x.dmgModifierValue,
                requiredClassName: x.requiredClassName,
                requiredStat: Stats[(x.requiredStat ?? '')  as keyof typeof Stats],
                requiredStatValue: x.requiredStatValue,
                requiredGearName: x.requiredGearName
            } as ActionCard
        default:
            return null;
    }
});

export enum GameStatus {
    starting = 1,
    onGoing,
    over
}

export const createGame = (): Game => {

    const board = new Array(new Array<GameCard | null>(7))

    for (let index = 0; index < 13; index++) {
        if (index === 12) board[index] = [null, null, null, mockCrystalOne, null, null, null, null];
        else if (index === 0) board[index] = [null, null, null, mockCrystalTwo, null, null, null, null];
        else board[index] = [null, null, null, null, null, null, null, null];
    }

    return { board: board, players: [mockPlayerOne, mockPlayerTwo], status: GameStatus.onGoing, playerIndex: 0, playingPlayerIndex: 0, loser: null };
}

export interface Game {
    playingPlayerIndex: number;
    playerIndex: number;
    players: Player[];
    loser: Player | null,
    board: (GameCard | null)[][];
    status: GameStatus;
}

const mockChampion1: ChampionCard = cardsList[0] as ChampionCard;
const mockChampion2: ChampionCard = cardsList[0] as ChampionCard;
const mockClass: ClassCard = cardsList[1] as ClassCard;
const mockGear: GearCard = cardsList[2] as GearCard;
const mockPlayerOne: Player = { name: 'AviadP', hand: [mockClass, mockGear], deck: [mockChampion2], didDraw: false, summonsLeft: 1 };
const mockPlayerTwo: Player = { name: 'MorP', hand: new Array<GameCard>(), deck: new Array<GameCard>(), didDraw: false, summonsLeft: 1 };
const mockCrystalOne: CrystalCard = { image: 'https://img.freepik.com/premium-photo/magical-crystal-with-swirling-colors-digital-art-style-illustration_812426-6398.jpg', hp: 20, currentHp: 20, name: 'Warrior Spirit', guid: '5', effect: null, playerIndex: 0, isBlocking: true }
const mockCrystalTwo: CrystalCard = { image: 'https://img.freepik.com/premium-photo/magical-crystal-with-swirling-colors-digital-art-style-illustration_812426-6466.jpg?w=740', hp: 20, currentHp: 20, name: 'Warrior Spirit', guid: '5', effect: null, playerIndex: 1, isBlocking: true }
