import React from 'react';
import { AppIcon } from './common/Icons';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="flex justify-center items-center min-h-screen w-full auth-bg-gradient">
      <div className="w-[375px] h-auto bg-transparent flex flex-col justify-center p-4">
        <div className="bg-black/30 dark:bg-card-dark/60 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-2xl shadow-primary/20 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-secondary rounded-3xl mb-6 shadow-lg">
                <AppIcon className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">{title}</h1>
            <p className="text-text-muted-dark text-base">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
