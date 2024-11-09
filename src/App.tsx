import { useState, useEffect } from 'react';
import DeckBuilder from './components/DeckBuilder/DeckBuilder';
import GameTabs from './components/GameTabs/GameTabs';
import GameJoinCreate from './components/GameManager/GameManager';
import { useAppSelector } from './redux/hooks';
import { GameStatus } from './logic/enums';
import './App.css';

function App() {
  const [currentDisplay, setCurrentDisplay] = useState(0);
  const [disabledTabIndex, setDisabledTabIndex] = useState(-1);

  const gameStatus = useAppSelector((state) => state.gameActions.game.status);

  useEffect(() => {
    if (gameStatus === GameStatus.started)
      setDisabledTabIndex(0);
    else if (gameStatus === GameStatus.over)
      setDisabledTabIndex(-1)
  }, [gameStatus]);

  const handleDisplaySelect = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentDisplay(newValue);
  }

  return (
    <main className="App">
      <header>
        <GameTabs disabledTabIndex={disabledTabIndex} displayMode={currentDisplay} onModeClick={handleDisplaySelect} />
        <div>0.3.0</div>
      </header>
      <div className="App-content">
        {currentDisplay === 0 && <DeckBuilder />}
        {currentDisplay === 1 && <GameJoinCreate />}
      </div>
    </main>
  );
}

export default App;
