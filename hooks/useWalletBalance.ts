import { useState, useEffect, useMemo } from 'react';
import { Balances } from '../types';

const INITIAL_BALANCES: Balances = {
    btc: 0.1234,
    eth: 2.5678,
    usdt: 5120.75,
};

const INITIAL_RATES = {
    btc: 65000,
    eth: 3500,
    usdt: 1,
};

export const useWalletBalance = () => {
    const [balances, setBalances] = useState<Balances>(() => {
        const storedBalances = localStorage.getItem('minerx_balances');
        return storedBalances ? JSON.parse(storedBalances) : INITIAL_BALANCES;
    });

    const [rates, setRates] = useState(INITIAL_RATES);

    useEffect(() => {
        localStorage.setItem('minerx_balances', JSON.stringify(balances));
    }, [balances]);
    
    useEffect(() => {
        // Simulate rate fluctuations
        const interval = setInterval(() => {
            setRates(prev => ({
                btc: prev.btc * (1 + (Math.random() - 0.5) * 0.01), // +/- 0.5%
                eth: prev.eth * (1 + (Math.random() - 0.5) * 0.01),
                usdt: 1,
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleBalanceUpdate = (event: Event) => {
            const newBalances = (event as CustomEvent<Balances>).detail;
            if (newBalances) {
                setBalances(newBalances);
            }
        };
        window.addEventListener('admin_wallet_update', handleBalanceUpdate);
        return () => window.removeEventListener('admin_wallet_update', handleBalanceUpdate);
    }, []);


    const totalUsdValue = useMemo(() => {
        return (balances.btc * rates.btc) + (balances.eth * rates.eth) + (balances.usdt * rates.usdt);
    }, [balances, rates]);

    return { balances, setBalances, rates, totalUsdValue };
};
