import React, { useState, useEffect } from 'react';
import { Plan } from '../../types';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import { CreditCardIcon, CheckCircleIcon, XMarkIcon } from './Icons';

interface PaymentModalProps {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    if (formattedValue.length <= 19) {
      setCardNumber(formattedValue);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formattedValue = value;
    if (value.length > 2) {
      formattedValue = `${value.slice(0, 2)} / ${value.slice(2, 4)}`;
    }
    if (formattedValue.length <= 7) {
      setExpiry(formattedValue);
    }
  };
  
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvc(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      onSuccess();
    }, 2000); // Simulate API call
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
        <Card className="w-11/12 max-w-md mx-auto !p-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-text-muted-dark hover:text-white transition-colors z-10" aria-label="Close" disabled={isProcessing || isSuccess}>
                <XMarkIcon className="w-6 h-6" />
            </button>
            
            {isSuccess ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-96">
                    <CheckCircleIcon className="w-24 h-24 text-success animate-pulse" />
                    <h2 className="text-2xl font-bold mt-6 text-text-dark">Payment Successful!</h2>
                    <p className="text-text-muted-dark mt-2">Your '{plan.name}' plan is now active. Redirecting...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-text-dark">Complete Purchase</h2>
                        <p className="text-text-muted-dark">For your <span className="font-bold text-primary">{plan.name}</span> plan.</p>
                    </div>

                    <Input label="Card Number" value={cardNumber} onChange={handleCardNumberChange} icon={<CreditCardIcon />} placeholder="0000 0000 0000 0000" required />
                    <div className="flex space-x-4">
                        <Input label="Expiry Date" value={expiry} onChange={handleExpiryChange} placeholder="MM / YY" required />
                        <Input label="CVC" value={cvc} onChange={handleCvcChange} placeholder="123" required />
                    </div>
                    
                    <Button type="submit" className="w-full !py-4" disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : `Pay $${plan.price}`}
                    </Button>
                </form>
            )}
        </Card>
    </div>
  );
};

export default PaymentModal;