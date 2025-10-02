import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useDatabase } from './useDatabase';

const STATIC_RATES = {
    btc: 65000,
    eth: 3500,
    usdt: 1,
};

export const useWalletBalance = () => {
    const { user } = useAuth();
    const { getUserById, updateUser } = useDatabase();

    const currentUser = user ? getUserById(user.id) : null;
    const balances = currentUser?.balances || { btc: 0, eth: 0, usdt: 0 };
    
    const setBalances = (newBalances: React.SetStateAction<typeof balances>) => {
        if (currentUser) {
            const updatedBalances = typeof newBalances === 'function' ? newBalances(currentUser.balances) : newBalances;
            updateUser({ ...currentUser, balances: updatedBalances });
        }
    };
    
    const totalUsdValue = useMemo(() => {
        return (balances.btc * STATIC_RATES.btc) + (balances.eth * STATIC_RATES.eth) + (balances.usdt * STATIC_RATES.usdt);
    }, [balances]);

    return { balances, setBalances, rates: STATIC_RATES, totalUsdValue };
};