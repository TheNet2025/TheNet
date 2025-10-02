import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { MailIcon, LockIcon } from './common/Icons';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from './AuthLayout';

interface LoginProps {
  onSwitchToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

  return (
    <AuthLayout title="Welcome Back!" subtitle="Sign in to your MinerX account.">
      <form onSubmit={handleLogin} className="space-y-5">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<MailIcon />} placeholder="you@example.com" />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required icon={<LockIcon />} placeholder="••••••••" />
        
        {error && <p className="text-danger text-center text-sm">{error}</p>}

        <Button type="submit" className="w-full !py-4 !mt-8 !rounded-xl" disabled={isLoading}>
          {isLoading ? 'Logging In...' : 'Login'}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-text-muted-dark">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignUp} className="font-semibold text-primary hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;