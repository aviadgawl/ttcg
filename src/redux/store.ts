import { configureStore, createSlice } from '@reduxjs/toolkit';
import { AllowedBoardLocationResponse, BoardLocation, createGame, Game } from '../logic/game';
import { GameCard } from '../logic/game-card';
import { championAction } from '../logic/champion';
import { playerAction, getAllowedBoardLocations } from '../logic/player';
import { playSoundByPlayerActionName, playSoundByCardActionName } from '../helpers/audio-helper';
import { GameStoreActionTypes } from './types';

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
    allowedBoardLocations: BoardLocation[]
}

export const createSelectedData = (card: GameCard | null, actionName: string, actionType: GameStoreActionTypes | null, sourceLocation: BoardLocation|null = null): SelectedData => {
    return { card: card, actionName: actionName, actionType: actionType, sourceLocation: sourceLocation, allowedBoardLocations: [] };
}

export const initialState = {
    game: createGame() as Game,
    playerIndex: 0 as number,
    selectedActionData: { card: null, actionName: '', actionType: null, sourceLocation: null, allowedBoardLocations: [] } as SelectedData,
    showHand: false as boolean,
    dialog: null as unknown as GameDialog
}

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        championActions(state, action) {
            const { targetLocation } = action.payload;
            const { card, sourceLocation } = state.selectedActionData;

            if (card === null) {
                alert('SelectedData card can not be null');
                return;
            }

            if (sourceLocation === null) {
                alert('No source location');
                return;
            };

            const result = championAction(state.game, card.name, sourceLocation, targetLocation);

            if (result !== 'success') alert(result);
            else playSoundByCardActionName(card.name);
        },
        playerActions(state, action) {
            const { data } = action.payload;
            const { card, actionName } = action.payload.selectedActionData ?? state.selectedActionData;
            const result = playerAction(actionName, state.game, { selectedCard: card, extendedData: data });

            if (result !== 'success') alert(result);
            else playSoundByPlayerActionName(actionName);
        },
        setPlayer(state, action) {
            state.playerIndex = action.payload;
        },
        setShowHand(state, action) {
            state.showHand = action.payload;
        },
        setSelectedActionData(state, action) {
            let selectedData = action.payload as SelectedData;
            let allowedLocationsResult: AllowedBoardLocationResponse | null = { message: 'success', locations: [] };

            if (selectedData.actionType === GameStoreActionTypes.PlayerAction)
                allowedLocationsResult = getAllowedBoardLocations(state.game, selectedData.actionName, selectedData.card);

            if (allowedLocationsResult.message === 'success')
                selectedData = { ...selectedData, ...{ allowedBoardLocations: allowedLocationsResult.locations } }

            state.selectedActionData = selectedData;
        },
        setDialog(state, action) {
            state.dialog = action.payload;
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
} = gameSlice.actions;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;