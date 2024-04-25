import { FC } from 'react';
import { cardsList } from '../../logic/game';
import { PlayerActionsName } from '../../logic/player';
import HandCard, { HandCardMode } from '../HandCard/HandCard';
import Button from '@mui/material/Button';
import styles from './DeckBuilder.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { playerActions } from '../../app/store';

interface DeckBuilderProps { }

const DeckBuilder: FC<DeckBuilderProps> = () => {
  const playerIndex = useAppSelector((state) => state.gameActions.game.playerIndex);
  const playerDeck = useAppSelector((state) => state.gameActions.game.players[playerIndex].deck);
  const dispatch = useAppDispatch();

  const cardsInDeckGroupedByGuid = groupBy(playerDeck, card => card.guid);

  return <div className={styles.DeckBuilder}>
    <div className={styles.Deck}>
      <div>
        <Button>Export</Button>
        <Button>Import</Button>
        <h2>Total: {playerDeck.length}</h2>
      </div>
      <hr />
      <div>
        {Object.keys(cardsInDeckGroupedByGuid).map(cardGroupKey =>
          <div key={cardGroupKey}>
            <span>{cardsInDeckGroupedByGuid[cardGroupKey].length}</span>
            <HandCard mode={HandCardMode.DeckBuilding} card={cardsInDeckGroupedByGuid[cardGroupKey][0]} />
            <Button onClick={() => dispatch(playerActions({ selectedActionData: { card: cardsInDeckGroupedByGuid[cardGroupKey][0], actionName: PlayerActionsName.removeCardFromDeck } }))}>Remove</Button>
          </div>
        )}
      </div>

    </div>

    <div className={styles.CardsCollection}>
      {cardsList.map(card => {
        if (card !== null)
          return <div key={card.guid}>
            <HandCard mode={HandCardMode.DeckBuilding} card={card} />
            <Button onClick={() => dispatch(playerActions({ selectedActionData: { card: card, actionName: PlayerActionsName.AddCardToDeck } }))}>Add to deck</Button>
          </div>
        else return '';
      })}
    </div>
  </div>
};

const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);

export default DeckBuilder;
