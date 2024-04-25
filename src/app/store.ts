import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createGame, Game } from '../logic/game';
import { ActionCard, GameCard } from '../logic/game-card';
import { championAction } from '../logic/champion';
import { playerAction } from '../logic/player';
import { playSoundByPlayerActionName, playSoundByCardActionName } from '../helpers/audio-helper';

export interface GameDialog {
    title: string;
    content: string;
    showButtons: boolean;
}

export interface SelectedData {
    card: GameCard|null,
    actionName: string|null,
    actionType: string|null,
    location: number[]
}

export const createSelectedData = (card: GameCard | null, actionName: string, actionType: string, location: number[] = [-1, -1]) => {
    return { card: card, actionName: actionName, actionType: actionType, location }
}

export const initialState = {
    game: createGame() as Game,
    playerIndex: 0 as number,
    selectedActionData: { card: null, actionName: null, actionType: null, location: [-1, -1] } as SelectedData,
    showHand: false as boolean,
    dialog: null as unknown as GameDialog
}

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        championActions(state, action) {
            const { targetLocation } = action.payload;
            const { card, location } = state.selectedActionData;

            if(card === null) {
                alert('SelectedData card can not be null');
                return;
            }

            const result = championAction(state.game,
                card.name, location[0], location[1], targetLocation[0], targetLocation[1]);

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
        setPlayer(state, action){
            state.playerIndex = action.payload;
        },
        setShowHand(state, action) {
            state.showHand = action.payload;
        },
        setSelectedActionData(state, action) {
            state.selectedActionData = action.payload;
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