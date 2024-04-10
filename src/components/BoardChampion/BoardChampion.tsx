import { FC } from 'react';
import { Champion } from '../../logic/champion';
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

  return (<div style={{ backgroundImage: `url(${props.champion.image})` }}
    className={`${styles.Container} ${props.isSelected ? styles.Selected : styles.NotSelected}`}>
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
      {props.champion.actions.map((action, actionIndex) =>
        <Button size="small" variant="contained" key={actionIndex} onClick={() => dispatch(setSelectedActionData(createSelectedData(props.champion, action, actionTypes.championAction, [props.x, props.y])))}>{action}</Button>
      )}
    </div>
  </div>);
};

export default BoardChampion;
