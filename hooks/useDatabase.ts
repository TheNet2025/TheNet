import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, Transaction, Balances, KycStatus, TransactionStatus, TransactionType } from '../types';
import { MOCK_TRANSACTIONS } from '../constants';

const USERS_KEY = 'minerx_db_users';
const TRANSACTIONS_KEY = 'minerx_db_transactions';
const ADMIN_EMAIL = 'albertonani79@gmail.com';
const ADMIN_PASSWORD = 'Planetwin365@';

// Helper to get initial state from localStorage
const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

interface DatabaseContextType {
    // Users
    users: User[];
    getUserById: (id: string) => User | undefined;
    addUser: (newUser: User) => void;
    updateUser: (updatedUser: User) => void;
    
    // Transactions
    transactions: Transaction[];
    getTransactionsByUserId: (userId: string) => Transaction[];
    addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
    updateTransactionStatus: (txId: string, status: TransactionStatus) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(() => getInitialState<User[]>(USERS_KEY, []));
    const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialState<Transaction[]>(TRANSACTIONS_KEY, []));

    // Persist to localStorage whenever data changes
    useEffect(() => localStorage.setItem(USERS_KEY, JSON.stringify(users)), [users]);
    useEffect(() => localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions)), [transactions]);

    // Initialize admin user on first load
    useEffect(() => {
        setUsers(prevUsers => {
            const adminExists = prevUsers.some(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
            if (!adminExists) {
                const adminPasswordHash = btoa(ADMIN_PASSWORD);
                const adminUser: User = {
                    id: 'user_admin',
                    username: 'Admin',
                    email: ADMIN_EMAIL,
                    password: adminPasswordHash,
                    avatar: `https://i.pravatar.cc/150?u=${ADMIN_EMAIL}`,
                    kycStatus: KycStatus.Verified,
                    isVerified: true,
                    balances: { btc: 0.1234, eth: 2.5678, usdt: 5120.75 },
                    hashrate: 500,
                };
                 const updatedUsers = [...prevUsers, adminUser];

                // Add mock transactions for the admin user
                setTransactions(prevTxs => {
                    const adminHasTxs = prevTxs.some(tx => tx.userId === 'user_admin');
                    if (!adminHasTxs) {
                        const adminTxs = MOCK_TRANSACTIONS.map(tx => ({...tx, userId: 'user_admin'}));
                        return [...prevTxs, ...adminTxs];
                    }
                    return prevTxs;
                });

                return updatedUsers;
            }
            return prevUsers;
        });
    }, []);

    const getUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);
    
    const addUser = (newUser: User) => {
        setUsers(prevUsers => {
            const userExists = prevUsers.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
            if (userExists) {
                console.warn("Attempted to add a user that already exists:", newUser.email);
                return prevUsers;
            }
            return [...prevUsers, newUser];
        });
        window.dispatchEvent(new CustomEvent('db_updated'));
    };

    const updateUser = (updatedUser: User) => {
        setUsers(prevUsers => {
            const index = prevUsers.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) {
                const newUsers = [...prevUsers];
                // Keep the original password if it's not being updated
                newUsers[index] = { ...updatedUser, password: updatedUser.password || prevUsers[index].password }; 
                return newUsers;
            }
            // If user doesn't exist, don't add them here. Use addUser.
            return prevUsers;
        });
        window.dispatchEvent(new CustomEvent('db_updated'));
    };

    const getTransactionsByUserId = useCallback((userId: string) => {
        return transactions.filter(tx => tx.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);
    
    const addTransaction = (txData: Omit<Transaction, 'id' | 'date' | 'status'>) => {
        const newTx: Transaction = {
            ...txData,
            id: `tx_${Date.now()}`,
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            status: TransactionStatus.Pending,
        };
        setTransactions(prev => [newTx, ...prev]);
        window.dispatchEvent(new CustomEvent('db_updated'));
    };

    const updateTransactionStatus = (txId: string, status: TransactionStatus) => {
        let updatedTx: Transaction | null = null;
        
        setTransactions(prevTxs => {
            const index = prevTxs.findIndex(t => t.id === txId);
            if (index === -1) return prevTxs;

            const newTxs = [...prevTxs];
            updatedTx = { ...newTxs[index], status };
            newTxs[index] = updatedTx;
            return newTxs;
        });

        if (updatedTx) {
            const user = getUserById(updatedTx.userId);
            if (!user) return;

            const tx = updatedTx;
            const currencyKey = tx.currency.toLowerCase() as keyof Balances;
            const newBalances = { ...user.balances };

            let balanceChanged = false;
            // Logic for balance changes on approval/rejection
            if (tx.type === TransactionType.Deposit && status === TransactionStatus.Completed) {
                newBalances[currencyKey] += tx.amount;
                balanceChanged = true;
            } else if (tx.type === TransactionType.Withdrawal && status === TransactionStatus.Failed) {
                // Refund the held amount if withdrawal is rejected
                newBalances[currencyKey] += tx.amount;
                balanceChanged = true;
            }
            
            if (balanceChanged) {
                 updateUser({ ...user, balances: newBalances });
            }
        }
        window.dispatchEvent(new CustomEvent('db_updated'));
    };
    
    const value = {
        users,
        getUserById,
        addUser,
        updateUser,
        transactions,
        getTransactionsByUserId,
        addTransaction,
        updateTransactionStatus,
    };

    // FIX: Replaced JSX with React.createElement to support .ts file extension.
    return React.createElement(DatabaseContext.Provider, { value }, children);
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};