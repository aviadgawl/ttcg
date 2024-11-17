import { FC, useState } from 'react';
import { GameCard, isChampion } from '../../logic/game-card';
import styles from './GameCardDraw.module.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

interface CardProps {
  card: GameCard,
  children?: React.ReactNode,
  zoom?: boolean,
  showChampionStats?:boolean,
  className?: string
}

const GameCardDraw: FC<CardProps> = (props) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleShowDialog = (event: any) => {
    if(props.zoom && event.target.type !== 'button') setShowDialog(!showDialog);
  }

  return <div className={props.className}>
    <Card onClick={handleShowDialog} 
      className={`${styles.Card} App-text-color`} sx={{ maxWidth: 345 }}>

    <CardContent style={{ backgroundImage: `url(${props.card.image})` }} className={styles.CardContent}>
      {props.showChampionStats && isChampion(props.card) && <div className={styles.CardStats}>
        <div>HP: {props.card.currentHp} / {props.card.calHp}</div>
        <div>STR: {props.card.calStr}</div>
        <div>DEX: {props.card.calDex}</div>
        <div>INT: {props.card.calInt}</div>
        <div>Armor: {props.card.armor} / {props.card.calStr}</div>
        <div>Mental: {props.card.mental} / {props.card.calInt}</div>
        <div>Class: {props.card.calClass}</div>
        <div>Race: {props.card.race}</div>
        {props.card.statusEffects.length > 0 && <div className={styles.ChampionStatusEffect}>{props.card.statusEffects.map(effect => <span> {effect.name} </span>)}</div>}
      </div>}

    </CardContent>
    {props.children && <div className={styles.CardActions}>
      {props.children}
    </div>}
  </Card>

  <Dialog
    open={showDialog}
    onClose={() => setShowDialog(false)}>
    <DialogContent className={styles.DialogContent}>
      <img alt="card visual" className="App-card-large" src={props.card.image} />
    </DialogContent>
  </Dialog>
  </div>
};

export default GameCardDraw;
