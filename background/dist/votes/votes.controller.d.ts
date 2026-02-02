import { VotesService } from './votes.service';
import { VoteDto } from './dto/vote.dto';
export declare class VotesController {
    private readonly votesService;
    constructor(votesService: VotesService);
    vote(tableId: string, voteDto: VoteDto): Promise<{
        id: string;
        guestId: string;
        dishId: string;
        tableId: string;
        createdAt: Date;
    }>;
    unvote(tableId: string, dishId: string, sessionId: string): Promise<{
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
