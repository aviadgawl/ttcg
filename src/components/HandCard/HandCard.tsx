import { FC } from 'react';
import { GameCard, isGear } from '../../logic/game-card';
import { isChampion, isClass } from '../../logic/champion';
import { PlayerActionsName } from '../../logic/player';
import styles from './HandCard.module.css';
import { useAppDispatch } from '../../app/hooks';
import { setSelectedActionData, setShowHand, createSelectedData } from '../../app/store';
import { actionTypes } from '../../app/types';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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
    const selectedData = createSelectedData(props.card, cardAction, actionTypes.playerAction);
    dispatch(setSelectedActionData(selectedData));
    dispatch(setShowHand(false));
  }

  return <Card className={`${styles.Card} App-text-color`} style={{ backgroundImage: `url(${props.card.image})` }} sx={{ maxWidth: 345 }}>
    <CardContent>
      <Typography className={styles.CardName} gutterBottom variant="h5" component="div">
        {props.card.name}
      </Typography>

      {(isClass(props.card) || isGear(props.card) || isChampion(props.card)) && <div className={styles.CardStats}>
        <Typography> HP: {props.card.hp} </Typography>
        <Typography> STR: {props.card.str} </Typography>
        <Typography> DEX: {props.card.dex} </Typography>
        <Typography> INT: {props.card.int} </Typography>
      </div>}

      <div className={styles.CardActions}>
        {isChampion(props.card) && <>
          {props.card.actions.map((action, actionIndex) =>
            <Typography key={actionIndex}>{action}</Typography>
          )}
        </>}
      </div>
    </CardContent>
    {props.mode === HandCardMode.Hand && <CardActions className={styles.CardActions}>
      {isClass(props.card) && <Button className="App-button" variant="contained" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Upgrade)}>
        {PlayerActionsName.Upgrade} </Button>}
      {isGear(props.card) && <Button className="App-button" variant="contained" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Equip)}>
        {PlayerActionsName.Equip} </Button>}
      {isChampion(props.card) && <Button className="App-button" variant="contained" size="small" onClick={() => handleCardActionOnTarget(PlayerActionsName.Summon)}>
        {PlayerActionsName.Summon} </Button>}
    </CardActions>}
  </Card>
};

export default HandCard;
