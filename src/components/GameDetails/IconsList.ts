// Classes
import FighterIcon from '../../assets/images/FighterIcon.png';
import RougeIcon from '../../assets/images/RougeIcon.png';
import ApprenticeIcon from '../../assets/images/ApprenticeIcon.png';
import AcolyteIcon from '../../assets/images/AcolyteIcon.png';
import HighKnightIcon from '../../assets/images/HighKnightIcon.png';
import PriestIcon from '../../assets/images/PriestIcon.png';
import BarbarianIcon from '../../assets/images/BarbarianIcon.png';
import ShadowIcon from '../../assets/images/ShadowIcon.png';
import HighMageIcon from '../../assets/images/HighMageIcon.png';
import HawkeyeIcon from '../../assets/images/HawkeyeIcon.png';
import BattlePriestIcon from '../../assets/images/BattlePriestIcon.png';
import WarMageIcon from '../../assets/images/WarMageIcon.png';
// Statuses
import PhysicalDamageImmunityIcon from '../../assets/images/PhysicalDamageImmunityIcon.png';
import BreakGearIcon from '../../assets/images/BreakGearIcon.png';
import SilenceIcon from '../../assets/images/SilenceIcon.png';
import ParalyzeIcon from '../../assets/images/ParalyzeIcon.png';
// Play effects
import TimeBoundIcon from '../../assets/images/TimeBoundIcon.png';
import TwoHandedIcon from '../../assets/images/TwoHandedIcon.png';
import OneHandedIcon from '../../assets/images/OneHandedIcon.png';
import BodyIcon from '../../assets/images/BodyIcon.png';
import HumansIcon from '../../assets/images/HumansIcon.png';
import OrcsIcon from '../../assets/images/OrcsIcon.png';
import ElvensIcon from '../../assets/images/ElvensIcon.png';
import BurnIcon from '../../assets/images/BurnIcon.png';
// Stats
import HpIcon from '../../assets/images/HpIcon.png';
import DexIcon from '../../assets/images/DexIcon.png';
import IntIcon from '../../assets/images/IntIcon.png';
import StrIcon from '../../assets/images/StrIcon.png';

interface iconDescription {
    icon: string;
    description: string;
};

const iconsList: iconDescription[] = [
    { icon: FighterIcon, description: 'Fighter class' },
    { icon: RougeIcon, description: 'Rouge class' },
    { icon: ApprenticeIcon, description: 'Apprentice class' },
    { icon: AcolyteIcon, description: 'Acolyte class' },
    { icon: HighKnightIcon, description: 'High knight class' },
    { icon: PriestIcon, description: 'Priest class' },
    { icon: BarbarianIcon, description: 'Barbarian class' },
    { icon: ShadowIcon, description: 'Shadow class' },
    { icon: HighMageIcon, description: 'High mage class' },
    { icon: HawkeyeIcon, description: 'Hawkeye class' },
    { icon: BattlePriestIcon, description: 'Battle priest class' },
    { icon: WarMageIcon, description: 'War mage class' },
    { icon: PhysicalDamageImmunityIcon, description: 'Physical damage immunity icon' },
    { icon: BreakGearIcon, description: 'Break random piece of gear' },
    { icon: SilenceIcon, description: 'Silenced - Champion can not use actions' },
    { icon: ParalyzeIcon, description: 'Paralyze - Champion can not use actions or move' },
    { icon: BurnIcon, description: 'Burn - deal fire damage over time'},
    { icon: TimeBoundIcon, description: 'Time bound action' },
    { icon: TwoHandedIcon, description: 'Gear is two handed' },
    { icon: OneHandedIcon, description: 'Gear is one handed' },
    { icon: BodyIcon, description: 'Gear wear on body' },
    { icon: HumansIcon, description: 'Humans race' },
    { icon: OrcsIcon, description: 'Orcs race' },
    { icon: ElvensIcon, description: 'Elvens race' },
    { icon: HpIcon, description: 'Hit points stat'},
    { icon: DexIcon, description: 'Dexterity stat - effect range attacks and movement'},
    { icon: IntIcon, description: 'Intelligence stat - effect magic attacks and magic defense'},
    { icon: StrIcon, description: 'Strength stat- effect melee attacks and physical defense'}
];

export default iconsList;