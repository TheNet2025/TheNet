import { useState, useEffect, useMemo } from 'react';
import { Balances } from '../types';
import { useAuth } from './useAuth';

const ZERO_BALANCES: Balances = {
    btc: 0,
    eth: 0,
    usdt: 0,
};

// Fallback rates in case the API fails
const INITIAL_RATES = {
    btc: 65000,
    eth: 3500,
    usdt: 1,
};

export const useWalletBalance = () => {
    const { user } = useAuth();
    const [balances, setBalances] = useState<Balances>(ZERO_BALANCES);
    const [rates, setRates] = useState(INITIAL_RATES);

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
    
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd');
                if (!response.ok) {
                    throw new Error(`API call failed with status: ${response.status}`);
                }
                const data = await response.json();
                
                if (data.bitcoin?.usd && data.ethereum?.usd && data.tether?.usd) {
                    setRates({
                        btc: data.bitcoin.usd,
                        eth: data.ethereum.usd,
                        usdt: data.tether.usd,
                    });
                } else {
                     throw new Error('Invalid data structure from API');
                }
            } catch (error) {
                console.error("Could not fetch cryptocurrency rates:", error);
            }
        };

        fetchRates();
        const interval = setInterval(fetchRates, 60000);

        return () => clearInterval(interval);
    }, []);

    const totalUsdValue = useMemo(() => {
        return (balances.btc * rates.btc) + (balances.eth * rates.eth) + (balances.usdt * rates.usdt);
    }, [balances, rates]);

    return { balances, setBalances, rates, totalUsdValue };
};