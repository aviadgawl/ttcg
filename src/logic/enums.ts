export enum ActionDirections {
    Straight = 'Straight',
    None = 'None'
}

export enum Stats {
    Str = 'STR',
    Dex = 'DEX',
    Int = 'INT'
}

export enum ActionType {
    Movement = 0,
    Attack = 1,
    Ranged = 2,
    Magic = 3
}

export enum GameStatus {
    starting = 1,
    onGoing,
    over
}

export enum GearCategory {
    swords = 0,
    axes,
    daggers
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