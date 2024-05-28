import { FC, useState } from 'react';
import styles from './Hand.module.css';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { playerActions, setShowHand, createSelectedData } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import { PlayerActionsName } from '../../logic/enums';
import { GameCard, isOrder } from '../../logic/game-card';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import HandCard, { HandCardMode } from '../HandCard/HandCard';

const Hand: FC = () => {
  const playingPlayerIndex = useAppSelector((state) => state.gameActions.game.playingPlayerIndex);
  const playerHand = useAppSelector((state) => state.gameActions.game.players[playingPlayerIndex].hand);
  const playerDeck = useAppSelector((state) => state.gameActions.game.players[playingPlayerIndex].deck);
  const playerUsedCards = useAppSelector((state) => state.gameActions.game.players[playingPlayerIndex].usedCards);
  const showHand = useAppSelector((state) => state.gameActions.showHand);
  const selectedActionData = useAppSelector((state) => state.gameActions.selectedActionData);

  const dispatch = useAppDispatch();

  const [discardCards, setDiscardCards] = useState([] as GameCard[]);

  const handleAction = (actionName: string) => {
    const newSelectedActionData = createSelectedData(null, actionName, GameStoreActionTypes.PlayerAction);
    dispatch(playerActions({ selectedActionData: newSelectedActionData }));
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
      dispatch(playerActions({ data: newDiscardCards }));
    else
      setDiscardCards(newDiscardCards);
  }

  return <div className={styles.Hand}>
    <Button onClick={() => dispatch(setShowHand(true))}>Hand</Button>

    <Drawer anchor="bottom" open={showHand} onClose={() => dispatch(setShowHand(false))}>

      <Button onClick={() => dispatch(setShowHand(false))}>Hand</Button>

      <div className={styles.CardContainer}>
        <div className={styles.ButtonsContainer}>
          <h3> Used Cards: {playerUsedCards.length}</h3>
          <Button onClick={() => handleAction(PlayerActionsName.InitialDraw)} variant="outlined">Deck: {playerDeck.length}</Button>
          <Button onClick={() => handleAction(PlayerActionsName.EndTurn)} variant="outlined">{PlayerActionsName.EndTurn}</Button>
          <Button onClick={() => handleAction(PlayerActionsName.Surrender)} variant="outlined">{PlayerActionsName.Surrender}</Button>
        </div>
        {playerHand.map((card, index) => <div className={discardCards.some(x => x.guid === card.guid) ? styles.DiscardCard : ''} key={index}>
          <HandCard mode={HandCardMode.Hand} card={card} />
          {selectedActionData?.allowedHandCardSelect?.some(x => x.guid === card.guid) && <Button onClick={() => handleDiscardAction(card)}>Select</Button>}
        </div>)}
      </div>

    </Drawer>
  </div>
};

export default Hand;
