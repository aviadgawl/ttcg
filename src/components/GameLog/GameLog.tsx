import { Drawer } from '@mui/material';
import { useAppSelector } from '../../redux/hooks';
import React, { FC, useMemo } from 'react';
import styles from './GameLog.module.css';
import { PlayerActionLogRecord } from '../../logic/game-card';
import GameCardDraw from '../GameCardDraw/GameCardDraw';

interface GameLogProps { }

type formattedLog = {
  playerNumber: number;
  log: PlayerActionLogRecord;
};

const combineAndSortLog = (playerOneLog: PlayerActionLogRecord[], playerTwoLog: PlayerActionLogRecord[]): formattedLog[] => {

  const playerOneLogFormatted: formattedLog[] = playerOneLog.map(logItem => ({ playerNumber: 1, log: logItem }));
  const playerTwoLogFormatted: formattedLog[] = playerTwoLog.map(logItem => ({ playerNumber: 2, log: logItem }));

  const combinedAndSorted = [...playerOneLogFormatted, ...playerTwoLogFormatted].sort((a, b) => a.log.timestamp - b.log.timestamp);

  return combinedAndSorted;
};

const GameLog: FC<GameLogProps> = () => {
  const players = useAppSelector((state) => state.gameActions.game.players);
  const showLog = useAppSelector((state) => state.gameActions.showGameLog);

  const combinedAndSortedLog: formattedLog[] = useMemo(() => combineAndSortLog(players[0].actionsLog, players[1].actionsLog),
    [players[0].actionsLog.length, players[1].actionsLog.length]);

  return <Drawer variant="persistent" anchor="right" open={showLog} className={styles.GameLog} >
    {combinedAndSortedLog.map((logItem, index) => {
      const playerNumberElement = <span>{`${logItem.playerNumber}: `} </span>;

      if (logItem.log.card != null)
        return <div> {playerNumberElement} <GameCardDraw key={`${logItem.log.name}-${index}`} card={logItem.log.card} className="App-card" /></div>

      return <div key={`${logItem.log.name}-${index}`}>{playerNumberElement}{logItem.log.name}</div>;
    })}
  </Drawer>
};

export default GameLog;
