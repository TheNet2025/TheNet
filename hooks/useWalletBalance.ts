import { useState, useEffect, useMemo } from 'react';
import { Balances } from '../types';

const INITIAL_BALANCES: Balances = {
    btc: 0.1234,
    eth: 2.5678,
    usdt: 5120.75,
};

// Fallback rates in case the API fails
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
        const fetchRates = async () => {
            try {
                // Using CoinGecko's free, no-key-required API
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd');
                if (!response.ok) {
                    throw new Error(`API call failed with status: ${response.status}`);
                }
                const data = await response.json();
                
                // Ensure data structure is as expected before setting state
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
                // In case of an error, we'll just keep the last known rates.
            }
        };

        fetchRates(); // Fetch immediately on component mount
        const interval = setInterval(fetchRates, 60000); // And then poll every 60 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
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
