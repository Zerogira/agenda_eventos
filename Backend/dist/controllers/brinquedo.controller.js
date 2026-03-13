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
exports.deleteBrinquedo = exports.updateBrinquedo = exports.getBrinquedo = exports.createBrinquedo = exports.listBrinquedos = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const brinquedo_validator_1 = require("../validators/brinquedo.validator");
const AppError_1 = require("../utils/AppError");
const listBrinquedos = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const brinquedos = yield prisma_1.default.brinquedo.findMany({
            where: { empresaId },
            orderBy: { nome: 'asc' },
        });
        res.json({ success: true, data: brinquedos });
    }
    catch (error) {
        next(error);
    }
});
exports.listBrinquedos = listBrinquedos;
const createBrinquedo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const data = brinquedo_validator_1.createBrinquedoSchema.parse(req.body);
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const brinquedo = yield prisma_1.default.brinquedo.create({
            data: Object.assign(Object.assign({}, data), { empresaId }),
        });
        req.log.info({
            action: 'create_brinquedo',
            empresaId,
            usuarioId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            brinquedoId: brinquedo.id,
            nome: brinquedo.nome
        }, 'Brinquedo criado com sucesso');
        res.status(201).json({ success: true, data: brinquedo });
    }
    catch (error) {
        next(error);
    }
});
exports.createBrinquedo = createBrinquedo;
const getBrinquedo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const brinquedo = yield prisma_1.default.brinquedo.findUnique({
            where: { id: Number(id) },
        });
        if (!brinquedo || brinquedo.empresaId !== empresaId) {
            throw new AppError_1.AppError('Brinquedo não encontrado', 404);
        }
        res.json({ success: true, data: brinquedo });
    }
    catch (error) {
        next(error);
    }
});
exports.getBrinquedo = getBrinquedo;
const updateBrinquedo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        // Use partial schema for updates, or full schema if you expect full replacement
        // Based on user request "campos obrigatórios devem ser verificados", usually PUT implies full replacement or validation of provided fields.
        // If the frontend sends the whole object, createBrinquedoSchema works.
        // However, for robust APIs, if I send only { nome: "Novo" }, it should work if it's PATCH.
        // Express doesn't strictly distinguish PUT/PATCH body validation unless we force it.
        // I'll use updateBrinquedoSchema which is partial, BUT check if mandatory fields are null in DB if creating? No, this is update.
        // If user wants to enforce "valorUnitario" is present, they should send it.
        // But if the frontend sends the whole object, createBrinquedoSchema is safer to ensure nothing is missing.
        // I will use createBrinquedoSchema because the previous code used it, implying full update.
        const data = brinquedo_validator_1.createBrinquedoSchema.parse(req.body);
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const brinquedo = yield prisma_1.default.brinquedo.findUnique({
            where: { id: Number(id) },
        });
        if (!brinquedo || brinquedo.empresaId !== empresaId) {
            throw new AppError_1.AppError('Brinquedo não encontrado', 404);
        }
        const updatedBrinquedo = yield prisma_1.default.brinquedo.update({
            where: { id: Number(id) },
            data: Object.assign({}, data),
        });
        req.log.info({
            action: 'update_brinquedo',
            empresaId,
            usuarioId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            brinquedoId: updatedBrinquedo.id,
            nome: updatedBrinquedo.nome
        }, 'Brinquedo atualizado com sucesso');
        res.json({ success: true, data: updatedBrinquedo });
    }
    catch (error) {
        next(error);
    }
});
exports.updateBrinquedo = updateBrinquedo;
const deleteBrinquedo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const brinquedo = yield prisma_1.default.brinquedo.findUnique({
            where: { id: Number(id) },
        });
        if (!brinquedo || brinquedo.empresaId !== empresaId) {
            throw new AppError_1.AppError('Brinquedo não encontrado', 404);
        }
        yield prisma_1.default.brinquedo.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ success: true, message: 'Brinquedo excluído com sucesso' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteBrinquedo = deleteBrinquedo;
