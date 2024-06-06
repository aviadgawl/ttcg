// Champions
import EduardImage from '../assets/images/Eduard.png';
import RobinImage from '../assets/images/Robin.png';
// Upgrades
import HighKnightImage from '../assets/images/HighKnight.png';
// Gear
import SimpleSword from '../assets/images/SimpleSword.png';
import SimpleDagger from '../assets/images/SimpleDagger.png';
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

export const getImage = (id: string): string => {
    switch (id) {
        // Champions
        case 'Eduard':
            return EduardImage;
        case 'Robin':
            return RobinImage;
        // Upgrades
        case 'High Knight':
            return HighKnightImage;
        // Gear
        case 'Simple Sword':
            return SimpleSword;
        case 'Simple Dagger':
            return SimpleDagger;
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
        default:
            return '';
    }
}