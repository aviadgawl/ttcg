import { useState, useEffect } from 'react';
import DeckBuilder from './components/DeckBuilder/DeckBuilder';
import GameTabs from './components/GameTabs/GameTabs';
import GameManager from './components/GameManager/GameManager';
import { useAppSelector, useAppDispatch } from './redux/hooks';
import { setIsLoggedIn } from './redux/store';
import { GameStatus } from './logic/enums';
import Login from './components/Login/Login';
import { Button, Box } from '@mui/material';
import { loggedInKey } from './components/Shared/Configs/main.config';
import MyTypography from './components/Shared/MUI/MyTypography';
import { useIsMobile } from './components/Shared/Hooks/useIsMobile.hook';
import './App.css';

function App() {
  const [currentDisplay, setCurrentDisplay] = useState(0);
  const [disabledTabIndex, setDisabledTabIndex] = useState([-1]);

  const dispatch = useAppDispatch();

  const gameStatus = useAppSelector((state) => state.gameActions.game.status);
  const isLoggedIn = useAppSelector((state) => state.gameActions.isLoggedIn);

  const isMobile = useIsMobile();

  useEffect(() => {
    const isLoggedInItem = localStorage.getItem(loggedInKey);
    if (isLoggedInItem) {
      dispatch(setIsLoggedIn(true));
      setCurrentDisplay(1);
    }

    window.onbeforeunload = function () {
      return "Are you really sure?";
    };
  }, [dispatch]);

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
  };

  const handleLogout = () => {
    localStorage.removeItem(loggedInKey);
    dispatch(setIsLoggedIn(false));
    setCurrentDisplay(0);
  };

  return (
    <main className="App">
      <header>
        <GameTabs disabledTabIndexes={disabledTabIndex} displayMode={currentDisplay} onModeClick={handleDisplaySelect} />

        <Box display="flex" flexDirection={isMobile ? "column" : "row-reverse"} justifyContent="center" alignContent="center" gap={isMobile ? 0 : 2}>
          <MyTypography>v.2.2.2</MyTypography>
          <Button onClick={handleLogout}><MyTypography>Logout</MyTypography></Button>
        </Box>
      </header>
      {currentDisplay === 0 && <Login />}
      {currentDisplay === 1 && <DeckBuilder />}
      {currentDisplay === 2 && <GameManager />}
    </main>
  );
}

export default App;
