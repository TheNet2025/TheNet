import React, { useState, useMemo } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import { User, Transaction, TransactionType, TransactionStatus, Balances, KycStatus, ActivityLog, Plan } from '../types';
import { ArrowLeftIcon, BtcIcon, EthIcon, UsdtIcon, DepositIcon, WithdrawIcon, GiftIcon, ShoppingCartIcon, HistoryIcon } from './common/Icons';
import { useDatabase } from '../hooks/useDatabase';

const KycStatusBadge: React.FC<{ status: KycStatus }> = ({ status }) => {
    const styles = {
        [KycStatus.Verified]: 'bg-success/20 text-success',
        [KycStatus.Pending]: 'bg-warning/20 text-warning',
        [KycStatus.NotVerified]: 'bg-secondary text-text-muted-dark',
        [KycStatus.Rejected]: 'bg-danger/20 text-danger',
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>
};

interface AugmentedTransaction extends Transaction {
  userEmail: string;
}

const TransactionApprovalCard: React.FC<{ 
    tx: AugmentedTransaction, 
    onAction: (txId: string, action: 'approve' | 'reject') => void 
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
           <Button onClick={() => onAction(tx.id, 'approve')} className="!px-4 !py-1.5 !text-xs !bg-success !text-black">Approve</Button>
           <Button onClick={() => onAction(tx.id, 'reject')} className="!px-4 !py-1.5 !text-xs !bg-danger">Reject</Button>
        </div>
    </div>
);

const UserDetailView: React.FC<{ userId: string; onBack: () => void; }> = ({ userId, onBack }) => {
    const { getUserById, getTransactionsByUserId } = useDatabase();
    const user = getUserById(userId);
    const transactions = getTransactionsByUserId(userId);

    const coinData: { key: keyof Balances; name: string; icon: React.ReactNode }[] = [
        { key: 'btc', name: 'Bitcoin', icon: <BtcIcon /> },
        { key: 'eth', name: 'Ethereum', icon: <EthIcon /> },
        { key: 'usdt', name: 'Tether', icon: <UsdtIcon /> },
    ];
    
    const statusStyles: Record<TransactionStatus, string> = {
      [TransactionStatus.Completed]: 'text-success bg-success/10 border border-success/20',
      [TransactionStatus.Pending]: 'text-warning bg-warning/10 border border-warning/20',
      [TransactionStatus.Failed]: 'text-danger bg-danger/10 border border-danger/20',
    };

    const typeConfigs: Record<TransactionType, { icon: React.ReactNode; color: string }> = {
        [TransactionType.Deposit]: { icon: <DepositIcon className="h-5 w-5 text-success" />, color: 'text-success' },
        [TransactionType.Withdrawal]: { icon: <WithdrawIcon className="h-5 w-5 text-danger" />, color: 'text-danger' },
        [TransactionType.Payout]: { icon: <GiftIcon className="h-5 w-5 text-primary" />, color: 'text-primary' },
        [TransactionType.Purchase]: { icon: <ShoppingCartIcon className="h-5 w-5 text-yellow-500" />, color: 'text-danger' },
    };

    if (!user) {
        return <div className="p-5 text-center text-danger">User not found. <Button onClick={onBack} className="mt-4">Back</Button></div>;
    }

    return (
        <div className="p-5 space-y-6 pb-24">
            <div className="flex items-center space-x-4">
                <Button onClick={onBack} variant="secondary" className="!p-3 !rounded-full">
                    <ArrowLeftIcon className="w-6 h-6" />
                </Button>
                <h1 className="text-3xl font-extrabold text-text-dark">User Details</h1>
            </div>
            <Card className="flex items-center space-x-4">
                <img src={user.avatar} alt={user.username} className="w-20 h-20 rounded-full object-cover border-4 border-primary/50" />
                <div>
                    <h2 className="text-2xl font-bold text-text-dark">{user.username}</h2>
                    <p className="text-text-muted-dark">{user.email}</p>
                    <div className="mt-2"><KycStatusBadge status={user.kycStatus} /></div>
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold text-text-dark mb-4">Wallet Balances</h3>
                <div className="space-y-3">
                {coinData.map(({ key, name, icon }) => (
                    <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8">{icon}</div>
                        <p className="font-semibold text-text-dark">{name}</p>
                    </div>
                    <p className="font-mono text-text-dark">{user.balances[key].toFixed(6)}</p>
                    </div>
                ))}
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold text-text-dark mb-4">Transaction History ({transactions.length})</h3>
                {transactions.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center space-x-3 p-2 bg-secondary/50 rounded-lg">
                        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${typeConfigs[tx.type].color}/10`}>
                            {typeConfigs[tx.type].icon}
                        </div>
                        <div className="flex-1">
                        <p className="font-semibold text-text-dark">{tx.details || tx.type}</p>
                        <p className="text-xs text-text-muted-dark">{tx.date}</p>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${typeConfigs[tx.type].color}`}>{tx.type === TransactionType.Withdrawal || tx.type === TransactionType.Purchase ? '-' : '+'}{tx.amount.toFixed(4)} {tx.currency}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[tx.status]}`}>{tx.status}</span>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="text-center py-8 text-text-muted-dark">
                    <HistoryIcon className="w-12 h-12 mx-auto text-border-dark" />
                    <p className="mt-2">No transactions recorded for this user.</p>
                </div>
                )}
            </Card>
        </div>
    );
};

type AdminTab = 'deposits' | 'withdrawals' | 'users' | 'kyc' | 'activity' | 'plans';

const Admin: React.FC = () => {
    const { users, transactions, updateTransactionStatus, getUserById, updateKycStatus, activityLog, plans, updatePlan } = useDatabase();
    const [activeTab, setActiveTab] = useState<AdminTab>('deposits');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [newPrice, setNewPrice] = useState('');

    const { pendingDeposits, pendingWithdrawals } = useMemo(() => {
        const deposits: AugmentedTransaction[] = [];
        const withdrawals: AugmentedTransaction[] = [];
        transactions.filter(tx => tx.status === TransactionStatus.Pending).forEach(tx => {
            const user = getUserById(tx.userId);
            if (user) {
                const augmentedTx = { ...tx, userEmail: user.email };
                if (tx.type === TransactionType.Deposit) deposits.push(augmentedTx);
                else if (tx.type === TransactionType.Withdrawal) withdrawals.push(augmentedTx);
            }
        });
        return { 
            pendingDeposits: deposits.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
            pendingWithdrawals: withdrawals.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
    }, [transactions, getUserById]);
    
    const pendingKycUsers = useMemo(() => users.filter(u => u.kycStatus === KycStatus.Pending), [users]);
    const allUsers = useMemo(() => users.filter(u => u.email.toLowerCase() !== 'albertonani79@gmail.com'), [users]);
    
    const handleTransactionAction = (txId: string, action: 'approve' | 'reject') => {
        updateTransactionStatus(txId, action === 'approve' ? TransactionStatus.Completed : TransactionStatus.Failed);
    };

    const handleKycAction = (userId: string, action: 'approve' | 'reject') => {
        updateKycStatus(userId, action === 'approve' ? KycStatus.Verified : KycStatus.Rejected);
    };

    const handlePlanPriceUpdate = () => {
        if (editingPlan && newPrice) {
            const priceNum = parseFloat(newPrice);
            if (!isNaN(priceNum) && priceNum > 0) {
                updatePlan(editingPlan.id, priceNum);
                setEditingPlan(null);
                setNewPrice('');
            }
        }
    };

    if (selectedUserId) {
        return <UserDetailView userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
    }

    const tabs: { id: AdminTab; label: string; count: number }[] = [
        { id: 'deposits', label: 'Deposits', count: pendingDeposits.length },
        { id: 'withdrawals', label: 'Withdrawals', count: pendingWithdrawals.length },
        { id: 'kyc', label: 'KYC', count: pendingKycUsers.length },
        { id: 'users', label: 'Users', count: 0 },
        { id: 'plans', label: 'Plans', count: 0 },
        { id: 'activity', label: 'Activity', count: 0 },
    ];

    return (
        <>
            <div className="p-5 space-y-6 pb-24">
                <h1 className="text-4xl font-extrabold text-text-dark">Admin Dashboard</h1>

                <div className="bg-secondary rounded-2xl p-1">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 relative flex items-center ${activeTab === tab.id ? 'bg-card-dark text-primary shadow-md' : 'text-text-muted-dark'}`}>
                                {tab.label}
                                {tab.count > 0 && <span className="ml-2 h-5 w-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">{tab.count}</span>}
                            </button>
                        ))}
                    </div>
                </div>
                
                <Card>
                    {activeTab === 'deposits' && (
                        <><h2 className="font-bold text-xl mb-4 text-text-dark">Pending Deposits</h2>{pendingDeposits.length > 0 ? (<div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">{pendingDeposits.map(tx => <TransactionApprovalCard key={tx.id} tx={tx} onAction={handleTransactionAction} />)}</div>) : (<p className="text-text-muted-dark text-center py-8">No pending deposits.</p>)}</>
                    )}
                    {activeTab === 'withdrawals' && (
                         <><h2 className="font-bold text-xl mb-4 text-text-dark">Pending Withdrawals</h2>{pendingWithdrawals.length > 0 ? (<div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">{pendingWithdrawals.map(tx => <TransactionApprovalCard key={tx.id} tx={tx} onAction={handleTransactionAction} />)}</div>) : (<p className="text-text-muted-dark text-center py-8">No pending withdrawals.</p>)}</>
                    )}
                    {activeTab === 'kyc' && (
                        <><h2 className="font-bold text-xl mb-4 text-text-dark">Pending KYC Verifications</h2>{pendingKycUsers.length > 0 ? (<div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">{pendingKycUsers.map(user => (<div key={user.id} className="bg-secondary/80 p-3 rounded-lg flex justify-between items-center"><div className="flex items-center space-x-3"><img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" /><div><p className="font-bold text-text-dark">{user.username}</p><p className="text-sm text-text-muted-dark">{user.email}</p></div></div><div className="flex space-x-2"><Button onClick={() => handleKycAction(user.id, 'approve')} className="!px-4 !py-1.5 !text-xs !bg-success !text-black">Approve</Button><Button onClick={() => handleKycAction(user.id, 'reject')} className="!px-4 !py-1.5 !text-xs !bg-danger">Reject</Button></div></div>))}</div>) : (<p className="text-text-muted-dark text-center py-8">No pending KYC requests.</p>)}</>
                    )}
                    {activeTab === 'users' && (
                        <><h2 className="font-bold text-xl mb-4 text-text-dark">User Management ({allUsers.length})</h2><div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">{allUsers.map(user => (<div key={user.id} onClick={() => setSelectedUserId(user.id)} className="flex items-center space-x-4 bg-secondary/80 p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"><img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover" /><div className="flex-1"><p className="font-bold text-text-dark">{user.username}</p><p className="text-sm text-text-muted-dark">{user.email}</p></div><KycStatusBadge status={user.kycStatus} /></div>))}</div></>
                    )}
                    {activeTab === 'plans' && (
                        <>
                            <h2 className="font-bold text-xl mb-4 text-text-dark">Manage Mining Plans</h2>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                {plans.map(plan => (
                                    <div key={plan.id} className="bg-secondary/80 p-3 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-text-dark">{plan.name}</p>
                                            <p className="text-sm text-text-muted-dark">{plan.hashrate} GH/s for {plan.durationDays} days</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <p className="font-bold text-lg text-primary">${plan.price}</p>
                                            <Button onClick={() => { setEditingPlan(plan); setNewPrice(String(plan.price)); }} className="!px-4 !py-1.5 !text-xs">Edit</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {activeTab === 'activity' && (
                        <><h2 className="font-bold text-xl mb-4 text-text-dark">System Activity Log</h2>{activityLog.length > 0 ? (<div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 font-mono text-xs">{activityLog.map(log => (<div key={log.id} className="flex items-start"><span className="text-primary/60 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span><span className="text-text-muted-dark flex-1">{log.message}</span></div>))}</div>) : (<p className="text-text-muted-dark text-center py-8">No activity recorded yet.</p>)}</>
                    )}
                </Card>
            </div>
            {editingPlan && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
                    <Card className="w-11/12 max-w-sm mx-auto">
                        <h2 className="text-xl font-bold text-text-dark mb-4">Edit Price for {editingPlan.name}</h2>
                        <Input 
                            label="New Price (USDT)" 
                            type="number" 
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            placeholder="e.g., 499.99"
                        />
                        <div className="flex space-x-4 mt-6">
                            <Button variant="secondary" className="w-full" onClick={() => setEditingPlan(null)}>Cancel</Button>
                            <Button className="w-full" onClick={handlePlanPriceUpdate}>Save</Button>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
};

export default Admin;