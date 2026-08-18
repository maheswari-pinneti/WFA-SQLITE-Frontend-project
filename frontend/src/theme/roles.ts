export const roleColors = {
  light: {
    ADMIN: {
      primary: '#7C3AED',
      secondary: '#A78BFA',
      background: '#F5F3FF',
      text: '#5B21B6'
    },
    HR: {
      primary: '#DB2777',
      secondary: '#F472B6',
      background: '#FDF2F8',
      text: '#9D174D'
    },
    MANAGER: {
      primary: '#2563EB',
      secondary: '#60A5FA',
      background: '#EFF6FF',
      text: '#1D4ED8'
    },
    TEAM_LEAD: {
      primary: '#059669',
      secondary: '#34D399',
      background: '#ECFDF5',
      text: '#047857'
    },
    EMPLOYEE: {
      primary: '#D97706',
      secondary: '#FBBF24',
      background: '#FFFBEB',
      text: '#B45309'
    }
  },
  dark: {
    ADMIN: {
      primary: '#A78BFA',
      secondary: '#C4B5FD',
      background: '#2E1065',
      text: '#DDD6FE'
    },
    HR: {
      primary: '#F472B6',
      secondary: '#F9A8D4',
      background: '#500724',
      text: '#FBCFE8'
    },
    MANAGER: {
      primary: '#60A5FA',
      secondary: '#93C5FD',
      background: '#172554',
      text: '#DBEAFE'
    },
    TEAM_LEAD: {
      primary: '#34D399',
      secondary: '#6EE7B7',
      background: '#022C22',
      text: '#A7F3D0'
    },
    EMPLOYEE: {
      primary: '#FBBF24',
      secondary: '#FCD34D',
      background: '#451A03',
      text: '#FEF3C7'
    }
  }
};
export type RoleType = 'ADMIN' | 'HR' | 'MANAGER' | 'TEAM_LEAD' | 'EMPLOYEE';
