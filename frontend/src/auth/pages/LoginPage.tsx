import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME_PATHS } from '../../security/roles/roles';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import { RoleType } from '../../theme/roles';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleType>('ADMIN');

  useEffect(() => {
    if (isAuthenticated) {
      const homePath = ROLE_HOME_PATHS[role] || '/admin/dashboard';
      navigate(homePath);
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <AuthLayout selectedRole={selectedRole}>
      <LoginForm
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onSuccess={() => {
          // Success is handled by the isAuthenticated useEffect redirection
        }}
      />
      <div className="text-center text-sm font-medium text-[var(--text-secondary)] mt-4">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[var(--role-primary)] font-semibold hover:underline">
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
