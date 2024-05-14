import { FC } from 'react';
import { GameCard, isGear, isChampion, isClass, isOrder } from '../../logic/game-card';
import styles from './GameCardDraw.module.css';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface CardProps {
  card: GameCard,
  showChampionCardActions: boolean,
  children: React.ReactNode
}

const GameCardDraw: FC<CardProps> = (props) => {
  return <Card className={`${styles.Card} App-text-color`} style={{ backgroundImage: `url(${props.card.image})` }} sx={{ maxWidth: 345 }}>
    <CardContent className={styles.CardContent}>
      <Typography className={styles.CardName} gutterBottom variant="h5" component="div">
        {props.card.name}
      </Typography>

      {isOrder(props.card) && <Typography variant='body2'>
        {props.card.info}
        </Typography>}

      {(isClass(props.card) || isGear(props.card)) && <div className={styles.CardStats}>
        <div>HP: {props.card.hp}</div>
        <div>STR: {props.card.str}</div>
        <div>DEX: {props.card.dex}</div>
        <div>INT: {props.card.int}</div>
      </div>}

      {isChampion(props.card) && <div className={styles.CardStats}>
        <div>HP: {props.card.currentHp} / {props.card.calHp}</div>
        <div>Armor: {props.card.armor} / {props.card.calStr}</div>
        <div>Mental: {props.card.mental} / {props.card.calInt}</div>
        <div>STR: {props.card.calStr}</div>
        <div>DEX: {props.card.calDex}</div>
        <div>INT: {props.card.calInt}</div>
        <div>Class: {props.card.calClass}</div>
      </div>}

      <div className={styles.CardActions}>
        {props.showChampionCardActions && isChampion(props.card) && <>
          {props.card.learnedActions.map((action, actionIndex) =>
            <Typography key={actionIndex}>{action}</Typography>
          )}
        </>}

        {props.showChampionCardActions && isClass(props.card) &&
          <Typography>{props.card.learnedAction}</Typography>}
      </div>
    </CardContent>
    <CardActions>
      {props.children}
    </CardActions>
  </Card>
};

export default GameCardDraw;
