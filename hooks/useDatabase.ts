import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, Transaction, Balances, KycStatus, TransactionStatus, TransactionType, ActivityLog, Plan, MiningContract } from '../types';
import { MOCK_TRANSACTIONS } from '../constants';

const USERS_KEY = 'minerx_db_users';
const TRANSACTIONS_KEY = 'minerx_db_transactions';
const ACTIVITY_LOG_KEY = 'minerx_db_activity_log';
const PLANS_KEY = 'minerx_db_plans';
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

const MOCK_PLANS_DATA: Plan[] = [
  {
    id: 'plan_starter',
    name: 'Starter Miner',
    hashrate: 100, // GH/s
    durationDays: 30,
    price: 99,
    features: ['100 GH/s BTC Mining', 'SHA-256 Algorithm', 'Daily Payouts', 'Full-time Support'],
    bestValue: false,
  },
  {
    id: 'plan_pro',
    name: 'Pro Rig',
    hashrate: 500, // GH/s
    durationDays: 90,
    price: 449,
    features: ['500 GH/s BTC Mining', 'SHA-256 Algorithm', 'Daily Payouts', 'Priority Support'],
    bestValue: true,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Farm',
    hashrate: 2000, // GH/s
    durationDays: 180,
    price: 1599,
    features: ['2 TH/s BTC Mining', 'SHA-256 Algorithm', 'Instant Payouts', 'Dedicated Manager'],
    bestValue: false,
  },
];


interface DatabaseContextType {
    // Users
    users: User[];
    getUserById: (id: string) => User | undefined;
    addUser: (newUser: User) => void;
    updateUser: (updatedUser: User) => void;
    
    // Transactions
    transactions: Transaction[];
    getTransactionsByUserId: (userId: string) => Transaction[];
    addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'status'>, initialStatus?: TransactionStatus) => void;
    updateTransactionStatus: (txId: string, status: TransactionStatus) => void;

    // KYC and Logging
    updateKycStatus: (userId: string, status: KycStatus) => void;
    activityLog: ActivityLog[];
    
    // Plans
    plans: Plan[];
    updatePlan: (planId: string, newPrice: number) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(() => getInitialState<User[]>(USERS_KEY, []));
    const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialState<Transaction[]>(TRANSACTIONS_KEY, []));
    const [activityLog, setActivityLog] = useState<ActivityLog[]>(() => getInitialState<ActivityLog[]>(ACTIVITY_LOG_KEY, []));
    const [plans, setPlans] = useState<Plan[]>(() => getInitialState<Plan[]>(PLANS_KEY, MOCK_PLANS_DATA));

    // Persist to localStorage whenever data changes
    useEffect(() => localStorage.setItem(USERS_KEY, JSON.stringify(users)), [users]);
    useEffect(() => localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions)), [transactions]);
    useEffect(() => localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(activityLog)), [activityLog]);
    useEffect(() => localStorage.setItem(PLANS_KEY, JSON.stringify(plans)), [plans]);

    // Initialize admin user on first load
    useEffect(() => {
        setUsers(prevUsers => {
            const adminExists = prevUsers.some(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
            if (!adminExists) {
                const adminPasswordHash = btoa(ADMIN_PASSWORD);

                // Create some sample contracts for the admin
                const now = new Date();
                const purchaseDate1 = new Date(now);
                const expiryDate1 = new Date(now);
                expiryDate1.setDate(expiryDate1.getDate() + 90); // 90 days from now

                const purchaseDate2 = new Date(now);
                purchaseDate2.setDate(purchaseDate2.getDate() - 10); // 10 days ago
                const expiryDate2 = new Date(purchaseDate2);
                expiryDate2.setDate(expiryDate2.getDate() + 30); // expires in 20 days

                const adminContracts: MiningContract[] = [
                    {
                        id: `contract_admin_1`,
                        planId: 'plan_pro',
                        planName: 'Pro Rig',
                        hashrate: 500,
                        purchaseDate: purchaseDate1.toISOString(),
                        expiryDate: expiryDate1.toISOString(),
                    },
                    {
                        id: `contract_admin_2`,
                        planId: 'plan_starter',
                        planName: 'Starter Miner',
                        hashrate: 100,
                        purchaseDate: purchaseDate2.toISOString(),
                        expiryDate: expiryDate2.toISOString(),
                    }
                ];

                const adminUser: User = {
                    id: 'user_admin',
                    username: 'Admin',
                    email: ADMIN_EMAIL,
                    password: adminPasswordHash,
                    avatar: `https://i.pravatar.cc/150?u=${ADMIN_EMAIL}`,
                    kycStatus: KycStatus.Verified,
                    isVerified: true,
                    balances: { btc: 0.1234, eth: 2.5678, usdt: 5120.75 },
                    contracts: adminContracts,
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

    const logActivity = (message: string) => {
        const newLog: ActivityLog = {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            message,
        };
        setActivityLog(prev => [newLog, ...prev]);
    };

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
                const oldUser = prevUsers[index];
                if (oldUser.kycStatus !== KycStatus.Pending && updatedUser.kycStatus === KycStatus.Pending) {
                    logActivity(`User ${updatedUser.email} submitted KYC for review.`);
                }
                const newUsers = [...prevUsers];
                newUsers[index] = { ...updatedUser, password: updatedUser.password || prevUsers[index].password }; 
                return newUsers;
            }
            return prevUsers;
        });
        window.dispatchEvent(new CustomEvent('db_updated'));
    };
    
    const updatePlan = (planId: string, newPrice: number) => {
        setPlans(prevPlans => {
            const newPlans = prevPlans.map(p => {
                if (p.id === planId) {
                    return { ...p, price: newPrice };
                }
                return p;
            });
            return newPlans;
        });
        logActivity(`Admin updated price for plan ${planId} to $${newPrice}.`);
        window.dispatchEvent(new CustomEvent('db_updated'));
    };

    const getTransactionsByUserId = useCallback((userId: string) => {
        return transactions.filter(tx => tx.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);
    
    const addTransaction = (txData: Omit<Transaction, 'id' | 'date' | 'status'>, initialStatus: TransactionStatus = TransactionStatus.Pending) => {
        const newTx: Transaction = {
            ...txData,
            id: `tx_${Date.now()}`,
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            status: initialStatus,
        };
        
        if (newTx.type === TransactionType.Purchase && newTx.status === TransactionStatus.Completed) {
            const user = getUserById(newTx.userId);
            if(user) {
                logActivity(`'${newTx.details}' by ${user.email} completed instantly.`);
            }
        }

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
            if (tx.type === TransactionType.Deposit && status === TransactionStatus.Completed) {
                newBalances[currencyKey] += tx.amount;
                balanceChanged = true;
            } else if (tx.type === TransactionType.Withdrawal && status === TransactionStatus.Failed) {
                newBalances[currencyKey] += tx.amount;
                balanceChanged = true;
            }
            
            if (balanceChanged) {
                 updateUser({ ...user, balances: newBalances });
            }
        }
        window.dispatchEvent(new CustomEvent('db_updated'));
    };

    const updateKycStatus = (userId: string, status: KycStatus) => {
        const user = getUserById(userId);
        if (!user) return;
        updateUser({ ...user, kycStatus: status });
        const action = status === KycStatus.Verified ? 'approved' : 'rejected';
        logActivity(`Admin ${action} KYC for ${user.email}.`);
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
        updateKycStatus,
        activityLog,
        plans,
        updatePlan
    };

    return React.createElement(DatabaseContext.Provider, { value }, children);
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};