import React, { FC, useState, useEffect, useRef } from 'react';
import { ChampionCard } from '../../logic/game-card';
import { LinearProgress, ThemeProvider, createTheme, Stack } from '@mui/material';
import { playSoundByEvent, SoundEvents } from '../../helpers/audio-helper';
import ChampionSprite from '../ChampionSprite/ChampionSprite';
import styles from './BoardChampionPanel.module.css';
import { ChampionDirection } from '../../logic/enums';
import { isMobileDevice } from '../../helpers/functions-helper';

const playerOneTheme = createTheme({
  palette: {
    primary: {
      main: '#94b354'
    }
  },
});

const playerTwoTheme = createTheme({
  palette: {
    primary: {
      main: '#cd604aff'
    }
  },
});

interface BoardChampionAnimationsProps {
  children?: React.ReactNode,
  champion: ChampionCard,
  onPanelClick: () => void,
  shouldRotate?: boolean,
  isSelected: boolean
};

const BoardChampionPanel: FC<BoardChampionAnimationsProps> = (props: BoardChampionAnimationsProps) => {
  const [showDamage, setShowDamage] = useState(false);
  const hpRef = useRef(props.champion.currentHp);
  const animation = props.isSelected ? 'walk' : 'idle';
  const hpValue = props.champion.currentHp / props.champion.calHp * 100;
  const isMobile = isMobileDevice();
  const championSpriteSize = isMobile ? 43 : 90;

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
    if (!props.shouldRotate) return direction;

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

  return <Stack display="flex" justifyItems="center" height="100%" justifyContent="center" className={`${showDamage && styles.Damage}`}>
    <ChampionSprite onClick={props.onPanelClick}
      direction={getDirection(props.champion.direction)}
      championName={props.champion.name}
      animation={animation}
      width={championSpriteSize}
      height={championSpriteSize} />
    {!isMobile && <ThemeProvider theme={props.champion.playerIndex === 0 ? playerOneTheme : playerTwoTheme}>
      <LinearProgress sx={{height: 10}} variant="determinate" value={hpValue} />
    </ThemeProvider>}
  </Stack>
};

export default BoardChampionPanel;
