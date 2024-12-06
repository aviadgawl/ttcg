import React, { FC, useState, ReactElement, useEffect, useRef } from 'react';
import { ChampionCard } from '../../logic/game-card';
import { FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { playSoundByEvent , SoundEvents } from '../../helpers/audio-helper';
import styles from './BoardChampionPanel.module.css';

interface BoardChampionAnimationsProps {
  children?: React.ReactNode,
  champion: ChampionCard,
  onPanelClick: () => void,
  shouldRotate?: boolean,
  colorClassName: string,
}

const directionIconMap: ReactElement[] = [
  <FaArrowUp />,
  <FaArrowDown />,
  <FaArrowLeft />,
  <FaArrowRight />
];

const BoardChampionPanel: FC<BoardChampionAnimationsProps> = (props: BoardChampionAnimationsProps) => {
  const [showDamage, setShowDamage] = useState(false);
  const currentHpRef = useRef<number>()

  useEffect(() => {
    if (currentHpRef.current && currentHpRef.current > props.champion.currentHp){
      setShowDamage(true);
      playSoundByEvent(SoundEvents.hpDamage);
      setTimeout(() => {
        setShowDamage(false);
      },1000);
    }

    currentHpRef.current = props.champion.currentHp;
  }, [props.champion.currentHp])

  return <div style={{ backgroundImage: `url(${props.champion.image})` }}
    className={styles.Panel}
    onClick={props.onPanelClick}>
    <div className={`${styles.Panel} ${showDamage && styles.Damage}`}>
      <div className={`${styles.DirectionIcon} ${props.shouldRotate && 'App-rotate'}`}>
        {directionIconMap[props.champion.direction]}
      </div>
      <label className={`${styles.HpLabel} ${props.colorClassName}`}>{props.champion.currentHp}</label>
    </div>
  </div>
};

export default BoardChampionPanel;
