import { FC, useMemo } from 'react';
import { GameCard } from '../../logic/game-card';
import { checkCardType } from '../../logic/player';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import { Button, Stack} from '@mui/material';
import { CardType } from '../../logic/enums';
import { groupBy } from '../../helpers/functions-helper';
import MyTypography from '../Shared/MUI/MyTypography';
import styles from './CardsDisplay.module.css';
import GameCardDraw from '../GameCardDraw/GameCardDraw';

interface CardsDisplayProps {
  cards: GameCard[],
  onSelectCard?: (card: GameCard) => void
  buttonName?: string,
  cardType?: CardType | null,
  nameContains?: string | null,
  excludedCards?: GameCard[]
}

const CardsDisplay: FC<CardsDisplayProps> = (props) => {
  const cardsGroupedByCardName = useMemo(() => groupBy(props.cards, card => card.name), [props.cards]);

  const handleClick = (card: GameCard) => {
    if (props.onSelectCard !== undefined)
      props.onSelectCard(card);
  }
  
  const filterCards = (cards: GameCard[]): GameCard[] => {
    return cards.filter((card) => !props.cardType || checkCardType(card, props.cardType)) // filter by type
      .filter((card) => !props.nameContains || card.name.indexOf(props.nameContains) > -1) // filter by name
      .filter((card) => !props.excludedCards || !props.excludedCards.some(exCard => exCard.guid === card.guid)); // filter by excluded cards
  }

  return <div className={styles.CardsDisplay}>
    {Object.keys(cardsGroupedByCardName).map(cardName => {
      const filteredCardGroup = filterCards(cardsGroupedByCardName[cardName]);
      const firstCard = filteredCardGroup.length > 0 ? filteredCardGroup[0] : null;
  
      return firstCard !== null && <Stack justifyContent="center" key={firstCard.guid}>
        <MyTypography textAlign="center">{filteredCardGroup.length}</MyTypography>
        <GameCardDraw zoom card={firstCard} />
        {props.onSelectCard && <Button size="small" onClick={() => handleClick(firstCard)}>
          <MyTypography> {props.buttonName} </MyTypography>
        </Button>}
      </Stack>
    })}
  </div>
};

export default CardsDisplay;
