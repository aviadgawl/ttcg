import { FC } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import styles from './GameTabs.module.css';

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface GameTabsProps {
  onModeClick: (event: React.SyntheticEvent, newValue: number) => any,
  displayMode: number,
  disabledTabIndexes: number[]
}

const GameTabs: FC<GameTabsProps> = (props) => (
  <div className={styles.GameMenu}>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={props.displayMode} onChange={props.onModeClick} aria-label="basic tabs example">
        <Tab disabled={props.disabledTabIndexes.some(x => x === 0)} label="Login" {...a11yProps(0)} />
        <Tab disabled={props.disabledTabIndexes.some(x => x === 1)} label="Deck Builder" {...a11yProps(0)} />
        <Tab disabled={props.disabledTabIndexes.some(x => x === 2)} label="Game" {...a11yProps(1)} />
      </Tabs>
    </Box>
  </div>
);

export default GameTabs;
