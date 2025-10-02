import { useState, useEffect, useMemo } from 'react';
import { Balances } from '../types';
import { useAuth } from './useAuth';

const ZERO_BALANCES: Balances = {
    btc: 0,
    eth: 0,
    usdt: 0,
};

// Using static rates for a stable simulation, as live API calls can be blocked.
const STATIC_RATES = {
    btc: 65000,
    eth: 3500,
    usdt: 1,
};

export const useWalletBalance = () => {
    const { user } = useAuth();
    const [balances, setBalances] = useState<Balances>(ZERO_BALANCES);
    const [rates] = useState(STATIC_RATES);

    useEffect(() => {
        if (user) {
            const BALANCE_KEY = `minerx_balances_${user.id}`;
            const storedBalances = localStorage.getItem(BALANCE_KEY);
            setBalances(storedBalances ? JSON.parse(storedBalances) : ZERO_BALANCES);
        } else {
            setBalances(ZERO_BALANCES);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            const BALANCE_KEY = `minerx_balances_${user.id}`;
            localStorage.setItem(BALANCE_KEY, JSON.stringify(balances));
        }
    }, [balances, user]);
    
    const totalUsdValue = useMemo(() => {
        return (balances.btc * rates.btc) + (balances.eth * rates.eth) + (balances.usdt * rates.usdt);
    }, [balances, rates]);

    return { balances, setBalances, rates, totalUsdValue };
};
