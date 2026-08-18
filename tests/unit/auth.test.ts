import { describe, it, expect } from 'vitest';
import { Role, ROLE_LABELS, ROLE_HOME_PATHS, ROLE_LEVELS } from '../../frontend/src/security/roles/roles';
import { Permission } from '../../frontend/src/security/permissions/permissions';

describe('RBAC & Roles Specifications Unit Tests', () => {
  describe('Role mappings validation', () => {
    it('should match roles to their corporate titles', () => {
      expect(ROLE_LABELS[Role.ADMIN]).toBe('System Administrator');
      expect(ROLE_LABELS[Role.HR]).toBe('HR Operations Manager');
      expect(ROLE_LABELS[Role.MANAGER]).toBe('Department Manager');
    });

    it('should route roles to correct dashboard entry points', () => {
      expect(ROLE_HOME_PATHS[Role.ADMIN]).toBe('/admin/dashboard');
      expect(ROLE_HOME_PATHS[Role.EMPLOYEE]).toBe('/employee/dashboard');
    });

    it('should declare strict nested hierarchy ranks', () => {
      expect(ROLE_LEVELS[Role.ADMIN]).toBe(0); // Top level
      expect(ROLE_LEVELS[Role.HR]).toBe(1);
      expect(ROLE_LEVELS[Role.MANAGER]).toBe(2);
      expect(ROLE_LEVELS[Role.TEAM_LEAD]).toBe(3);
      expect(ROLE_LEVELS[Role.EMPLOYEE]).toBe(4); // Base level
    });
  });

  describe('Permission aliases mapping checks', () => {
    it('should map legacy permission codes to correct modern counterparts', () => {
      expect(Permission.SYSTEM_ALL).toBe(Permission.VIEW_ALL_DATA);
      expect(Permission.EMPLOYEE_SELF).toBe(Permission.PROFILE_VIEW);
      expect(Permission.REPORT_CREATE).toBe(Permission.REPORT_GENERATE);
    });
  });
});
