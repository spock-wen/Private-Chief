import { Category } from '@prisma/client';
export declare class CreateDishDto {
    name: string;
    description?: string;
    image?: string;
    category: Category;
    tags?: string[];
    allergens?: string;
}
