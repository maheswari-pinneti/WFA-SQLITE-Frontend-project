import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../../components/auth/AuthLayout';
import SignupForm from '../../components/auth/SignupForm';
import { RoleType } from '../../theme/roles';

export const SignUpPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleType>('EMPLOYEE');

  const handleSignupSubmit = (data: any) => {
    // Standard signup simulation as per original flow
    setTimeout(() => {
      login(data.email);
      navigate('/admin/dashboard');
    }, 1000);
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
