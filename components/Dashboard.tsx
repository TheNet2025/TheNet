import React from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { useMining } from '../hooks/useMining';
import { usePayouts } from '../hooks/usePayouts';
import { useLiveFeed } from '../hooks/useLiveFeed';
import LiveFeed from './LiveFeed';
import { BiometricIcon, ChartBarIcon, CpuChipIcon, PauseIcon, PlayIcon, ClockIcon } from './common/Icons';
import { Balances, Page, User } from '../types';

interface Rates {
    btc: number;
    eth: number;
    usdt: number;
}

interface DashboardProps {
  user: User;
  totalUsdValue: number;
  setBalances: React.Dispatch<React.SetStateAction<Balances>>;
  rates: Rates;
  setActivePage: (page: Page) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, subValue?: string }> = ({ icon, label, value, subValue }) => (
    <div className="flex-1 p-4 bg-secondary/50 rounded-2xl flex items-center space-x-3">
        <div className="text-primary w-8 h-8">{icon}</div>
        <div>
            <p className="text-xs text-text-muted-dark">{label}</p>
            <p className="font-bold text-lg text-text-dark">{value}</p>
            {subValue && <p className="text-xs text-success">{subValue}</p>}
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ user, totalUsdValue, setBalances, rates, setActivePage }) => {
    const { isMining, setIsMining, hashrate, estimatedEarnings } = useMining();
    const { pendingPayout, nextPayoutTime } = usePayouts(hashrate, isMining, setBalances);
    const feed = useLiveFeed(isMining, hashrate);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (hashrate === 0) {
        return (
            <div className="p-5 space-y-6 pb-24 text-center h-full flex flex-col justify-center">
                <Card className="!p-8">
                    <CpuChipIcon className="w-20 h-20 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-text-dark">Start Your Mining Journey</h2>
                    <p className="text-text-muted-dark mt-2 mb-6">You don't have any active mining plans yet. Purchase hashpower from the store to begin earning cryptocurrency.</p>
                    <Button onClick={() => setActivePage(Page.Store)} variant="primary" className="w-full !py-4">
                        Go to Store
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-5 space-y-6 pb-24">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-dark">Hello, {user.username}!</h1>
                    <p className="text-text-muted-dark">Welcome to your mining dashboard.</p>
                </div>
                <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
            </div>

            <Card className="text-center !p-8">
                <p className="text-text-muted-dark font-semibold">Total Balance</p>
                <p className="text-5xl font-extrabold text-primary my-2 tracking-tight">
                    ${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-success font-semibold">+ $25.30 (1.2%) today</p>
            </Card>

            <div className="flex space-x-4">
                <StatCard icon={<CpuChipIcon />} label="Current Hashrate" value={`${hashrate.toFixed(2)} GH/s`} />
                <StatCard icon={<ChartBarIcon />} label="Daily Earnings" value={`$${estimatedEarnings.toFixed(2)}`} subValue="+5%" />
            </div>
            
            <Card>
                <h3 className="font-bold text-lg text-text-dark mb-4">Live Payout Status</h3>
                <div className="flex justify-between items-center bg-secondary/50 p-4 rounded-2xl">
                    <div>
                        <p className="text-sm text-text-muted-dark">Pending Rewards</p>
                        <p className="font-bold text-2xl text-text-dark">{pendingPayout.toFixed(8)} BTC</p>
                        <p className="text-sm font-semibold text-success">~ ${(pendingPayout * rates.btc).toFixed(4)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-text-muted-dark">Next Payout In</p>
                        <div className="flex items-center space-x-2">
                           <ClockIcon className="w-6 h-6 text-primary"/>
                           <p className="font-mono font-bold text-2xl text-primary">{formatTime(nextPayoutTime)}</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-text-dark">Mining Status</h3>
                        <p className={`text-sm font-semibold ${isMining ? 'text-success' : 'text-danger'}`}>
                            {isMining ? 'Actively Mining' : 'Mining Paused'}
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsMining(!isMining)}
                        variant={isMining ? 'danger' : 'primary'}
                        className="!px-4 !py-4 rounded-full"
                    >
                        {isMining ? <PauseIcon /> : <PlayIcon />}
                    </Button>
                </div>
            </Card>

            <Card>
                <LiveFeed feed={feed} />
            </Card>
        </div>
    );
};

export default Dashboard;
