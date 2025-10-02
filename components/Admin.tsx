import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { User, Transaction, TransactionType, TransactionStatus, Balances, KycStatus } from '../types';

// In a real app, this would be fetched from a secure backend.
const USERS_KEY = 'minerx_users';

interface AugmentedTransaction extends Transaction {
  userId: string;
  userEmail: string;
}

const TransactionApprovalCard: React.FC<{ 
    tx: AugmentedTransaction, 
    onAction: (tx: AugmentedTransaction, action: 'approve' | 'reject') => void 
}> = ({ tx, onAction }) => (
    <div className="bg-secondary/80 p-3 rounded-lg">
        <div className="flex justify-between items-center">
            <div>
                <p className="font-bold text-text-dark">{tx.type} Request</p>
                <p className="text-sm text-text-muted-dark">{tx.userEmail}</p>
            </div>
            <p className={`font-bold text-lg ${tx.type === 'Deposit' ? 'text-success' : 'text-danger'}`}>
                {tx.type === 'Deposit' ? '+' : '-'}{tx.amount.toFixed(4)} {tx.currency}
            </p>
        </div>
        <div className="flex justify-end space-x-2 mt-3">
           <Button onClick={() => onAction(tx, 'approve')} className="!px-4 !py-1.5 !text-xs !bg-success !text-black">Approve</Button>
           <Button onClick={() => onAction(tx, 'reject')} className="!px-4 !py-1.5 !text-xs !bg-danger">Reject</Button>
        </div>
    </div>
);


