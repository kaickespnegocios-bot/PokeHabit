import React from 'react';
import { AuthModal } from '../components/AuthModal';

export const LoginPage: React.FC = () => {
  return <AuthModal mode="login" standalone isOpen />;
};

export default LoginPage;
