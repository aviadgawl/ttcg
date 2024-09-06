import { FC, useState, useRef } from 'react';
import styles from './GameManager.module.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { GameStatus, PlayerActionsName } from '../../logic/enums';
import { Game } from '../../logic/game';
import { gameSubscriber, getGameAsync } from '../../firebase/firebase';
import { useAppDispatch, useAppSelector, usePlayerAction, useCreateGame, useJoinGame } from '../../redux/hooks';
import { setPartialGame, createSelectedData } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import Board from '../Board/Board';
import GameDetails from '../GameDetails/GameDetails';
import Hand from '../Hand/Hand';

interface GameJoinCreateProps { }

const GameJoinCreate: FC<GameJoinCreateProps> = () => {
  const [gameCode, setGameCode] = useState('');
  const winner = useAppSelector((state) => state.gameActions.game.loser);
  const game = useAppSelector((state) => state.gameActions.game);

  const dispatch = useAppDispatch();
 
  const playerAction = usePlayerAction();
  const createGame = useCreateGame();
  const joinGame = useJoinGame();

  const gameSubRef = useRef(null as any);

  const gameUpdatesSubscriber = (playerIndex: number) => {
    gameSubRef.current = gameSubscriber(gameCode, (gameFromDb: Game) => {

      // Update state if the update was triggered not by the local player
      if (gameFromDb.playerIndex !== playerIndex)
        dispatch(setPartialGame(gameFromDb));
    });
  }

  if (game.status === GameStatus.over && winner !== null)
    alert(`Player ${winner.name} has lost!`);

  const handleJoinGame = async () => {
    const gameFromDb = await getGameAsync(gameCode);

    if (gameFromDb === null) {
      alert(`Unable to join game ${gameCode}, game was not found`);
      return;
    };

    if (gameFromDb.status === GameStatus.over) {
      alert(`Unable to join game ${gameCode}, game was over`);
      return;
    };

    const newSelectedActionData = createSelectedData(null, PlayerActionsName.Draw, GameStoreActionTypes.PlayerAction);
    playerAction(newSelectedActionData, 5);
    joinGame(gameFromDb);
    gameUpdatesSubscriber(1);
  }

  const handleCreateGame = async () => {
    const gameFromDb = await getGameAsync(gameCode);

    if (gameFromDb !== null) {
      alert(`Unable to create game ${gameCode}, game is already exists`);
      return;
    };

    const newSelectedActionData = createSelectedData(null, PlayerActionsName.Draw, GameStoreActionTypes.PlayerAction);
    playerAction(newSelectedActionData, 5);
    createGame(gameCode);
    gameUpdatesSubscriber(0);
  }

  const handleGameWithBot = async () => {
    const newSelectedActionData = createSelectedData(null, PlayerActionsName.Draw, GameStoreActionTypes.PlayerAction);
    playerAction(newSelectedActionData, 5);
    createGame('Bot');
  }

  return <div className={styles.GameJoinCreate}>
    {game.status === GameStatus.over && <div>
      <TextField onChange={(input) => setGameCode(input.target.value)} placeholder='Code' helperText="Enter Game Code"></TextField>
      <div>
        <Button onClick={handleJoinGame}>Join</Button>
        <Button onClick={handleCreateGame}>Create</Button>
        <Button onClick={handleGameWithBot}>Bot</Button>
      </div>
    </div>}
    {game.status === GameStatus.started && <>
      <div className={styles.GameAndDetails}>
        <GameDetails />
        <Board />
      </div>
      <Hand />
    </>}
  </div>
};

export default GameJoinCreate;
