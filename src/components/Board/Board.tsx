import { FC } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { championActions, playerActions, setSelectedActionData, initialState } from '../../app/store';
import { actionTypes } from '../../app/types';
import { isChampion } from '../../logic/champion';
import Button from '@mui/material/Button';
import BoardChampion from '../BoardChampion/BoardChampion';
import styles from './Board.module.css';

const Board: FC = () => {
  const boardState = useAppSelector((state) => state.gameActions.game.board);
  const selectedActionData = useAppSelector((state) => state.gameActions.selectedActionData);
  const dispatch = useAppDispatch();

  const handleAction = (targetX: number, targetY: number) => {

    if (selectedActionData.actionType === actionTypes.playerAction) {
      dispatch(playerActions({ data: [targetX, targetY] }))
    }
    else if (selectedActionData.actionType === actionTypes.championAction) {
      dispatch(championActions({
        targetLocation: [targetX, targetY]
      }));
    }

    dispatch(setSelectedActionData(initialState.selectedActionData));
  };

  const playerBaseClassName = (rowIndex: number) => {
    if (rowIndex >= 11) return styles.PlayerOneBase;
    if (rowIndex <= 1) return styles.PlayerTwoBase;

    return styles.NoneBase;
  };

  return (
    <table className={styles.Board}>
      <tbody>
        {boardState.map((row, rowIndex) => {
          return <tr key={`${rowIndex}`}>
            {row.map((card, columnIndex) => {
              return <td className={playerBaseClassName(rowIndex)} key={`${rowIndex}-${columnIndex}`}>
                <Button variant="outlined" onClick={() => handleAction(rowIndex, columnIndex)}>{rowIndex}-{columnIndex}</Button>
                {isChampion(card) && <BoardChampion champion={card}
                  x={rowIndex}
                  y={columnIndex}
                  isSelected={`${selectedActionData.location[0]}-${selectedActionData.location[1]}` === `${rowIndex}-${columnIndex}`} />}
              </td>
            })}
          </tr>
        })}
      </tbody>
    </table>
  );
}
export default Board;
