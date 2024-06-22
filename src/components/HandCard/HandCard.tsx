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
  disabled?:boolean
}

const HandCard: FC<CardProps> = (props) => {
  const dispatch = useAppDispatch();

  const handleCardActionOnTarget = (cardAction: string) => {
    const selectedData = createSelectedData(props.card, cardAction, GameStoreActionTypes.PlayerAction);
    dispatch(setSelectedActionData(selectedData));

    if (isOrder(props.card) && props.card.requirement.length > 0)
      return;

    dispatch(setShowHand(false));
  }

  return <div>
    <GameCardDraw className="App-card" zoom={true} card={props.card} />
    {props.mode === HandCardMode.Hand && <div>
      {isClass(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Upgrade)}>
        {PlayerActionsName.Upgrade} </Button>}

      {isGear(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Equip)}>
        {PlayerActionsName.Equip} </Button>}

      {isChampion(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Summon)}>
        {PlayerActionsName.Summon} </Button>}

      {isAction(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Attach)}>
        {PlayerActionsName.Attach} </Button>}

      {isOrder(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.PlayOrder)}>
        {PlayerActionsName.PlayOrder} </Button>}
    </div>}
  </div>;
}

export default HandCard;
