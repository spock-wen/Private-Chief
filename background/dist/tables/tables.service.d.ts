import { PrismaService } from '../prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { TableStatus } from '@prisma/client';
export declare class TablesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTableDto: CreateTableDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        time: Date;
        location: string | null;
        hostSessionId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        totalExpense: number | null;
        finalDishIds: string[];
    }>;
    findAll(sessionId?: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        time: Date;
        location: string | null;
        hostSessionId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        totalExpense: number | null;
        finalDishIds: string[];
    }[]>;
    findOne(id: string): Promise<{
        candidateDishes: {
            name: string;
            description: string | null;
            image: string | null;
            category: import(".prisma/client").$Enums.Category;
            tags: string[];
            allergens: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        finalDishes: {
            name: string;
            description: string | null;
            image: string | null;
            category: import(".prisma/client").$Enums.Category;
            tags: string[];
            allergens: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        guests: ({
            votes: {
                id: string;
                createdAt: Date;
                tableId: string;
                guestId: string;
                dishId: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            sessionId: string;
            preferences: string | null;
            tableId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        time: Date;
        location: string | null;
        hostSessionId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        totalExpense: number | null;
        finalDishIds: string[];
    }>;
    private checkHostPermission;
    updateStatus(id: string, status: TableStatus, sessionId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        time: Date;
        location: string | null;
        hostSessionId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        totalExpense: number | null;
        finalDishIds: string[];
    }>;
    updateCandidates(id: string, dishIds: string[], sessionId: string): Promise<{
        candidateDishes: {
            name: string;
            description: string | null;
            image: string | null;
            category: import(".prisma/client").$Enums.Category;
            tags: string[];
            allergens: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        time: Date;
        location: string | null;
        hostSessionId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        totalExpense: number | null;
        finalDishIds: string[];
    }>;
    setFinalDishes(id: string, dishIds: string[], sessionId: string): Promise<{
        finalDishes: {
            name: string;
            description: string | null;
            image: string | null;
            category: import(".prisma/client").$Enums.Category;
            tags: string[];
            allergens: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        time: Date;
        location: string | null;
        hostSessionId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        totalExpense: number | null;
        finalDishIds: string[];
    }>;
    setFinalSelection(id: string, dishIds: string[], sessionId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        time: Date;
        location: string | null;
        hostSessionId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        totalExpense: number | null;
        finalDishIds: string[];
    }>;
    updateBilling(id: string, totalExpense: number, sessionId: string): Promise<{
        guestCount: number;
        perPerson: number;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        time: Date;
        location: string | null;
        hostSessionId: string;
        status: import(".prisma/client").$Enums.TableStatus;
        totalExpense: number | null;
        finalDishIds: string[];
    }>;
}
