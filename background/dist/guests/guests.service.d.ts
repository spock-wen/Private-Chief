import { PrismaService } from '../prisma.service';
import { JoinTableDto } from './dto/join-table.dto';
export declare class GuestsService {
    private prisma;
    constructor(prisma: PrismaService);
    joinTable(tableId: string, joinTableDto: JoinTableDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        sessionId: string;
        preferences: string | null;
        tableId: string;
    }>;
    findByTable(tableId: string): Promise<({
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
    })[]>;
}
