import { FC } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setShowGameDetails } from '../../redux/store';
import { Drawer, Button } from '@mui/material';
import iconsList from './IconsList';
import styles from './GameDetails.module.css';

const iconHeight = 25;

const GameDetails: FC = () => {
  const playingPlayer = useAppSelector((state) => state.gameActions.game.playingPlayerIndex);
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);
  const showGameDetails = useAppSelector((state) => state.gameActions.showGameDetails);

  const dispatch = useAppDispatch();

  return <Drawer variant="persistent" anchor="left" open={showGameDetails} className={styles.GameDetails}>
    <h2>Player Number: {playerIndex + 1} | Playing Player: {playingPlayer + 1}</h2>
    <div className={styles.GameDetailsContent}>
      <table>
        <thead>
          <tr>
            <th>Icon</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {iconsList.map(item => <tr key={item.description}>
            <td><img alt="Icon place" height={iconHeight} src={item.icon} /></td>
            <td>{item.description}</td>
          </tr>)}
        </tbody>
      </table>
      <Button size="small" variant="outlined" onClick={() => { dispatch(setShowGameDetails(false)) }}>Hide details</Button>
    </div>
  </Drawer>
};

export default GameDetails;
