import React from 'react';
import { Transaction, TransactionStatus, TransactionType } from '../../types';
import Card from './Card';
import { XMarkIcon, CopyIcon, LinkIcon, CheckCircleIcon, ClockIcon, ShieldExclamationIcon, GiftIcon, DepositIcon, WithdrawIcon, ShoppingCartIcon } from './Icons';

interface TransactionDetailModalProps {
  tx: Transaction;
  onClose: () => void;
}

const statusConfig = {
    [TransactionStatus.Completed]: { text: 'Completed', icon: <CheckCircleIcon />, color: 'text-success' },
    [TransactionStatus.Pending]: { text: 'Pending', icon: <ClockIcon />, color: 'text-warning' },
    [TransactionStatus.Failed]: { text: 'Failed', icon: <ShieldExclamationIcon />, color: 'text-danger' },
};

const typeConfig = {
    [TransactionType.Deposit]: { icon: <DepositIcon/>, color: 'text-success' },
    [TransactionType.Withdrawal]: { icon: <WithdrawIcon/>, color: 'text-danger' },
    [TransactionType.Payout]: { icon: <GiftIcon/>, color: 'text-primary' },
    [TransactionType.Purchase]: { icon: <ShoppingCartIcon/>, color: 'text-yellow-500' },
};


const DetailRow: React.FC<{label: string, value: React.ReactNode}> = ({label, value}) => (
    <div className="flex justify-between items-center py-3 border-b border-border-dark/50">
        <span className="text-text-muted-dark">{label}</span>
        <span className="font-semibold text-right text-text-dark">{value}</span>
    </div>
)

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ tx, onClose }) => {
    const currentStatus = statusConfig[tx.status];
    const currentType = typeConfig[tx.type];

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const sign = tx.type === TransactionType.Withdrawal || tx.type === TransactionType.Purchase ? '-' : '+';
    const amountDisplay = tx.type === TransactionType.Purchase ? tx.amount.toFixed(2) : tx.amount.toFixed(8);

    return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-end z-50 animate-fade-in" onClick={onClose}>
        <div className="w-full bg-secondary rounded-t-3xl border-t-2 border-primary/50 shadow-2xl shadow-primary/20 animate-slide-in-up" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border-dark flex justify-center relative">
                <div className="h-1.5 w-12 bg-border-dark rounded-full"></div>
                 <button onClick={onClose} className="absolute top-3 right-4 text-text-muted-dark hover:text-white transition-colors" aria-label="Close">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="p-6">
                <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-card-dark ${currentType.color}`}>
                        {React.cloneElement(currentType.icon, {className: 'w-8 h-8'})}
                    </div>
                    <h2 className="text-3xl font-bold text-text-dark mt-4">{tx.details ? tx.details : tx.type}</h2>
                    <p className={`text-4xl font-extrabold mt-2 ${currentType.color}`}>
                        {sign}{amountDisplay} <span className="text-2xl">{tx.currency}</span>
                    </p>
                </div>
                
                <Card className="!bg-background-dark/80">
                    <DetailRow label="Status" value={
                        <div className={`flex items-center space-x-2 font-semibold ${currentStatus.color}`}>
                            {React.cloneElement(currentStatus.icon, {className: 'w-5 h-5'})}
                            <span>{currentStatus.text}</span>
                        </div>
                    }/>
                    <DetailRow label="Date & Time" value={tx.date} />
                    <DetailRow label={tx.type === TransactionType.Deposit ? 'From Address' : 'To Address'} value={
                         <div className="flex items-center space-x-2 font-mono text-sm">
                            <span>{tx.address}</span>
                            <button onClick={() => handleCopy(tx.address)} className="text-text-muted-dark hover:text-primary"><CopyIcon className="w-4 h-4"/></button>
                         </div>
                    } />
                     {tx.txHash && (
                        <DetailRow label="Transaction Hash" value={
                             <div className="flex items-center space-x-2 font-mono text-sm">
                                <span>{tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}</span>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="text-text-muted-dark hover:text-primary"><LinkIcon className="w-4 h-4"/></a>
                             </div>
                        } />
                     )}
                    {tx.confirmations !== undefined && <DetailRow label="Confirmations" value={`${tx.confirmations}+`} />}
                     <DetailRow label="Transaction ID" value={
                         <div className="flex items-center space-x-2 font-mono text-xs">
                            <span>{tx.id}</span>
                         </div>
                    } />

                </Card>
            </div>
        </div>
    </div>
  );
};

export default TransactionDetailModal;