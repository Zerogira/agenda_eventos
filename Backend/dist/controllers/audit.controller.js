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
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogs = exports.createLog = void 0;
const audit_service_1 = require("../services/audit.service");
const createLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { action, resource, resourceId, details } = req.body;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!empresaId || !userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        yield audit_service_1.auditService.log({
            empresaId,
            userId,
            action,
            resource,
            resourceId,
            details,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.status(201).json({ message: 'Log created' });
    }
    catch (error) {
        console.error('Error creating audit log:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createLog = createLog;
const listAuditLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const filters = {
            userId: req.query.userId,
            action: req.query.action,
            resource: req.query.resource,
        };
        const result = yield audit_service_1.auditService.list(empresaId, page, limit, filters);
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.listAuditLogs = listAuditLogs;
