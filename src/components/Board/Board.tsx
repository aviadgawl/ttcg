import { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { championActions, playerActions, setSelectedActionData, initialState } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import { isCrystal, CrystalCard, isChampion, BoardLocation } from '../../logic/game-card';
import Button from '@mui/material/Button';
import BoardChampion from '../BoardChampion/BoardChampion';
import BoardCrystal from '../BoardCrystal/BoardCrystal';
import { FaBullseye } from "react-icons/fa";
import styles from './Board.module.css';
import BackGroundImage from '../../assets/images/background.jpg';

const Board: FC = () => {
  const boardState = useAppSelector((state) => state.gameActions.game.board);
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);
  const selectedActionData = useAppSelector((state) => state.gameActions.selectedActionData);
  const dispatch = useAppDispatch();

  const shouldRotate = playerIndex === 1;

  useEffect(() => {

  }, [selectedActionData]);

  const handleAction = (targetX: number, targetY: number) => {

    if (selectedActionData.actionType === GameStoreActionTypes.PlayerAction) {
      dispatch(playerActions({ data: { rowIndex: targetX, columnIndex: targetY } as BoardLocation }))
    }
    else if (selectedActionData.actionType === GameStoreActionTypes.ChampionAction) {
      dispatch(championActions({
        targetLocation: { rowIndex: targetX, columnIndex: targetY } as BoardLocation
      }));
    }

    dispatch(setSelectedActionData(initialState.selectedActionData));
  };

  const playerBaseClassName = (rowIndex: number) => {
    if (rowIndex >= 11) return styles.PlayerOneBase;
    if (rowIndex <= 1) return styles.PlayerTwoBase;

    return;
  };

  const getObjectPlayerColorClassName = (cardPlayerIndex:number) => {
    if(cardPlayerIndex === 0) return styles.PlayerOneObject;
    return styles.PlayerTwoObject;
  }

  const isAllowedLocation = (rowIndex: number, columnIndex: number): boolean => {
    if (selectedActionData.allowedBoardLocations.length === 0) return false;

    return selectedActionData.allowedBoardLocations.some(loc => loc.rowIndex === rowIndex && loc.columnIndex === columnIndex);
  }

  return (
    <table style={{ backgroundImage: BackGroundImage }} className={`${styles.Board} ${shouldRotate ? 'App-rotate' : ''}`} >
      <tbody>
        {boardState.map((row, rowIndex) => {
          return <tr key={`${rowIndex}`}>
            {row.map((card, columnIndex) => {
              return <td key={`${rowIndex}-${columnIndex}`}>
                <div className={`${styles.PlayerBase} ${playerBaseClassName(rowIndex)}`} />
                <div className={styles.BoardPanel}>
                  {isAllowedLocation(rowIndex, columnIndex) &&
                    <Button className={styles.TargetButton} size="small" variant="contained" onClick={() => handleAction(rowIndex, columnIndex)}>
                      <FaBullseye />
                    </Button>}
                  {isChampion(card) && <BoardChampion className={`${getObjectPlayerColorClassName(card.playerIndex)} ${styles.BoardObject}`} rotate={shouldRotate} champion={card}
                    x={rowIndex}
                    y={columnIndex}
                    isSelected={selectedActionData.sourceLocation?.rowIndex === rowIndex && selectedActionData.sourceLocation?.columnIndex === columnIndex} />}
                  {isCrystal(card) && <BoardCrystal className={`${getObjectPlayerColorClassName(card.playerIndex)} ${styles.BoardObject}`} rotate={shouldRotate} crystal={card as unknown as CrystalCard} />}
                </div>
              </td>
            })}
          </tr>
        })}
      </tbody>
    </table>
  );
}
export default Board;
