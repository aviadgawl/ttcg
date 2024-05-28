export enum ActionDirections {
    Straight = 'Straight',
    Any = 'Any'
}

export enum Stats {
    Str = 'STR',
    Dex = 'DEX',
    Int = 'INT',
    Hp = 'HP'
}

export enum ActionType {
    Movement = 'Movement',
    Attack = 'Attack',
    Ranged = 'Ranged',
    Magic = 'Magic',
    Buff = 'Buff'
}

export enum GameStatus {
    starting = 1,
    onGoing,
    over
}

export enum GearCategory {
    Swords = 'Swords',
    Axes = 'Axes',
    Daggers = 'Daggers'
}

export enum PlayerActionsName {
    Draw = 'Draw',
    Surrender = 'Surrender',
    Summon = 'Summon',
    EndTurn = 'End Turn',
    InitialDraw = 'Initial Draw',
    Equip = 'Equip',
    Upgrade = 'Upgrade',
    AddCardToDeck = 'Add Card To Deck',
    removeCardFromDeck = 'Remove Card From Deck',
    Attach = 'Attach',
    PlayOrder = 'Play Order'
}

export enum MathModifier {
    Plus = '+',
    Multiply = 'x'
}

export enum EffectStatus {
    Burn = 'Burn',
    Poison = 'Poison',
    Immobilize = 'Immobilize'
}

export enum CardType {
    OrderCard = 'OrderCard'
}