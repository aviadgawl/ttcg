// Champions
import Eduard from '../assets/images/Eduard.png';
import Robin from '../assets/images/Robin.png';
import David from '../assets/images/David.png';
import Aron from '../assets/images/Aron.png';
import Trafrandir from '../assets/images/Tafrandir.png';
import Taeriel from '../assets/images/Taeriel.png';
import Valindra from '../assets/images/Valindra.png';
import Firsha from '../assets/images/Firsha.png';
import Gurak from '../assets/images/Gurak.png';
import Chiron from '../assets/images/Chiron.png';
import Karina from '../assets/images/Karina.png';
import Seth from '../assets/images/Seth.png';
// Upgrades
import HighKnight from '../assets/images/HighKnight.png';
import Barbarian from '../assets/images/Barbarian.png';
import BattlePriest from '../assets/images/BattlePriest.png';
import Hawkeye from '../assets/images/Hawkeye.png';
import HighMage from '../assets/images/HighMage.png';
import HighPriest from '../assets/images/HighPriest.png';
import Shadow from '../assets/images/Shadow.png';
import WarMage from '../assets/images/WarMage.png';
// Gear
import SimpleSword from '../assets/images/SimpleSword.png';
import SimpleDagger from '../assets/images/SimpleDagger.png';
import GreatStaff from '../assets/images/GreatStaff.png';
import Shield from '../assets/images/Shield.png';
import LeatherArmor from '../assets/images/LeatherArmor.png';
import SimpleWand from '../assets/images/SimpleWand.png';
import PlateArmor from '../assets/images/PlateArmor.png';
import RobeArmor from '../assets/images/RobeArmor.png';
import GreatBow from '../assets/images/GreatBow.png';
import GreatAxe from '../assets/images/GreatAxe.png';
import DualDaggers from '../assets/images/DualDaggers.png';
// Actions
import Step from '../assets/images/Step.png';
import BasicHit from '../assets/images/BasicHit.png';
import MightyBlow from '../assets/images/MightyBlow.png';
import DaggerSlash from '../assets/images/DaggerSlash.png';
import DaggerThrow from '../assets/images/DaggerThrow.png';
import Enrage from '../assets/images/Enrage.png';
import UltimateDefense from '../assets/images/UltimateDefense.png';
import JumpStep from '../assets/images/JumpStep.png';
import RushStep from '../assets/images/RushStep.png';
import BasicStep from '../assets/images/BasicStep.png';
import SwordSlash from '../assets/images/SwordSlash.png';
import AxeSlash from '../assets/images/AxeSlash.png';
import ArrowShot from '../assets/images/ArrowShot.png';
import Haste from '../assets/images/Haste.png';
import Precision from '../assets/images/Precision.png';
import CripplingShot from '../assets/images/CripplingShot.png';
import AcidBomb from '../assets/images/AcidBomb.png';
import AxeSwipe from '../assets/images/AxeSwipe.png';
import SwordSwipe from '../assets/images/SwordSwipe.png';
import MagicShield from '../assets/images/MagicShield.png';
import EnergyBall from '../assets/images/EnergyBall.png';
import ArcanePower from '../assets/images/ArcanePower.png';
import DexterityBlessing from '../assets/images/DexterityBlessing.png';
import StrengthBlessing from '../assets/images/StrengthBlessing.png';
import IntelligenceBlessing from '../assets/images/IntelligenceBlessing.png';
import FireBall from '../assets/images/FireBall.png';
import SelfHeal from '../assets/images/SelfHeal.png';
import Heal from '../assets/images/Heal.png';
import PetrifiedHex from '../assets/images/PetrifiedHex.png';
import ShieldBash from '../assets/images/ShieldBash.png';
import ArmorBreak from '../assets/images/ArmorBreak.png';
import MindBreak from '../assets/images/MindBreak.png';
import BackStab from '../assets/images/BackStab.png';
import EtherBladeSlash from '../assets/images/EtherBladeSlash.png';
import MagicPunch from '../assets/images/MagicPunch.png';
import EtherBladeSwipe from '../assets/images/EtherBladeSwipe.png';
// Orders
import GiveMeMore from '../assets/images/GiveMeMore.png';
import Regroup from '../assets/images/Regroup.png';
import GetReady from '../assets/images/GetReady.png';
import FixIt from '../assets/images/FixIt.png';
import KeepMoving from '../assets/images/KeepMoving.png';
import DoItAgain from '../assets/images/DoItAgain.png';
import FindHim from '../assets/images/FindHim.png';
import INeedSomeGear from '../assets/images/INeedSomeGear.png';
import RefreshMe from '../assets/images/RefreshMe.png';
import LearnQuick from '../assets/images/LearnQuick.png';
// Crystals
import ForestSpirit from '../assets/images/ForestSpirit.png';
import MountainsSpirit from '../assets/images/MountainsSpirit.png';
// Objects
import Boulder from '../assets/images/Boulder.png';


