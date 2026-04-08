"use strict";
/**
 * Role groups for Express authorization (align with client `LAYOUT_ALLOWED_ROLES` / dashboards).
 * MEMBER is intentionally omitted: no access to staff module APIs (use /api/auth/* until member routes exist).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGISTRATION_ALLOWED_ROLES = exports.FINANCE_CORE_ROLES = exports.STAFF_MODULE_ROLES = void 0;
exports.STAFF_MODULE_ROLES = [
    'ADMIN',
    'ACCOUNTANT',
    'PASTOR',
    'VOLUNTEER_COORDINATOR',
    'STAFF',
    'MEDIA_DEPARTMENT',
    'KITCHEN_RESTAURANT',
    'MANAGEMENT',
    'USHER_MANAGEMENT',
    'PARTNERS_COORDINATOR',
    'PRAYER_LINE_COORDINATOR',
];
/** Giving, budgets, vendors, expenses — finance team + admin only. */
exports.FINANCE_CORE_ROLES = ['ADMIN', 'ACCOUNTANT'];
/** Self-service signup may only receive these roles (never ADMIN, etc.). */
exports.REGISTRATION_ALLOWED_ROLES = ['USER', 'MEMBER'];
//# sourceMappingURL=accessRoles.js.map