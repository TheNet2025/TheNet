import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { MailIcon, LockIcon } from './common/Icons';

interface LoginProps {
  onLogin: () => void;
  onAdminLogin: () => void;
  onSwitchToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onAdminLogin, onSwitchToSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.toLowerCase() === 'admin' && password === '1995') {
            onAdminLogin();
        } else {
            onLogin();
        }
    };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-background-light dark:bg-background-dark dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.15),rgba(255,255,255,0))]">
      <div className="w-[375px] h-[812px] bg-transparent flex flex-col justify-center p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-primary mb-3">Welcome Back!</h1>
          <p className="text-text-muted-light dark:text-text-muted-dark text-lg">Sign in to your account.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<MailIcon />} placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required icon={<LockIcon />} placeholder="••••••••" />
          <Button type="submit" className="w-full !py-4 !mt-10 !rounded-2xl">
            Login
          </Button>
        </form>
        <div className="mt-10 text-center">
          <p className="text-base text-text-muted-light dark:text-text-muted-dark">
            Don't have an account?{' '}
            <button onClick={onSwitchToSignUp} className="font-bold text-primary hover:underline">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;