import { FC } from 'react';
import { PlayerActionsName } from '../../logic/enums';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import Button from '@mui/material/Button';
import styles from './DeckBuilder.module.css';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { playerActions } from '../../redux/store';
import { GameCard } from '../../logic/game-card';

const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);

const DeckBuilder: FC = () => {
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);
  const playerDeck = useAppSelector((state) => state.gameActions.game.players[playerIndex].deck);
  const cardsList = useAppSelector((state) => state.gameActions.cardsList);
  const dispatch = useAppDispatch();

  const cardsInDeckGroupedByName = groupBy(playerDeck, card => card.name);

  const handleExport = () => {
    const deckBuildString = Object.keys(cardsInDeckGroupedByName)
      .reduce((accumulator, newValue) => accumulator + `,${newValue}:${cardsInDeckGroupedByName[newValue].length}`, '');
    navigator.clipboard.writeText(deckBuildString);
    alert(deckBuildString);
  }

  const handleImport = () => {
    const deckString = prompt('Please deck string', '');

    if (!deckString) return;

    deckString?.slice(1).split(',').forEach(cardData => {
      const [cardName, cardAmount] = cardData.split(':');
      const cardToAdd = cardsList.find(card => card?.name === cardName);

      for (let index = 0; index < parseInt(cardAmount); index++) {
        if (cardToAdd) addCardToDeck(cardToAdd);
      }
    });
  }

  const handleClear = () => {
    dispatch(playerActions({ selectedActionData: { actionName: PlayerActionsName.ClearDeck } }))
  }

  const addCardToDeck = (card: GameCard) => {
    dispatch(playerActions({ selectedActionData: { card: card, actionName: PlayerActionsName.AddCardToDeck } }))
  }

  const removeCardFromDeck = (card: GameCard) => {
    dispatch(playerActions({ selectedActionData: { card: card, actionName: PlayerActionsName.RemoveCardFromDeck } }))
  }

  return <div className={styles.DeckBuilder}>
    <div className={styles.Deck}>
      <div>
        <Button onClick={handleExport}>Export</Button>
        <Button onClick={handleImport}>Import</Button>
        <Button onClick={handleClear}>Clear</Button>
        <h2>Total: {playerDeck.length}</h2>
      </div>
      <hr />
      <div>
        {Object.keys(cardsInDeckGroupedByName).map(cardName =>
          <div key={cardName}>
            <span>{cardsInDeckGroupedByName[cardName].length}</span>
            <HandCard mode={HandCardMode.DeckBuilding} card={cardsInDeckGroupedByName[cardName][0]} />
            <Button onClick={() => removeCardFromDeck(cardsInDeckGroupedByName[cardName][0])}>Remove</Button>
          </div>
        )}
      </div>
    </div>

    <div className={styles.CardsCollection}>
      {cardsList.map(card => {
        if (card !== null)
          return <div key={card.guid}>
            <HandCard mode={HandCardMode.DeckBuilding} card={card} />
            <Button onClick={() => addCardToDeck(card as GameCard)}>Add to deck</Button>
          </div>
        else return <></>;
      })}
    </div>
  </div>
};

export default DeckBuilder;
