import { FC } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import GameCardDraw from '../GameCardDraw/GameCardDraw';
import styles from './ChampionMenu.module.css';
import { ChampionCard } from '../../logic/game-card';

interface ChampionMenuProps {
  anchorEl: Element|null,
  open: boolean,
  onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void,
  championCard: ChampionCard
}

const ChampionMenu: FC<ChampionMenuProps> = (props) => (
  <Menu
    id="basic-menu"
    anchorEl={props.anchorEl}
    open={props.open}
    onClose={props.onClose}
    MenuListProps={{
      'aria-labelledby': 'basic-button',
    }}
    className={styles.ChampionMenuList}
  >
    {props.championCard.upgrade && <MenuItem><GameCardDraw className='App-card' card={props.championCard.upgrade}/></MenuItem>}
    {props.championCard.body && <MenuItem><GameCardDraw className='App-card' card={props.championCard.body}/></MenuItem>}
    {props.championCard.leftHand && <MenuItem><GameCardDraw className='App-card' card={props.championCard.leftHand}/></MenuItem>}
    {props.championCard.rightHand && <MenuItem><GameCardDraw className='App-card' card={props.championCard.rightHand}/></MenuItem>}
  </Menu>
);

export default ChampionMenu;
