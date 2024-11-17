import { FC, ReactElement, useState } from 'react';
import { ActionCard, ChampionCard } from '../../logic/game-card';
import { checkRepeatableAction } from '../../logic/champion';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setSelectedActionData, createSelectedData } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import { FaCircleInfo, FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import GameCardDraw from '../GameCardDraw/GameCardDraw';
import ChampionMenu from '../ChampionMenu/ChampionMenu';
import styles from './BoardChampion.module.css';

const directionIconMap: ReactElement[] = [
  <FaArrowUp />,
  <FaArrowDown />,
  <FaArrowLeft />,
  <FaArrowRight />
];

interface BoardChampionProps {
  champion: ChampionCard;
  x: number;
  y: number;
  isSelected: boolean;
  shouldRotate?: boolean;
  className: string;
}

const BoardChampion: FC<BoardChampionProps> = (props: BoardChampionProps) => {
  const dispatch = useAppDispatch();
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);
  const player = useAppSelector((state) => state.gameActions.game.players[state.gameActions.game.playerIndex]);
  const playingPlayerIndex = useAppSelector((state) => state.gameActions.game.playingPlayerIndex);
  const [showDialog, setShowDialog] = useState(false);
  const showInfoButton = props?.champion?.body || props?.champion?.rightHand || props?.champion?.leftHand || props?.champion?.upgrade;

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

  const handleCloseMenu = (): void => {
    setAnchorEl(null);
  };

  const isActionCardDisabled = (sourceChampion: ChampionCard, actionCard: ActionCard, isAttached: boolean): boolean => {
    if (props.champion.playerIndex !== playerIndex) return true;

    if (playerIndex !== playingPlayerIndex) return true;

    if (actionCard.isRepeatable) {
      return !checkRepeatableAction(player, actionCard);
    }
    else {
      if (actionCard.wasPlayed) return true;
      if (!isAttached && sourceChampion.stm <= 0) return true;
    }

    return false;
  }

  const getPlayerClassName = () => {
    if (props.champion.playerIndex === 0)
      return styles.PlayerOneObject;
    else if (props.champion.playerIndex === 1)
      return styles.PlayerTwoObject;
  }

  return (<div className={`App-text-color ${props.className} ${styles.Container} ${props.isSelected ? styles.BoardChampionSelected : ''}`}>

    <div style={{ backgroundImage: `url(${props.champion.image})` }}
      className={styles.Panel}
      onClick={handlePanelClick}>
      <div className={`${styles.BoardChampionDirectionIcon} ${props.shouldRotate && 'App-rotate'}`}>
        {directionIconMap[props.champion.direction]}
      </div>
      <label className={`${styles.BoardChampionHpLabel} ${getPlayerClassName()}`}>{props.champion.currentHp}</label>
    </div>

    <Dialog
      open={showDialog}
      className={styles.Dialog}
      onClose={handleClose}>
      <DialogContent className={styles.DialogContent}>
        <GameCardDraw className="App-card-large" showChampionStats={true} card={props.champion}>
          <div className={styles.ChampionCardActions}>
            {props.champion.learnedActionsCards.map((card, actionIndex) =>
              <Button disabled={isActionCardDisabled(props.champion, card, false)} size="small" variant="contained" className="App-button" key={actionIndex}
                onClick={() => handleAction(card, false)}>{card.name} {card.isRepeatable && `(${card.repeatableActivationLeft})`}
              </Button>
            )}
            {props.champion.attachedActionsCards.map((card, actionIndex) =>
              <Button disabled={isActionCardDisabled(props.champion, card, true)} size="small" variant="contained" className="App-button" key={actionIndex}
                onClick={() => handleAction(card, true)}>{card.name} {card.isRepeatable && `(${card.repeatableActivationLeft})`}
              </Button>
            )}
            {showInfoButton && <button onClick={handleChampionCardClick}><FaCircleInfo /></button>}
          </div>
        </GameCardDraw>
        <ChampionMenu anchorEl={anchorEl} open={open} onClose={handleCloseMenu} championCard={props.champion} />
      </DialogContent>
    </Dialog>
  </div>);
};

export default BoardChampion;
