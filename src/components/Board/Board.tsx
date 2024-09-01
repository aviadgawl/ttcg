import { FC } from 'react';
import { useAppDispatch, useAppSelector, usePlayerAction } from '../../redux/hooks';
import { championActions, setSelectedActionData, initialState } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import { isCrystal, CrystalCard, isChampion, BoardLocation } from '../../logic/game-card';
import BoardChampion from '../BoardChampion/BoardChampion';
import BoardCrystal from '../BoardCrystal/BoardCrystal';
import { FaHandPointer } from "react-icons/fa";
import styles from './Board.module.css';
import BackGroundImage from '../../assets/images/background.jpg';

const Board: FC = () => {
  const boardState = useAppSelector((state) => state.gameActions.game.board);
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);
  const selectedActionData = useAppSelector((state) => state.gameActions.selectedActionData);
  const playerActions = usePlayerAction();
  const dispatch = useAppDispatch();

  const shouldRotate = playerIndex === 1;

  const handleAction = (targetX: number, targetY: number) => {

    if (selectedActionData.actionType === GameStoreActionTypes.PlayerAction) {
      const extendedData = { rowIndex: targetX, columnIndex: targetY } as BoardLocation;
      playerActions(null, extendedData);
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
  };

  const isAllowedLocation = (rowIndex: number, columnIndex: number): boolean => {
    if (selectedActionData.allowedBoardLocations.length === 0)
      return false;

    return selectedActionData.allowedBoardLocations.some(loc => loc.rowIndex === rowIndex && loc.columnIndex === columnIndex);
  }

  const isSelectedChampion = (rowIndex: number, columnIndex: number) => {
    return selectedActionData.sourceLocation?.rowIndex === rowIndex && selectedActionData.sourceLocation?.columnIndex === columnIndex;
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
                    <button className={`${styles.TargetButton} ${shouldRotate && 'App-rotate'}`}
                      onClick={() => handleAction(rowIndex, columnIndex)}>
                      <FaHandPointer />
                    </button>}

                  {isChampion(card) &&
                    <BoardChampion className={`${styles.BoardObject} ${shouldRotate && 'App-rotate'}`}
                      champion={card}
                      x={rowIndex}
                      y={columnIndex}
                      shouldRotate={shouldRotate}
                      isSelected={isSelectedChampion(rowIndex, columnIndex)} />}

                  {isCrystal(card) &&
                    <BoardCrystal className={`${styles.BoardObject} ${shouldRotate && 'App-rotate'}`}
                      crystal={card as unknown as CrystalCard} />}

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
