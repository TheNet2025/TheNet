import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import Toggle from './common/Toggle';
import { User, Theme, Transaction, TransactionType, TransactionStatus, Balances, KycStatus, SystemAlert, WorkerNode } from '../types';
import { TrashIcon, PlusIcon, ExclamationTriangleIcon, ServerIcon, ChartPieIcon, CodeBracketIcon, DocumentTextIcon } from './common/Icons';
import MetricChart from './common/MetricChart';
import LiveLogViewer from './common/LiveLogViewer';


const MOCK_ALERTS: SystemAlert[] = [
    { id: 'alert1', severity: 'Critical', message: 'Payout Worker #3 is unresponsive. No payouts processed in 15 mins.', timestamp: '2 mins ago' },
    { id: 'alert2', severity: 'Warning', message: 'High rate of failed withdrawal attempts from IP 123.45.67.89.', timestamp: '28 mins ago' },
];

const MOCK_WORKERS: WorkerNode[] = [
    { id: 'worker1', name: 'Payout Worker #1', status: 'Healthy', ip: '192.168.1.101' },
    { id: 'worker2', name: 'Share Aggregator #1', status: 'Healthy', ip: '192.168.1.102' },
    { id: 'worker3', name: 'Payout Worker #2', status: 'Degraded', ip: '192.168.1.103' },
    { id: 'worker4', name: 'Stratum Gateway #1', status: 'Healthy', ip: '192.168.1.104' },
    { id: 'worker5', name: 'Payout Worker #3', status: 'Unresponsive', ip: '192.168.1.105' },
];

const MOCK_DEPLOYMENTS = [
    { id: 'dep1', commit: 'a1b2c3d', message: 'fix: resolved payout calculation bug', status: 'Deployed', timestamp: '2 hours ago' },
    { id: 'dep2', commit: 'e4f5g6h', message: 'feat: added new ETH mining plan', status: 'Deployed', timestamp: '1 day ago' },
    { id: 'dep3', commit: 'i7j8k9l', message: 'refactor: optimized database queries', status: 'Deployed', timestamp: '2 days ago' },
];


interface AdminProps {
    balances: Balances;
    setBalances: React.Dispatch<React.SetStateAction<Balances>>;
}

