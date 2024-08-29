import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createGame, Game, cardsList } from '../logic/game';
import { ActionCard, GameCard, isAction, isOrder, OrderCard, AllowedBoardLocationResponse, BoardLocation, AllowedHandCardSelectResponse } from '../logic/game-card';
import { championAction, getChampionsActionsAllowedBoardLocations } from '../logic/champion';
import { GameStatus, CardType } from '../logic/enums';
import { playerAction, getPlayerActionsAllowedBoardLocations, getPlayerAllowedHandCardSelect } from '../logic/player';
import { playSoundByPlayerActionName, playSoundByCardActionName } from '../helpers/audio-helper';
import { GameStoreActionTypes } from './types';
import { updateGameAsync, addGameAsync } from '../firebase/firebase';

export interface SelectedData {
    card: GameCard | null,
    actionName: string,
    actionType: GameStoreActionTypes | null,
    sourceLocation: BoardLocation | null,
    allowedBoardLocations: BoardLocation[],
    isAttachedAction: boolean,
    allowedHandCardSelect: GameCard[],
    cardToDraw: GameCard | null
}

interface ShowCardsInDeck {
    show: boolean,
    byType: CardType | null
}

export const createShowCardsInDeck = (show: boolean, byType: CardType | null = null) : ShowCardsInDeck => {
    return {show: show, byType: byType} as ShowCardsInDeck;
}

export const createSelectedData = (card: GameCard | null,
    actionName: string, actionType: GameStoreActionTypes | null, sourceLocation: BoardLocation | null = null, isAttachedAction = false, cardToDraw: GameCard | null = null): SelectedData => {
    return {
        card: card,
        actionName: actionName,
        actionType: actionType,
        sourceLocation: sourceLocation,
        allowedBoardLocations: [],
        isAttachedAction: isAttachedAction,
        allowedHandCardSelect: [],
        cardToDraw: cardToDraw
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
        allowedHandCardSelect: [],
        cardToDraw: null
    } as SelectedData,
    showHand: false as boolean,
    showCardsInDeck: { show: false } as ShowCardsInDeck,
    cardsList: cardsList as GameCard[]
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
            const { card, cardToDraw, actionName } = action.payload.selectedActionData ?? state.selectedActionData;
            
            const result = playerAction(actionName, state.cardsList, state.game, { selectedCard: card, cardToDraw: cardToDraw, extendedData: data });

            if (result !== 'success') alert(result);
            else {
                playSoundByPlayerActionName(actionName);
                state.selectedActionData = initialState.selectedActionData;
                if (state.game.code !== '')
                    updateGameAsync(state.game).catch(console.error);
            }
        },
        setShowHand(state, action) {
            state.showHand = action.payload;
        },
        setShowCardsInDeck(state, action) {
            state.showCardsInDeck = action.payload;
        },
        setSelectedActionDataCardToDraw(state, action) {
            if (action.payload === null) {
                alert('Card to draw not be null');
                return;
            }

            state.selectedActionData.cardToDraw = action.payload;
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

            if(gameCode !== 'Bot')
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
    setShowCardsInDeck,
    setSelectedActionData,
    setPartialGame,
    setJoinedGame,
    setCreatedGame,
    setSelectedActionDataCardToDraw
} = gameSlice.actions;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;