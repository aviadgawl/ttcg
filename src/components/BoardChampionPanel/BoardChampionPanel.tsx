import React, { FC, useState, ReactElement, useEffect, useRef } from 'react';
import { ChampionCard } from '../../logic/game-card';
import { FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { playSoundByEvent } from '../../helpers/audio-helper';
import styles from './BoardChampionPanel.module.css';

interface BoardChampionAnimationsProps {
  children?: React.ReactNode,
  champion: ChampionCard,
  onPanelClick: () => void,
  shouldRotate?: boolean
}

const directionIconMap: ReactElement[] = [
  <FaArrowUp />,
  <FaArrowDown />,
  <FaArrowLeft />,
  <FaArrowRight />
];

const BoardChampionPanel: FC<BoardChampionAnimationsProps> = (props: BoardChampionAnimationsProps) => {
  console.log('champ', props.champion);

  const [showDamage, setShowDamage] = useState(false);
  const currentHpRef = useRef<number>()

  useEffect(() => {
    if (currentHpRef.current && currentHpRef.current < props.champion.currentHp){
      setShowDamage(true);
      playSoundByEvent('');
      setTimeout(() => {
        setShowDamage(false);
      },500);
    }

    currentHpRef.current = props.champion.currentHp;
  }, [props.champion.currentHp])

  const getPlayerClassName = () => {
    if (props.champion.playerIndex === 0)
      return styles.PlayerOneObject;
    else if (props.champion.playerIndex === 1)
      return styles.PlayerTwoObject;
  }

  return <div style={{ backgroundImage: `url(${props.champion.image})` }}
    className={styles.Panel}
    onClick={props.onPanelClick}>
    <div className={`${styles.Panel} ${showDamage && styles.Damage}`}>
      <div className={`${styles.DirectionIcon} ${props.shouldRotate && 'App-rotate'}`}>
        {directionIconMap[props.champion.direction]}
      </div>
      <label className={`${styles.HpLabel} ${getPlayerClassName()}`}>{props.champion.currentHp}</label>
    </div>
  </div>
};

export default BoardChampionPanel;