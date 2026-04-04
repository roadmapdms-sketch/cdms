import { canAccessFinanceModules, sidebarItemsForRole, FINANCE_ALLOWED_ROLES } from './roles';

describe('roles', () => {
  it('canAccessFinanceModules is true only for finance roles', () => {
    expect(canAccessFinanceModules('ADMIN')).toBe(true);
    expect(canAccessFinanceModules('ACCOUNTANT')).toBe(true);
    expect(canAccessFinanceModules('PASTOR')).toBe(false);
    expect(canAccessFinanceModules(undefined)).toBe(false);
  });

  it('sidebarItemsForRole hides finance links for pastor', () => {
    const items = sidebarItemsForRole('PASTOR');
    const hrefs = items.map((i) => i.href);
    expect(hrefs).not.toContain('/financial');
    expect(hrefs).not.toContain('/budget');
    expect(hrefs).toContain('/members');
  });

  it('sidebarItemsForRole includes finance for accountant', () => {
    const items = sidebarItemsForRole('ACCOUNTANT');
    expect(items.some((i) => i.href === '/financial')).toBe(true);
  });

  it('FINANCE_ALLOWED_ROLES matches server finance pair', () => {
    expect([...FINANCE_ALLOWED_ROLES].sort()).toEqual(['ACCOUNTANT', 'ADMIN'].sort());
  });
});
