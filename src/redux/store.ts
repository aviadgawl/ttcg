import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createGame, Game } from '../logic/game';
import { ActionCard, GameCard, isAction, isOrder, OrderCard, AllowedBoardLocationResponse, BoardLocation, AllowedHandCardSelectResponse } from '../logic/game-card';
import { championAction, getChampionsActionsAllowedBoardLocations } from '../logic/champion';
import { GameStatus } from '../logic/enums';
import { playerAction, getPlayerActionsAllowedBoardLocations, getPlayerAllowedHandCardSelect } from '../logic/player';
import { playSoundByPlayerActionName, playSoundByCardActionName } from '../helpers/audio-helper';
import { GameStoreActionTypes } from './types';
import { updateGameAsync, addGameAsync } from '../firebase/firebase';

export interface GameDialog {
    title: string;
    content: string;
    showButtons: boolean;
}

export interface SelectedData {
    card: GameCard | null,
    actionName: string,
    actionType: GameStoreActionTypes | null,
    sourceLocation: BoardLocation | null,
    allowedBoardLocations: BoardLocation[],
    isAttachedAction: boolean,
    allowedHandCardSelect: GameCard[]
}

export const createSelectedData = (card: GameCard | null,
    actionName: string, actionType: GameStoreActionTypes | null, sourceLocation: BoardLocation | null = null, isAttachedAction = false): SelectedData => {
    return {
        card: card,
        actionName: actionName,
        actionType: actionType,
        sourceLocation: sourceLocation,
        allowedBoardLocations: [],
        isAttachedAction: isAttachedAction,
        allowedHandCardSelect: []
    };
}

export const initialState = {
    game: createGame() as Game,
    playerIndex: 0 as number,
    selectedActionData: {
        card: null,
        actionName: '',
        actionType: null,
        sourceLocation: null,
        allowedBoardLocations: [],
        isAttachedAction: false,
        allowedHandCardSelect: []
    } as SelectedData,
    showHand: false as boolean,
    dialog: null as unknown as GameDialog
}

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        championActions(state, action) {
            const { targetLocation } = action.payload;
            const selectedData = state.selectedActionData as SelectedData;

            if (selectedData.card === null) {
                alert('SelectedData card can not be null');
                return;
            }

            if (selectedData.sourceLocation === null) {
                alert('No source location');
                return;
            };

            if (!isAction(selectedData.card)) {
                alert('SelectedData is not action card');
                return;
            };

            const result = championAction(state.game, selectedData.card as ActionCard, selectedData.sourceLocation, targetLocation, selectedData.isAttachedAction);

            if (result !== 'success') alert(result);
            else {
                playSoundByCardActionName(selectedData.card.actionType);
                state.selectedActionData = initialState.selectedActionData;
                if (state.game.code !== '')
                    updateGameAsync(state.game).catch(console.error);
            }
        },
        playerActions(state, action) {
            const { data } = action.payload;
            const { card, actionName } = action.payload.selectedActionData ?? state.selectedActionData;
            const result = playerAction(actionName, state.game, { selectedCard: card, extendedData: data });

            if (result !== 'success') alert(result);
            else {
                playSoundByPlayerActionName(actionName);
                state.selectedActionData = initialState.selectedActionData;
                if (state.game.code !== '')
                    updateGameAsync(state.game).catch(console.error);
            }
        },
        setPlayer(state, action) {
            state.playerIndex = action.payload;
        },
        setShowHand(state, action) {
            state.showHand = action.payload;
        },
        setSelectedActionData(state, action) {
            let selectedData = action.payload as SelectedData;
            let allowedHandCardSelectResult: AllowedHandCardSelectResponse = { message: 'success', handCards: [] };
            let allowedLocationsResult: AllowedBoardLocationResponse = { message: 'success', locations: [] };

            if (selectedData.actionType === GameStoreActionTypes.PlayerAction) {
                if (isOrder(selectedData.card))
                    allowedHandCardSelectResult = getPlayerAllowedHandCardSelect(state.game, selectedData.card as OrderCard);

                allowedLocationsResult = getPlayerActionsAllowedBoardLocations(state.game, selectedData.actionName, selectedData.card);
            }
            else if (selectedData.actionType === GameStoreActionTypes.ChampionAction && isAction(selectedData.card))
                allowedLocationsResult = getChampionsActionsAllowedBoardLocations(state.game, selectedData.card, selectedData.sourceLocation);

            if (allowedLocationsResult.message === 'success')
                selectedData = { ...selectedData, ...{ allowedBoardLocations: allowedLocationsResult.locations } }
            else console.log(allowedLocationsResult.message);

            if (allowedHandCardSelectResult.message === 'success')
                selectedData = { ...selectedData, ...{ allowedHandCardSelect: allowedHandCardSelectResult.handCards } }
            else console.log(allowedHandCardSelectResult.message);

            state.selectedActionData = selectedData;
        },
        setDialog(state, action) {
            state.dialog = action.payload;
        },
        setGame(state, action) {
            state.game = action.payload;
        },
        setJoinedGame(state, action) {
            const gameFromDb: Game = action.payload;

            const localPlayer = state.game.players[0];
            const playerTwoDeck = localPlayer.deck.map(card => {
                return { ...card, playerIndex: 1 }
            });
            const playerTwo = { ...localPlayer, name: 'Player Two', deck: playerTwoDeck };
            const joinedGame = { ...state.game, players: [gameFromDb.players[0], playerTwo], playerIndex: 1, code: gameFromDb.code, status: GameStatus.started };

            state.game = joinedGame;

            updateGameAsync(joinedGame).catch(console.error);
        },
        setCreatedGame(state, action) {
            const gameCode: string = action.payload;
            const createdGame: Game = { ...state.game, status: GameStatus.started, code: gameCode };

            state.game = createdGame;

            addGameAsync(createdGame).catch(console.error);
        },
        setPartialGame(state, action) {
            const updatedGame = {
                ...state.game,
                players: action.payload.players,
                board: action.payload.board,
                playingPlayerIndex: action.payload.playingPlayerIndex,
            };
            state.game = updatedGame;
        }
    }
});

const store = configureStore({
    reducer: {
        gameActions: gameSlice.reducer
    }
})

export const {
    championActions,
    playerActions,
    setShowHand,
    setSelectedActionData,
    setDialog,
    setPlayer,
    setGame,
    setPartialGame,
    setJoinedGame,
    setCreatedGame
} = gameSlice.actions;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;