import { FC } from 'react';
import { PlayerActionsName } from '../../logic/enums';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import Button from '@mui/material/Button';
import styles from './DeckBuilder.module.css';
import { useAppSelector, usePlayerAction, useAppDispatch } from '../../redux/hooks';
import { GameCard, ChampionCard, isChampion } from '../../logic/game-card';
import CardsDisplay from '../CardsDisplay/CardsDisplay';
import { SelectedData, setStartingChampion } from '../../redux/store';

const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);

const DeckBuilder: FC = () => {
  const player = useAppSelector((state) => {
    const playerIndex = state.gameActions.game.playerIndex;
    return state.gameActions.game.players[playerIndex];
  });
  const dispatch = useAppDispatch();
  const cardsList = useAppSelector((state) => state.gameActions.cardsList);
  const playerAction = usePlayerAction();

  const cardsInDeckGroupedByName = groupBy(player.deck, card => card.name);

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
      const cardAmountAsNumber: number = parseInt(cardAmount);

      const cardsToAdd = cardsList.filter(card => card?.name === cardName).slice(0, cardAmountAsNumber);

      if (cardsToAdd && cardsToAdd.length > 0)
        cardsToAdd.forEach(cardToAdd => addCardToDeck(cardToAdd));
    });
  }

  const handleClear = () => {
    const selectedData = { actionName: PlayerActionsName.ClearDeck } as SelectedData;
    playerAction(selectedData);
  }

  const addCardToDeck = (card: GameCard) => {
    const selectedData = { card: card, actionName: PlayerActionsName.AddCardToDeck } as SelectedData;
    playerAction(selectedData);
  }

  const removeCardFromDeck = (card: GameCard) => {
    const selectedData = { card: card, actionName: PlayerActionsName.RemoveCardFromDeck } as SelectedData;
    playerAction(selectedData);
  }

  const handleSelectingStartingChampion = (championCard: ChampionCard) => {
    dispatch(setStartingChampion(championCard));
  }

  const unsetStartingChampion = () => {
    dispatch(setStartingChampion(null));
  }

  return <div className={styles.DeckBuilder}>
    <div className={styles.Deck}>
      <div>
        <Button onClick={handleExport}>Export</Button>
        <Button onClick={handleImport}>Import</Button>
        <Button onClick={handleClear}>Clear</Button>
        <hr />
        <h2>Total: {player.deck.length}</h2>
      </div>
      <hr />
      <div>
        <h3> Starting Champion </h3>
        {player.startingChampion && <>
          <HandCard mode={HandCardMode.DeckBuilding} card={player.startingChampion} />
          <Button onClick={() => unsetStartingChampion()}>Remove</Button>
        </>}
        <h3> Deck </h3>
        {Object.keys(cardsInDeckGroupedByName).map(cardName =>
          <div key={cardName}>
            <span>{cardsInDeckGroupedByName[cardName].length}</span>
            <HandCard mode={HandCardMode.DeckBuilding} card={cardsInDeckGroupedByName[cardName][0]} />
            <Button onClick={() => removeCardFromDeck(cardsInDeckGroupedByName[cardName][0])}>Remove</Button>
            {isChampion(cardsInDeckGroupedByName[cardName][0]) &&
              <Button variant="outlined" size="small" onClick={() => handleSelectingStartingChampion(cardsInDeckGroupedByName[cardName][0] as ChampionCard)}>
                Select
              </Button>}
          </div>
        )}
      </div>
    </div>

    <CardsDisplay cards={cardsList} onSelectCard={(card) => addCardToDeck(card)} buttonName="Add to deck" />
  </div>
};

export default DeckBuilder;
