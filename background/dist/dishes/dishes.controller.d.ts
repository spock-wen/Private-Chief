import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Category } from '@prisma/client';
export declare class DishesController {
    private readonly dishesService;
    constructor(dishesService: DishesService);
    create(createDishDto: CreateDishDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        category: import(".prisma/client").$Enums.Category;
        tags: string[];
        allergens: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(name?: string, category?: Category, tags?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        category: import(".prisma/client").$Enums.Category;
        tags: string[];
        allergens: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        category: import(".prisma/client").$Enums.Category;
        tags: string[];
        allergens: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: string, updateDishDto: UpdateDishDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        category: import(".prisma/client").$Enums.Category;
        tags: string[];
        allergens: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    putUpdate(id: string, updateDishDto: UpdateDishDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        category: import(".prisma/client").$Enums.Category;
        tags: string[];
        allergens: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        category: import(".prisma/client").$Enums.Category;
        tags: string[];
        allergens: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeMany(ids: string[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
