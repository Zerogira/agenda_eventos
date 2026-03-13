"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Rota pública para usuários logados criarem logs (ex: Frontend actions)
router.post('/log', audit_controller_1.createLog);
router.use(admin_middleware_1.adminMiddleware);
router.get('/', audit_controller_1.listAuditLogs);
exports.default = router;
