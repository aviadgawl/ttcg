import { FC } from 'react';
import { PlayerActionsName } from '../../logic/enums';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import Button from '@mui/material/Button';
import { useAppSelector, usePlayerAction } from '../../redux/hooks';
import { GameCard, ChampionCard, isChampion } from '../../logic/game-card';
import CardsDisplay from '../CardsDisplay/CardsDisplay';
import { SelectedData } from '../../redux/store';
import { groupBy } from '../../helpers/functions-helper';
import prebuiltDecks from './prebuilt-decks.json';
import styles from './DeckBuilder.module.css';

const DeckBuilder: FC = () => {
  const player = useAppSelector((state) => {
    const playerIndex = state.gameActions.game.playerIndex;
    return state.gameActions.game.players[playerIndex];
  });
  const cardsList = useAppSelector((state) => state.gameActions.cardsList);
  const playerAction = usePlayerAction();

  const disablePrebuiltDecks = player.deck?.length > 0 || player.startingChampion !== null;
  const cardsInDeckGroupedByName = groupBy(player.deck, card => card.name);

  const handleExport = () => {
    const deckBuildString = Object.keys(cardsInDeckGroupedByName)
      .reduce((accumulator, newValue) => accumulator + `,${newValue}:${cardsInDeckGroupedByName[newValue].length}`, '');
    navigator.clipboard.writeText(deckBuildString);
    alert(deckBuildString);
  }

  const importDeck = (deckString: string) => {
    deckString?.slice(1).split(',').forEach(cardData => {
      const [cardName, cardAmount] = cardData.split(':');
      const cardAmountAsNumber: number = parseInt(cardAmount);

      const cardsToAdd = cardsList.filter(card => card?.name === cardName).slice(0, cardAmountAsNumber);

      if (cardsToAdd && cardsToAdd.length > 0)
        cardsToAdd.forEach(cardToAdd => addCardToDeck(cardToAdd));
    });
  }

  const handleImport = () => {
    const deckString = prompt('Please deck string', '');
    if (!deckString) return;
    importDeck(deckString);
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

  const handleSelectingStartingChampion = (championCard: GameCard) => {
    const selectedData = { card: championCard, actionName: PlayerActionsName.SetStartingChampion } as SelectedData;
    playerAction(selectedData);
  }

  return <div className={styles.DeckBuilder}>
    <div className={styles.PrebuiltDecks}>
      <label>Decks:</label>
      <Button disabled={disablePrebuiltDecks} onClick={() => importDeck(prebuiltDecks.Fighters)} variant='outlined'>Fighters</Button>
      <Button disabled={disablePrebuiltDecks} onClick={() => importDeck(prebuiltDecks.Apprentices)} variant='outlined'>Apprentices</Button>
      <Button disabled={disablePrebuiltDecks} onClick={() => importDeck(prebuiltDecks.Rouges)} variant='outlined'>Rouges</Button>
      <Button disabled={disablePrebuiltDecks} onClick={() => importDeck(prebuiltDecks.FightersAndAcolytes)} variant='outlined'>Fighters & Acolytes</Button>
    </div>
    <div className={styles.Container}>
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
          </>}
          <h3> Deck </h3>
          {Object.keys(cardsInDeckGroupedByName).map(cardName =>
            <div key={cardName}>
              <span>{cardsInDeckGroupedByName[cardName].length}</span>
              <HandCard mode={HandCardMode.DeckBuilding} card={cardsInDeckGroupedByName[cardName][0]} />
              <Button onClick={() => removeCardFromDeck(cardsInDeckGroupedByName[cardName][0])}>Remove</Button>
              {isChampion(cardsInDeckGroupedByName[cardName][0]) && player.startingChampion?.name !== cardsInDeckGroupedByName[cardName][0].name &&
                <Button variant="outlined" size="small" onClick={() => handleSelectingStartingChampion(cardsInDeckGroupedByName[cardName][0] as ChampionCard)}>
                  Select
                </Button>}
            </div>
          )}
        </div>
      </div>
      <CardsDisplay cards={cardsList} onSelectCard={(card) => addCardToDeck(card)} buttonName="Add to deck" />
    </div>
  </div>
};

export default DeckBuilder;
