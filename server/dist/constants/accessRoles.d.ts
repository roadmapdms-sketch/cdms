/**
 * Role groups for Express authorization (align with client `LAYOUT_ALLOWED_ROLES` / dashboards).
 * MEMBER is intentionally omitted: no access to staff module APIs (use /api/auth/* until member routes exist).
 */
export declare const STAFF_MODULE_ROLES: string[];
/** Giving, budgets, vendors, expenses — finance team + admin only. */
export declare const FINANCE_CORE_ROLES: string[];
/** Self-service signup may only receive these roles (never ADMIN, etc.). */
export declare const REGISTRATION_ALLOWED_ROLES: string[];
//# sourceMappingURL=accessRoles.d.ts.map