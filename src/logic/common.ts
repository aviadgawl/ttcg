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