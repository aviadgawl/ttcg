import { useEffect } from 'react';
import Board from './components/Board/Board';
import GameDetails from './components/GameDetails/GameDetails';
import GameDialog from './components/GameDialog/GameDialog';
import Hand from './components/Hand/Hand';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { setDialog } from './app/store';
import { GameStatus } from './logic/game';
import { getGames } from './firebase/firebase';
import DeckBuilder from './components/DeckBuilder/DeckBuilder';

import './App.css';

function App() {

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await getGames();
  //   }
  
  //   fetchData().catch(console.error);
  // }, [])

  const gameStatus = useAppSelector((state) => state.gameActions.game.status);
  const winner = useAppSelector((state) => state.gameActions.game.looser);
  const dispatch = useAppDispatch();

  if(gameStatus === GameStatus.over && winner !== null)
    dispatch(setDialog({title: `Player ${winner.name} has lost!`, content: 'Close match, try another match', showButtons: false}));

  return (
    <main className="App">
      <DeckBuilder></DeckBuilder>
      {/* <GameDialog />
      <GameDetails />
      <Board />
      <Hand /> */}
    </main>
  );
}

export default App;
