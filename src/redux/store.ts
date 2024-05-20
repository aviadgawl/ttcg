import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createGame, Game } from '../logic/game';
import { ActionCard, GameCard, isAction } from '../logic/game-card';
import { championAction, getChampionsActionsAllowedBoardLocations } from '../logic/champion';
import { playerAction, getPlayerActionsAllowedBoardLocations } from '../logic/player';
import { playSoundByPlayerActionName, playSoundByCardActionName } from '../helpers/audio-helper';
import { GameStoreActionTypes } from './types';
import { AllowedBoardLocationResponse, BoardLocation } from '../logic/common';

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
    return { card: card, actionName: actionName, actionType: actionType, sourceLocation: sourceLocation, allowedBoardLocations: []};
}

export const initialState = {
    game: createGame() as Game,
    playerIndex: 0 as number,
    selectedActionData: { card: null, actionName: '', actionType: null, sourceLocation: null, allowedBoardLocations: [], isAttached: false } as SelectedData,
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

            if (!isAction(card)) {
                alert('SelectedData is not action card');
                return;
            };

            const result = championAction(state.game, card as ActionCard, sourceLocation, targetLocation);

            if (result !== 'success') alert(result);
            else playSoundByCardActionName(card.actionType);
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
                allowedLocationsResult = getPlayerActionsAllowedBoardLocations(state.game, selectedData.actionName, selectedData.card);
            else if(selectedData.actionType === GameStoreActionTypes.ChampionAction && isAction(selectedData.card))
                allowedLocationsResult = getChampionsActionsAllowedBoardLocations(state.game, selectedData.card, selectedData.sourceLocation); 
               
            if (allowedLocationsResult.message === 'success')
                selectedData = { ...selectedData, ...{ allowedBoardLocations: allowedLocationsResult.locations } }
            else alert(allowedLocationsResult.message);

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