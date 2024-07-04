import { FC } from 'react';
import { CrystalCard } from '../../logic/game-card';
import styles from './BoardCrystal.module.css';

interface BoardCrystalProps {
    crystal: CrystalCard,
    className?:string
}

const BoardCrystal: FC<BoardCrystalProps> = (props: BoardCrystalProps) => {

  const getPlayerClassName = () => {
    if(props.crystal.playerIndex === 0)
      return styles.PlayerOneObject;
    else if (props.crystal.playerIndex === 1)
      return styles.PlayerTwoObject;
  }

  return <div className={`${props.className} App-text-color ${styles.BoardCrystal}`} style={{ backgroundImage: `url(${props.crystal.image})` }}>
    <h2 className={getPlayerClassName()}>{props.crystal.currentHp} / {props.crystal.hp}</h2>
  </div>
};

export default BoardCrystal;
