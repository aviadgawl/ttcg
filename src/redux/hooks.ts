import { useCallback } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch, SelectedData, setGame, resetSelectedData, setCardsList } from './store';
import { playSoundByPlayerActionName } from '../helpers/audio-helper';
import { playerAction } from '../logic/player';
import { updateGameAsync } from '../firebase/firebase';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const usePlayerAction = () => {
    const state = useAppSelector((state) => state.gameActions);
    const dispatch = useAppDispatch();

    return useCallback((selectedActionData: SelectedData | null, additionalData: any = null) => {
        const { card, cardToDraw, actionName } = selectedActionData ?? structuredClone(state.selectedActionData);
        
        const data = { selectedCard: card, cardToDraw: cardToDraw, extendedData: additionalData };
        const gameToUpdate = structuredClone(state.game);
        const cardsListToUpdate = [ ...state.cardsList ];

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
    }, [dispatch, state]);
}

export const useChampionAction = () => {
    const state = useAppSelector((state) => state.gameActions);
    const dispatch = useAppDispatch();

    return useCallback((selectedActionData: SelectedData | null, additionalData: any = null) => {
        const { card, cardToDraw, actionName } = selectedActionData ?? structuredClone(state.selectedActionData);
        
        const data = { selectedCard: card, cardToDraw: cardToDraw, extendedData: additionalData };
        const gameToUpdate = structuredClone(state.game);
        const cardsListToUpdate = [ ...state.cardsList ];

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
    }, [dispatch, state]);
}