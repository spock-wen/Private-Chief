import { PrismaService } from '../prisma.service';
export declare class VotesService {
    private prisma;
    constructor(prisma: PrismaService);
    vote(tableId: string, sessionId: string, dishId: string): Promise<{
        id: string;
        guestId: string;
        dishId: string;
        tableId: string;
        createdAt: Date;
    }>;
    unvote(tableId: string, sessionId: string, dishId: string): Promise<{
        id: string;
        guestId: string;
        dishId: string;
        tableId: string;
        createdAt: Date;
    }>;
    getHeatmap(tableId: string): Promise<{
        dishId: string;
        count: number;
    }[]>;
}
