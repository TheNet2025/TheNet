import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { MailIcon } from './common/Icons';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from './AuthLayout';

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
    <AuthLayout title="Verify Your Email" subtitle={`Enter the 6-digit code sent to ${email}. Check your console for the code.`}>
      <form onSubmit={handleVerify} className="space-y-5">
        <Input 
          label="Verification Code" 
          type="text" 
          value={code} 
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
          required
          maxLength={6}
          inputMode="numeric"
          placeholder="000000"
          className="text-center tracking-[1em]"
        />
        
        {error && <p className="text-danger text-center text-sm">{error}</p>}

        <Button type="submit" className="w-full !py-4 !mt-8 !rounded-xl" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify Account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default VerifyEmail;