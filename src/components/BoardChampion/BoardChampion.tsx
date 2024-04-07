import { FC } from 'react';
import { Champion } from '../../logic/card';
import { useAppDispatch } from '../../app/hooks';
import { setSelectedActionData, createSelectedData } from '../../app/store';
import { actionTypes } from '../../app/types';
import Button from '@mui/material/Button';
import styles from './BoardChampion.module.css';

interface BoardChampionProps {
  champion: Champion;
  x: number;
  y: number;
  isSelected: boolean;
}

const BoardChampion: FC<BoardChampionProps> = (props: BoardChampionProps) => {
  const dispatch = useAppDispatch();

  return (<div className={props.isSelected ? styles.Selected : ""}>
    <div>{props.champion.name}</div>
    <div>
      <img src={props.champion.image} />
    </div>
    <span> HP: {props.champion.currentHp}/{props.champion.hp} </span>
    <span> Armor: {props.champion.armor}/{props.champion.calStr}</span>
    <span> Mental: {props.champion.mental}/{props.champion.calInt}</span>
    <span> STR: {props.champion.calStr} </span>
    <span> DEX: {props.champion.calDex} </span>
    <span> INT: {props.champion.calInt} </span>
    <span> STM: {props.champion.stm} </span>
    <div> Class: {props.champion.calClass}</div>
    <div>
      {props.champion.actions.map((action, actionIndex) =>
        <Button variant="outlined" key={actionIndex} onClick={() => dispatch(setSelectedActionData(createSelectedData(props.champion, action, actionTypes.championAction, [props.x, props.y])))}>{action}</Button>
      )}
    </div>
  </div>);
};

export default BoardChampion;
