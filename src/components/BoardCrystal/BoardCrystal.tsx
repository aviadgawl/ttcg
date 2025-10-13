import { FC } from 'react';
import { CrystalCard } from '../../logic/game-card';
import styles from './BoardCrystal.module.css';

interface BoardCrystalProps {
    crystal: CrystalCard,
    className?:string,
    colorClassName: string,
}

const BoardCrystal: FC<BoardCrystalProps> = (props: BoardCrystalProps) => {
  return <div className={`${props.className} ${styles.BoardCrystal}`} style={{ backgroundImage: `url(${props.crystal.image})` }}>
    <label className={`${styles.BoardCrystalHpLabel} ${props.colorClassName}`}>{props.crystal.currentHp}</label>
  </div>
};

export default BoardCrystal;
