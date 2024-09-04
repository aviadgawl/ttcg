import { useCallback } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux';
import { RootState, AppDispatch, SelectedData, setGame, resetSelectedData, setCardsList } from './store';
import { playSoundByPlayerActionName, playSoundByCardActionName } from '../helpers/audio-helper';
import { playerAction } from '../logic/player';
import { championAction } from '../logic/champion';
import { updateGameAsync, addGameAsync } from '../firebase/firebase';
import { BoardLocation, isAction, ActionCard } from '../logic/game-card';
import { Game } from '../logic/game';
import { GameStatus } from '../logic/enums';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const usePlayerAction = () => {
    const store = useStore();
    const dispatch = useAppDispatch();

    return useCallback((newSelectedActionData: SelectedData | null, additionalData: any = null) => {
        const state = store.getState() as any;

        const { game, selectedActionData, cardsList } = state.gameActions;
        const { card, cardToDraw, actionName } = newSelectedActionData ?? structuredClone(selectedActionData);

        const data = { selectedCard: card, cardToDraw: cardToDraw, extendedData: additionalData };
        const gameToUpdate = structuredClone(game);
        const cardsListToUpdate = [...cardsList];

        const result = playerAction(actionName, cardsListToUpdate, gameToUpdate, data);

        if (result !== 'success') alert(result);
        else {
            playSoundByPlayerActionName(actionName);
            dispatch(resetSelectedData());
            if (gameToUpdate.code !== '')
                updateGameAsync(gameToUpdate).catch(console.error);
        }

        dispatch(setGame(gameToUpdate));
        dispatch(setCardsList(cardsListToUpdate));
    }, []);
}

export const useChampionAction = () => {
    const store = useStore();
    const dispatch = useAppDispatch();

    return useCallback((targetLocation: BoardLocation) => {
        const state = store.getState() as any;
        const { selectedActionData } = state.gameActions;

        if (selectedActionData.card === null) {
            alert('SelectedData card can not be null');
            return;
        }

        if (selectedActionData.sourceLocation === null) {
            alert('No source location');
            return;
        };

        if (!isAction(selectedActionData.card)) {
            alert('SelectedData is not action card');
            return;
        };

        const gameToUpdate = structuredClone(state.game);
        const result = championAction(gameToUpdate, selectedActionData.card as ActionCard, selectedActionData.sourceLocation, targetLocation, selectedActionData.isAttachedAction);

        if (result !== 'success') alert(result);
        else {
            playSoundByCardActionName(selectedActionData.card.actionType);
            dispatch(resetSelectedData());
            if (state.game.code !== '')
                updateGameAsync(state.game).catch(console.error);
        }

        dispatch(setGame(gameToUpdate));
    }, []);
}

export const useCreateGame = () => {
    const store = useStore();
    const dispatch = useAppDispatch();

    return useCallback((gameCode: string) => {
        const state = store.getState() as any;
        const createdGame: Game = { ...state.gameActions.game, status: GameStatus.started, code: gameCode };

        if (gameCode !== 'Bot')
            addGameAsync(createdGame).catch(console.error);

        dispatch(setGame(createdGame));
    }, [])
}