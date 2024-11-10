import { FC, useState } from 'react';
import styles from './Hand.module.css';
import { useAppDispatch, useAppSelector, usePlayerAction } from '../../redux/hooks';
import { setShowHand, createSelectedData, setShowCardsInDeck, setSelectedActionDataCardsToDraw, createShowCardsInDeck, SelectedData } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import { PlayerActionsName } from '../../logic/enums';
import { GameCard, isOrder } from '../../logic/game-card';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import CardsDisplay from '../CardsDisplay/CardsDisplay';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

const Hand: FC = () => {
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);
  const playingPlayerIndex = useAppSelector((state) => state.gameActions.game.playingPlayerIndex);
  const player = useAppSelector((state) => state.gameActions.game.players[playerIndex]);
  const showHand = useAppSelector((state) => state.gameActions.showHand);
  const selectedActionData: SelectedData = useAppSelector((state) => state.gameActions.selectedActionData);
  const showCardsInDeck = useAppSelector((state) => state.gameActions.showCardsInDeck);
  const playerAction = usePlayerAction();

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
      <Button onClick={() => dispatch(setShowHand(true))}>Show Hand</Button>
    </div>
    <Drawer variant="persistent" anchor="bottom" open={showHand} onClose={() => dispatch(setShowHand(false))}>
      <Button onClick={() => dispatch(setShowHand(false))}>Hide Hand</Button>
      <div className={styles.CardContainer}>
        <div className={styles.ButtonsContainer}>
          <h3 onClick={() => setShowUsedCardsDialog(true)}> Used Cards: {player.usedCards.length}</h3>
          <Button disabled={playerIndex !== playingPlayerIndex || player.didDraw} onClick={() => handleAction(PlayerActionsName.TurnDraw)} variant="outlined">Deck: {player.deck.length}</Button>
          <Button disabled={playerIndex !== playingPlayerIndex} onClick={() => handleAction(PlayerActionsName.EndTurn, true)} variant="outlined">{PlayerActionsName.EndTurn}</Button>
          <Button disabled={playerIndex !== playingPlayerIndex} onClick={() => handleAction(PlayerActionsName.Surrender)} variant="outlined">{PlayerActionsName.Surrender}</Button>
        </div>
        {player.hand.map((card, index) => <div className={discardCards.some(x => x.guid === card.guid) ? styles.DiscardCard : ''} key={index}>
          <HandCard disabled={playerIndex !== playingPlayerIndex} mode={HandCardMode.Hand} card={card} />
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
