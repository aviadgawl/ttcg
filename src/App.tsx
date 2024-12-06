import { useState, useEffect } from 'react';
import DeckBuilder from './components/DeckBuilder/DeckBuilder';
import GameTabs from './components/GameTabs/GameTabs';
import GameJoinCreate from './components/GameManager/GameManager';
import { useAppSelector, useAppDispatch } from './redux/hooks';
import { setIsLoggedIn } from './redux/store';
import { GameStatus } from './logic/enums';
import Login from './components/Login/Login';
import './App.css';

function App() {
  const [currentDisplay, setCurrentDisplay] = useState(0);
  const [disabledTabIndex, setDisabledTabIndex] = useState([-1]);

  const dispatch = useAppDispatch();

  const gameStatus = useAppSelector((state) => state.gameActions.game.status);
  const isLoggedIn = useAppSelector((state) => state.gameActions.isLoggedIn);

  useEffect(() => {
    const isLoggedInItem = localStorage.getItem("isLoggedIn");
    if (isLoggedInItem) {
      dispatch(setIsLoggedIn(true));
      setCurrentDisplay(1);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn)
      setCurrentDisplay(1);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn)
      setDisabledTabIndex([1, 2]);
    else if (gameStatus === GameStatus.started)
      setDisabledTabIndex([0, 1]);
    else if (gameStatus === GameStatus.over)
      setDisabledTabIndex([0])
  }, [gameStatus, isLoggedIn]);

  const handleDisplaySelect = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentDisplay(newValue);
  }

  return (
    <main className="App">
      <header>
        <GameTabs disabledTabIndexes={disabledTabIndex} displayMode={currentDisplay} onModeClick={handleDisplaySelect} />
        <div>1.6.0</div>
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
