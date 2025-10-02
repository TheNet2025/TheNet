import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { AppIcon, MailIcon } from './common/Icons';
import { useAuth } from '../hooks/useAuth';

interface VerifyEmailProps {
  email: string;
  onVerificationSuccess: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ email, onVerificationSuccess }) => {
    const [code, setCode] = useState('');
    const { verifyEmail, error, isLoading } = useAuth();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await verifyEmail(code);
        if (success) {
            alert("Email verified successfully! You can now log in.");
            onVerificationSuccess();
        }
    };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-background-light dark:bg-background-dark dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.15),rgba(255,255,255,0))]">
      <div className="w-[375px] h-[812px] bg-transparent flex flex-col justify-center p-8">
        <div className="text-center mb-8">
          <MailIcon className="w-24 h-24 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-extrabold text-primary mb-3">Verify Your Email</h1>
          <p className="text-text-muted-light dark:text-text-muted-dark text-lg">
            We've sent a 6-digit code to <span className="font-bold text-text-dark">{email}</span>. Please check your console for the code.
          </p>
        </div>
        <form onSubmit={handleVerify} className="space-y-6">
          <Input 
            label="Verification Code" 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
            required
            maxLength={6}
            inputMode="numeric"
            placeholder="000000" 
          />
          
          {error && <p className="text-danger text-center text-sm -my-2">{error}</p>}

          <Button type="submit" className="w-full !py-4 !mt-10 !rounded-2xl" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
