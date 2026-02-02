export const Category = {
  HOT_DISH: 'HOT_DISH',
  COLD_DISH: 'COLD_DISH',
  SOUP: 'SOUP',
  STAPLE: 'STAPLE',
  DRINK: 'DRINK',
} as const;

export type Category = typeof Category[keyof typeof Category];

export const TableStatus = {
  PLANNING: 'PLANNING',
  VOTING: 'VOTING',
  LOCKED: 'LOCKED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type TableStatus = typeof TableStatus[keyof typeof TableStatus];

export interface Dish {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: Category;
  tags: string[];
  allergens?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  sessionId: string;
  name: string;
  preferences?: string;
  tableId: string;
  votes: Vote[];
}

export interface Vote {
  id: string;
  guestId: string;
  dishId: string;
  tableId: string;
}

export interface Table {
  id: string;
  name: string;
  time: string;
  location?: string;
  status: TableStatus;
  totalExpense?: number;
  hostSessionId: string;
  candidateDishes: Dish[];
  finalDishIds: string[];
  finalDishes: Dish[];
  guests: Guest[];
  createdAt: string;
}
