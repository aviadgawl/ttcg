import React, { FC } from 'react';
import { GameCard } from '../../logic/game-card';
import styles from './BoardCrystal.module.css';

interface BoardCrystalProps {
    crystal: GameCard,
    rotate: boolean
}

const BoardCrystal: FC<BoardCrystalProps> = (props: BoardCrystalProps) => (
  <div className={`App-text-color ${styles.BoardCrystal} ${props.rotate ? 'App-rotate' : ''}`} style={{ backgroundImage: `url(${props.crystal.image})` }}>
    <h2>{props.crystal.currentHp} / {props.crystal.hp}</h2>
  </div>
);

export default BoardCrystal;
