import { FC } from 'react';
import { GameCard, isGear, isChampion, isClass, isOrder, isAction } from '../../logic/game-card';
import styles from './GameCardDraw.module.css';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface CardProps {
  card: GameCard,
  showChampionCardActions: boolean,
  children?: React.ReactNode,
  onClick?: any
}

const GameCardDraw: FC<CardProps> = (props) => {
  return <Card onClick={props.onClick} className={`${styles.Card} App-text-color`} style={{ backgroundImage: `url(${props.card.image})` }} sx={{ maxWidth: 345 }}>
    <CardContent className={styles.CardContent}>
      <Typography className={styles.CardName} gutterBottom variant="h5" component="div">
        {props.card.name}
      </Typography>

      {isOrder(props.card) && <Typography variant='body2'>
        {props.card.info}
      </Typography>}

      {(isClass(props.card) || isGear(props.card)) && <div className={styles.CardStats}>
        {props.card.hp > 0 && <div>HP: {props.card.hp}</div>}
        {props.card.str > 0 && <div>STR: {props.card.str}</div>}
        {props.card.dex > 0 && <div>DEX: {props.card.dex}</div>}
        {props.card.int > 0 && <div>INT: {props.card.int}</div>}
      </div>}

      {isGear(props.card) && <div className={styles.CardStats}>
        <div>Category: {props.card.category}</div>
      </div>}

      {isAction(props.card) && <div className={styles.CardStats}>
        <div>Type: {props.card.actionType}</div>
        <div>Stat: {props.card.dmgStat} </div>
        <div>Damage: {props.card.dmgModifier} {props.card.dmgModifierValue}</div>
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
