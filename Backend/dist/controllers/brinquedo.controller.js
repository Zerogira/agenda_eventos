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
exports.createBrinquedo = exports.listBrinquedos = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const zod_1 = require("zod");
const createBrinquedoSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3),
    descricao: zod_1.z.string().optional(),
    marca: zod_1.z.string().optional(),
    quantidade_total: zod_1.z.number().int().min(0),
    necessita_funcionario: zod_1.z.boolean().optional(),
    ativo: zod_1.z.boolean().optional(),
});
const listBrinquedos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            return res.status(401).json({ message: 'Unauthorized' });
        const brinquedos = yield prisma_1.default.brinquedo.findMany({
            where: { empresaId },
            orderBy: { nome: 'asc' },
        });
        res.json(brinquedos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.listBrinquedos = listBrinquedos;
const createBrinquedo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const data = createBrinquedoSchema.parse(req.body);
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            return res.status(401).json({ message: 'Unauthorized' });
        const brinquedo = yield prisma_1.default.brinquedo.create({
            data: Object.assign(Object.assign({}, data), { empresaId }),
        });
        res.status(201).json(brinquedo);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Validation Error',
                errors: error.errors.map(e => e.message),
            });
        }
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            errors: [error.message]
        });
    }
});
exports.createBrinquedo = createBrinquedo;
