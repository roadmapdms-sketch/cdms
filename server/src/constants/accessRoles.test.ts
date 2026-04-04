import { FINANCE_CORE_ROLES, REGISTRATION_ALLOWED_ROLES, STAFF_MODULE_ROLES } from './accessRoles';

describe('accessRoles', () => {
  it('FINANCE_CORE_ROLES is admin and accountant only', () => {
    expect(FINANCE_CORE_ROLES).toEqual(['ADMIN', 'ACCOUNTANT']);
  });

  it('MEMBER is not in STAFF_MODULE_ROLES', () => {
    expect(STAFF_MODULE_ROLES).not.toContain('MEMBER');
  });

  it('REGISTRATION_ALLOWED_ROLES excludes privileged roles', () => {
    expect(REGISTRATION_ALLOWED_ROLES).toEqual(['USER', 'MEMBER']);
    expect(REGISTRATION_ALLOWED_ROLES).not.toContain('ADMIN');
  });
});