export const getImage = (id: string): string => {
    switch (id) {
        // Champions
        case 'Eduard':
            return Eduard;
        case 'Robin':
            return Robin;
        case 'David':
            return David;
        case 'Aron':
            return Aron;
        case 'Tafrandir':
            return Trafrandir;
        case 'Taeriel':
            return Taeriel;
        case 'Valindra':
            return Valindra;
        case 'Firsha':
            return Firsha;
        case 'Chiron':
            return Chiron;
        case 'Gurak':
            return Gurak;
        case 'Karina':
            return Karina;
        case 'Seth':
            return Seth;
        // Upgrades
        case 'High Knight':
            return HighKnight;
        case 'Barbarian':
            return Barbarian;
        case 'Battle Priest':
            return BattlePriest;
        case 'Hawkeye':
            return Hawkeye;
        case 'High Mage':
            return HighMage;
        case 'High Priest':
            return HighPriest;
        case 'Shadow':
            return Shadow;
        case 'War Mage':
            return WarMage;
        // Gear
        case 'Simple Sword':
            return SimpleSword;
        case 'Simple Dagger':
            return SimpleDagger;
        case 'Great Staff':
            return GreatStaff;
        case 'Shield':
            return Shield;
        case 'Leather Armor':
            return LeatherArmor;
        case 'Simple Wand':
            return SimpleWand;
        case 'Plate Armor':
            return PlateArmor;
        case 'Robe Armor':
            return RobeArmor;
        case 'Great Bow':
            return GreatBow;
        case 'Great Axe':
            return GreatAxe;
        case 'Dual Daggers':
            return DualDaggers;
        // Actions
        case 'Step':
            return Step;
        case 'Basic Hit':
            return BasicHit;
        case 'Mighty Blow':
            return MightyBlow;
        case 'Dagger Slash':
            return DaggerSlash;
        case 'Dagger Throw':
            return DaggerThrow;
        case 'Enrage':
            return Enrage;
        case 'Ultimate Defense':
            return UltimateDefense;
        case 'Jump Step':
            return JumpStep;
        case 'Rush Step':
            return RushStep;
        case 'Basic Step':
            return BasicStep;
        case 'Sword Slash':
            return SwordSlash;
        case 'Axe Slash':
            return AxeSlash;
        case 'Arrow Shot':
            return ArrowShot;
        case 'Haste':
            return Haste;
        case 'Precision':
            return Precision;
        case 'Crippling Shot':
            return CripplingShot;
        case 'Acid Bomb':
            return AcidBomb;
        case 'Axe Swipe':
            return AxeSwipe;
        case 'Sword Swipe':
            return SwordSwipe;
        case 'Magic Shield':
            return MagicShield;
        case 'Energy Ball':
            return EnergyBall;
        case 'Arcane Power':
            return ArcanePower;
        case 'Dexterity Blessing':
            return DexterityBlessing;
        case 'Strength Blessing':
            return StrengthBlessing;
        case 'Intelligence Blessing':
            return IntelligenceBlessing;
        case 'Fire Ball':
            return FireBall;
        case 'Self Heal':
            return SelfHeal;
        case 'Heal':
            return Heal;
        case 'Petrified Hex':
            return PetrifiedHex;
        case 'Shield Bash':
            return ShieldBash;
        case 'Armor Break':
            return ArmorBreak;
        case 'Mind Break':
            return MindBreak;
        case 'Back Stab':
            return BackStab;
        case 'Ether Blade Slash':
            return EtherBladeSlash;
        case 'Magic Punch':
            return MagicPunch;
        case 'Ether Blade Swipe':
            return EtherBladeSwipe;
        // Orders
        case 'Give Me More!':
            return GiveMeMore;
        case 'Regroup!':
            return Regroup;
        case 'Get Ready!':
            return GetReady;
        case 'Fix It!':
            return FixIt;
        case 'Keep Moving!':
            return KeepMoving;
        case 'Do It Again!':
            return DoItAgain;
        case 'Find Him!':
            return FindHim;
        case 'I Need Some Gear!':
            return INeedSomeGear;
        case 'Refresh Me!':
            return RefreshMe;
        case 'Learn Quick!':
            return LearnQuick;
        // Crystals
        case 'Mountains Spirit':
            return MountainsSpirit;
        case 'Forest Spirit':
            return ForestSpirit
        // Objects
        case 'Boulder':
            return Boulder;
        default:
            return '';
    }
}