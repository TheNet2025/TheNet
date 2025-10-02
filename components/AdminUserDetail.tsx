import React, { useState, useEffect, useMemo } from 'react';
import { User, Transaction, Balances, Page, KycStatus, TransactionStatus, TransactionType } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { ArrowLeftIcon, BtcIcon, EthIcon, UsdtIcon, DepositIcon, WithdrawIcon, GiftIcon, ShoppingCartIcon, HistoryIcon } from './common/Icons';

interface AdminUserDetailProps {
  userId: string;
  navigateTo: (page: Page) => void;
}

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

const AdminUserDetail: React.FC<AdminUserDetailProps> = ({ userId, navigateTo }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<Balances>({ btc: 0, eth: 0, usdt: 0 });

  useEffect(() => {
    // Fetch all data for the specific user from localStorage
    const usersJson = localStorage.getItem('minerx_users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    const foundUser = users.find(u => u.id === userId);
    setUser(foundUser || null);

    const txsJson = localStorage.getItem(`minerx_transactions_${userId}`);
    setTransactions(txsJson ? JSON.parse(txsJson) : []);
    
    const balancesJson = localStorage.getItem(`minerx_balances_${userId}`);
    setBalances(balancesJson ? JSON.parse(balancesJson) : { btc: 0, eth: 0, usdt: 0 });
  }, [userId]);

  const KycStatusBadge: React.FC<{ status: KycStatus }> = ({ status }) => {
    const styles = {
        [KycStatus.Verified]: 'bg-success/20 text-success',
        [KycStatus.Pending]: 'bg-warning/20 text-warning',
        [KycStatus.NotVerified]: 'bg-secondary text-text-muted-dark',
        [KycStatus.Rejected]: 'bg-danger/20 text-danger',
    };
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status]}`}>{status}</span>
  };

  const coinData: { key: keyof Balances; name: string; icon: React.ReactNode }[] = [
    { key: 'btc', name: 'Bitcoin', icon: <BtcIcon /> },
    { key: 'eth', name: 'Ethereum', icon: <EthIcon /> },
    { key: 'usdt', name: 'Tether', icon: <UsdtIcon /> },
  ];

  if (!user) {
    return (
      <div className="p-5 text-center">
        <p className="text-danger">User not found.</p>
        <Button onClick={() => navigateTo(Page.Admin)} className="mt-4">Back to Admin Panel</Button>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 pb-24">
      <div className="flex items-center space-x-4">
        <Button onClick={() => navigateTo(Page.Admin)} variant="secondary" className="!p-3 !rounded-full">
          <ArrowLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-extrabold text-text-dark">User Details</h1>
      </div>
      
      <Card className="flex items-center space-x-4">
        <img src={user.avatar} alt={user.username} className="w-20 h-20 rounded-full object-cover border-4 border-primary/50" />
        <div>
          <h2 className="text-2xl font-bold text-text-dark">{user.username}</h2>
          <p className="text-text-muted-dark">{user.email}</p>
          <div className="mt-2">
            <KycStatusBadge status={user.kycStatus} />
          </div>
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
              <p className="font-mono text-text-dark">{balances[key].toFixed(6)}</p>
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

export default AdminUserDetail;