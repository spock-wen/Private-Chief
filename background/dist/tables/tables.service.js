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
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
let TablesService = class TablesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTableDto) {
        const { hostName, ...tableData } = createTableDto;
        const table = await this.prisma.table.create({
            data: {
                ...tableData,
                time: new Date(createTableDto.time),
                status: client_1.TableStatus.PLANNING,
                guests: {
                    create: {
                        sessionId: createTableDto.hostSessionId,
                        name: hostName,
                    },
                },
            },
        });
        return table;
    }
    async findAll(sessionId) {
        const where = sessionId ? { hostSessionId: sessionId } : {};
        return this.prisma.table.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const table = await this.prisma.table.findUnique({
            where: { id },
            include: {
                candidateDishes: true,
                finalDishes: true,
                guests: {
                    include: {
                        votes: true,
                    },
                },
            },
        });
        if (!table) {
            throw new common_1.NotFoundException(`Table with ID ${id} not found`);
        }
        return table;
    }
    async checkHostPermission(tableId, sessionId) {
        const table = await this.prisma.table.findUnique({
            where: { id: tableId },
            select: { hostSessionId: true },
        });
        if (!table) {
            throw new common_1.NotFoundException(`Table with ID ${tableId} not found`);
        }
        if (table.hostSessionId !== sessionId) {
            throw new common_1.ForbiddenException('Only the host can perform this action');
        }
    }
    async updateStatus(id, status, sessionId) {
        const table = await this.findOne(id);
        await this.checkHostPermission(id, sessionId);
        const statusOrder = [
            client_1.TableStatus.PLANNING,
            client_1.TableStatus.VOTING,
            client_1.TableStatus.LOCKED,
            client_1.TableStatus.ARCHIVED,
        ];
        if (statusOrder.indexOf(status) < statusOrder.indexOf(table.status)) {
            throw new common_1.ForbiddenException('Cannot move to a previous status');
        }
        return this.prisma.table.update({
            where: { id },
            data: { status },
        });
    }
    async updateCandidates(id, dishIds, sessionId) {
        const table = await this.findOne(id);
        await this.checkHostPermission(id, sessionId);
        if (table.status !== client_1.TableStatus.PLANNING) {
            throw new common_1.ForbiddenException('Cannot edit candidate dishes after planning phase');
        }
        return this.prisma.table.update({
            where: { id },
            data: {
                candidateDishes: {
                    set: dishIds.map((dishId) => ({ id: dishId })),
                },
            },
            include: {
                candidateDishes: true,
            },
        });
    }
    async setFinalDishes(id, dishIds, sessionId) {
        const table = await this.findOne(id);
        await this.checkHostPermission(id, sessionId);
        if (table.status === client_1.TableStatus.ARCHIVED) {
            throw new common_1.ForbiddenException('Cannot edit menu after table is archived');
        }
        return this.prisma.table.update({
            where: { id },
            data: {
                finalDishes: {
                    set: dishIds.map((dishId) => ({ id: dishId })),
                },
            },
            include: {
                finalDishes: true,
            },
        });
    }
    async setFinalSelection(id, dishIds, sessionId) {
        const table = await this.findOne(id);
        await this.checkHostPermission(id, sessionId);
        if (table.status === client_1.TableStatus.ARCHIVED) {
            throw new common_1.ForbiddenException('Cannot edit menu after table is archived');
        }
        return this.prisma.table.update({
            where: { id },
            data: {
                finalDishIds: dishIds,
            },
        });
    }
    async updateBilling(id, totalExpense, sessionId) {
        const table = await this.findOne(id);
        await this.checkHostPermission(id, sessionId);
        if (table.status !== client_1.TableStatus.LOCKED &&
            table.status !== client_1.TableStatus.ARCHIVED) {
            throw new common_1.ForbiddenException('Billing can only be set after table is locked or archived');
        }
        const guestCount = table.guests.length;
        const perPerson = guestCount > 0 ? totalExpense / guestCount : 0;
        const updatedTable = await this.prisma.table.update({
            where: { id },
            data: { totalExpense },
        });
        return {
            ...updatedTable,
            guestCount,
            perPerson: parseFloat(perPerson.toFixed(2)),
        };
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TablesService);
//# sourceMappingURL=tables.service.js.map