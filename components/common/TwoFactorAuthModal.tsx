import React, { useState } from 'react';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import { XMarkIcon, CopyIcon, CheckCircleIcon } from './Icons';

interface TwoFactorAuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const MOCK_SECRET_KEY = 'JBSWY3DPEHPK3PXP';
const MOCK_OTP_URL = `otpauth://totp/MinerX:satoshi@nakamoto.com?secret=${MOCK_SECRET_KEY}&issuer=MinerX`;

const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({ onClose, onSuccess }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_SECRET_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    // In a real app, we'd verify the code with the backend
    onSuccess();
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <Card className="w-11/12 max-w-md mx-auto !p-0">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted-dark hover:text-white transition-colors z-10" aria-label="Close">
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-text-dark">Enable Two-Factor Authentication</h2>
                <p className="text-text-muted-dark mt-2">Scan the QR code with your authenticator app.</p>
            </div>

            <div className="flex justify-center my-4">
                <div className="p-3 bg-white rounded-xl">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(MOCK_OTP_URL)}`} alt="2FA QR Code" className="rounded-md" />
                </div>
            </div>

            <p className="text-sm text-center text-text-muted-dark">Or enter this code manually:</p>
            
            <div className="bg-background-dark rounded-lg p-3 text-center break-all border border-border-dark flex items-center justify-between space-x-2">
                 <p className="text-primary text-lg font-mono tracking-widest">{MOCK_SECRET_KEY}</p>
                 <Button type="button" onClick={handleCopy} className="!p-2 !rounded-lg" variant="ghost" icon={copied ? <CheckCircleIcon className="w-5 h-5 text-success"/> : <CopyIcon className="w-5 h-5" />}>
                 </Button>
            </div>

            <Input 
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
              inputMode="numeric"
            />
            {error && <p className="text-danger text-sm text-center -mt-2">{error}</p>}
            
            <Button type="submit" className="w-full !py-4 !mt-8">
              Verify & Enable
            </Button>
        </form>
      </Card>
    </div>
  );
};

export default TwoFactorAuthModal;
