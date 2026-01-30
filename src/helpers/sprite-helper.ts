// Basic
import eduardSpriteSheet from '../assets/sprites/eduard-spritesheet.png';
import robinSpriteSheet from '../assets/sprites/robin-spritesheet.png';
import davidSpriteSheet from '../assets/sprites/david-spritesheet.png';
import aronSpriteSheet from '../assets/sprites/aron-spritesheet.png';
import gurakSpriteSheet from '../assets/sprites/gurak-spritesheet.png';
import chironSpriteSheet from '../assets/sprites/chiron-spritesheet.png';
import sethSpriteSheet from '../assets/sprites/seth-spritesheet.png';
import karinaSpriteSheet from '../assets/sprites/karina-spritesheet.png';
import firshaSpriteSheet from '../assets/sprites/karina-spritesheet.png';
import valindraSpriteSheet from '../assets/sprites/valindra-spritesheet.png';
import tarielSpriteSheet from '../assets/sprites/tariel-spritesheet.png';
import tafrandirSpriteSheet from '../assets/sprites/tafrandir-spritesheet.png';

// Upgraded
import eduardHighKnightSpriteSheet from '../assets/sprites/eduard-high-knight-spritesheet.png';
import eduardBarbarianSpriteSheet from '../assets/sprites/eduard-barbarian-spritesheet.png';
import tafrandirBarbarianSpriteSheet from '../assets/sprites/tafrandir-barbarian-spritesheet.png';
import tafrandirHighKnightSpriteSheet from '../assets/sprites/tafrandir-high-knight-spritesheet.png';
import gurakHighKnightSpriteSheet from '../assets/sprites/gurak-high-knight-spritesheet.png';
import gurakBarbarianSpriteSheet from '../assets/sprites/gurak-barbarian-spritesheet.png';
import robinArcherSpriteSheet from '../assets/sprites/robin-archer-spritesheet.png';
import robinShadowSpriteSheet from '../assets/sprites/robin-shadow-spritesheet.png';
import davidBattlePriestSpriteSheet from '../assets/sprites/david-battle-priest-spritesheet.png';
import davidHighPriestSpriteSheet from '../assets/sprites/david-high-priest-spritesheet.png';

export const getSprite = (championName: string, className: string) => {
    switch (`${championName}-${className}`) {
        case 'Eduard-Fighter':
            return eduardSpriteSheet;
        case 'Eduard-High Knight':
            return eduardHighKnightSpriteSheet;
        case 'Eduard-Barbarian':
            return eduardBarbarianSpriteSheet;
        case 'Robin-Rouge':
            return robinSpriteSheet;
        case 'Robin-Hawkeye':
            return robinArcherSpriteSheet;
        case 'Robin-Shadow':
            return robinShadowSpriteSheet;
        case 'David-Acolyte':
            return davidSpriteSheet;
        case 'David-High Priest':
            return davidHighPriestSpriteSheet;
        case 'David-Battle Priest':
            return davidBattlePriestSpriteSheet;
        case 'Aron-Apprentice':
        case 'Aron-War Mage':
        case 'Aron-High Mage':
            return aronSpriteSheet;
        case 'Gurak-Fighter':
            return gurakSpriteSheet;
        case 'Gurak-High Knight':
            return gurakHighKnightSpriteSheet;
        case 'Gurak-Barbarian':
            return gurakBarbarianSpriteSheet;
        case 'Chiron-Acolyte':
        case 'Chiron-High Priest':
        case 'Chiron-Battle Priest':
            return chironSpriteSheet;
        case 'Seth-Rouge':
        case 'Seth-Hawkeye':
        case 'Seth-Shadow':
            return sethSpriteSheet;
        case 'Karina-Apprentice':
        case 'Karina-War Mage':
        case 'Karina-High Mage':
            return karinaSpriteSheet;
        case 'Firsha-Acolyte':
            return firshaSpriteSheet;
        case 'Valindra-Apprentice':
        case 'Valindra-War Mage':
        case 'Valindra-High Mage':
            return valindraSpriteSheet;
        case 'Taeriel-Rouge':
        case 'Taeriel-Hawkeye':
        case 'Taeriel-Shadow':
            return tarielSpriteSheet;
        case 'Tafrandir-Fighter':
            return tafrandirSpriteSheet;
        case 'Tafrandir-Barbarian':
            return tafrandirBarbarianSpriteSheet;
        case 'Tafrandir-High Knight':
            return tafrandirHighKnightSpriteSheet;
        default:
            throw Error(`championName: ${championName} and ${className} are not supported in getSprite`);
    }
};