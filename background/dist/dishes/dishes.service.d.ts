import { PrismaService } from '../prisma.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Category } from '@prisma/client';
export declare class DishesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDishDto: CreateDishDto): Promise<{
        name: string;
        description: string | null;
        image: string | null;
        category: import(".prisma/client").$Enums.Category;
        tags: string[];
        allergens: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query?: {
        name?: string;
        category?: Category;
        tags?: string[];
    }): Promise<{
        name: string;
        description: string | null;
        image: string | null;
        category: import(".prisma/client").$Enums.Category;
        tags: string[];
        allergens: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        description: string | null;
        image: string | null;
        category: import(".prisma/client").$Enums.Category;
        tags: string[];
        allergens: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: string, updateDishDto: UpdateDishDto): Promise<{
        name: string;
        description: string | null;
        image: string | null;
        category: import(".prisma/client").$Enums.Category;
        tags: string[];
        allergens: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        name: string;
        description: string | null;
        image: string | null;
        category: import(".prisma/client").$Enums.Category;
        tags: string[];
        allergens: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeMany(ids: string[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
