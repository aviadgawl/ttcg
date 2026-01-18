import { FC } from 'react';
import { SummoningCard } from '../../logic/game-card';
import styles from './BoardCrystal.module.css';

interface BoardCrystalProps {
    crystal: SummoningCard,
    className?:string
}

const BoardCrystal: FC<BoardCrystalProps> = (props: BoardCrystalProps) => {
  console.log('props: ', props);

  return <div className={`${props.className} ${styles.BoardCrystal}`} style={{ backgroundImage: `url(${props.crystal.image})` }}>
    <label className={`${styles.BoardCrystalHpLabel}`}>{props.crystal.currentHp}</label>
  </div>
};

export default BoardCrystal;
