import { ActionDirections, Stats, ChampionActionsName } from './enums';

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
    guid: string;
}

export interface SummoningCard extends GameCard {
    hp: number;
    currentHp: number;
    isBlocking: boolean;
}

export interface CrystalCard extends SummoningCard {
    effect: GameEffect|null
}

export interface GearCard extends GameCard {
    str: number;
    dex: number;
    int: number;
    hp: number;
    bodyPart: string;
}

export interface ActionCard extends GameCard {
    distance: number;
    direction: ActionDirections;
    dmgStat: Stats|null;
    dmgModifier: string|null;
    dmgModifierValue: number;
    requiredClass: string|null;
    requiredStat: number|null;
    requiredStatValue: number|null;
    requiredGear: string|null;
}

export interface ClassCard extends SummoningCard {
    str: number;
    dex: number;
    int: number;
    action: ChampionActionsName;
    requiredClass: string;
    class: string;
}

export interface ChampionCard extends SummoningCard {

    str: number;
    calStr: number;
    armor: number;
    dex: number;
    calDex: number;

    int: number;
    calInt: number;
    mental: number;

    stm: number;

    actions: ChampionActionsName[];
    calActions: string[];

    body: GearCard | null;
    rightHand: GearCard | null;
    leftHand: GearCard | null;

    class: string;
    calClass: string;
    upgrade: ClassCard | null;
}

export const isCrystal = (value: any): value is GearCard => !!value?.effect || value?.effect === null;

export const isGear = (value: any): value is GearCard => !!value?.bodyPart;

export const isSummoning = (value: any): value is GearCard => !!value?.hp || value?.hp === null;