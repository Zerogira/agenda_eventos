"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Requires Super Admin privileges' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
