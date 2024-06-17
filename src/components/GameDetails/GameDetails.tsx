import { FC } from 'react';
import { useAppSelector } from '../../redux/hooks';
import FighterIcon from '../../assets/images/FighterIcon.png';
import PhysicalDamageImmunityIcon from '../../assets/images/PhysicalDamageImmunityIcon.png';
import BlockingIcon from '../../assets/images/BlockingIcon.png';
import BreakGearIcon from '../../assets/images/BreakGearIcon.png';
import SilenceIcon from '../../assets/images/SilenceIcon.png';
import TimeBoundIcon from '../../assets/images/TimeBoundIcon.png';
import styles from './GameDetails.module.css';

interface GameDetailsProps { }

const GameDetails: FC<GameDetailsProps> = () => {
  const playingPlayer = useAppSelector((state) => state.gameActions.game.playingPlayerIndex);
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);

  return <div className={styles.GameDetails}>
    <h2>Player Number: {playerIndex + 1} | Playing Player: {playingPlayer + 1}</h2>
    <table>
      <thead>
        <th>Name</th>
        <th>Description</th>
      </thead>
      <tbody>
        <tr>
          <td><img height={25} src={FighterIcon} /></td>
          <td>Fighter class</td>
        </tr>
        <tr>
          <td><img height={25} src={PhysicalDamageImmunityIcon} /></td>
          <td>Physical damage immunity icon</td>
        </tr>
        <tr>
          <td><img height={25} src={BlockingIcon} /></td>
          <td>Blocking</td>
        </tr>
        <tr>
          <td><img height={25} src={BreakGearIcon} /></td>
          <td>Break gear</td>
        </tr>
        <tr>
          <td><img height={25} src={SilenceIcon} /></td>
          <td>Silence icon</td>
        </tr>
        <tr>
          <td><img height={25} src={TimeBoundIcon} /></td>
          <td>Time bound action</td>
        </tr>
      </tbody>
    </table>
  </div>
};

export default GameDetails;
