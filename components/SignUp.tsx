import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { MailIcon, LockIcon, UserIcon } from './common/Icons';

interface SignUpProps {
  onSignUp: () => void;
  onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    onSignUp();
  };

  return (
     <div className="flex justify-center items-center min-h-screen w-full bg-background-light dark:bg-background-dark dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.15),rgba(255,255,255,0))]">
      <div className="w-[375px] h-[812px] bg-transparent flex flex-col justify-center p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-primary mb-3">Create Account</h1>
          <p className="text-text-muted-light dark:text-text-muted-dark text-lg">Join the MinerX community.</p>
        </div>
        <form onSubmit={handleSignUp} className="space-y-6">
          <Input label="Username" type="text" required icon={<UserIcon />} placeholder="Satoshi" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<MailIcon />} placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required icon={<LockIcon />} placeholder="••••••••" />
          <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required icon={<LockIcon />} placeholder="••••••••" />
          <Button type="submit" className="w-full !py-4 !mt-10 !rounded-2xl">
            Sign Up
          </Button>
        </form>
        <div className="mt-10 text-center">
          <p className="text-base text-text-muted-light dark:text-text-muted-dark">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-bold text-primary hover:underline">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;