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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesController = void 0;
const common_1 = require("@nestjs/common");
const tables_service_1 = require("./tables.service");
const create_table_dto_1 = require("./dto/create-table.dto");
const update_table_status_dto_1 = require("./dto/update-table-status.dto");
const update_candidates_dto_1 = require("./dto/update-candidates.dto");
const update_billing_dto_1 = require("./dto/update-billing.dto");
const update_final_selection_dto_1 = require("./dto/update-final-selection.dto");
let TablesController = class TablesController {
    tablesService;
    constructor(tablesService) {
        this.tablesService = tablesService;
    }
    create(createTableDto) {
        return this.tablesService.create(createTableDto);
    }
    findAll(sessionId) {
        return this.tablesService.findAll(sessionId);
    }
    findOne(id) {
        return this.tablesService.findOne(id);
    }
    updateStatus(id, updateTableStatusDto) {
        return this.tablesService.updateStatus(id, updateTableStatusDto.status, updateTableStatusDto.sessionId);
    }
    updateCandidates(id, updateCandidatesDto) {
        return this.tablesService.updateCandidates(id, updateCandidatesDto.dishIds, updateCandidatesDto.sessionId);
    }
    setFinalDishes(id, updateCandidatesDto) {
        return this.tablesService.setFinalDishes(id, updateCandidatesDto.dishIds, updateCandidatesDto.sessionId);
    }
    setFinalSelection(id, updateFinalSelectionDto) {
        return this.tablesService.setFinalSelection(id, updateFinalSelectionDto.dishIds, updateFinalSelectionDto.sessionId);
    }
    updateBilling(id, updateBillingDto) {
        return this.tablesService.updateBilling(id, updateBillingDto.totalExpense, updateBillingDto.sessionId);
    }
};
exports.TablesController = TablesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_table_dto_1.CreateTableDto]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_table_status_dto_1.UpdateTableStatusDto]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/candidates'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_candidates_dto_1.UpdateCandidatesDto]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "updateCandidates", null);
__decorate([
    (0, common_1.Patch)(':id/final'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_candidates_dto_1.UpdateCandidatesDto]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "setFinalDishes", null);
__decorate([
    (0, common_1.Patch)(':id/final-selection'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_final_selection_dto_1.UpdateFinalSelectionDto]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "setFinalSelection", null);
__decorate([
    (0, common_1.Patch)(':id/billing'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_billing_dto_1.UpdateBillingDto]),
    __metadata("design:returntype", void 0)
], TablesController.prototype, "updateBilling", null);
exports.TablesController = TablesController = __decorate([
    (0, common_1.Controller)('tables'),
    __metadata("design:paramtypes", [tables_service_1.TablesService])
], TablesController);
//# sourceMappingURL=tables.controller.js.map