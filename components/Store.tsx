import React, { useState } from 'react';
import { Page, Plan, Transaction, TransactionType, TransactionStatus, Balances } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { MOCK_PLANS } from '../constants';
import { CheckCircleIcon } from './common/Icons';
import PurchaseModal from './common/PurchaseModal';
import { useAuth } from '../hooks/useAuth';

interface StoreProps {
  setActivePage: (page: Page) => void;
  balances: Balances;
  setBalances: React.Dispatch<React.SetStateAction<Balances>>;
}

const Store: React.FC<StoreProps> = ({ setActivePage, balances, setBalances }) => {
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [modalState, setModalState] = useState<'hidden' | 'confirm' | 'insufficient_funds'>('hidden');

    const handleAttemptPurchase = (plan: Plan) => {
        setSelectedPlan(plan);
        if (balances.usdt >= plan.price) {
            setModalState('confirm');
        } else {
            setModalState('insufficient_funds');
        }
    };
    
    // Simulates an atomic, idempotent purchase operation
    const handleConfirmPurchase = () => {
        if (!selectedPlan || !user || balances.usdt < selectedPlan.price) {
             // Close modal and reset state if conditions are no longer met
            setModalState('hidden');
            setSelectedPlan(null);
            return;
        };

        // 1. Atomically deduct balance (simulated)
        setBalances(prev => ({...prev, usdt: prev.usdt - selectedPlan.price }));

        // 2. Create an immutable ledger entry (order record)
        const newTx: Transaction = {
            id: `tx_pur_${Date.now()}`,
            type: TransactionType.Purchase,
            status: TransactionStatus.Completed,
            amount: selectedPlan.price,
            currency: 'USDT',
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            address: 'MinerX Store',
            details: `Purchase of ${selectedPlan.name}`
        };
        
        const TRANSACTIONS_KEY = `minerx_transactions_${user.id}`;
        const existingTxs = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([newTx, ...existingTxs]));
        window.dispatchEvent(new Event('transactions_updated'));

        // 3. Provision the service (update hashrate)
        const HASHRATE_KEY = `minerx_hashrate_${user.id}`;
        const currentHashrate = parseFloat(localStorage.getItem(HASHRATE_KEY) || '0');
        const newHashrate = currentHashrate + selectedPlan.hashrate;
        localStorage.setItem(HASHRATE_KEY, newHashrate.toString());
        window.dispatchEvent(new Event('hashpower_updated'));

        // 4. Close modal and navigate
        setModalState('hidden');
        setSelectedPlan(null);
        setActivePage(Page.Dashboard);
    };

    const handleGoToWallet = () => {
        setModalState('hidden');
        setSelectedPlan(null);
        setActivePage(Page.Wallet);
    };

    return (
        <div className="p-5 space-y-6 pb-24">
            <h1 className="text-4xl font-extrabold text-text-dark">Hashpower Store</h1>
            <p className="text-text-muted-dark -mt-4">Purchase a mining plan to start earning.</p>

            <div className="space-y-5">
                {MOCK_PLANS.map((plan) => (
                    <Card key={plan.id} className={`!p-0 overflow-hidden transition-all duration-300 ${plan.bestValue ? 'border-2 border-primary shadow-primary/20' : ''}`}>
                        {plan.bestValue && (
                            <div className="bg-primary text-center py-1 text-sm font-bold text-black">BEST VALUE</div>
                        )}
                        <div className="p-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-text-dark">{plan.name}</h2>
                                <p className="text-3xl font-extrabold text-primary">${plan.price}</p>
                            </div>
                            <p className="text-text-muted-dark font-semibold">{plan.hashrate} GH/s <span className="text-sm font-normal">({plan.duration})</span></p>

                            <ul className="my-6 space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <CheckCircleIcon className="w-5 h-5 text-success mr-3" />
                                        <span className="text-text-dark">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button 
                                onClick={() => handleAttemptPurchase(plan)} 
                                className="w-full !py-3.5"
                                variant={plan.bestValue ? 'primary' : 'secondary'}
                                disabled={modalState !== 'hidden'}
                            >
                                Purchase with Wallet Balance
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {modalState !== 'hidden' && selectedPlan && (
                <PurchaseModal
                    plan={selectedPlan}
                    state={modalState}
                    onClose={() => setModalState('hidden')}
                    onConfirm={handleConfirmPurchase}
                    onGoToWallet={handleGoToWallet}
                    balance={balances.usdt}
                />
            )}
        </div>
    );
};

export default Store;