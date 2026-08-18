import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { loginUserThunk, logoutUserThunk, logoutAction, clearError, loginSuccessAction, initializeAuthThunk } from '../store/authSlice';
import { Role } from '../../security/roles/roles';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const initializeAuth = () => dispatch(initializeAuthThunk());

  const login = (email: string, password?: string) => dispatch(loginUserThunk({ email, password }));

  const signup = async (signupData: any) => {
    return await authService.signup(signupData);
  };

  const verifyMfa = async (challengeId: string, code: string) => {
    const data = await authService.verifyMfa(challengeId, code);
    dispatch(loginSuccessAction(data));
  };

  const resendMfa = async (challengeId: string) => {
    return await authService.resendMfa(challengeId);
  };
  
  const logout = () => {
    authService.logout();
    dispatch(logoutAction());
    dispatch(logoutUserThunk());
  };

  const dismissError = () => dispatch(clearError());

  return {
    ...authState,
    login,
    signup,
    verifyMfa,
    resendMfa,
    logout,
    dismissError,
    initializeAuth,
    role: authState.user?.role || Role.EMPLOYEE,
    permissions: authState.user?.permissions || [],
  };
};
