import { FC } from 'react';
import styles from './Hand.module.css';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { playerActions, setShowHand, createSelectedData } from '../../redux/store';
import { GameStoreActionTypes } from '../../redux/types';
import { PlayerActionsName } from '../../logic/enums';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import HandCard, {HandCardMode} from '../HandCard/HandCard';

const Hand: FC = () => {
  const playingPlayerIndex = useAppSelector((state) => state.gameActions.game.playingPlayerIndex);
  const playerHand = useAppSelector((state) => state.gameActions.game.players[playingPlayerIndex].hand);
  const playerDeck = useAppSelector((state) => state.gameActions.game.players[playingPlayerIndex].deck);
  const showHand = useAppSelector((state) => state.gameActions.showHand);

  const dispatch = useAppDispatch();

  const handleAction = (actionName: string) => {
    const selectedActionData = createSelectedData(null, actionName, GameStoreActionTypes.PlayerAction);
    dispatch(playerActions({ selectedActionData: selectedActionData }));
  };

  return <div className={styles.Hand}>
    <Button onClick={() => dispatch(setShowHand(true))}>Hand</Button>

    <Drawer anchor="bottom" open={showHand} onClose={() => dispatch(setShowHand(false))}>

      <Button onClick={() => dispatch(setShowHand(false))}>Hand</Button>

      <div className={styles.CardContainer}>
        <div className={styles.ButtonsContainer}>
          <Button onClick={() => handleAction(PlayerActionsName.InitialDraw)} variant="outlined">Deck: {playerDeck.length}</Button>
          <Button onClick={() => handleAction(PlayerActionsName.EndTurn)} variant="outlined">{PlayerActionsName.EndTurn}</Button>
          <Button onClick={() => handleAction(PlayerActionsName.Surrender)} variant="outlined">{PlayerActionsName.Surrender}</Button>
        </div>
        {playerHand.map((card, index) => <HandCard mode={HandCardMode.Hand} key={index} card={card} />)}
      </div>

    </Drawer>
  </div>
};

export default Hand;
