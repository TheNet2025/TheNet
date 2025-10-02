import React, { useState } from 'react';
import { Page, Plan, TransactionType, TransactionStatus, MiningContract } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { CheckCircleIcon } from './common/Icons';
import PurchaseModal from './common/PurchaseModal';
import { useAuth } from '../hooks/useAuth';
import { useDatabase } from '../hooks/useDatabase';
import { useWalletBalance } from '../hooks/useWalletBalance';

interface StoreProps {
  navigateTo: (page: Page) => void;
}

const Store: React.FC<StoreProps> = ({ navigateTo }) => {
    const { user } = useAuth();
    const { updateUser, addTransaction, getUserById, plans } = useDatabase();
    const { balances } = useWalletBalance();

    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [modalState, setModalState] = useState<'hidden' | 'confirm' | 'insufficient_funds'>('hidden');
    
    const currentUser = user ? getUserById(user.id) : null;

    const handleAttemptPurchase = (plan: Plan) => {
        if (!currentUser) return;
        setSelectedPlan(plan);
        if (currentUser.balances.usdt >= plan.price) {
            setModalState('confirm');
        } else {
            setModalState('insufficient_funds');
        }
    };
    
    const handleConfirmPurchase = () => {
        if (!selectedPlan || !currentUser || currentUser.balances.usdt < selectedPlan.price) {
            setModalState('hidden');
            setSelectedPlan(null);
            return;
        };

        const newBalances = { ...currentUser.balances, usdt: currentUser.balances.usdt - selectedPlan.price };
        
        const now = new Date();
        const expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + selectedPlan.durationDays);

        const newContract: MiningContract = {
            id: `contract_${currentUser.id}_${Date.now()}`,
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            hashrate: selectedPlan.hashrate,
            purchaseDate: now.toISOString(),
            expiryDate: expiryDate.toISOString(),
        };

        const updatedContracts = [...currentUser.contracts, newContract];
        
        updateUser({ ...currentUser, balances: newBalances, contracts: updatedContracts });
        
        addTransaction({
            userId: currentUser.id,
            type: TransactionType.Purchase,
            amount: selectedPlan.price,
            currency: 'USDT',
            address: 'MinerX Store',
            details: `Purchase of ${selectedPlan.name}`
        }, TransactionStatus.Completed);

        setModalState('hidden');
        setSelectedPlan(null);
        navigateTo(Page.Dashboard);
    };

    const handleGoToWallet = () => {
        setModalState('hidden');
        setSelectedPlan(null);
        navigateTo(Page.Wallet);
    };

    return (
        <div className="p-5 space-y-6 pb-24">
            <h1 className="text-4xl font-extrabold text-text-dark">Hashpower Store</h1>
            <p className="text-text-muted-dark -mt-4">Purchase a mining plan to start earning.</p>

            <div className="space-y-5">
                {plans.map((plan) => (
                    <Card key={plan.id} className={`!p-0 overflow-hidden transition-all duration-300 ${plan.bestValue ? 'border-2 border-primary shadow-primary/20' : ''}`}>
                        {plan.bestValue && (
                            <div className="bg-primary text-center py-1 text-sm font-bold text-black">BEST VALUE</div>
                        )}
                        <div className="p-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-text-dark">{plan.name}</h2>
                                <p className="text-3xl font-extrabold text-primary">${plan.price}</p>
                            </div>
                            <p className="text-text-muted-dark font-semibold">{plan.hashrate} GH/s <span className="text-sm font-normal">({plan.durationDays} Days Contract)</span></p>

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