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
exports.DishesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let DishesService = class DishesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDishDto) {
        return this.prisma.dish.create({
            data: createDishDto,
        });
    }
    async findAll(query) {
        const where = {};
        if (query?.name) {
            where.name = { contains: query.name, mode: 'insensitive' };
        }
        if (query?.category) {
            where.category = query.category;
        }
        if (query?.tags && query.tags.length > 0) {
            where.tags = { hasSome: query.tags };
        }
        return this.prisma.dish.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.dish.findUnique({
            where: { id },
        });
    }
    async update(id, updateDishDto) {
        return this.prisma.dish.update({
            where: { id },
            data: updateDishDto,
        });
    }
    async remove(id) {
        return this.prisma.dish.delete({
            where: { id },
        });
    }
    async removeMany(ids) {
        return this.prisma.dish.deleteMany({
            where: { id: { in: ids } },
        });
    }
};
exports.DishesService = DishesService;
exports.DishesService = DishesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DishesService);
//# sourceMappingURL=dishes.service.js.map