import { FC } from 'react';
import { GameCard, isGear, isChampion, isClass, isAction, isOrder, OrderCard } from '../../logic/game-card';
import { PlayerActionsName } from '../../logic/enums';
import { useAppDispatch } from '../../redux/hooks';
import { setSelectedActionData, setShowHand, createSelectedData, playerActions } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import Button from '@mui/material/Button';
import GameCardDraw from '../GameCardDraw/GameCardDraw';
import styles from './HandCard.module.css';

export enum HandCardMode {
  DeckBuilding = 1,
  Hand
}

interface CardProps {
  card: GameCard,
  mode: HandCardMode,
  disabled?: boolean
}

const HandCard: FC<CardProps> = (props) => {
  const dispatch = useAppDispatch();

  const isDiscardAllHandOrderCard = (orderCard: OrderCard): boolean => {
    return orderCard.requirement.length === 1 && orderCard.requirement[0].amount === -1;
  }

  const handleCardActionOnTarget = (cardAction: string) => {
    const selectedData = createSelectedData(props.card, cardAction, GameStoreActionTypes.PlayerAction);
    dispatch(setSelectedActionData(selectedData));
    dispatch(setShowHand(false));
  }

  const handleOrderCardAction = (cardAction: string) => {
    if (!isOrder(props.card)) {
      alert("Play order card must be invoked on order card");
      return;
    }

    const selectedData = createSelectedData(props.card, cardAction, GameStoreActionTypes.PlayerAction);

    if (isDiscardAllHandOrderCard(props.card)) {
      dispatch(playerActions({ selectedActionData: selectedData, data: [] }));
      return;
    }

    dispatch(setSelectedActionData(selectedData));

    if (props.card.requirement.length === 0)
      dispatch(setShowHand(false));
  }

  return <div>
    <GameCardDraw className="App-card" zoom={true} card={props.card} />
    {props.mode === HandCardMode.Hand && <div className={styles.Buttons}>
      {isClass(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Upgrade)}>
        {PlayerActionsName.Upgrade} </Button>}

      {isGear(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Equip)}>
        {PlayerActionsName.Equip} </Button>}

      {isChampion(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Summon)}>
        {PlayerActionsName.Summon} </Button>}

      {isAction(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Attach)}>
        {PlayerActionsName.Attach} </Button>}

      {isOrder(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleOrderCardAction(PlayerActionsName.PlayOrder)}>
        {PlayerActionsName.PlayOrder} </Button>}
    </div>}
  </div>;
}

export default HandCard;
