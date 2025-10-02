import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { MailIcon, LockIcon, UserIcon, CheckCircleIcon } from './common/Icons';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from './AuthLayout';

interface SignUpProps {
  onSignUpSuccess: (email: string) => void;
  onSwitchToLogin: () => void;
}

const PasswordStrengthIndicator: React.FC<{ passwordValidity: any }> = ({ passwordValidity }) => {
    const conditions = [
        { label: "8+ Chars", valid: passwordValidity.minLength },
        { label: "Uppercase", valid: passwordValidity.uppercase },
        { label: "Number", valid: passwordValidity.number },
        { label: "Symbol", valid: passwordValidity.specialChar },
    ];

    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {conditions.map(condition => (
                <div key={condition.label} className={`flex items-center transition-colors ${condition.valid ? 'text-success' : 'text-text-muted-dark/50'}`}>
                    <CheckCircleIcon className={`w-3.5 h-3.5 mr-1.5 ${condition.valid ? 'opacity-100' : 'opacity-50'}`} />
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
    <AuthLayout title="Create Account" subtitle="Join the MinerX community today.">
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required icon={<UserIcon />} placeholder="Satoshi" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<MailIcon />} placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required icon={<LockIcon />} placeholder="••••••••" />
          
          <PasswordStrengthIndicator passwordValidity={passwordValidity} />
          
           {error && <p className="text-danger text-center text-sm pt-2">{error}</p>}

          <Button type="submit" className="w-full !py-4 !mt-6 !rounded-xl" disabled={isLoading || !isPasswordStrong}>
             {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-text-muted-dark">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-semibold text-primary hover:underline">
              Login
            </button>
          </p>
        </div>
    </AuthLayout>
  );
};

export default SignUp;