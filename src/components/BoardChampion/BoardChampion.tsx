import { FC, useState } from 'react';
import { ActionCard, ChampionCard } from '../../logic/game-card';
import { useAppDispatch } from '../../redux/hooks';
import { setSelectedActionData, createSelectedData } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import GameCardDraw from '../GameCardDraw/GameCardDraw';
import styles from './BoardChampion.module.css';

interface BoardChampionProps {
  champion: ChampionCard;
  x: number;
  y: number;
  isSelected: boolean;
  rotate: boolean;
}

const BoardChampion: FC<BoardChampionProps> = (props: BoardChampionProps) => {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAction = (card: ActionCard) => {
    const selectedActionData = createSelectedData(card, card.name, GameStoreActionTypes.ChampionAction, { rowIndex: props.x, columnIndex: props.y });
    dispatch(setSelectedActionData(selectedActionData));
    setOpen(false);
  }

  return (<div className={`App-text-color ${styles.Container} ${props.isSelected ? styles.Selected : styles.NotSelected} ${props.rotate ? 'App-rotate' : ''}`}>
    <div style={{ backgroundImage: `url(${props.champion.image})` }}
      className={styles.Panel}
      onClick={handleClickOpen}>
        <h2>{props.champion.currentHp} / {props.champion.calHp}</h2>
    </div>
    <Dialog
      open={open}
      className={styles.Dialog}
      onClose={handleClose}>
      <DialogContent className={styles.DialogContent}>
        <GameCardDraw showChampionCardActions={false} card={props.champion}>
        <div>
          {props.champion.learnedActionsCards.map((card, actionIndex) =>
            <Button disabled={props.champion.stm <= 0} size="small" variant="contained" className="App-button" key={actionIndex}
              onClick={() => handleAction(card)}>{card.name}
            </Button>
          )}
          {props.champion.attachedActionsCards.map((card, actionIndex) =>
            <Button size="small" variant="contained" className="App-button" key={actionIndex}
              onClick={() => handleAction(card)}>{card.name}
            </Button>
          )}
        </div>
        </GameCardDraw>
      </DialogContent>
    </Dialog>
  </div>);
};

export default BoardChampion;
