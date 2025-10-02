import React from 'react';
import { Plan } from '../../types';
import Card from './Card';
import Button from './Button';
import { XMarkIcon, ExclamationTriangleIcon, WalletIcon } from './Icons';

interface PurchaseModalProps {
  plan: Plan;
  state: 'confirm' | 'insufficient_funds';
  onClose: () => void;
  onConfirm: () => void;
  onGoToWallet: () => void;
  balance: number;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ plan, state, onClose, onConfirm, onGoToWallet, balance }) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    // The onConfirm function will handle the rest, including closing the modal.
    // No need for a timeout here, as the parent component controls dismissal.
    onConfirm();
  };
  
  const renderContent = () => {
    if (state === 'insufficient_funds') {
      return (
        <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 flex items-center justify-center bg-danger/10 rounded-full mb-4">
                <ExclamationTriangleIcon className="w-10 h-10 text-danger" />
            </div>
            <h2 className="text-2xl font-bold mt-4 text-text-dark">Insufficient Funds</h2>
            <p className="text-text-muted-dark mt-2 mb-6">
                Your wallet balance is too low to purchase the '{plan.name}' plan. Please deposit more funds to proceed.
            </p>
            <div className="w-full bg-secondary/50 p-3 rounded-xl text-left space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="text-text-muted-dark">Required:</span>
                    <span className="font-bold text-danger">${plan.price.toFixed(2)} USDT</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-text-muted-dark">Available:</span>
                    <span className="font-bold text-text-dark">${balance.toFixed(2)} USDT</span>
                </div>
            </div>
             <Button onClick={onGoToWallet} className="w-full !py-4 mt-6" icon={<WalletIcon />}>
                Deposit Funds
            </Button>
        </div>
      );
    }
    
    if (state === 'confirm') {
      return (
        <div className="p-8 space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-text-dark">Confirm Purchase</h2>
                <p className="text-text-muted-dark">You are about to purchase the <span className="font-bold text-primary">{plan.name}</span> plan.</p>
            </div>
            
            <Card className="!bg-background-dark/80">
                <div className="flex justify-between items-center py-2">
                    <span className="text-text-muted-dark text-lg">Price:</span>
                    <span className="font-bold text-lg text-text-dark">${plan.price.toFixed(2)} USDT</span>
                </div>
                 <div className="flex justify-between items-center py-2 border-t border-border-dark/50">
                    <span className="text-text-muted-dark">New Hashrate:</span>
                    <span className="font-bold text-text-dark">+{plan.hashrate} GH/s</span>
                </div>
            </Card>

            <p className="text-sm text-center text-text-muted-dark">
                The total amount of ${plan.price.toFixed(2)} USDT will be deducted from your wallet balance.
            </p>
            
            <div className="flex space-x-4 pt-2">
                <Button variant="secondary" className="w-full !py-3" onClick={onClose} disabled={isProcessing}>
                    Cancel
                </Button>
                <Button className="w-full !py-3" onClick={handleConfirm} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Confirm & Pay'}
                </Button>
            </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
        <Card className="w-11/12 max-w-md mx-auto !p-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-text-muted-dark hover:text-white transition-colors z-10" aria-label="Close" disabled={isProcessing}>
                <XMarkIcon className="w-6 h-6" />
            </button>
            {renderContent()}
        </Card>
    </div>
  );
};

export default PurchaseModal;