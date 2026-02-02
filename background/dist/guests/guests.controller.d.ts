import { GuestsService } from './guests.service';
import { JoinTableDto } from './dto/join-table.dto';
export declare class GuestsController {
    private readonly guestsService;
    constructor(guestsService: GuestsService);
    join(tableId: string, joinTableDto: JoinTableDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        sessionId: string;
        preferences: string | null;
        tableId: string;
    }>;
    findAll(tableId: string): Promise<({
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
