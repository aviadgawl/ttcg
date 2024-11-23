import { useState, useEffect } from 'react';
import DeckBuilder from './components/DeckBuilder/DeckBuilder';
import GameTabs from './components/GameTabs/GameTabs';
import GameJoinCreate from './components/GameManager/GameManager';
import { useAppSelector } from './redux/hooks';
import { GameStatus } from './logic/enums';
import Login from './components/Login/Login';
import './App.css';

function App() {
  const [currentDisplay, setCurrentDisplay] = useState(0);
  const [disabledTabIndex, setDisabledTabIndex] = useState([-1]);

  const gameStatus = useAppSelector((state) => state.gameActions.game.status);
  const isLoggedIn = useAppSelector((state) => state.gameActions.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn)
      setDisabledTabIndex([1, 2]);
    else if (gameStatus === GameStatus.started)
      setDisabledTabIndex([0]);
    else if (gameStatus === GameStatus.over)
      setDisabledTabIndex([-1])
  }, [gameStatus, isLoggedIn]);

  const handleDisplaySelect = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentDisplay(newValue);
  }

  return (
    <main className="App">
      <header>
        <GameTabs disabledTabIndexes={disabledTabIndex} displayMode={currentDisplay} onModeClick={handleDisplaySelect} />
        <div>0.8.0</div>
      </header>
      <div>
        {currentDisplay === 0 && <Login />}
        {currentDisplay === 1 && <DeckBuilder />}
        {currentDisplay === 2 && <GameJoinCreate />}
      </div>
    </main>
  );
}

export default App;
