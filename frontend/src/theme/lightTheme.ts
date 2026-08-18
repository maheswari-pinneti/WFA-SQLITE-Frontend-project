import { palette } from './palette.js';
import { roleColors } from './roles.js';
import { typography } from './typography.js';
import { spacing } from './spacing.js';
import { shadows } from './shadows.js';
import { breakpoints } from './breakpoints.js';
import { components } from './components.js';

export const lightTheme = {
  mode: 'light' as const,
  palette: palette.light,
  roles: roleColors.light,
  typography,
  spacing,
  shadows,
  breakpoints,
  components
};
export default lightTheme;