const Admin: React.FC = () => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [pendingDeposits, setPendingDeposits] = useState<AugmentedTransaction[]>([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState<AugmentedTransaction[]>([]);
    const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'users'>('deposits');
    const [isLoading, setIsLoading] = useState(true);

    const loadData = () => {
        setIsLoading(true);
        const usersJson = localStorage.getItem(USERS_KEY);
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];
        setAllUsers(users.filter(u => u.email !== 'admin'));

        const allPendingDeposits: AugmentedTransaction[] = [];
        const allPendingWithdrawals: AugmentedTransaction[] = [];
        
        users.forEach(user => {
            const txsJson = localStorage.getItem(`minerx_transactions_${user.id}`);
            const userTxs: Transaction[] = txsJson ? JSON.parse(txsJson) : [];
            
            userTxs.forEach(tx => {
                if (tx.status === TransactionStatus.Pending) {
                    const augmentedTx = { ...tx, userId: user.id, userEmail: user.email };
                    if (tx.type === TransactionType.Deposit) {
                        allPendingDeposits.push(augmentedTx);
                    } else if (tx.type === TransactionType.Withdrawal) {
                        allPendingWithdrawals.push(augmentedTx);
                    }
                }
            });
        });
        
        setPendingDeposits(allPendingDeposits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setPendingWithdrawals(allPendingWithdrawals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleTransactionAction = (txToUpdate: AugmentedTransaction, action: 'approve' | 'reject') => {
        const { id: txId, userId } = txToUpdate;
        
        const TX_KEY = `minerx_transactions_${userId}`;
        const txsJson = localStorage.getItem(TX_KEY);
        const transactions: Transaction[] = txsJson ? JSON.parse(txsJson) : [];
        const txIndex = transactions.findIndex(t => t.id === txId);

        if (txIndex === -1) return;

        const newStatus = action === 'approve' ? TransactionStatus.Completed : TransactionStatus.Failed;
        transactions[txIndex].status = newStatus;
        localStorage.setItem(TX_KEY, JSON.stringify(transactions));

        const tx = transactions[txIndex];
        let balancesUpdated = false;
        
        const BAL_KEY = `minerx_balances_${userId}`;
        const balJson = localStorage.getItem(BAL_KEY);
        const balances: Balances = balJson ? JSON.parse(balJson) : { btc: 0, eth: 0, usdt: 0 };
        const currencyKey = tx.currency.toLowerCase() as keyof Balances;

        if (tx.type === TransactionType.Deposit && action === 'approve') {
            balances[currencyKey] = (balances[currencyKey] || 0) + tx.amount;
            balancesUpdated = true;
        } 
        else if (tx.type === TransactionType.Withdrawal && action === 'reject') {
            balances[currencyKey] = (balances[currencyKey] || 0) + tx.amount;
            balancesUpdated = true;
        }
        
        if (balancesUpdated) {
            localStorage.setItem(BAL_KEY, JSON.stringify(balances));
            window.dispatchEvent(new Event('balances_updated'));
        }

        loadData();
        window.dispatchEvent(new Event('transactions_updated'));
    };

    const KycStatusBadge: React.FC<{ status: KycStatus }> = ({ status }) => {
        const styles = {
            [KycStatus.Verified]: 'bg-success/20 text-success',
            [KycStatus.Pending]: 'bg-warning/20 text-warning',
            [KycStatus.NotVerified]: 'bg-secondary text-text-muted-dark',
            [KycStatus.Rejected]: 'bg-danger/20 text-danger',
        };
        return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>
    };

    return (
        <div className="p-5 space-y-6 pb-24">
            <h1 className="text-4xl font-extrabold text-text-dark">Admin Dashboard</h1>

            <div className="flex bg-secondary rounded-2xl p-1">
                <button
                    onClick={() => setActiveTab('deposits')}
                    className={`w-1/3 py-2.5 rounded-xl font-bold text-base transition-all duration-300 relative ${activeTab === 'deposits' ? 'bg-card-dark text-primary shadow-md' : 'text-text-muted-dark'}`}
                >
                    Deposits
                    {pendingDeposits.length > 0 && 
                        <span className="absolute top-1 right-2 h-5 w-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {pendingDeposits.length}
                        </span>
                    }
                </button>
                <button
                    onClick={() => setActiveTab('withdrawals')}
                    className={`w-1/3 py-2.5 rounded-xl font-bold text-base transition-all duration-300 relative ${activeTab === 'withdrawals' ? 'bg-card-dark text-primary shadow-md' : 'text-text-muted-dark'}`}
                >
                    Withdrawals
                     {pendingWithdrawals.length > 0 && 
                        <span className="absolute top-1 right-2 h-5 w-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {pendingWithdrawals.length}
                        </span>
                    }
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`w-1/3 py-2.5 rounded-xl font-bold text-base transition-all duration-300 ${activeTab === 'users' ? 'bg-card-dark text-primary shadow-md' : 'text-text-muted-dark'}`}
                >
                    Users
                </button>
            </div>
            
            {isLoading ? <div className="text-center p-10 text-primary">Loading Data...</div> : (
                <>
                    {activeTab === 'deposits' && (
                        <Card>
                            <h2 className="font-bold text-xl mb-4 text-text-dark">Pending Deposits</h2>
                            {pendingDeposits.length > 0 ? (
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                    {pendingDeposits.map(tx => (
                                        <TransactionApprovalCard key={tx.id} tx={tx} onAction={handleTransactionAction} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-muted-dark text-center py-8">No pending deposits.</p>
                            )}
                        </Card>
                    )}
                    
                    {activeTab === 'withdrawals' && (
                        <Card>
                            <h2 className="font-bold text-xl mb-4 text-text-dark">Pending Withdrawals</h2>
                            {pendingWithdrawals.length > 0 ? (
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                    {pendingWithdrawals.map(tx => (
                                        <TransactionApprovalCard key={tx.id} tx={tx} onAction={handleTransactionAction} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-muted-dark text-center py-8">No pending withdrawals.</p>
                            )}
                        </Card>
                    )}

                    {activeTab === 'users' && (
                        <Card>
                            <h2 className="font-bold text-xl mb-4 text-text-dark">User Management ({allUsers.length})</h2>
                             <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                {allUsers.map(user => (
                                    <div key={user.id} className="flex items-center space-x-4 bg-secondary/80 p-3 rounded-lg">
                                        <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                                        <div className="flex-1">
                                            <p className="font-bold text-text-dark">{user.username}</p>
                                            <p className="text-sm text-text-muted-dark">{user.email}</p>
                                        </div>
                                        <KycStatusBadge status={user.kycStatus} />
                                    </div>
                                ))}
                             </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default Admin;