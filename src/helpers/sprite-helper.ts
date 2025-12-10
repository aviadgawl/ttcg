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

export const getSprite = (championName: string, className: string) => {
    switch (`${championName}-${className}`) {
        case 'Eduard-Fighter':
            return eduardSpriteSheet;
        case 'Eduard-High Knight':
            return eduardHighKnightSpriteSheet;
        case 'Eduard-Barbarian':
            return eduardBarbarianSpriteSheet;
        case 'Robin-':
            return robinSpriteSheet;
        case 'David-':
            return davidSpriteSheet;
        case 'Aron-':
            return aronSpriteSheet;
        case 'Gurak-Fighter':
            return gurakSpriteSheet;
        case 'Gurak-High Knight':
            return gurakHighKnightSpriteSheet;
        case 'Chiron-':
            return chironSpriteSheet;
        case 'Seth-':
            return sethSpriteSheet;
        case 'Karina-':
            return karinaSpriteSheet;
        case 'Firsha-':
            return firshaSpriteSheet;
        case 'Valindra-':
            return valindraSpriteSheet;
        case 'Taeriel-':
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