import { useCallback } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux';
import { RootState, AppDispatch, SelectedData, setGame, resetSelectedData, setCardsList, setPartialGame } from './store';
import { playSoundByPlayerActionName, playSoundByCardActionName } from '../helpers/audio-helper';
import { playerAction, shouldUpdateMultiplayerGame } from '../logic/player';
import { championAction } from '../logic/champion';
import { updateGameAsync, addGameAsync, getGameAsync } from '../firebase/firebase';
import { BoardLocation, isAction, ActionCard } from '../logic/game-card';
import { Game } from '../logic/game';
import { GameStatus, PlayerActionsName } from '../logic/enums';
import { makeMove } from '../logic/game-bot';
import { Player } from '../logic/player';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const usePlayerAction = () => {
    const store = useStore();
    const dispatch = useAppDispatch();

    return useCallback((newSelectedActionData: SelectedData | null, additionalData: any = null) => {
        const state = store.getState() as any;

        const { game, selectedActionData, cardsList } = state.gameActions;
        const { card, cardsToDraw, actionName } = newSelectedActionData ?? structuredClone(selectedActionData);

        const data = { selectedCard: card, cardsToDraw: cardsToDraw, extendedData: additionalData };
        const gameToUpdate = structuredClone(game);
        const cardsListToUpdate = [...cardsList];

        const result = playerAction(actionName, cardsListToUpdate, gameToUpdate, data);

        if (result !== 'success') alert(result);
        else {
            playSoundByPlayerActionName(actionName);

            dispatch(resetSelectedData());

            const shouldUBroadcastUpdate = shouldUpdateMultiplayerGame(actionName);
            if (gameToUpdate.code !== 'Bot' && gameToUpdate.code !== '' && shouldUBroadcastUpdate)
                updateGameAsync(gameToUpdate).catch(console.error);

            if (actionName === PlayerActionsName.EndTurn && gameToUpdate.code === 'Bot') {
                gameToUpdate.playerIndex = 1;
                makeMove(gameToUpdate);
                gameToUpdate.playerIndex = 0;
            }
        }

        dispatch(setGame(gameToUpdate));
        dispatch(setCardsList(cardsListToUpdate));
    }, [dispatch, store]);
};

export const useChampionAction = () => {
    const store = useStore();
    const dispatch = useAppDispatch();

    return useCallback((targetLocation: BoardLocation) => {
        const state = store.getState() as any;
        const selectedActionDataClone = structuredClone(state.gameActions.selectedActionData);

        if (selectedActionDataClone.card === null) {
            alert('SelectedData card can not be null');
            return;
        }

        if (selectedActionDataClone.sourceLocation === null) {
            alert('No source location');
            return;
        };

        if (!isAction(selectedActionDataClone.card)) {
            alert('SelectedData is not action card');
            return;
        };

        const gameClone = structuredClone(state.gameActions.game);
        const result = championAction(gameClone,
            selectedActionDataClone.card as ActionCard,
            selectedActionDataClone.sourceLocation,
            targetLocation,
            selectedActionDataClone.isAttachedAction);

        if (result !== 'success') alert(result);
        else {
            playSoundByCardActionName(selectedActionDataClone.card.actionType);
            dispatch(resetSelectedData());
            if (gameClone.code !== 'Bot')
                updateGameAsync(gameClone).catch(console.error);
        }

        dispatch(setGame(gameClone));
    }, [dispatch, store]);
};

export const useCreateGame = () => {
    const store = useStore();
    const dispatch = useAppDispatch();

    return useCallback((gameCode: string) => {
        const state = store.getState() as any;
        let createdGame: Game = { ...state.gameActions.game, status: GameStatus.started, code: gameCode };

        if (gameCode !== 'Bot')
            addGameAsync(createdGame).catch(console.error);
        else {
            const botPlayer = changeLocalPlayerToPlayerTwo(createdGame.players[0]);
            createdGame = { ...createdGame, players: [createdGame.players[0], botPlayer] };
        }

        dispatch(setGame(createdGame));
    }, [dispatch, store])
};

export const useJoinGame = () => {
    const store = useStore();
    const dispatch = useAppDispatch();

    return useCallback((gameFromDb: Game) => {
        const state = store.getState() as any;
        const game: Game = state.gameActions.game;

        const localPlayer = game.players[0];

        const playerTwo = changeLocalPlayerToPlayerTwo(localPlayer);
        const joinedGame = {
            ...gameFromDb,
            players: [gameFromDb.players[0],
                playerTwo],
            playerIndex: 1,
            code: gameFromDb.code,
            status: GameStatus.started
        };

        updateGameAsync(joinedGame).catch(console.error);

        dispatch(setGame(joinedGame));
    }, [dispatch, store]);
};

export const useRefreshGame = () => {
    const store = useStore();
    const dispatch = useAppDispatch();

    return useCallback(async () => {
        const state = store.getState() as any;
        const game: Game = state.gameActions.game;

        const gameFromDb = await getGameAsync(game.code);

        dispatch(setPartialGame(gameFromDb));
    }, [dispatch, store]);
}

const changeLocalPlayerToPlayerTwo = (localPlayer: Player) => {
    const localPlayerClone = structuredClone(localPlayer) as Player;

    const playerTwoDeck = localPlayerClone.deck.map(card => {
        return { ...card, playerIndex: 1 }
    });

    const playerTwoHand = localPlayerClone.hand.map(card => {
        return { ...card, playerIndex: 1 }
    });

    let playerTwoStartingChampion = null;

    if (localPlayerClone.startingChampion)
        playerTwoStartingChampion = { ...localPlayerClone.startingChampion, playerIndex: 1 };

    const playerTwo = {
        ...localPlayerClone,
        name: 'Player Two',
        deck: playerTwoDeck,
        hand: playerTwoHand,
        startingChampion: playerTwoStartingChampion
    };

    return playerTwo;
};