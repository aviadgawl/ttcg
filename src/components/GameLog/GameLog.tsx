import { Drawer, Box, Card, Stack, CardContent, CardHeader } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { FC, useMemo } from 'react';
import styles from './GameLog.module.css';
import { PlayerActionLogRecord } from '../../logic/game-card';
import { setShowGameLog } from '../../redux/store';
import GameCardDraw from '../GameCardDraw/GameCardDraw';

interface GameLogProps { }

type formattedLog = {
  playerNumber: number;
  log: PlayerActionLogRecord;
};

const combineAndSortLog = (playerOneLog: PlayerActionLogRecord[] | undefined, playerTwoLog: PlayerActionLogRecord[] | undefined): formattedLog[] => {

  const playerOneLogFormatted: formattedLog[] = playerOneLog === undefined ? [] : playerOneLog.map(logItem => ({ playerNumber: 1, log: logItem }));
  const playerTwoLogFormatted: formattedLog[] = playerTwoLog === undefined ? [] : playerTwoLog.map(logItem => ({ playerNumber: 2, log: logItem }));

  const combinedAndSorted = [...playerOneLogFormatted, ...playerTwoLogFormatted].sort((a, b) => a.log.timestamp - b.log.timestamp);

  return combinedAndSorted;
};

const GameLog: FC<GameLogProps> = () => {
  const dispatch = useAppDispatch();

  const [playerOne, playerTwo] = useAppSelector((state) => state.gameActions.game.players);
  const showLog = useAppSelector((state) => state.gameActions.showGameLog);

  const playerOneActionLog = playerOne.actionsLog;
  const playerTwoActionLog = playerTwo?.actionsLog;

  const combinedAndSortedLog: formattedLog[] = useMemo(() => combineAndSortLog(playerOneActionLog, playerTwoActionLog),
    [playerOneActionLog, playerTwoActionLog]);

  return <Drawer anchor="right" open={showLog} className={styles.GameLogContainer} onClose={() => { dispatch(setShowGameLog(false)) }}>
    <Stack gap={1}>
      {combinedAndSortedLog.map((logItem, index) => {
        return <Card variant="outlined" key={`${logItem.log.name}-${index}`}>
          <CardHeader titleTypographyProps={{variant: 'body1'}} title={`Player number: ${logItem.playerNumber}`} subheader={logItem.log.name} />
          {logItem.log.card != null && <CardContent>
            <Box display='flex' justifyContent='center'>
              <GameCardDraw disableAnimation key={`${logItem.log.name}-${index}`} card={logItem.log.card} />
            </Box>
          </CardContent>}
        </Card>;
      })}
    </Stack>
  </Drawer>
};

export default GameLog;
