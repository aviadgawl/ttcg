import React, { FC } from 'react';
import { GameCard } from '../../logic/game-card';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import Button from '@mui/material/Button';
import styles from './CardsDisplay.module.css';

interface CardsDisplayProps {
  cards: GameCard[],
  onSelectCard?: (card: GameCard) => void
  buttonName?:string
}

const CardsDisplay: FC<CardsDisplayProps> = (props) => {
  
  const handleClick = (card: GameCard) => {
    if(props.onSelectCard !== undefined)
      props.onSelectCard(card);
  }

  return <div className={styles.CardsDisplay}>
    {props.cards.map(card => {
      return <div key={card.guid}>
        <HandCard mode={HandCardMode.DeckBuilding} card={card} />
        {props.onSelectCard && <Button onClick={() => handleClick(card)}>{props.buttonName ?? 'Select'}</Button>}
      </div>
    })}
  </div>
};

export default CardsDisplay;
