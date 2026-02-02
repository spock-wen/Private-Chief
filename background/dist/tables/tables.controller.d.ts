import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { UpdateCandidatesDto } from './dto/update-candidates.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { UpdateFinalSelectionDto } from './dto/update-final-selection.dto';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
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
    updateStatus(id: string, updateTableStatusDto: UpdateTableStatusDto): Promise<{
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
    updateCandidates(id: string, updateCandidatesDto: UpdateCandidatesDto): Promise<{
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
    setFinalDishes(id: string, updateCandidatesDto: UpdateCandidatesDto): Promise<{
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
    setFinalSelection(id: string, updateFinalSelectionDto: UpdateFinalSelectionDto): Promise<{
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
    updateBilling(id: string, updateBillingDto: UpdateBillingDto): Promise<{
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
