import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createGame } from '../logic/game';
import { GameCard } from '../logic/game-card';
import { GameChampionActions } from '../logic/champion';
import { GamePlayerActions } from '../logic/player';
import { playSoundByPlayerActionName, playSoundByCardActionName } from '../helpers/audio-helper';

export const createSelectedData = (card: GameCard | null, actionName: string, actionType: string, location: number[] = [-1, -1]) => {
    return { card: card, actionName: actionName, actionType: actionType, location }
}

export const initialState = {
    game: createGame(),
    selectedActionData: { card: null, actionName: '', actionType: null, location: [-1, -1] },
    showHand: false
}

const gameChampionActions = new GameChampionActions();
const gamePlayerActions = new GamePlayerActions();

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        championActions(state, action) {
            const { targetLocation } = action.payload;
            const { actionName, location } = state.selectedActionData;

            const result = gameChampionActions.championAction(state.game,
                actionName, location[0], location[1], targetLocation[0], targetLocation[1]);

            if (result !== 'success') alert(result);
            else playSoundByCardActionName(actionName);
        },
        playerActions(state, action) {
            const { data } = action.payload;
            const { card, actionName } = action.payload.selectedActionData ?? state.selectedActionData;
            const result = gamePlayerActions.playerAction(actionName, state.game, { selectedCard: card, extendedData: data });

            if (result !== 'success') alert(result);
            else playSoundByPlayerActionName(actionName);
        },
        setShowHand(state, action) {
            state.showHand = action.payload;
        },
        setSelectedActionData(state, action) {
            state.selectedActionData = action.payload;
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
    setSelectedActionData
} = gameSlice.actions;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;