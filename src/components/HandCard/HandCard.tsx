import { FC } from 'react';
import { GameCard, isGear, isChampion, isClass, isAction, isOrder, OrderCard } from '../../logic/game-card';
import { PlayerActionsName, RewardType } from '../../logic/enums';
import { useAppDispatch, usePlayerAction } from '../../redux/hooks';
import { setSelectedActionData, setShowHand, createSelectedData, setShowCardsInDeck, createShowCardsInDeck } from '../../redux/store';
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
  const playerAction = usePlayerAction();

  const isOneStepOrderCard = (orderCard: OrderCard): boolean => {

    const isDiscardAllHandOrderCard = orderCard.requirement.length === 1 && orderCard.requirement[0].amount === -1;
    if (isDiscardAllHandOrderCard)
      return isDiscardAllHandOrderCard;

    const isNoRequirements = orderCard.requirement.length === 0;
    return isNoRequirements
  }

  const shouldOpenDeckCardSelect = (orderCard: OrderCard): boolean => {
    return orderCard.reward.name === RewardType.SpecificDraw;
  }

  const handleCardActionOnTarget = (cardAction: string) => {
    const selectedData = createSelectedData(props.card, cardAction, GameStoreActionTypes.PlayerAction);
    dispatch(setSelectedActionData(selectedData));
    dispatch(setShowHand(false));
  }

  const handleOrderCardAction = () => {

    if (!isOrder(props.card)) {
      alert("Play order card must be invoked on order card");
      return;
    }

    const selectedData = createSelectedData(props.card, PlayerActionsName.PlayOrder, GameStoreActionTypes.PlayerAction);

    const oneStepOrderCard = isOneStepOrderCard(props.card);
    if (oneStepOrderCard) {
      playerAction(selectedData, []);
      dispatch(setShowHand(false));
      return;
    }

    const openDeckCardSelect = shouldOpenDeckCardSelect(props.card);
    if(openDeckCardSelect)
      dispatch(setShowCardsInDeck(createShowCardsInDeck(true, props.card.reward.cardType ?? undefined )));

    dispatch(setSelectedActionData(selectedData));
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

      {isOrder(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={handleOrderCardAction}>
        {PlayerActionsName.PlayOrder} </Button>}
    </div>}
  </div>;
}

export default HandCard;
