import { Player } from './player';
import { GameCard, Gear, Class } from './card';
import { Champion, ChampionActionsName } from './champion';

export const createGame = (): Game => {

    const board = new Array(new Array<GameCard | null>(7))

    for (let index = 0; index < 13; index++) {
        board[index] = [null, null, null, null, mockChampion1, null, null, null];
    }

    return { board: board, players: [mockPlayerOne, mockPlayerTwo], status: 'start', playerIndex: 0, playingPlayerIndex: 0 };
}

export interface Game {
    playingPlayerIndex: number;
    playerIndex: number;
    board: (GameCard | null)[][];
    players: Player[];
    status: string;
}

const mockChampion1: Champion = {
    guid: '1', name: 'Aviad', image: 'https://cdn.openart.ai/published/FszSWSLSplED5gq2DIRv/bZ9vPFtW_B0RM_raw.jpg', playerIndex: 0, isBlocking: false,
    hp: 2, currentHp: 2,
    armor: 2, str: 2, calStr: 2,
    dex: 2, calDex: 2,
    int: 2, calInt: 2, mental: 2,
    stm: 2, actions: [ChampionActionsName.Step, ChampionActionsName.DaggerThrow], calActions: [],
    body: null, rightHand: null, leftHand: null, 
    class: 'Fighter', calClass: 'Fighter', upgrade: null
};
const mockChampion2: Champion = {
    guid: '2', name: 'Mor', image: 'https://ih1.redbubble.net/image.5268916617.1284/flat,750x,075,f-pad,750x1000,f8f8f8.jpg', playerIndex: 0, isBlocking: false,
    hp: 2, currentHp: 2,
    armor: 2, str: 4, calStr: 2,
    dex: 2, calDex: 2,
    int: 2, calInt: 2, mental: 2,
    stm: 2, actions: [ChampionActionsName.Step, ChampionActionsName.DaggerThrow],  calActions: [],
    body: null, rightHand: null, leftHand: null,
    class: 'Fighter', calClass: 'Fighter', upgrade: null
};
const mockGear: Gear = { guid: '3', name: 'Sword', str: 2, dex: 0, int: 0, hp: 0, currentHp: 0, bodyPart: 'Hand', image: 'https://pics.craiyon.com/2023-10-08/42b36e89ac864496855393cd033a545a.webp', playerIndex: 0, isBlocking: false };
const mockClass: Class = { 
    guid: '4', name: 'High Knight', class: 'Knight',
    str: 3, dex: 0, int: 0, hp: 4, action: 'Block',
    requiredClass: 'Fighter', currentHp: 0,
    image: 'https://v.etsystatic.com/video/upload/q_auto/Untitled_design_18_hx9pqm.jpg', playerIndex: 0, isBlocking: false  };

const mockPlayerOne: Player = { name: 'AviadP', hand: [mockClass, mockGear], deck: [mockChampion2], didDraw: false, summonsLeft: 1 };
const mockPlayerTwo: Player = { name: 'MorP', hand: new Array<GameCard>(), deck: new Array<GameCard>(), didDraw: false, summonsLeft: 1 };