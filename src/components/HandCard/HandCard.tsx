import { FC } from 'react';
import { Card, isChampion, isGear, isClass } from '../../logic/card';
import { playerActionsName } from '../../logic/player';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import styles from './HandCard.module.css';
import { useAppDispatch } from '../../app/hooks';
import { setSelectedActionData, setShowHand, createSelectedData } from '../../app/store';
import { actionTypes } from '../../app/types';

interface CardProps {
  card: Card
}

const HandCard: FC<CardProps> = (props) => {

  const dispatch = useAppDispatch();

  const handleCardActionOnTarget = (cardAction: string) => {
    const selectedData = createSelectedData(props.card, cardAction, actionTypes.playerAction);
    dispatch(setSelectedActionData(selectedData));
    dispatch(setShowHand(false));
  }

  return <div className={styles.Card}>
    <Paper>
      <h3>{props.card.name}</h3>

      {(isClass(props.card) || isGear(props.card) || isChampion(props.card)) && <div>
        <span> HP: {props.card.hp} </span>
        <span> STR: {props.card.str} </span>
        <span> DEX: {props.card.dex} </span>
        <span> INT: {props.card.int} </span>
      </div>}

      {isClass(props.card) && <Button onClick={() => handleCardActionOnTarget(playerActionsName.upgrade)}> {playerActionsName.upgrade} </Button>}
      {isGear(props.card) && <Button onClick={() => handleCardActionOnTarget(playerActionsName.equip)}> {playerActionsName.equip} </Button>}
      {isChampion(props.card) && <><div>
        {props.card.actions.map((action, actionIndex) =>
          <span key={actionIndex}>{action}</span>
        )}
      </div>
        <Button onClick={() => handleCardActionOnTarget(playerActionsName.summon)}> {playerActionsName.summon} </Button></>}
        
    </Paper>
  </div>
};

export default HandCard;
