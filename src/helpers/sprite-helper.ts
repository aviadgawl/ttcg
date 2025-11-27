import eduardSpriteSheet from '../assets/sprites/eduard-spritesheet.png';
import robinSpriteSheet from '../assets/sprites/robin-spritesheet.png';
import davidSpriteSheet from '../assets/sprites/david-spritesheet.png';
import aronSpriteSheet from '../assets/sprites/aron-spritesheet.png';
import gurakSpriteSheet from '../assets/sprites/gurak-spritesheet.png';
import chironSpriteSheet from '../assets/sprites/chiron-spritesheet.png';
import sethSpriteSheet from '../assets/sprites/chiron-spritesheet.png';
import karinaSpriteSheet from '../assets/sprites/karina-spritesheet.png';
import firshaSpriteSheet from '../assets/sprites/karina-spritesheet.png';
import valindraSpriteSheet from '../assets/sprites/valindra-spritesheet.png';
import tarielSpriteSheet from '../assets/sprites/tariel-spritesheet.png';

export const getSprite = (championName: string) => {
    switch (championName) {
        case 'Eduard':
            return eduardSpriteSheet;
        case 'Robin':
            return robinSpriteSheet;
        case 'David':
            return davidSpriteSheet;
        case 'Aron':
            return aronSpriteSheet;
        case 'Gurak':
            return gurakSpriteSheet;
        case 'Chiron':
            return chironSpriteSheet;
        case 'Seth':
            return sethSpriteSheet;
        case 'Karina':
            return karinaSpriteSheet;
        case 'Firsha':
            return firshaSpriteSheet;
        case 'Valindra':
            return valindraSpriteSheet;
        case 'Taeriel':
            return tarielSpriteSheet;
        default:
            throw Error(`champion name ${championName} is not supported`);
    }
};