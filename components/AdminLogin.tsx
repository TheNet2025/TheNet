import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { MailIcon, LockIcon } from './common/Icons';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from './AuthLayout';
import { Page } from '../types';

interface AdminLoginProps {
  navigateTo: (page: Page) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ navigateTo }) => {
    const [email, setEmail] = useState('admin');
    const [password, setPassword] = useState('1995');
    const { login, error, isLoading, isUserAdmin, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && isUserAdmin) {
            navigateTo(Page.Admin);
        }
    }, [isAuthenticated, isUserAdmin, navigateTo]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            // The useEffect will catch the state change and navigate
        }
    };

  return (
    <AuthLayout title="Admin Access" subtitle="Please authenticate to continue.">
      <form onSubmit={handleLogin} className="space-y-5">
        <Input 
            label="Admin Email" 
            type="text" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            icon={<MailIcon />} 
            placeholder="admin" 
        />
        <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            icon={<LockIcon />} 
            placeholder="••••••••" 
        />
        
        {error && <p className="text-danger text-center text-sm">{error}</p>}

        <Button type="submit" className="w-full !py-4 !mt-8 !rounded-xl" disabled={isLoading}>
          {isLoading ? 'Authenticating...' : 'Login'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;