const Admin: React.FC<AdminProps> = ({ balances: initialBalances, setBalances: setGlobalBalances }) => {
    const [user, setUser] = useState<User>(() => JSON.parse(localStorage.getItem('minerx_user') || '{}'));
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('minerx_theme') as Theme) || Theme.Dark);
    const [localBalances, setLocalBalances] = useState<Balances>(initialBalances);
    const [hashrate, setHashrate] = useState<number>(() => parseFloat(localStorage.getItem('minerx_hashrate') || '0'));
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
        
        currentTxs[txIndex].status = newStatus;

        const currentBalances: Balances = JSON.parse(localStorage.getItem('minerx_balances') || '{}');
        let balancesUpdated = false;

        if (tx.type === TransactionType.Deposit && action === 'approve') {
            const currencyKey = tx.currency.toLowerCase() as keyof Balances;
            currentBalances[currencyKey] = (currentBalances[currencyKey] || 0) + tx.amount;
            balancesUpdated = true;
        } else if (tx.type === TransactionType.Withdrawal && action === 'reject') {
            const currencyKey = tx.currency.toLowerCase() as keyof Balances;
            currentBalances[currencyKey] = (currentBalances[currencyKey] || 0) + tx.amount;
            balancesUpdated = true;
        }
        
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
        if (action === 'set_hashrate' && typeof value === 'number') {
            localStorage.setItem('minerx_hashrate', value.toString());
        }
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
    
    const StatusIndicator: React.FC<{ status: 'Healthy' | 'Degraded' | 'Unresponsive' | 'Connected'}> = ({ status }) => {
        const config = {
            Healthy: { color: 'bg-success', text: 'Healthy' },
            Connected: { color: 'bg-success', text: 'Connected' },
            Degraded: { color: 'bg-warning', text: 'Degraded' },
            Unresponsive: { color: 'bg-danger', text: 'Unresponsive' },
        }[status];
        return (
            <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${config.color} animate-pulse`}></div>
                <span className="font-semibold text-text-dark">{config.text}</span>
            </div>
        );
    };


    return (
        <div className="p-5 space-y-6 pb-24">
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
                    <div>
                        <label className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-2 ml-1">KYC Status</label>
                        <select
                            value={user.kycStatus}
                            onChange={e => setUser({...user, kycStatus: e.target.value as KycStatus})}
                            className="w-full bg-background-light dark:bg-white/5 border-2 border-border-light dark:border-border-dark rounded-2xl py-3.5 px-4 text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        >
                            {Object.values(KycStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
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
                     <Input label="Set Hashrate (GH/s)" type="number" value={hashrate} onChange={e => setHashrate(parseFloat(e.target.value))} />
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
                <h2 className="font-bold text-xl mb-4 text-text-dark">System Monitoring & Ops</h2>
                
                <div className="space-y-6">
                    {/* Metrics */}
                    <div className="bg-secondary/50 p-4 rounded-xl">
                        <h3 className="font-semibold text-lg text-text-dark mb-3 flex items-center"><ChartPieIcon className="w-5 h-5 mr-2 text-primary" />Metrics Overview</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <MetricChart title="API Latency (p95)" unit="ms" color="#00E5FF" />
                           <MetricChart title="DB Queries/sec" unit="qps" color="#00FF85" />
                        </div>
                        <div className="mt-4 p-3 bg-background-dark/50 rounded-lg flex justify-between items-center">
                            <span className="text-text-muted-dark font-medium">Pool Connection:</span>
                            <StatusIndicator status="Connected" />
                        </div>
                    </div>

                    {/* Worker Status */}
                    <div className="bg-secondary/50 p-4 rounded-xl">
                        <h3 className="font-semibold text-lg text-text-dark mb-3 flex items-center"><ServerIcon className="w-5 h-5 mr-2 text-primary" />Worker Status</h3>
                        <div className="space-y-2">
                            {MOCK_WORKERS.map(worker => (
                                <div key={worker.id} className="flex justify-between items-center bg-background-dark/50 p-2 rounded-lg text-sm">
                                    <div>
                                        <p className="font-medium text-text-dark">{worker.name}</p>
                                        <p className="text-xs text-text-muted-dark font-mono">{worker.ip}</p>
                                    </div>
                                    <StatusIndicator status={worker.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Active Alerts */}
                    <div className="bg-secondary/50 p-4 rounded-xl">
                        <h3 className="font-semibold text-lg text-text-dark mb-3 flex items-center"><ExclamationTriangleIcon className="w-5 h-5 mr-2 text-danger" />Active Alerts</h3>
                        <div className="space-y-2">
                            {MOCK_ALERTS.map(alert => (
                                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${alert.severity === 'Critical' ? 'bg-danger/10 border-danger' : 'bg-warning/10 border-warning'}`}>
                                    <p className="font-bold text-text-dark">{alert.severity}: <span className="font-normal">{alert.message}</span></p>
                                    <p className="text-xs text-text-muted-dark mt-1">{alert.timestamp}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Live Logs */}
                    <LiveLogViewer />

                    {/* Deployments & Ops */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/50 p-4 rounded-xl">
                             <h3 className="font-semibold text-text-dark mb-3 flex items-center"><CodeBracketIcon className="w-5 h-5 mr-2 text-primary" />Recent Deploys</h3>
                             <div className="space-y-2 text-sm">
                                {MOCK_DEPLOYMENTS.slice(0, 2).map(d => (
                                    <div key={d.id} className="p-2 bg-background-dark/50 rounded-lg">
                                        <p className="font-mono text-primary text-xs">{d.commit}</p>
                                        <p className="text-text-dark truncate">{d.message}</p>
                                        <p className="text-xs text-text-muted-dark">{d.timestamp}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                         <div className="bg-secondary/50 p-4 rounded-xl flex flex-col justify-between">
                             <h3 className="font-semibold text-text-dark mb-3 flex items-center"><DocumentTextIcon className="w-5 h-5 mr-2 text-primary" />Operations</h3>
                             <p className="text-sm text-text-muted-dark flex-grow">Access internal documentation for incident response.</p>
                             <Button variant="ghost" onClick={() => alert('Runbooks are maintained in the internal Confluence space.')}>View Runbooks</Button>
                        </div>
                    </div>
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

            <Card>
                <h2 className="font-bold text-xl mb-4 text-text-dark">App Settings</h2>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-lg text-text-dark">Dark Mode</span>
                    <Toggle label="Theme" enabled={theme === Theme.Dark} onChange={handleThemeChange} />
                </div>
            </Card>

        </div>
    );
};

export default Admin;
