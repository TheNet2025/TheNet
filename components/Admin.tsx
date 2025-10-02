import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import Toggle from './common/Toggle';
import { User, Theme, Transaction, TransactionType, TransactionStatus, Balances } from '../types';
import { TrashIcon, PlusIcon, CheckCircleIcon } from './common/Icons';

interface AdminProps {
    balances: Balances;
    setBalances: React.Dispatch<React.SetStateAction<Balances>>;
}

const Admin: React.FC<AdminProps> = ({ balances: initialBalances, setBalances: setGlobalBalances }) => {
    const [user, setUser] = useState<User>(() => JSON.parse(localStorage.getItem('minerx_user') || '{}'));
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('minerx_theme') as Theme) || Theme.Dark);
    const [localBalances, setLocalBalances] = useState<Balances>(initialBalances);
    const [hashrate, setHashrate] = useState<number>(250.7);
    const [transactions, setTransactions] = useState<Transaction[]>(() => JSON.parse(localStorage.getItem('minerx_transactions') || '[]'));
    
    const pendingTransactions = transactions.filter(tx => tx.status === TransactionStatus.Pending);

    useEffect(() => {
        setLocalBalances(initialBalances);
    }, [initialBalances]);

    useEffect(() => {
        const handleTxsUpdate = () => setTransactions(JSON.parse(localStorage.getItem('minerx_transactions') || '[]'));
        window.addEventListener('transactions_updated', handleTxsUpdate);
        return () => window.removeEventListener('transactions_updated', handleTxsUpdate);
    }, []);

    const dispatchUpdate = (eventName: string, detail: any) => {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    };

    const handleTransactionAction = (txId: string, action: 'approve' | 'reject') => {
        const currentTxs: Transaction[] = JSON.parse(localStorage.getItem('minerx_transactions') || '[]');
        const txIndex = currentTxs.findIndex(t => t.id === txId);
        if (txIndex === -1) return;

        const tx = currentTxs[txIndex];
        const newStatus = action === 'approve' ? TransactionStatus.Completed : TransactionStatus.Failed;
        
        // Update transaction status
        currentTxs[txIndex].status = newStatus;

        // Update balances if necessary
        const currentBalances: Balances = JSON.parse(localStorage.getItem('minerx_balances') || '{}');
        let balancesUpdated = false;

        if (tx.type === TransactionType.Deposit && action === 'approve') {
            const currencyKey = tx.currency.toLowerCase() as keyof Balances;
            currentBalances[currencyKey] = (currentBalances[currencyKey] || 0) + tx.amount;
            balancesUpdated = true;
        } else if (tx.type === TransactionType.Withdrawal && action === 'reject') {
            // Refund the held amount
            const currencyKey = tx.currency.toLowerCase() as keyof Balances;
            currentBalances[currencyKey] = (currentBalances[currencyKey] || 0) + tx.amount;
            balancesUpdated = true;
        }
        
        // Save and dispatch updates
        localStorage.setItem('minerx_transactions', JSON.stringify(currentTxs));
        dispatchUpdate('transactions_updated', null);
        
        if (balancesUpdated) {
            localStorage.setItem('minerx_balances', JSON.stringify(currentBalances));
            setGlobalBalances(currentBalances);
        }
    };


    const handleUserSave = () => {
        localStorage.setItem('minerx_user', JSON.stringify(user));
        dispatchUpdate('admin_user_update', user);
    };

    const handleThemeChange = (isDark: boolean) => {
        const newTheme = isDark ? Theme.Dark : Theme.Light;
        setTheme(newTheme);
        localStorage.setItem('minerx_theme', newTheme);
        dispatchUpdate('admin_theme_update', newTheme);
    };
    
    const handleMiningControl = (action: 'start' | 'stop' | 'set_hashrate', value?: number) => {
        dispatchUpdate('admin_mining_control', { action, value });
    };

    const handleBalanceSet = () => {
        setGlobalBalances(localBalances);
    };
    
    const deleteTransaction = (id: string) => {
        const updatedTxs = transactions.filter(tx => tx.id !== id);
        localStorage.setItem('minerx_transactions', JSON.stringify(updatedTxs));
        dispatchUpdate('transactions_updated', null);
    };
    
    const addTransaction = () => {
        const newTx: Transaction = {
            id: `tx_admin_${Date.now()}`,
            type: TransactionType.Deposit,
            status: TransactionStatus.Completed,
            amount: 1.0,
            currency: 'BTC',
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            address: 'admin_generated',
        };
        const updatedTxs = [newTx, ...transactions];
        localStorage.setItem('minerx_transactions', JSON.stringify(updatedTxs));
        dispatchUpdate('transactions_updated', null);
    };


    return (
        <div className="p-5 space-y-6">
            <h1 className="text-4xl font-extrabold text-text-dark">Admin Panel</h1>
            
            {pendingTransactions.length > 0 && (
                <Card className="!border-warning !border-2">
                    <h2 className="font-bold text-xl mb-4 text-warning">Pending Actions ({pendingTransactions.length})</h2>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {pendingTransactions.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center bg-secondary/80 p-3 rounded-lg">
                               <div>
                                    <p className="font-semibold text-text-dark">{tx.type} - {tx.amount} {tx.currency}</p>
                                    <p className="text-xs text-text-muted-dark">{tx.date}</p>
                               </div>
                               <div className="flex space-x-2">
                                   <Button onClick={() => handleTransactionAction(tx.id, 'approve')} className="!px-3 !py-2 !text-xs !bg-success !text-black">Approve</Button>
                                   <Button onClick={() => handleTransactionAction(tx.id, 'reject')} className="!px-3 !py-2 !text-xs !bg-danger">Reject</Button>
                               </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card>
                <h2 className="font-bold text-xl mb-4 text-text-dark">User Management</h2>
                <div className="space-y-4">
                    <Input label="Username" value={user.username} onChange={e => setUser({...user, username: e.target.value})} />
                    <Input label="Email" value={user.email} onChange={e => setUser({...user, email: e.target.value})} />
                    <Input label="Avatar URL" value={user.avatar} onChange={e => setUser({...user, avatar: e.target.value})} />
                </div>
                <Button onClick={handleUserSave} className="w-full mt-6">Save User</Button>
            </Card>
            
            <Card>
                <h2 className="font-bold text-xl mb-4 text-text-dark">Mining Control</h2>
                <div className="grid grid-cols-2 gap-4">
                     <Button onClick={() => handleMiningControl('start')} variant="secondary">Start Mining</Button>
                     <Button onClick={() => handleMiningControl('stop')} variant="danger">Stop Mining</Button>
                </div>
                <div className="flex items-end space-x-2 mt-4">
                     <Input label="Set Hashrate (MH/s)" type="number" value={hashrate} onChange={e => setHashrate(parseFloat(e.target.value))} />
                     <Button onClick={() => handleMiningControl('set_hashrate', hashrate)} variant="secondary">Set</Button>
                </div>
            </Card>

            <Card>
                <h2 className="font-bold text-xl mb-4 text-text-dark">Wallet Control</h2>
                <div className="space-y-4">
                    <Input label="Set BTC Balance" type="number" value={localBalances.btc} onChange={e => setLocalBalances({...localBalances, btc: parseFloat(e.target.value) || 0})} />
                    <Input label="Set ETH Balance" type="number" value={localBalances.eth} onChange={e => setLocalBalances({...localBalances, eth: parseFloat(e.target.value) || 0})} />
                    <Input label="Set USDT Balance" type="number" value={localBalances.usdt} onChange={e => setLocalBalances({...localBalances, usdt: parseFloat(e.target.value) || 0})} />
                </div>
                 <Button onClick={handleBalanceSet} variant="secondary" className="w-full mt-6">Set Balances</Button>
            </Card>
            
            <Card>
                <h2 className="font-bold text-xl mb-4 text-text-dark">App Settings</h2>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-lg text-text-dark">Dark Mode</span>
                    <Toggle label="Theme" enabled={theme === Theme.Dark} onChange={handleThemeChange} />
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-xl text-text-dark">Transaction History</h2>
                    <Button onClick={addTransaction} variant="ghost" icon={<PlusIcon className="w-5 h-5"/>}>Add</Button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {transactions.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center bg-secondary/80 p-3 rounded-lg">
                           <div>
                                <p className="font-semibold text-text-dark">{tx.type} - {tx.amount} {tx.currency}</p>
                                <p className="text-xs text-text-muted-dark">{tx.id}</p>
                           </div>
                           <button onClick={() => deleteTransaction(tx.id)} className="p-2 text-danger/70 hover:text-danger hover:bg-danger/10 rounded-full transition-colors">
                               <TrashIcon className="w-5 h-5" />
                           </button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Admin;