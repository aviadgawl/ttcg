import { ActionDirections, Stats, ActionType, GearCategory, MathModifier, EffectStatus, CardType, ChampionDirection, Race, RewardType } from './enums';

export interface ValidationResult {
    message: string;
    isValid: boolean;
}

export interface BoardLocation {
    rowIndex: number;
    columnIndex: number;
}

export interface AllowedBoardLocationResponse {
    message: string;
    locations: BoardLocation[];
}

export interface AllowedHandCardSelectResponse {
    message: string;
    handCards: GameCard[];
}

export interface OrderCardReward {
    name: RewardType,
    amount: number,
    cardType: CardType|null,
    cardNameContains: string|null,
    condition: string|null
}

export interface OrderCardRequirement {
    name: string,
    amount: number,
    cardType: CardType | null
}

export interface GameEffect {
    area: string,
    attribute: string,
    value: number,
    duration: number
}

export interface PlayerEffect {
    type: RewardType,
    duration: number
}

export interface StatusEffect {
    name: EffectStatus,
    duration: number,
    stat: Stats | null,
    value: number | null
}

export interface GameCard {
    playerIndex: number;
    image: string;
    name: string;
    guid: string;
}

export interface SummoningCard extends GameCard {
    hp: number;
    calHp: number;
    currentHp: number;
    isBlocking: boolean;
}

export interface CrystalCard extends SummoningCard {
    effect: GameEffect | null
}

export interface GearCard extends GameCard {
    str: number;
    dex: number;
    int: number;
    hp: number;
    bodyPart: string;
    category: GearCategory;
}

export interface OrderCard extends GameCard {
    duration: number;
    info: string;
    requirement: OrderCardRequirement[],
    reward: OrderCardReward
}

export interface Damage {
    dmgStat: Stats | null;
    dmgModifier: MathModifier | null;
    dmgModifierValue: number | null;
}

export interface ActionCard extends GameCard {
    actionType: ActionType;
    distance: number[];
    direction: ActionDirections;
    damages: Damage[]
    requiredClassName: string | null;
    requiredStat: Stats | null;
    requiredStatValue: number | null;
    requiredGearCategory: GearCategory | null;
    isFreeTargeting: boolean;
    targetEffects: StatusEffect[];
    isRepeatable: boolean;
    isBackTargeting: boolean;
    repeatableStat: Stats | null;
    repeatableActivationLeft: number | null;
    wasPlayed: boolean;
    hitAreas: { [key: number]: HitArea };
    isHeal: boolean;
}

export interface ClassCard extends GameCard {
    str: number;
    dex: number;
    int: number;
    hp: number;
    learnedAction: string;
    requiredClassName: string;
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
    
    race: Race;

    statusEffects: StatusEffect[];
    direction: ChampionDirection;
}

export interface PlayerActionLogRecord {
    name: string;
    guid: string|null;
}

export interface HitArea {
    right: number;
    left: number;
}

export const isCrystal = (value: any): value is CrystalCard => !!value?.effect;

export const isGear = (value: any): value is GearCard => !!value?.bodyPart;

export const isSummoning = (value: any): value is GameCard => !!value?.hp;

export const isClass = (value: any): value is ClassCard => !!value?.learnedAction;

export const isChampion = (value: any): value is ChampionCard => !!value?.learnedActions;

export const isAction = (value: any): value is ActionCard => !!value?.actionType;

export const isOrder = (value: any): value is OrderCard => !!value?.info;