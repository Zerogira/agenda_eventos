"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const router = (0, express_1.Router)();
// All routes require authentication and SUPER_ADMIN role
router.use(auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware);
router.post('/empresas', admin_controller_1.createEmpresa);
router.get('/empresas', admin_controller_1.listEmpresas);
router.get('/empresas/:id', admin_controller_1.getEmpresaDetails);
router.put('/empresas/:id', admin_controller_1.updateEmpresa);
router.delete('/empresas/:id', admin_controller_1.deleteEmpresa);
router.post('/convites', admin_controller_1.createConvite);
router.get('/convites', admin_controller_1.listConvites);
exports.default = router;
