// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, onSnapshot, doc, getDoc, setDoc, updateDoc, connectFirestoreEmulator } from 'firebase/firestore';
import { Game } from '../logic/game';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeMDZFJa8DCFRCm094uU6-1dZO5Z5qhcI",
  authDomain: "ttcg-1170e.firebaseapp.com",
  projectId: "ttcg-1170e",
  storageBucket: "ttcg-1170e.appspot.com",
  messagingSenderId: "229282985789",
  appId: "1:229282985789:web:6e9ddec654109579077754",
  measurementId: "G-P2Q40LR4Q9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

console.log(process.env.REACT_APP_NOT_SECRET_CODE);

if(process.env.REACT_APP_NOT_SECRET_CODE) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  setDoc(doc(db, 'games', 'default'), {gameAsJson: 'default'});
}

export const getGamesAsync = async () => {
  const gamesCol = collection(db, 'games');
  const gamesSnapshot = await getDocs(gamesCol);
  const gamesList = gamesSnapshot.docs.map(doc => doc.data());
  return gamesList;
}

export const updateGameAsync = async (game: Game) => {
  const gameDocRef = doc(db, 'games', game.code);
  const gameAsJson = JSON.stringify(game);
  await updateDoc(gameDocRef, {gameAsJson: gameAsJson});
}

export const addGameAsync = async (game: Game) => {
  await setDoc(doc(db, 'games', game.code), {gameAsJson: JSON.stringify(game)});
}

export const getGameAsync = async (gameCode: string): Promise<Game|null> => {
  const docRef = doc(db, "games", gameCode);
  const gameDoc = await getDoc(docRef);
  const gameData = gameDoc.data();

  if(!gameData?.gameAsJson) return null;

  return JSON.parse(gameData.gameAsJson);
}

export const gameSubscriber = (gameCode: string, onGameUpdate: (game: Game) => void) => {
  return onSnapshot(doc(db, "games", gameCode), (doc: any) => {
    const game = doc.data();
    const gameAsObject = JSON.parse(game.gameAsJson);
    onGameUpdate(gameAsObject as Game);
  });
}