import { FC, useState, useRef } from 'react';
import styles from './GameManager.module.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { GameStatus } from '../../logic/enums';
import { gameSubscriber, isGameExistsAsync } from '../../firebase/firebase';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setGameStatus } from '../../redux/store';
import Board from '../Board/Board';
import GameDetails from '../GameDetails/GameDetails';
import Hand from '../Hand/Hand';

interface GameJoinCreateProps { }

const GameJoinCreate: FC<GameJoinCreateProps> = () => {
  const [gameCode, setGameCode] = useState('');
  const activeGameRef = useRef(null as any);

  const dispatch = useAppDispatch();
  const gameStatus = useAppSelector((state) => state.gameActions.game.status);
  const winner = useAppSelector((state) => state.gameActions.game.loser);

  if (gameStatus === GameStatus.over && winner !== null)
    alert(`Player ${winner.name} has lost!`);

  const handleJoinGame = async () => {
    const isActive = await isGameExistsAsync(gameCode);

    if (!isActive) {
      alert(`Unable to join game ${gameCode}, game was not found`);
      return;
    };

    activeGameRef.current = gameSubscriber(gameCode, (game: any) => {
      console.log(JSON.stringify(game));
    });

    dispatch(setGameStatus(GameStatus.started));
  }

  const handleCreateGame = async () => {
    const isActive = await isGameExistsAsync(gameCode);

    if (isActive) {
      alert(`Unable to create game ${gameCode}, game is already exists`);
      return;
    };
  }

  return <div className={styles.GameJoinCreate}>
    {gameStatus === GameStatus.over && <div>
      <TextField onChange={(input) => setGameCode(input.target.value)} placeholder='Code' helperText="Enter Game Code"></TextField>
      <div>
        <Button onClick={handleJoinGame}>Join</Button>
        <Button onClick={handleCreateGame}>Create</Button>
      </div>
    </div>}
    {gameStatus === GameStatus.started && <>
      <GameDetails />
      <Board />
      <Hand />
    </>}
  </div>
};

export default GameJoinCreate;
