import { FC } from 'react';
import { useAppSelector } from '../../redux/hooks';
import styles from './GameDetails.module.css';

interface GameDetailsProps {}

const GameDetails: FC<GameDetailsProps> = () => {
  const playingPlayer = useAppSelector((state) => state.gameActions.game.playingPlayerIndex);

  return <div className={styles.GameDetails}>
    <h1>Playing Player: {playingPlayer + 1}</h1>
  </div>
};

export default GameDetails;
