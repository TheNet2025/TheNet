import React from 'react';
import { MiningContract } from '../../types';
import Card from './Card';
import { ClockIcon, CpuChipIcon } from './Icons';
import { useCountdown } from '../../hooks/useCountdown';

const MinerCountdown: React.FC<{ expiryDate: string }> = ({ expiryDate }) => {
    const { formattedString, isExpired } = useCountdown(expiryDate);

    if (isExpired) {
        return <span className="font-bold text-lg text-danger">Expired</span>;
    }

    return (
        <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-primary"/>
            <p className="font-mono font-bold text-lg text-primary">{formattedString}</p>
        </div>
    );
};

interface ActiveMinersListProps {
    contracts: MiningContract[];
}

const ActiveMinersList: React.FC<ActiveMinersListProps> = ({ contracts }) => {
    return (
        <Card>
            <h3 className="font-bold text-lg text-text-dark mb-4">Active Miners</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                {contracts.map(contract => (
                    <div key={contract.id} className="bg-secondary/50 p-3 rounded-xl flex justify-between items-center">
                        <div>
                            <p className="font-bold text-text-dark">{contract.planName}</p>
                            <div className="flex items-center space-x-2 text-sm text-text-muted-dark">
                                <CpuChipIcon className="w-4 h-4" />
                                <span>{contract.hashrate} GH/s</span>
                            </div>
                        </div>
                        <MinerCountdown expiryDate={contract.expiryDate} />
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ActiveMinersList;
