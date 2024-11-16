import { FC } from 'react';
import { GameCard } from '../../logic/game-card';
import { checkCardType } from '../../logic/player';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import Button from '@mui/material/Button';
import styles from './CardsDisplay.module.css';
import { CardType } from '../../logic/enums';

interface CardsDisplayProps {
  cards: GameCard[],
  onSelectCard?: (card: GameCard) => void
  buttonName?: string,
  cardType?: CardType | null,
  nameContains?: string | null,
  excludedCards?: GameCard[]
}

const CardsDisplay: FC<CardsDisplayProps> = (props) => {

  const handleClick = (card: GameCard) => {
    if (props.onSelectCard !== undefined)
      props.onSelectCard(card);
  }

  const byCardType = (card: GameCard): boolean => {
    if (props.cardType === undefined || props.cardType === null) return true;

    return checkCardType(card, props.cardType);
  }

  const byNameContains = (card: GameCard): boolean => {
    if (props.nameContains === undefined || props.nameContains === null) return true;

    return card.name.indexOf(props.nameContains) > -1;
  }

  const notExcludedCard = (card: GameCard): boolean => {
    if (props.excludedCards === undefined || props.excludedCards === null || props.excludedCards.length === 0) return true;

    return props.excludedCards.some(exCard => exCard.guid === card.guid);
  }

  return <div className={styles.CardsDisplay}>
    {props.cards.map(card => {
      return notExcludedCard(card) && byCardType(card) && byNameContains(card) && <div className={styles.Card} key={card.guid}>
        <HandCard mode={HandCardMode.DeckBuilding} card={card} />
        {props.onSelectCard && <Button size="small" onClick={() => handleClick(card)}>{props.buttonName ?? 'Select'}</Button>}
      </div>
    })}
  </div>
};

export default CardsDisplay;
