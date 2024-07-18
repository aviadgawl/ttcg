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
// Actions
import Step from '../assets/images/Step.png';
import BasicHit from '../assets/images/BasicHit.png';
import MightyBlow from '../assets/images/MightyBlow.png';
import DaggerSlash from '../assets/images/DaggerSlash.png';
import DaggerThrow from '../assets/images/DaggerThrow.png';
import Enrage from '../assets/images/Enrage.png';
import UltimateDefense from '../assets/images/UltimateDefense.png';
// Orders
import GiveMeMore from '../assets/images/GiveMeMore.png';
import Regroup from '../assets/images/Regroup.png';
import GetReady from '../assets/images/GetReady.png';

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
        // Orders
        case 'Give Me More!':
            return GiveMeMore;
        case 'Regroup!':
            return Regroup;
        case 'Get Ready!':
            return GetReady;
        default:
            return '';
    }
}