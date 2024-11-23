import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createGame, Game, cardsList } from '../logic/game';
import { GameCard, isAction, isOrder, OrderCard, AllowedBoardLocationResponse, BoardLocation, AllowedHandCardSelectResponse } from '../logic/game-card';
import { getChampionsActionsAllowedBoardLocations } from '../logic/champion';
import { CardType } from '../logic/enums';
import { getPlayerActionsAllowedBoardLocations, getPlayerAllowedHandCardSelect } from '../logic/player';
import { GameStoreActionTypes } from './types';

export interface SelectedData {
    card: GameCard | null,
    actionName: string,
    actionType: GameStoreActionTypes | null,
    sourceLocation: BoardLocation | null,
    allowedBoardLocations: BoardLocation[],
    isAttachedAction: boolean,
    allowedHandCardSelect: GameCard[],
    cardsToDraw: GameCard[]
}

interface ShowCardsInDeck {
    show: boolean,
    byType: CardType | null,
    byName: string | null
}

export const createShowCardsInDeck = (show: boolean, byType: CardType | null = null, byName: string | null = null): ShowCardsInDeck => {
    return { show: show, byType: byType, byName: byName } as ShowCardsInDeck;
}

export const createSelectedData = (card: GameCard | null,
    actionName: string, actionType: GameStoreActionTypes | null, sourceLocation: BoardLocation | null = null, isAttachedAction = false, cardsToDraw: GameCard[] = []): SelectedData => {
    return {
        card: card,
        actionName: actionName,
        actionType: actionType,
        sourceLocation: sourceLocation,
        allowedBoardLocations: [],
        isAttachedAction: isAttachedAction,
        allowedHandCardSelect: [],
        cardsToDraw: cardsToDraw
    };
}

export const initialState = {
    game: createGame() as Game,
    selectedActionData: {
        card: null,
        actionName: '',
        actionType: null,
        sourceLocation: null,
        allowedBoardLocations: [],
        isAttachedAction: false,
        allowedHandCardSelect: [],
        cardsToDraw: []
    } as SelectedData,
    showHand: false as boolean,
    showGameDetails: false as boolean,
    showCardsInDeck: { show: false } as ShowCardsInDeck,
    cardsList: cardsList as GameCard[],
    isLoggedIn: false as boolean
}

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setShowHand(state, action) {
            state.showHand = action.payload;
        },
        setShowCardsInDeck(state, action) {
            state.showCardsInDeck = action.payload;
        },
        setSelectedActionDataCardsToDraw(state, action) {
            if (action.payload === null) {
                alert('Card to draw not be null');
                return;
            }

            state.selectedActionData.cardsToDraw = action.payload;
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
            else alert(allowedLocationsResult.message);

            if (allowedHandCardSelectResult.message === 'success')
                selectedData = { ...selectedData, ...{ allowedHandCardSelect: allowedHandCardSelectResult.handCards } }
            else alert(allowedHandCardSelectResult.message);

            state.selectedActionData = selectedData;
        },
        setPartialGame(state, action) {
            const updatedGame = {
                ...state.game,
                players: action.payload.players,
                board: action.payload.board,
                playingPlayerIndex: action.payload.playingPlayerIndex,
                loser: action.payload.loser
            };
            state.game = updatedGame;
        },
        setGame(state, action) {
            state.game = action.payload;
        },
        setCardsList(state, action) {
            state.cardsList = action.payload;
        },
        resetSelectedData(state) {
            state.selectedActionData = initialState.selectedActionData;
        },
        returnToInitialState(state) {
            state = initialState;
        },
        setShowGameDetails(state, action) {
            state.showGameDetails = action.payload;
        },
        setIsLoggedIn(state, action) {
            state.isLoggedIn = action.payload;
        }
    }
});

const store = configureStore({
    reducer: {
        gameActions: gameSlice.reducer
    }
})

export const {
    setShowHand,
    setShowCardsInDeck,
    setSelectedActionData,
    setPartialGame,
    setSelectedActionDataCardsToDraw,
    setGame,
    setCardsList,
    resetSelectedData,
    returnToInitialState,
    setShowGameDetails,
    setIsLoggedIn
} = gameSlice.actions;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;