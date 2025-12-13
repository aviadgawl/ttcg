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
    ActionDirections,
    GameStatus,
    ChampionDirection,
    CardType
} from './enums';
import { getImage } from '../helpers/image-helper';
import cardsListJson from '../assets/cards/cards-list.json';

export interface Game {
    code: string;
    playingPlayerIndex: number;
    playerIndex: number;
    players: Player[];
    loser: Player | null,
    board: (GameCard | null)[][];
    status: GameStatus;
};

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
                    race: x.race,
                    isAttachedAction: false
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
                            cardName: x.name,
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
            case CardType.CrystalCard:
                 newCardsArray.push({
                    guid: createGuid(),
                    image: getImage(x.name),
                    playerIndex: 0,
                    name: x.name,
                    hp: x.hp,
                    currentHp: x.hp,
                    isBlocking: x.isBlocking,
                    effect: {} as GameEffect
                } as CrystalCard);
                break;
            default:
                break;
        }
    }
    return newCardsArray;
});

export const cardsList = cardsJsonToObjects(cardsListJson);

const createBoard = (): Array<Array<GameCard | null>> => {
    const maxRows = 11;
    const board = new Array(new Array<GameCard | null>(7));

    const playerOneCrystal = cardsList.find( card => card.name === 'Mountains Spirit')!;
    let playerTwoCrystal = cardsList.find( card => card.name === 'Forest Spirit')!;

    playerTwoCrystal = {...playerTwoCrystal, playerIndex: 1};

    for (let index = 0; index < maxRows; index++) {
        if (index === (maxRows - 1)) board[index] = [null, null, null, playerOneCrystal, null, null, null];
        else if (index === 0) board[index] = [null, null, null, playerTwoCrystal, null, null, null];
        else board[index] = [null, null, null, null, null, null, null];
    }

    return board;
};

export const createNewPlayer = (): Player => {
    const newPlayer: Player = {
        name: 'Player One',
        hand: [],
        deck: [],
        usedCards: [],
        didDraw: false,
        summonsLeft: 1,
        actionsLog: [],
        effects: [],
        startingChampion: null
    };

    return newPlayer;
};

export const createGame = (): Game => {

    const board = createBoard();
    const mockPlayerOne = createNewPlayer();

    return { board: board, players: [mockPlayerOne], status: GameStatus.over, playerIndex: 0, playingPlayerIndex: 0, loser: null, code: '' };
};

export const startNewGame = (game: Game, newCode: string) => {
    const newBoard = createBoard();
    const player = game.players[game.playerIndex];
    const restedPlayer = { ...createNewPlayer(), deck: player.deck, startingChampion: player.startingChampion, name: player.name, hand: player.hand };

    return { ...game, status: GameStatus.started, board: newBoard, players: [restedPlayer], loser: null, code: newCode }
};