import { FC } from 'react';
import { GameCard, isGear, isChampion, isClass, isAction } from '../../logic/game-card';
import styles from './GameCardDraw.module.css';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface CardProps {
  card: GameCard,
  children: React.ReactNode
}

const GameCardDraw: FC<CardProps> = (props) => {
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
          {props.card.learnedActions.map((action, actionIndex) =>
            <Typography key={actionIndex}>{action}</Typography>
          )}
        </>}
      </div>
    </CardContent>
    <CardActions>
            {props.children}
    </CardActions>
  </Card>
};

export default GameCardDraw;
