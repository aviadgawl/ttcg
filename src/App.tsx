import { useEffect, useState } from 'react';
import Board from './components/Board/Board';
import GameDetails from './components/GameDetails/GameDetails';
import GameDialog from './components/GameDialog/GameDialog';
import Hand from './components/Hand/Hand';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { setDialog } from './redux/store';
import { GameStatus } from './logic/game';
import { getGames } from './firebase/firebase';
import DeckBuilder from './components/DeckBuilder/DeckBuilder';
import GameTabs from './components/GameMenu/GameTabs';

import './App.css';


function App() {
  const [currentDisplay, setCurrentDisplay] = useState(0);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await getGames();
  //   }

  //   fetchData().catch(console.error);
  // }, [])

  const gameStatus = useAppSelector((state) => state.gameActions.game.status);
  const winner = useAppSelector((state) => state.gameActions.game.loser);
  const dispatch = useAppDispatch();

  const handleDisplaySelect = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentDisplay(newValue);
  }

  if (gameStatus === GameStatus.over && winner !== null)
    dispatch(setDialog({ title: `Player ${winner.name} has lost!`, content: 'Close match, try another match', showButtons: false }));

  return (
    <main className="App">
      <GameTabs displayMode={currentDisplay} onModeClick={handleDisplaySelect} />
      {currentDisplay === 0 && <DeckBuilder />}
      {currentDisplay === 1 && <><GameDialog />
        <GameDetails />
        <Board />
        <Hand />
      </>}
    </main>
  );
}

export default App;
