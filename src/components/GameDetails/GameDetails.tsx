import { FC } from 'react';
import { useAppSelector } from '../../redux/hooks';
import iconsList from './IconsList';
import styles from './GameDetails.module.css';

const iconHeight = 25;

const GameDetails: FC = () => {
  const playingPlayer = useAppSelector((state) => state.gameActions.game.playingPlayerIndex);
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);

  return <div className={styles.GameDetails}>
    <h2>Player Number: {playerIndex + 1} | Playing Player: {playingPlayer + 1}</h2>
    <table>
      <thead>
        <tr>
          <th>Icon</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {iconsList.map(item => <tr>
          <td><img alt="Icon place" height={iconHeight} src={item.icon} /></td>
          <td>{item.description}</td>
        </tr>)}
      </tbody>
    </table>
  </div>
};

export default GameDetails;
