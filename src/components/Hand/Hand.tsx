import { FC } from 'react';
import styles from './Hand.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { playerActions, setShowHand, createSelectedData } from '../../app/store';
import { actionTypes } from '../../app/types';
import { playerActionsName } from '../../logic/player';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import HandCard from '../HandCard/HandCard';

const Hand: FC = () => {
  const playerHand = useAppSelector((state) => state.gameActions.game.players[0].hand);
  const playerDeck = useAppSelector((state) => state.gameActions.game.players[0].deck);
  const showHand = useAppSelector((state) => state.gameActions.showHand);

  const dispatch = useAppDispatch();

  const handleDraw = () => {
    const selectedActionData = createSelectedData(null, playerActionsName.initialDraw, actionTypes.playerAction);
    dispatch(playerActions({ selectedActionData: selectedActionData}));
  };

  return <div className={styles.Hand}>
    <Button onClick={() => dispatch(setShowHand(true))}>Open drawer</Button>

    <Drawer anchor="bottom" open={showHand} onClose={() => dispatch(setShowHand(false))}>

      <Button onClick={() => dispatch(setShowHand(false))}>Close drawer</Button>

      <div className={styles.CardContainer}>
        <Button onClick={handleDraw} variant="outlined">Deck: {playerDeck.length}</Button>
        <Button onClick={handleDraw} variant="outlined">{playerActionsName.endTurn}</Button>
        <Button onClick={handleDraw} variant="outlined">{playerActionsName.surrender}</Button>
        {playerHand.map((card, index) => <HandCard key={index} card={card} />)}
      </div>

    </Drawer>
  </div>
};

export default Hand;
