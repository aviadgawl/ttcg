import { FC } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { championActions, playerActions, setSelectedActionData, initialState } from '../../redux/store';
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
  const dispatch = useAppDispatch();

  const shouldRotate = playerIndex === 1;

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
                    <button className={styles.TargetButton}
                      onClick={() => handleAction(rowIndex, columnIndex)}>
                      <FaHandPointer />
                    </button>}

                  {isChampion(card) &&
                    <BoardChampion className={styles.BoardObject}
                      rotate={shouldRotate}
                      champion={card}
                      x={rowIndex}
                      y={columnIndex}
                      isSelected={isSelectedChampion(rowIndex, columnIndex)} />}

                  {isCrystal(card) &&
                    <BoardCrystal className={styles.BoardObject}
                      rotate={shouldRotate}
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
