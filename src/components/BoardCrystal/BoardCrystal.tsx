import { FC } from 'react';
import { CrystalCard } from '../../logic/game-card';
import styles from './BoardCrystal.module.css';

interface BoardCrystalProps {
    crystal: CrystalCard,
    className?:string,
    colorClassName: string,
}

const BoardCrystal: FC<BoardCrystalProps> = (props: BoardCrystalProps) => {

  const getPlayerClassName = () => {
    if(props.crystal.playerIndex === 0)
      return 'App-player-one-color';
    else if (props.crystal.playerIndex === 1)
      return 'App-player-two-color';
  }

  return <div className={`${props.className} ${styles.BoardCrystal}`} style={{ backgroundImage: `url(${props.crystal.image})` }}>
    <label className={`${styles.BoardCrystalHpLabel} ${props.colorClassName}`}>{props.crystal.currentHp}</label>
  </div>
};

export default BoardCrystal;
