import { FC, useState } from 'react';
import { ActionCard, ChampionCard } from '../../logic/game-card';
import { useAppDispatch } from '../../redux/hooks';
import { setSelectedActionData, createSelectedData } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import GameCardDraw from '../GameCardDraw/GameCardDraw';
import ChampionMenu from '../ChampionMenu/ChampionMenu';
import { FaCircleInfo } from "react-icons/fa6";
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

  const [showDialog, setShowDialog] = useState(false);

  const handlePanelClick = () => {
    setShowDialog(true);
  };

  const handleChampionCardClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setShowDialog(false);
  };

  const handleAction = (card: ActionCard, isAttachedAction: boolean) => {
    const selectedActionData = createSelectedData(card, card.name, GameStoreActionTypes.ChampionAction, { rowIndex: props.x, columnIndex: props.y }, isAttachedAction);
    dispatch(setSelectedActionData(selectedActionData));
    setShowDialog(false);
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (<div className={`App-text-color ${styles.Container} ${props.isSelected ? styles.Selected : styles.NotSelected} ${props.rotate ? 'App-rotate' : ''}`}>
    <div style={{ backgroundImage: `url(${props.champion.image})` }}
      className={styles.Panel}
      onClick={handlePanelClick}>
      <h2>{props.champion.currentHp} / {props.champion.calHp}</h2>
    </div>
    <Dialog
      open={showDialog}
      className={styles.Dialog}
      onClose={handleClose}>
      <DialogContent className={styles.DialogContent}>
        <GameCardDraw showChampionCardActions={false} card={props.champion}>
          <div>
            {props.champion.learnedActionsCards.map((card, actionIndex) =>
              <Button disabled={props.champion.stm <= 0} size="small" variant="contained" className="App-button" key={actionIndex}
                onClick={() => handleAction(card, false)}>{card.name}
              </Button>
            )}
            {props.champion.attachedActionsCards.map((card, actionIndex) =>
              <Button size="small" variant="contained" className="App-button" key={actionIndex}
                onClick={() => handleAction(card, true)}>{card.name}
              </Button>
            )}
            <Button size="small" variant="outlined" onClick={handleChampionCardClick}><FaCircleInfo /></Button>
          </div>
        </GameCardDraw>
        <ChampionMenu anchorEl={anchorEl} open={open} onClose={handleCloseMenu} championCard={props.champion} />
      </DialogContent>
    </Dialog>
  </div>);
};

export default BoardChampion;
