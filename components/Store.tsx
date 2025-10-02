import React, { useState } from 'react';
import { Page } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { MOCK_PLANS } from '../constants';
import { CheckCircleIcon } from './common/Icons';

interface StoreProps {
  setActivePage: (page: Page) => void;
}

const Store: React.FC<StoreProps> = ({ setActivePage }) => {
    const [purchasedId, setPurchasedId] = useState<string | null>(null);

    const handlePurchase = (hashrate: number, planId: string) => {
        const currentHashrate = parseFloat(localStorage.getItem('minerx_hashrate') || '0');
        const newHashrate = currentHashrate + hashrate;
        localStorage.setItem('minerx_hashrate', newHashrate.toString());
        window.dispatchEvent(new Event('hashpower_updated'));

        setPurchasedId(planId);
        setTimeout(() => {
            setActivePage(Page.Dashboard);
        }, 2000);
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
                                onClick={() => handlePurchase(plan.hashrate, plan.id)} 
                                className="w-full !py-3.5"
                                variant={plan.bestValue ? 'primary' : 'secondary'}
                                disabled={!!purchasedId}
                            >
                                {purchasedId === plan.id ? 'Purchased!' : 'Purchase Plan'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Store;
