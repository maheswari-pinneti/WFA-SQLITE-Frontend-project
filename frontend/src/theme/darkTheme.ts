import { palette } from './palette.js';
import { roleColors } from './roles.js';
import { typography } from './typography.js';
import { spacing } from './spacing.js';
import { shadows } from './shadows.js';
import { breakpoints } from './breakpoints.js';
import { components } from './components.js';

export const darkTheme = {
  mode: 'dark' as const,
  palette: palette.dark,
  roles: roleColors.dark,
  typography,
  spacing,
  shadows,
  breakpoints,
  components
};
export default darkTheme;
