export enum ActionDirections {
    Straight = 'Straight',
    Any = 'Any'
};

export enum Stats {
    Str = 'STR',
    Dex = 'DEX',
    Int = 'INT',
    Hp = 'HP'
};

export enum ActionType {
    Movement = 'Movement',
    Attack = 'Attack',
    Ranged = 'Ranged',
    Magic = 'Magic',
    Buff = 'Buff'
};

export enum GameStatus {
    starting = 1,
    onGoing,
    over,
    started
};

export enum GearCategory {
    Swords = 'Swords',
    Axes = 'Axes',
    Daggers = 'Daggers',
    Armors = 'Armors',
    Bows = 'Bows'
};

export enum PlayerActionsName {
    Draw = 'Draw',
    Surrender = 'Surrender',
    Summon = 'Summon',
    EndTurn = 'End Turn',
    InitialDraw = 'Initial Draw',
    Equip = 'Equip',
    Upgrade = 'Upgrade',
    AddCardToDeck = 'Add Card To Deck',
    RemoveCardFromDeck = 'Remove Card From Deck',
    Attach = 'Attach',
    PlayOrder = 'Play Order',
    ClearDeck = 'Clear Deck'
};

export enum MathModifier {
    Plus = '+',
    Multiply = 'x'
};

export enum EffectStatus {
    Burn = 'Burn',
    Poison = 'Poison',
    Immobilize = 'Immobilize',
    PhysicalImmunity = 'Physical Immunity',
    Silence = 'Silence',
    StrBoost = 'STR Boost',
    DexBoost = 'DEX Boost',
    IntBoost = 'INT Boost',
    StrRedaction = "STR Redaction",
    DexRedaction = "Dex Redaction",
    IntRedaction = "Int Redaction"
};

export enum CardType {
    OrderCard = 'OrderCard',
    GearCard = 'GearCard',
    ActionCard = 'ActionCard',
    ChampionCard = 'ChampionCard'
};

export enum RewardType {
    Draw = 'Draw',
    ConditionedDraw = 'ConditionedDraw',
    ReturnUsedCard = 'ReturnUsedCard',
    SpecificDraw = 'SpecificDraw',
    ReturnUsedCardToDeck = 'ReturnUsedCardToDeck',
    PlayExtraClassUpgrade = 'PlayExtraClassUpgrade'
};

export enum ChampionDirection {
    Up = 0,
    Down,
    Left,
    Right
};

export enum BodyPart {
    Hand = 'Hand',
    Hands = 'Hands',
    Body = 'Body'
};

export enum Race {
    Humans = 'Humans',
    Orcs = 'Orcs',
    Elfs = 'Elfs'
};