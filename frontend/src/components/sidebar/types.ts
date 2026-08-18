import { Role } from '../../security/roles/roles';
import { Permission } from '../../security/permissions/permissions';

export interface MenuItemConfig {
  id: string;
  title: string;
  icon: string;
  path?: string;
  roles?: Role[];
  permissions?: Permission[];
  departmentScope?: string[];
  badge?: {
    text: string;
    variant: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose';
  };
  children?: MenuItemConfig[];
}

export interface MenuGroupConfig {
  groupTitle: string;
  items: MenuItemConfig[];
}

export interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  filterQuery: string;
  activeMenuId: string | null;
}
