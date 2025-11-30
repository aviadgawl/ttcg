import { FC, useMemo } from 'react';
import { PlayerActionsName } from '../../logic/enums';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import { Stack, Button, Typography, Box } from '@mui/material';
import { useAppSelector, usePlayerAction } from '../../redux/hooks';
import { GameCard, ChampionCard, isChampion } from '../../logic/game-card';
import CardsDisplay from '../CardsDisplay/CardsDisplay';
import { SelectedData } from '../../redux/store';
import { groupBy } from '../../helpers/functions-helper';
import prebuiltDecks from './prebuilt-decks.json';
import MyTypography from '../Shared/MUI/MyTypography';
import styles from './DeckBuilder.module.css';
import GameCardDraw from '../GameCardDraw/GameCardDraw';

const DeckBuilder: FC = () => {
  const player = useAppSelector((state) => {
    const playerIndex = state.gameActions.game.playerIndex;
    return state.gameActions.game.players[playerIndex];
  });
  const cardsList = useAppSelector((state) => state.gameActions.cardsList);

  const filteredCardList = useMemo(() => {
    return cardsList.filter(card => card.name !== 'Forest Spirit' && card.name !== 'Mountains Spirit');
  },[cardsList]);

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
      <MyTypography>Decks:</MyTypography>
      <Button disabled={disablePrebuiltDecks} onClick={() => importDeck(prebuiltDecks.Fighters)} variant='outlined'>
        <MyTypography>Fighters</MyTypography>
      </Button>
      <Button disabled={disablePrebuiltDecks} onClick={() => importDeck(prebuiltDecks.Apprentices)} variant='outlined'>
        <MyTypography>Apprentices</MyTypography>
      </Button>
      <Button disabled={disablePrebuiltDecks} onClick={() => importDeck(prebuiltDecks.Rouges)} variant='outlined'>
        <MyTypography>Rouges</MyTypography>
      </Button>
      <Button disabled={disablePrebuiltDecks} onClick={() => importDeck(prebuiltDecks.FightersAndAcolytes)} variant='outlined'>
        <MyTypography>Fighters & Acolytes</MyTypography>
      </Button>
    </div>
    <div className={styles.Container}>
      <div className={styles.Deck}>
        <div>
          <Button onClick={handleExport}><MyTypography>Export</MyTypography></Button>
          <Button onClick={handleImport}><MyTypography>Import</MyTypography></Button>
          <Button onClick={handleClear}><MyTypography>Clear</MyTypography></Button>
          <hr />
          <Typography variant="h5">Total: {player.deck.length}</Typography>
        </div>
        <hr />
        <div>
          <Typography variant="h6"> Starting Champion </Typography>
          {player.startingChampion && <>
            <HandCard mode={HandCardMode.DeckBuilding} card={player.startingChampion} />
          </>}
          <hr />
          <Typography> Deck </Typography>
          {Object.keys(cardsInDeckGroupedByName).map(cardName =>
            <Stack key={cardName}>
              <MyTypography>{cardsInDeckGroupedByName[cardName].length}</MyTypography>
              <Box display="flex" justifyContent="center">
                <GameCardDraw zoom card={cardsInDeckGroupedByName[cardName][0]} />
              </Box>
              <Button onClick={() => removeCardFromDeck(cardsInDeckGroupedByName[cardName][0])}>
                <MyTypography>Remove</MyTypography>
              </Button>
              {isChampion(cardsInDeckGroupedByName[cardName][0]) && player.startingChampion?.name !== cardsInDeckGroupedByName[cardName][0].name &&
                <Button variant="outlined" size="small" onClick={() => handleSelectingStartingChampion(cardsInDeckGroupedByName[cardName][0] as ChampionCard)}>
                  <MyTypography>Select</MyTypography>
                </Button>}
            </Stack>
          )}
        </div>
      </div>
      <CardsDisplay cards={filteredCardList} onSelectCard={(card) => addCardToDeck(card)} buttonName="Add to deck" />
    </div>
  </div>
};

export default DeckBuilder;
