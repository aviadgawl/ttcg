export interface GameCard {
    playerIndex: number;
    image: string;
    name: string;
    hp: number;
    currentHp: number;
    guid: string;
    isBlocking: false;
}

export interface Gear extends GameCard {
    str: number;
    dex: number;
    int: number;
    hp: number;
    bodyPart: string;
}

export const isGear = (value: any): value is Gear => !!value?.bodyPart;