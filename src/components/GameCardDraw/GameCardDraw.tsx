import { FC, useState } from 'react';
import { GameCard, isChampion } from '../../logic/game-card';
import { Card, CardContent, Dialog, DialogContent } from '@mui/material';
import HpIcon from '../../assets/images/HpIcon.png';
import DexIcon from '../../assets/images/DexIcon.png';
import IntIcon from '../../assets/images/IntIcon.png';
import StrIcon from '../../assets/images/StrIcon.png';
import styles from './GameCardDraw.module.css';

interface CardProps {
  card: GameCard,
  children?: React.ReactNode,
  zoom?: boolean,
  showChampionStats?: boolean,
  className?: string
}

const GameCardDraw: FC<CardProps> = (props) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleShowDialog = (event: any) => {
    if (props.zoom && event.target.type !== 'button') setShowDialog(!showDialog);
  }

  return <div className={props.className}>
    <Card onClick={handleShowDialog}
      className={styles.Card} sx={{ maxWidth: 345 }}>

      <CardContent style={{ backgroundImage: `url(${props.card.image})` }} className={styles.CardContent}>
        {props.showChampionStats && isChampion(props.card) && <div className={styles.CardStats}>
          <div><img width={20} alt="hp icon" title="HP" src={HpIcon} /> {props.card.currentHp} / {props.card.calHp}</div>
          <div><img width={20} alt="str icon" title="STR" src={StrIcon} /> {props.card.calStr}</div>
          <div><img width={20} alt="dex icon" title="DEX" src={DexIcon} /> {props.card.calDex}</div>
          <div><img width={20} alt="int icon" title="INT" src={IntIcon} /> {props.card.calInt}</div>
          <div>Armor: {props.card.armor} / {props.card.calStr}</div>
          <div>Mental: {props.card.mental} / {props.card.calInt}</div>
          <div>Class: {props.card.calClass}</div>
          <div>Race: {props.card.race}</div>
          {props.card.statusEffects.length > 0 && <div className={styles.ChampionStatusEffect}>{props.card.statusEffects.map((effect, i) => <span key={i}> {effect.name} </span>)}</div>}
        </div>}
        {props.children && <div className={styles.CardActions}>
          {props.children}
        </div>}
      </CardContent>
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
