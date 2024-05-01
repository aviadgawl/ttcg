import { ActionDirections, Stats, ActionType } from './enums';

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
    actionType: ActionType;
    distance: number;
    direction: ActionDirections|null;
    dmgStat: Stats|null;
    dmgModifier: string|null;
    dmgModifierValue: number|null;
    requiredClassName: string|null;
    requiredStat: Stats|null;
    requiredStatValue: number|null;
    requiredGearName: string|null;
}

export interface ClassCard extends SummoningCard {
    str: number;
    dex: number;
    int: number;
    learnedAction: string;
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

    learnedActions: string[];
    learnedActionsCards: ActionCard[];
    attachedActionsCards: ActionCard[];

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

export const isClass = (value: any): value is ClassCard => !!value?.learnedAction;

export const isChampion = (value: any): value is ChampionCard => !!value?.learnedActions;

export const isAction = (value: any): value is ActionCard => !!value?.actionType;