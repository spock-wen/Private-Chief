export interface User {
  id: string;
  phone?: string;
  email?: string;
  wechatOpenId?: string;
  nickname: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export enum Category {
  HOT_DISH = 'HOT_DISH',
  COLD_DISH = 'COLD_DISH',
  SOUP = 'SOUP',
  STAPLE = 'STAPLE',
  DRINK = 'DRINK'
}

export enum TableStatus {
  PLANNING = 'PLANNING',
  VOTING = 'VOTING',
  LOCKED = 'LOCKED',
  ARCHIVED = 'ARCHIVED'
}

export enum FamilyMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN'
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: Category;
  tags: string[];
  allergens?: string;
  familyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  name: string;
  time: string;
  location?: string;
  address?: string;
  addressDetail?: string;
  latitude?: number;
  longitude?: number;
  status: TableStatus;
  totalExpense?: number;
  familyId: string;
  creatorId: string;
  finalDishIds: string[];
  createdAt: string;
  updatedAt: string;
  candidateDishes?: Dish[];
  finalDishes?: Dish[];
  guests?: Guest[];
}

export interface Guest {
  id: string;
  sessionId: string;
  name: string;
  preferences?: string;
  userId?: string;
  tableId: string;
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  address?: string;
  addressDetail?: string;
  latitude?: number;
  longitude?: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  role?: FamilyMemberRole;
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  inviteCode: string;
  createdBy: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  createdAt: string;
}
