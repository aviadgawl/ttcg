import './App.css';
import Board from './components/Board/Board';
import GameDetails from './components/GameDetails/GameDetails';
import Hand from './components/Hand/Hand';
function App() {

  return (
    <main className="App">
      <GameDetails />
      <Board />
      <Hand />
    </main>
  );
}

export default App;
