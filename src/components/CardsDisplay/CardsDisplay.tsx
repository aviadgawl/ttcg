import React, { FC } from 'react';
import { GameCard } from '../../logic/game-card';
import { checkCardType } from '../../logic/player';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import Button from '@mui/material/Button';
import styles from './CardsDisplay.module.css';
import { CardType } from '../../logic/enums';

interface CardsDisplayProps {
  cards: GameCard[],
  onSelectCard?: (card: GameCard) => void
  buttonName?:string,
  cardType?: CardType | null
}

const CardsDisplay: FC<CardsDisplayProps> = (props) => {

  const handleClick = (card: GameCard) => {
    if(props.onSelectCard !== undefined)
      props.onSelectCard(card);
  }

  const byCardType = (card: GameCard) => {
    if(props.cardType === undefined || props.cardType === null) return true;

    return checkCardType(card, props.cardType);
  }

  return <div className={styles.CardsDisplay}>
    {props.cards.map(card => {
      return <div className={styles.Card} key={card.guid}>
        <HandCard mode={HandCardMode.DeckBuilding} card={card} />
        {props.onSelectCard && byCardType(card) && <Button onClick={() => handleClick(card)}>{props.buttonName ?? 'Select'}</Button>}
      </div>
    })}
  </div>
};

export default CardsDisplay;
