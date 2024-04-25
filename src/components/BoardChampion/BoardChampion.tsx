import { FC } from 'react';
import { ChampionCard } from '../../logic/game-card';
import { useAppDispatch } from '../../redux/hooks';
import { setSelectedActionData, createSelectedData } from '../../redux/store';
import { actionTypes } from '../../redux/types';
import Button from '@mui/material/Button';
import styles from './BoardChampion.module.css';

interface BoardChampionProps {
  champion: ChampionCard;
  x: number;
  y: number;
  isSelected: boolean;
  rotate: boolean;
}

const BoardChampion: FC<BoardChampionProps> = (props: BoardChampionProps) => {
  const dispatch = useAppDispatch();

  return (<div style={{ backgroundImage: `url(${props.champion.image})` }}
    className={`App-text-color ${styles.Container} ${props.isSelected ? styles.Selected : styles.NotSelected} ${props.rotate ? 'App-rotate' : ''}`}>
    <div>{props.champion.name}</div>
    <span> HP: {props.champion.currentHp}/{props.champion.hp} </span>
    <span> Armor: {props.champion.armor}/{props.champion.calStr}</span>
    <span> Mental: {props.champion.mental}/{props.champion.calInt}</span>
    <span> STR: {props.champion.calStr} </span>
    <span> DEX: {props.champion.calDex} </span>
    <span> INT: {props.champion.calInt} </span>
    <span> STM: {props.champion.stm} </span>
    <div> Class: {props.champion.calClass}</div>
    <div>
      {props.champion.learnedActionsCards.map((card, actionIndex) =>
        <Button disabled={props.champion.stm <= 0} size="small" variant="contained" className="App-button" key={actionIndex} 
          onClick={() => dispatch(setSelectedActionData(createSelectedData(card, card.name, actionTypes.championAction, [props.x, props.y])))}>{card.name}
        </Button>
      )}
      {props.champion.attachedActionsCards.map((card, actionIndex) =>
        <Button size="small" variant="contained" className="App-button" key={actionIndex} 
          onClick={() => dispatch(setSelectedActionData(createSelectedData(props.champion, card.name, actionTypes.championAction, [props.x, props.y])))}>{card.name}
        </Button>
      )}
    </div>
  </div>);
};

export default BoardChampion;
