import { FC } from 'react';
import { GameCard, isGear, isChampion, isClass, isAction, isOrder, OrderCard } from '../../logic/game-card';
import { PlayerActionsName, RewardType } from '../../logic/enums';
import { useAppDispatch, usePlayerAction } from '../../redux/hooks';
import { setSelectedActionData, setShowHand, createSelectedData, setShowCardsInDeck, createShowCardsInDeck } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import { Button, Stack} from '@mui/material';
import GameCardDraw from '../GameCardDraw/GameCardDraw';
import MyTypography from '../Shared/MUI/MyTypography';
import styles from './HandCard.module.css';

export enum HandCardMode {
  DeckBuilding = 1,
  Hand
};

interface CardProps {
  card: GameCard,
  mode: HandCardMode,
  disabled?: boolean
};

const HandCard: FC<CardProps> = (props) => {
  const dispatch = useAppDispatch();
  const playerAction = usePlayerAction();

  const isOneStepOrderCard = (orderCard: OrderCard): boolean => {
    const isDiscardAllHandOrderCard = orderCard.requirement.length === 1 && orderCard.requirement[0].amount === -1;

    if (isDiscardAllHandOrderCard)
      return true;

    const isNoRequirements = orderCard.requirement.length === 0;
    const isNoSelectCardFromDeck = orderCard.reward.name === RewardType.SpecificDraw;

    return isNoRequirements && !isNoSelectCardFromDeck;
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
    if (openDeckCardSelect)
      dispatch(setShowCardsInDeck(createShowCardsInDeck(true, props.card.reward.cardType, props.card.reward.cardNameContains)));

    dispatch(setSelectedActionData(selectedData));
  }

  return <Stack>
    <GameCardDraw card={props.card} />
    {props.mode === HandCardMode.Hand && <Stack justifyContent="center" className={styles.Buttons}>
      {isClass(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Upgrade)}>
        <MyTypography variant="button"> {PlayerActionsName.Upgrade} </MyTypography>
      </Button>}

      {isGear(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Equip)}>
        <MyTypography variant="button"> {PlayerActionsName.Equip} </MyTypography>
      </Button>}

      {isChampion(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Summon)}>
        <MyTypography variant="button"> {PlayerActionsName.Summon} </MyTypography>
      </Button>}

      {isAction(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Attach)}>
        <MyTypography variant="button"> {PlayerActionsName.Attach} </MyTypography>
      </Button>}

      {isOrder(props.card) && <Button disabled={props.disabled} variant="outlined" size="small" onClick={handleOrderCardAction}>
        <MyTypography variant="button"> {PlayerActionsName.PlayOrder} </MyTypography>
      </Button>}
    </Stack>}
  </Stack>;
}

export default HandCard;
