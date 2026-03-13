"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
exports.auditService = {
    log(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.auditLog.create({
                    data: {
                        empresaId: data.empresaId,
                        userId: data.userId,
                        action: data.action,
                        resource: data.resource,
                        resourceId: data.resourceId,
                        details: data.details || {},
                        ipAddress: data.ipAddress,
                        userAgent: data.userAgent,
                    },
                });
            }
            catch (error) {
                console.error('Failed to create audit log:', error);
                // We don't throw error to avoid failing the main request
            }
        });
    },
    list(empresaId_1) {
        return __awaiter(this, arguments, void 0, function* (empresaId, page = 1, limit = 20, filters) {
            const skip = (page - 1) * limit;
            const where = { empresaId };
            if (filters === null || filters === void 0 ? void 0 : filters.userId)
                where.userId = filters.userId;
            if (filters === null || filters === void 0 ? void 0 : filters.action)
                where.action = { contains: filters.action, mode: 'insensitive' };
            if (filters === null || filters === void 0 ? void 0 : filters.resource)
                where.resource = { contains: filters.resource, mode: 'insensitive' };
            const [total, logs] = yield Promise.all([
                prisma_1.default.auditLog.count({ where }),
                prisma_1.default.auditLog.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                nome: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip,
                    take: limit,
                }),
            ]);
            return {
                data: logs,
                meta: {
                    total,
                    page,
                    lastPage: Math.ceil(total / limit),
                },
            };
        });
    },
};
