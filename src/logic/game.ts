import { Player } from './player';
import { GameCard, Gear, Crystal } from './game-card';
import { Champion, Class, stringToChampionActionName } from './champion';
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
                stm: 2, actions: x.actions?.map(y => stringToChampionActionName(y)), calActions: [],
                body: null, rightHand: null, leftHand: null,
                class: x.class, calClass: x.class, upgrade: null
            } as Champion;
        case 'Class':
            return {
                guid: x.guid, name: x.name, class: x.class,
                str: x.str, dex: x.dex, int: x.int, hp: x.hp, action: stringToChampionActionName(x.action ?? ''),
                requiredClass: x.requiredClass, currentHp: 0,
                image: x.image, playerIndex: 0, isBlocking: x.isBlocking
            } as Class
        case 'Gear':
            return {
                guid: x.guid, name: x.name, str: x.str,
                dex: x.dex, int: x.int, hp: x.hp, currentHp: x.hp, bodyPart: x.bodyPart,
                image: x.image, playerIndex: 0, isBlocking: x.isBlocking
            } as Gear
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
        if(index === 12) board[index] = [null, null, null, mockCrystalOne, null, null, null, null];
        else if (index === 0) board[index] = [null, null, null, mockCrystalTwo, null, null, null, null];
        else board[index] = [null, null, null, null, null, null, null, null];
    }

    return { board: board, players: [mockPlayerOne, mockPlayerTwo], status: GameStatus.onGoing, playerIndex: 0, playingPlayerIndex: 0, looser: null };
}

export interface Game {
    playingPlayerIndex: number;
    playerIndex: number;
    players: Player[];
    looser: Player|null,
    board: (GameCard | null)[][];
    status: GameStatus;
}

const mockChampion1: Champion = cardsList[0] as Champion;
const mockChampion2: Champion = cardsList[0] as Champion;
const mockClass: Class = cardsList[1] as Class;
const mockGear: Gear = cardsList[2] as Gear;
const mockPlayerOne: Player = { name: 'AviadP', hand: [mockClass, mockGear], deck: [mockChampion2], didDraw: false, summonsLeft: 1 };
const mockPlayerTwo: Player = { name: 'MorP', hand: new Array<GameCard>(), deck: new Array<GameCard>(), didDraw: false, summonsLeft: 1 };
const mockCrystalOne: Crystal = { image: 'https://img.freepik.com/premium-photo/magical-crystal-with-swirling-colors-digital-art-style-illustration_812426-6398.jpg', hp: 20, currentHp: 20, name: 'Warrior Spirit', guid: '5', effect: null, playerIndex:0, isBlocking: true}
const mockCrystalTwo: Crystal = { image: 'https://img.freepik.com/premium-photo/magical-crystal-with-swirling-colors-digital-art-style-illustration_812426-6466.jpg?w=740', hp: 20, currentHp: 20, name: 'Warrior Spirit', guid: '5', effect: null, playerIndex:1, isBlocking: true}
