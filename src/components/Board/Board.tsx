import { FC, useMemo } from 'react';
import { useAppDispatch, useAppSelector, usePlayerAction, useChampionAction } from '../../redux/hooks';
import { setSelectedActionData, initialState } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import { isCrystal, CrystalCard, isChampion, BoardLocation, GameCard } from '../../logic/game-card';
import BoardChampion from '../BoardChampion/BoardChampion';
import BoardCrystal from '../BoardCrystal/BoardCrystal';
import { FaHandPointer } from "react-icons/fa";
import styles from './Board.module.css';

const Board: FC = () => {
  const boardState = useAppSelector((state) => state.gameActions.game.board);
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);
  const selectedActionData = useAppSelector((state) => state.gameActions.selectedActionData);
  const playingPlayerIndex = useAppSelector((state) => state.gameActions.game.playingPlayerIndex);
  const championAction = useChampionAction();
  const playerActions = usePlayerAction();
  const dispatch = useAppDispatch();

  const shouldRotate = playerIndex === 1;
  const boardPlayerOneBaseIndex = useMemo(() => boardState.length - 2, [boardState.length, boardState[0].length]);

  const handleAction = (targetX: number, targetY: number) => {

    if (selectedActionData.actionType === GameStoreActionTypes.PlayerAction) {
      const extendedData = { rowIndex: targetX, columnIndex: targetY } as BoardLocation;
      playerActions(null, extendedData);
    }
    else if (selectedActionData.actionType === GameStoreActionTypes.ChampionAction) {
      const targetLocation = { rowIndex: targetX, columnIndex: targetY } as BoardLocation
      championAction(targetLocation);
    }

    dispatch(setSelectedActionData(initialState.selectedActionData));
  };

  const playerBaseClassName = (rowIndex: number) => {
    if (rowIndex >= boardPlayerOneBaseIndex) return styles.PlayerOneBase;
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

  const getPlayerColorClassName = (summoned: GameCard): string => {
    if (summoned.playerIndex === 0)
      return 'App-player-one-color';
    else if (summoned.playerIndex === 1)
      return 'App-player-two-color';

    return '';
  }

  return (
    <table
      className={`${playingPlayerIndex === 0 ? styles.PlayerOneBorder : styles.PlayerTwoBorder} ${styles.Board} ${shouldRotate ? 'App-rotate' : ''}`} >
      <tbody>
        {boardState.map((row, rowIndex) => {
          return <tr key={`${rowIndex}`}>
            {row.map((card, columnIndex) => {
              return <td key={`${rowIndex}-${columnIndex}`}>
                <div className={`${styles.PlayerBase} ${playerBaseClassName(rowIndex)}`} />
                <div className={styles.Panel}>

                  {isAllowedLocation(rowIndex, columnIndex) &&
                    <button className={`${styles.TargetButton} ${shouldRotate && 'App-rotate'}`}
                      onClick={() => handleAction(rowIndex, columnIndex)}>
                      <FaHandPointer />
                    </button>}

                  {isChampion(card) &&
                    <BoardChampion colorClassName={getPlayerColorClassName(card)} className={`${styles.Object} ${shouldRotate && 'App-rotate'}`}
                      champion={card}
                      x={rowIndex}
                      y={columnIndex}
                      shouldRotate={shouldRotate}
                      isSelected={isSelectedChampion(rowIndex, columnIndex)} />}

                  {isCrystal(card) &&
                    <BoardCrystal colorClassName={getPlayerColorClassName(card)} className={`${styles.Object} ${shouldRotate && 'App-rotate'}`}
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
