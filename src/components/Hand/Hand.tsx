import { FC, useState } from 'react';
import { useAppDispatch, useAppSelector, usePlayerAction, useRefreshGame } from '../../redux/hooks';
import { setShowHand, createSelectedData, setShowCardsInDeck, setSelectedActionDataCardsToDraw, createShowCardsInDeck, SelectedData, setShowGameDetails, setShowGameLog }
  from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import { PlayerActionsName } from '../../logic/enums';
import { GameCard, isOrder } from '../../logic/game-card';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import CardsDisplay from '../CardsDisplay/CardsDisplay';
import { Drawer, Button, Dialog, DialogContent, Typography } from '@mui/material';
import * as motion from "motion/react-client"
import styles from './Hand.module.css';

const Hand: FC = () => {
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);
  const playingPlayerIndex = useAppSelector((state) => state.gameActions.game.playingPlayerIndex);
  const player = useAppSelector((state) => state.gameActions.game.players[playerIndex]);
  const showHand = useAppSelector((state) => state.gameActions.showHand);
  const selectedActionData: SelectedData = useAppSelector((state) => state.gameActions.selectedActionData);
  const showCardsInDeck = useAppSelector((state) => state.gameActions.showCardsInDeck);
  const playerAction = usePlayerAction();
  const refreshGame = useRefreshGame();

  const dispatch = useAppDispatch();

  const [showUsedCardsDialog, setShowUsedCardsDialog] = useState(false);
  const [discardCards, setDiscardCards] = useState([] as GameCard[]);

  const handleAction = (actionName: PlayerActionsName, hideHand: boolean = false) => {
    if (actionName === PlayerActionsName.Surrender) {
      const res = window.confirm("Are you sure you want to surrender?");
      if (!res) return;
    }

    const newSelectedActionData = createSelectedData(null, actionName, GameStoreActionTypes.PlayerAction);

    playerAction(newSelectedActionData);

    if (hideHand)
      dispatch(setShowHand(false));
  };

  const handleDiscardAction = (card: GameCard) => {
    const playedOrderCard = selectedActionData.card;

    if (!isOrder(playedOrderCard)) {
      alert("Selected card is not an order card");
      return;
    };

    const discardRequirement = playedOrderCard.requirement.find(x => x.name === 'discard');

    if (discardRequirement === undefined) {
      alert("No discard requirement found");
      return;
    };

    const newDiscardCards = [...discardCards, card];

    if (discardRequirement.amount === newDiscardCards.length)
      playerAction(null, newDiscardCards);
    else
      setDiscardCards(newDiscardCards);
  }

  const handleDeckSelectedCard = (card: GameCard) => {
    const playedOrderCard = selectedActionData.card;

    if (!isOrder(playedOrderCard)) {
      alert("Selected card is not an order card");
      return;
    };

    const amountToSelect = playedOrderCard.reward.amount;

    if (selectedActionData.cardsToDraw?.length === amountToSelect) {
      alert("Selected cards to draw are already chosen");
      return;
    };

    const newCardsToDraw = [...selectedActionData.cardsToDraw, card];
    dispatch(setSelectedActionDataCardsToDraw(newCardsToDraw));

    if (selectedActionData.cardsToDraw?.length === (amountToSelect - 1))
      dispatch(setShowCardsInDeck(createShowCardsInDeck(false)));
  }

  return <div className={styles.Hand}>
    <div className={styles.HandButton}>
      <Button variant="outlined" onClick={() => dispatch(setShowHand(true))}>Show Hand</Button>
      <Button variant="outlined" onClick={() => dispatch(setShowGameDetails(true))}>Show Details</Button>
      <Button variant="outlined" onClick={() => dispatch(setShowGameLog(true))}>Show Log</Button>
    </div>
    <Drawer anchor="bottom" open={showHand} onClose={() => dispatch(setShowHand(false))}>
      <div className={styles.CardContainer}>
        <div className={styles.HandButtonsContainer}>
          <Typography variant="h3" onClick={() => setShowUsedCardsDialog(true)}> Used Cards: {player.usedCards.length}</Typography>
          <Button size="small" disabled={playerIndex !== playingPlayerIndex || player.didDraw} onClick={() => handleAction(PlayerActionsName.TurnDraw)} variant="outlined">Deck: {player.deck.length}</Button>
          <Button size="small" disabled={playerIndex !== playingPlayerIndex} onClick={() => handleAction(PlayerActionsName.EndTurn, true)} variant="outlined">{PlayerActionsName.EndTurn}</Button>
          <Button size="small" disabled={playerIndex !== playingPlayerIndex} onClick={() => handleAction(PlayerActionsName.Surrender)} variant="outlined">{PlayerActionsName.Surrender}</Button>
          <Button size="small" onClick={() => refreshGame()} variant="outlined">Refresh</Button>
        </div>
        {player.hand.map((card, index) => <div className={discardCards.some(x => x.guid === card.guid) ? styles.DiscardCard : ''} key={index}>
          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
            <HandCard disabled={playerIndex !== playingPlayerIndex} mode={HandCardMode.Hand} card={card} />
          </motion.div>
          {selectedActionData?.allowedHandCardSelect?.some(x => x.guid === card.guid) && <Button onClick={() => handleDiscardAction(card)}>Discard</Button>}
        </div>)}
      </div>
    </Drawer>
    <Dialog
      open={showUsedCardsDialog && player.usedCards.length > 0}
      onClose={() => setShowUsedCardsDialog(false)}>
      <DialogContent className={styles.DialogContent}>
        <CardsDisplay cards={player.usedCards} />
      </DialogContent>
    </Dialog>
    <Dialog
      open={showCardsInDeck?.show && player.deck.length > 0}
      onClose={() => dispatch(setShowCardsInDeck(false))}>
      <DialogContent className={styles.DialogContent}>
        <CardsDisplay onSelectCard={handleDeckSelectedCard}
          cardType={showCardsInDeck?.byType}
          nameContains={showCardsInDeck?.byName}
          cards={player.deck}
          excludedCards={selectedActionData.cardsToDraw} />
      </DialogContent>
    </Dialog>
  </div>
};

export default Hand;
