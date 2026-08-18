import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME_PATHS } from '../../security/roles/roles';
import AuthLayout from '../../components/auth/AuthLayout';
import SignupForm from '../../components/auth/SignupForm';
import { RoleType } from '../../theme/roles';

export const SignUpPage: React.FC = () => {
  const { signup, login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleType>('EMPLOYEE');

  useEffect(() => {
    if (isAuthenticated) {
      const homePath = ROLE_HOME_PATHS[role] || '/admin/dashboard';
      navigate(homePath);
    }
  }, [isAuthenticated, role, navigate]);

  const handleSignupSubmit = async (data: any) => {
    await signup(data);
    await login(data.email, data.password);
  };

  return (
    <AuthLayout selectedRole={selectedRole}>
      <SignupForm
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onSubmit={handleSignupSubmit}
      />
      <div className="text-center text-sm font-medium text-[var(--text-secondary)] mt-4">
        Already registered?{' '}
        <Link to="/login" className="text-[var(--role-primary)] font-semibold hover:underline">
          Sign in →
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;
