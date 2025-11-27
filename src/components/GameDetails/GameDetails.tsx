import { FC } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setShowGameDetails } from '../../redux/store';
import { Drawer, Typography } from '@mui/material';
import iconsList from './IconsList';
import MyTypography from '../Shared/MUI/MyTypography';
import styles from './GameDetails.module.css';

const iconHeight = 25;

const GameDetails: FC = () => {
  const playingPlayerIndex = useAppSelector((state) => state.gameActions.game.playingPlayerIndex);
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);
  const showGameDetails = useAppSelector((state) => state.gameActions.showGameDetails);

  const dispatch = useAppDispatch();

  return <Drawer anchor="left" open={showGameDetails} className={styles.GameDetails} onClose={() => {dispatch(setShowGameDetails(false))}}>
    <Typography variant='h6'>Player Number: {playerIndex + 1}</Typography>
    <Typography variant='h6'>Playing Player: {playingPlayerIndex + 1}</Typography>
    <div className={styles.GameDetailsContent}>
      <table>
        <thead>
          <tr>
            <th><Typography variant='h6'>Icon</Typography></th>
            <th><Typography variant='h6'>Description</Typography></th>
          </tr>
        </thead>
        <tbody>
          {iconsList.map(item => <tr key={item.description}>
            <td><img alt="Icon place" height={iconHeight} src={item.icon} /></td>
            <td><MyTypography>{item.description}</MyTypography></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Drawer>
};

export default GameDetails;
