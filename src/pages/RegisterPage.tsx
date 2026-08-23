import React from 'react';
import { AuthModal } from '../components/AuthModal';

export const RegisterPage: React.FC = () => {
  return <AuthModal mode="register" standalone isOpen />;
};

export default RegisterPage;
