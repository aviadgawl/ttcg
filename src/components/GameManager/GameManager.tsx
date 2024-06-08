import { FC, useState, useRef, useEffect } from 'react';
import styles from './GameManager.module.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { GameStatus } from '../../logic/enums';
import { Game } from '../../logic/game';
import { gameSubscriber, getGameAsync, addGameAsync, updateGameAsync } from '../../firebase/firebase';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setGameStatus, setGame, setPartialGame } from '../../redux/store';
import Board from '../Board/Board';
import GameDetails from '../GameDetails/GameDetails';
import Hand from '../Hand/Hand';

interface GameJoinCreateProps { }

const GameJoinCreate: FC<GameJoinCreateProps> = () => {
  const [gameCode, setGameCode] = useState('');
  const activeGameRef = useRef(null as any);

  const dispatch = useAppDispatch();
  const winner = useAppSelector((state) => state.gameActions.game.loser);
  const game = useAppSelector((state) => state.gameActions.game);

  useEffect(() => {
    if (game && game.status === GameStatus.started && gameCode !== '')
      updateGameAsync(gameCode, game).catch(console.error);

  }, [game, gameCode]);

  if (game.status === GameStatus.over && winner !== null)
    alert(`Player ${winner.name} has lost!`);

  const handleJoinGame = async () => {
    const game = await getGameAsync(gameCode);

    if (game === null) {
      alert(`Unable to join game ${gameCode}, game was not found`);
      return;
    };

    if (game.status === GameStatus.over) {
      alert(`Unable to join game ${gameCode}, game was over`);
      return;
    };
    
    game.players[1] = game.players[0];
    game.playerIndex = 1;
    dispatch(setGame(game));

    gameUpdatesSubscriber();
  }

  const handleCreateGame = async () => {
    const gameFromDb = await getGameAsync(gameCode);

    if (gameFromDb !== null) {
      alert(`Unable to create game ${gameCode}, game is already exists`);
      return;
    };

    await addGameAsync(gameCode, { ...game, status: GameStatus.started });
    dispatch(setGameStatus(GameStatus.started));
    gameUpdatesSubscriber();
  }

  const gameUpdatesSubscriber = () => {
    activeGameRef.current = gameSubscriber(gameCode, (gameFromDb: Game) => {
      dispatch(setPartialGame(gameFromDb));
    });
  }

  return <div className={styles.GameJoinCreate}>
    {game.status === GameStatus.over && <div>
      <TextField onChange={(input) => setGameCode(input.target.value)} placeholder='Code' helperText="Enter Game Code"></TextField>
      <div>
        <Button onClick={handleJoinGame}>Join</Button>
        <Button onClick={handleCreateGame}>Create</Button>
      </div>
    </div>}
    {game.status === GameStatus.started && <>
      <GameDetails />
      <Board />
      <Hand />
    </>}
  </div>
};

export default GameJoinCreate;
