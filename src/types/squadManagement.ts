
// Define types for squad management sorting and filtering

export enum SortField {
  SQUAD_NUMBER = 'squadNumber',
  NAME = 'name',
  AGE = 'age',
  TECHNICAL = 'technical',
  MENTAL = 'mental',
  PHYSICAL = 'physical',
  GOALKEEPING = 'goalkeeping'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export interface FilterOptions {
  category?: string;
  position?: string;
  searchTerm?: string;
}
