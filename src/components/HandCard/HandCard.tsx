import { FC } from 'react';
import { GameCard, isGear, isChampion, isClass, isAction, isOrder } from '../../logic/game-card';
import { PlayerActionsName } from '../../logic/enums';
import { useAppDispatch } from '../../redux/hooks';
import { setSelectedActionData, setShowHand, createSelectedData } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import Button from '@mui/material/Button';
import GameCardDraw from '../GameCardDraw/GameCardDraw';

export enum HandCardMode {
  DeckBuilding = 1,
  Hand
}

interface CardProps {
  card: GameCard,
  mode: HandCardMode,
}

const HandCard: FC<CardProps> = (props) => {
  const dispatch = useAppDispatch();

  const handleCardActionOnTarget = (cardAction: string) => {
    const selectedData = createSelectedData(props.card, cardAction, GameStoreActionTypes.PlayerAction);
    dispatch(setSelectedActionData(selectedData));

    if(isOrder(props.card) && props.card.requirement.length > 0)
      return;
      
    dispatch(setShowHand(false));
  }

  return <GameCardDraw zoom={true} card={props.card}>
    {props.mode === HandCardMode.Hand && <>
      {isClass(props.card) && <Button className="App-button" variant="contained" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Upgrade)}>
        {PlayerActionsName.Upgrade} </Button>}
      {isGear(props.card) && <Button className="App-button" variant="contained" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Equip)}>
        {PlayerActionsName.Equip} </Button>}
      {isChampion(props.card) && <Button className="App-button" variant="contained" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Summon)}>
        {PlayerActionsName.Summon} </Button>}
      {isAction(props.card) && <Button className="App-button" variant="contained" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Attach)}>
        {PlayerActionsName.Attach} </Button>}
      {isOrder(props.card) && <Button className="App-button" variant="contained" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.PlayOrder)}>
        {PlayerActionsName.PlayOrder} </Button>}
    </>}
  </GameCardDraw>;
};

export default HandCard;
