"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
let VotesService = class VotesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async vote(tableId, sessionId, dishId) {
        const table = await this.prisma.table.findUnique({ where: { id: tableId } });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        if (table.status !== client_1.TableStatus.VOTING) {
            throw new common_1.ForbiddenException('Voting is not open for this table');
        }
        const guest = await this.prisma.guest.findFirst({
            where: { tableId, sessionId },
        });
        if (!guest)
            throw new common_1.ForbiddenException('You must join the table first');
        return this.prisma.vote.upsert({
            where: {
                guestId_dishId_tableId: {
                    guestId: guest.id,
                    dishId,
                    tableId,
                },
            },
            create: {
                guestId: guest.id,
                dishId,
                tableId,
            },
            update: {},
        });
    }
    async unvote(tableId, sessionId, dishId) {
        const table = await this.prisma.table.findUnique({ where: { id: tableId } });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        if (table.status !== client_1.TableStatus.VOTING) {
            throw new common_1.ForbiddenException('Voting is locked');
        }
        const guest = await this.prisma.guest.findFirst({
            where: { tableId, sessionId },
        });
        if (!guest)
            throw new common_1.ForbiddenException('Guest not found');
        return this.prisma.vote.delete({
            where: {
                guestId_dishId_tableId: {
                    guestId: guest.id,
                    dishId,
                    tableId,
                },
            },
        });
    }
    async getHeatmap(tableId) {
        const votes = await this.prisma.vote.groupBy({
            by: ['dishId'],
            where: { tableId },
            _count: {
                id: true,
            },
        });
        return votes.map((v) => ({
            dishId: v.dishId,
            count: v._count.id,
        }));
    }
};
exports.VotesService = VotesService;
exports.VotesService = VotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VotesService);
//# sourceMappingURL=votes.service.js.map