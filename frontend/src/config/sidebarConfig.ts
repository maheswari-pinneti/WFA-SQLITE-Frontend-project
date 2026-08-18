export interface SidebarSubItemConfig {
  name: string;
  path: string;
}

export interface SidebarItemConfig {
  id: string;
  name: string;
  path: string;
  icon: string;
  roles: string[];
  permissions?: string[];
  subItems?: SidebarSubItemConfig[];
}

export const sidebarConfig: SidebarItemConfig[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'EMPLOYEE'],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    path: '/analytics',
    icon: 'BarChart3',
    roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD'],
    subItems: [
      { name: 'Workforce Analytics', path: '/analytics#workforce' },
      { name: 'Attendance Analytics', path: '/analytics#attendance' },
      { name: 'Performance Analytics', path: '/analytics#performance' },
      { name: 'Productivity Analytics', path: '/analytics#productivity' },
      { name: 'Salary Analytics', path: '/analytics#salary' },
      { name: 'Diversity Analytics', path: '/analytics#diversity' },
    ],
  },
  {
    id: 'employees',
    name: 'Employee Management',
    path: '/employees',
    icon: 'Users',
    roles: ['ADMIN', 'HR_MANAGER'],
    subItems: [
      { name: 'Employee Directory', path: '/employees#directory' },
      { name: 'Employee Profile', path: '/employees#profile' },
      { name: 'Add Employee', path: '/employees#add' },
      { name: 'Update Employee', path: '/employees#update' },
      { name: 'Employee Lifecycle', path: '/employees#lifecycle' },
      { name: 'Employee Status', path: '/employees#status' },
    ],
  },
  {
    id: 'employee-directory',
    name: 'Employee Directory',
    path: '/employee-directory',
    icon: 'Contact',
    roles: ['ADMIN', 'HR_MANAGER', 'TEAM_LEAD', 'EMPLOYEE'],
  },
  {
    id: 'departments',
    name: 'Departments',
    path: '/departments',
    icon: 'Building2',
    roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD'],
    subItems: [
      { name: 'Department Overview', path: '/departments#overview' },
      { name: 'Department Analytics', path: '/departments#analytics' },
      { name: 'Department Members', path: '/departments#members' },
      { name: 'Department Performance', path: '/departments#performance' },
    ],
  },
  {
    id: 'audit-logs',
    name: 'Audit Logs',
    path: '/audit-logs',
    icon: 'History',
    roles: ['ADMIN'],
  },
  {
    id: 'reports',
    name: 'Reports',
    path: '/reports',
    icon: 'FileText',
    roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD'],
    subItems: [
      { name: 'Workforce Reports', path: '/reports#workforce' },
      { name: 'Attendance Reports', path: '/reports#attendance' },
      { name: 'Performance Reports', path: '/reports#performance' },
      { name: 'Custom Reports', path: '/reports#custom' },
      { name: 'Export Reports', path: '/reports#export' },
    ],
  },
  {
    id: 'configuration',
    name: 'Configuration',
    path: '/configuration',
    icon: 'Sliders',
    roles: ['ADMIN'],
    subItems: [
      { name: 'Permission Management', path: '/configuration#permissions' },
      { name: 'RBAC Configuration', path: '/configuration#rbac' },
      { name: 'DBAC Rules', path: '/configuration#dbac' },
      { name: 'Notification Settings', path: '/configuration#notifications' },
      { name: 'Workflow Configuration', path: '/configuration#workflows' },
    ],
  },
  {
    id: 'settings',
    name: 'System Settings',
    path: '/settings',
    icon: 'Settings',
    roles: ['ADMIN'],
  },
  {
    id: 'help',
    name: 'Help & Q/A',
    path: '/help',
    icon: 'HelpCircle',
    roles: ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'EMPLOYEE'],
  },
];
