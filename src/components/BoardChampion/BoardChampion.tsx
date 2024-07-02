import { FC, ReactElement, useState } from 'react';
import { ActionCard, ChampionCard } from '../../logic/game-card';
import { ChampionDirection } from '../../logic/enums';
import { useAppDispatch } from '../../redux/hooks';
import { setSelectedActionData, createSelectedData } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import GameCardDraw from '../GameCardDraw/GameCardDraw';
import ChampionMenu from '../ChampionMenu/ChampionMenu';
import { FaCircleInfo, FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import styles from './BoardChampion.module.css';

const directionIconMap: ReactElement[] = [
  <FaArrowUp />,
  <FaArrowDown />,
  <FaArrowLeft/>,
  <FaArrowRight />
];

interface BoardChampionProps {
  champion: ChampionCard;
  x: number;
  y: number;
  isSelected: boolean;
  rotate: boolean;
  className: string;
}

const BoardChampion: FC<BoardChampionProps> = (props: BoardChampionProps) => {
  const dispatch = useAppDispatch();
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

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const isActionCardDisabled = (sourceChampion: ChampionCard, actionCard: ActionCard): boolean => {
    if(actionCard.isRepeatable && actionCard.repeatableActivationLeft !== null && actionCard.repeatableActivationLeft === 0) return true;
    
    return sourceChampion.stm <= 0;
  }

  const getPlayerClassName = () => {
    if(props.champion.playerIndex === 0)
      return styles.PlayerOneObject;
    else if (props.champion.playerIndex === 1)
      return styles.PlayerTwoObject;
  }

  return (<div className={`App-text-color ${props.className} ${styles.Container} ${props.isSelected ? styles.Selected : styles.NotSelected} ${props.rotate ? 'App-rotate' : ''}`}>
    <div style={{ backgroundImage: `url(${props.champion.image})` }}
      className={styles.Panel}
      onClick={handlePanelClick}>
        {directionIconMap[props.champion.direction]}
      <h2 className={getPlayerClassName()}>{props.champion.currentHp} / {props.champion.calHp}</h2>
    </div>
    <Dialog
      open={showDialog}
      className={styles.Dialog}
      onClose={handleClose}>
      <DialogContent className={styles.DialogContent}>
        <GameCardDraw className={styles.ChampionCardDraw} showChampionStats={true} card={props.champion}>
          <div>
            {props.champion.learnedActionsCards.map((card, actionIndex) =>
              <Button disabled={isActionCardDisabled(props.champion, card)} size="small" variant="contained" className="App-button" key={actionIndex}
                onClick={() => handleAction(card, false)}>{card.name} {card.isRepeatable && `(${card.repeatableActivationLeft})`}
              </Button>
            )}
            {props.champion.attachedActionsCards.map((card, actionIndex) =>
              <Button size="small" variant="contained" className="App-button" key={actionIndex}
                onClick={() => handleAction(card, true)}>{card.name}
              </Button>
            )}
            {showInfoButton && <Button size="small" variant="outlined" onClick={handleChampionCardClick}><FaCircleInfo /></Button>}
          </div>
        </GameCardDraw>
        <ChampionMenu anchorEl={anchorEl} open={open} onClose={handleCloseMenu} championCard={props.champion} />
      </DialogContent>
    </Dialog>
  </div>);
};

export default BoardChampion;
