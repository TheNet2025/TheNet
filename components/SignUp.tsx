import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { MailIcon, LockIcon, UserIcon, AppIcon, CheckCircleIcon } from './common/Icons';
import { useAuth } from '../hooks/useAuth';

interface SignUpProps {
  onSignUpSuccess: (email: string) => void;
  onSwitchToLogin: () => void;
}

const PasswordStrengthIndicator: React.FC<{ passwordValidity: any }> = ({ passwordValidity }) => {
    const conditions = [
        { label: "8+ characters", valid: passwordValidity.minLength },
        { label: "1 uppercase", valid: passwordValidity.uppercase },
        { label: "1 number", valid: passwordValidity.number },
        { label: "1 special char", valid: passwordValidity.specialChar },
    ];

    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {conditions.map(condition => (
                <div key={condition.label} className={`flex items-center transition-colors ${condition.valid ? 'text-success' : 'text-text-muted-dark'}`}>
                    <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                    <span>{condition.label}</span>
                </div>
            ))}
        </div>
    );
};

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, error, isLoading } = useAuth();

  const [passwordValidity, setPasswordValidity] = useState({
      minLength: false,
      uppercase: false,
      number: false,
      specialChar: false,
  });

  useEffect(() => {
      setPasswordValidity({
          minLength: password.length >= 8,
          uppercase: /[A-Z]/.test(password),
          number: /[0-9]/.test(password),
          specialChar: /[^A-Za-z0-9]/.test(password),
      });
  }, [password]);

  const isPasswordStrong = Object.values(passwordValidity).every(Boolean);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong) return;
    const success = await register(username, email, password);
    if (success) {
      onSignUpSuccess(email);
    }
  };

  return (
     <div className="flex justify-center items-center min-h-screen w-full bg-background-light dark:bg-background-dark dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.15),rgba(255,255,255,0))]">
      <div className="w-[375px] h-[812px] bg-transparent flex flex-col justify-center p-8">
        <div className="text-center mb-8">
          <AppIcon className="w-28 h-28 mx-auto mb-4" />
          <h1 className="text-5xl font-extrabold text-primary mb-3">Create Account</h1>
          <p className="text-text-muted-light dark:text-text-muted-dark text-lg">Join the MinerX community.</p>
        </div>
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required icon={<UserIcon />} placeholder="Satoshi" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<MailIcon />} placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required icon={<LockIcon />} placeholder="••••••••" />
          
          <PasswordStrengthIndicator passwordValidity={passwordValidity} />
          
           {error && <p className="text-danger text-center text-sm pt-2">{error}</p>}

          <Button type="submit" className="w-full !py-4 !mt-8 !rounded-2xl" disabled={isLoading || !isPasswordStrong}>
             {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
        <div className="mt-8 text-center">
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