import React, { FC, useState, useEffect, useRef } from 'react';
import { ChampionCard } from '../../logic/game-card';
import { LinearProgress } from '@mui/material';
import { playSoundByEvent, SoundEvents } from '../../helpers/audio-helper';
import ChampionSprite from '../ChampionSprite/ChampionSprite';
import styles from './BoardChampionPanel.module.css';
import { ChampionDirection } from '../../logic/enums';

interface BoardChampionAnimationsProps {
  children?: React.ReactNode,
  champion: ChampionCard,
  onPanelClick: () => void,
  shouldRotate?: boolean,
  colorClassName: string,
  isSelected: boolean
};

const BoardChampionPanel: FC<BoardChampionAnimationsProps> = (props: BoardChampionAnimationsProps) => {
  const [showDamage, setShowDamage] = useState(false);
  const hpRef = useRef(props.champion.currentHp);
  const animation = props.isSelected ? 'walk' : 'idle';
  const hpValue = props.champion.currentHp / props.champion.calHp * 100;

  useEffect(() => {
    if (props.champion.currentHp < hpRef.current) {
      setShowDamage(true);
      playSoundByEvent(SoundEvents.hpDamage);
      setTimeout(() => {
        setShowDamage(false);
      }, 2000);
    }

    hpRef.current = props.champion.currentHp;
  }, [props.champion.currentHp]);

  const getDirection = (direction: ChampionDirection) => {
    if(!props.shouldRotate) return direction;

    switch (direction) {
      case ChampionDirection.Up:
       return ChampionDirection.Down;
      case ChampionDirection.Down:
        return ChampionDirection.Up;
      case ChampionDirection.Left:
        return ChampionDirection.Right;
      case ChampionDirection.Right:
        return ChampionDirection.Left;
      default:
        throw new Error(`direction: ${direction} is not supported.`);
    }
  };

  return <div className={`${showDamage && styles.Damage}`}>
    <ChampionSprite onClick={props.onPanelClick} direction={getDirection(props.champion.direction)} championName={props.champion.name} animation={animation} width={100} height={100} />
    <LinearProgress style={{ height: 15 }} variant="determinate" value={hpValue} />
  </div>
};

export default BoardChampionPanel;
