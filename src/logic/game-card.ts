export interface GameEffect {
    area: string,
    attribute: string,
    value: number,
    duration: number
}

export interface GameCard {
    playerIndex: number;
    image: string;
    name: string;
    hp: number;
    currentHp: number;
    guid: string;
    isBlocking: boolean;
}

export interface Gear extends GameCard {
    str: number;
    dex: number;
    int: number;
    hp: number;
    bodyPart: string;
}

export interface Crystal extends GameCard {
    effect: GameEffect|null
}

export const isCrystal = (value: any): value is Gear => !!value?.effect || value?.effect === null;

export const isGear = (value: any): value is Gear => !!value?.bodyPart;