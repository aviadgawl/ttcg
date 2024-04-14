import React, { FC, useState } from 'react';
import { cardsList } from '../../logic/game';
import { PlayerActionsName } from '../../logic/player';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import styles from './DeckBuilder.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { playerActions } from '../../app/store';

interface DeckBuilderProps { }

const DeckBuilder: FC<DeckBuilderProps> = () => {
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);
  const playerDeck = useAppSelector((state) => state.gameActions.game.players[playerIndex].deck);

  const [openDeckDrawer, setOpenDeckDrawer] = useState(false);

  const dispatch = useAppDispatch();

  return <div className={styles.DeckBuilder}>
    <Button onClick={() => setOpenDeckDrawer(true)}>Open drawer</Button>
    <Drawer open={openDeckDrawer}>
      <Button onClick={() => setOpenDeckDrawer(false)}>Cloes drawer</Button>
      {playerDeck.map(card => <HandCard mode={HandCardMode.DeckBuilding} card={card} />)}
    </Drawer>
   
    <div className={styles.CardsCollection}>
      {cardsList.map(card => {
        if (card !== null) return <div>
          <HandCard mode={HandCardMode.DeckBuilding} card={card} />
          <Button onClick={() => dispatch(playerActions({selectedActionData: {card: card, actionName: PlayerActionsName.AddCardToDeck}}))}>Add to deck</Button>
          </div>
      })}
    </div>
  </div>
};

export default DeckBuilder;
