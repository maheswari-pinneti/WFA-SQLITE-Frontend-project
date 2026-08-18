export const roleColors = {
  light: {
    ADMIN: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      background: '#F5F3FF',
      text: '#5B21B6'
    },
    HR: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      background: '#EFF6FF',
      text: '#1D4ED8'
    },
    MANAGER: {
      primary: '#10B981',
      secondary: '#34D399',
      background: '#ECFDF5',
      text: '#047857'
    },
    TEAM_LEAD: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      background: '#FFFBEB',
      text: '#B45309'
    },
    EMPLOYEE: {
      primary: '#F43F5E',
      secondary: '#FB7185',
      background: '#FFF1F2',
      text: '#9F1239'
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
      primary: '#60A5FA',
      secondary: '#93C5FD',
      background: '#172554',
      text: '#DBEAFE'
    },
    MANAGER: {
      primary: '#34D399',
      secondary: '#6EE7B7',
      background: '#022C22',
      text: '#A7F3D0'
    },
    TEAM_LEAD: {
      primary: '#FBBF24',
      secondary: '#FCD34D',
      background: '#451A03',
      text: '#FEF3C7'
    },
    EMPLOYEE: {
      primary: '#FB7185',
      secondary: '#FDA4AF',
      background: '#4C0519',
      text: '#FFE4E6'
    }
  }
};
export type RoleType = 'ADMIN' | 'HR' | 'MANAGER' | 'TEAM_LEAD' | 'EMPLOYEE';
