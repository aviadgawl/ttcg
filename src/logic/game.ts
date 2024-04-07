import { Player } from './player';
import { Card, Champion, Gear, Class } from './card';

export const createGame = (): Game => {

    const board = new Array(new Array<Card | null>(7))

    for (let index = 0; index < 13; index++) {
        board[index] = [null, null, null, null, mockChampion1, null, null, null];
    }

    return { board: board, players: [mockPlayerOne, mockPlayerTwo], status: 'start', playerIndex: 0, playingPlayer: 0 };
}

export interface Game {
    playingPlayer: number;
    playerIndex: number;
    board: (Card | null)[][];
    players: Player[];
    status: string;
}

const mockChampion1: Champion = {
    guid: '1', name: 'Aviad', image: 'https://qph.cf2.quoracdn.net/main-qimg-219a6c6e4fe6707c07ec79348fb13751-lq', playerIndex: 0,
    hp: 2, currentHp: 2,
    armor: 2, str: 2, calStr: 2,
    dex: 2, calDex: 2,
    int: 2, calInt: 2, mental: 2,
    stm: 2, actions: ['Step', 'Basic Hit'], calActions: [],
    body: null, rightHand: null, leftHand: null, 
    class: 'Fighter', calClass: 'Fighter', upgrade: null
};
const mockChampion2: Champion = {
    guid: '2', name: 'Mor', image: 'https://i.pinimg.com/236x/94/36/7d/94367d7271e2393f1761617c6e21145c.jpg', playerIndex: 0,
    hp: 2, currentHp: 2,
    armor: 2, str: 4, calStr: 2,
    dex: 2, calDex: 2,
    int: 2, calInt: 2, mental: 2,
    stm: 2, actions: ['Step', 'Basic Hit'],  calActions: [],
    body: null, rightHand: null, leftHand: null,
    class: 'Fighter', calClass: 'Fighter', upgrade: null
};
const mockGear: Gear = { guid: '3', name: 'Sword', str: 2, dex: 0, int: 0, hp: 0, currentHp: 0, bodyPart: 'Hand', image: '', playerIndex: 0 };
const mockClass: Class = { guid: '4', name: 'High Knight', class: 'Knight', str: 3, dex: 0, int: 0, hp: 4, action: 'Block', requiredClass: 'Fighter', currentHp: 0, image: '', playerIndex: 0  };

const mockPlayerOne: Player = { name: 'AviadP', hand: new Array<Card>(), deck: [mockChampion2], didDraw: false, summonsLeft: 1 };
const mockPlayerTwo: Player = { name: 'MorP', hand: new Array<Card>(), deck: new Array<Card>(), didDraw: false, summonsLeft: 1 };