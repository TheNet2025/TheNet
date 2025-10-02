import React from 'react';
import { Transaction, TransactionStatus, TransactionType } from '../types';
import Card from './common/Card';
import { DepositIcon, WithdrawIcon, HistoryIcon } from './common/Icons';

const statusStyles: Record<TransactionStatus, string> = {
  [TransactionStatus.Completed]: 'text-success bg-success/10 border border-success/20',
  [TransactionStatus.Pending]: 'text-warning bg-warning/10 border border-warning/20 animate-pulse',
  [TransactionStatus.Failed]: 'text-danger bg-danger/10 border border-danger/20',
};

const typeIcons: Record<TransactionType, React.ReactNode> = {
    [TransactionType.Deposit]: (
        <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
            <DepositIcon className="h-6 w-6 text-success" />
        </div>
    ),
    [TransactionType.Withdrawal]: (
        <div className="h-12 w-12 rounded-xl bg-danger/10 flex items-center justify-center">
            <WithdrawIcon className="h-6 w-6 text-danger" />
        </div>
    )
};


const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
  return (
    <Card className="flex items-center space-x-4 !p-4">
      {typeIcons[tx.type]}
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="font-bold text-text-dark text-lg">{tx.type}</p>
          <p className={`font-bold text-lg ${tx.type === TransactionType.Deposit ? 'text-success' : 'text-danger'}`}>{tx.type === TransactionType.Deposit ? '+' : '-'}{tx.amount.toFixed(4)} {tx.currency}</p>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <p className="text-text-muted-dark">{tx.date}</p>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[tx.status]}`}>{tx.status}</span>
        </div>
      </div>
    </Card>
  );
};

const History: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  return (
    <div className="p-5">
      <h1 className="text-4xl font-extrabold mb-8 text-text-dark">Transaction History</h1>
      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map(tx => (
            <TransactionItem key={tx.id} tx={tx} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-[50vh]">
            <HistoryIcon className="w-16 h-16 text-border-dark" />
            <h3 className="mt-4 text-xl font-bold text-text-dark">No Transactions Yet</h3>
            <p className="mt-1 text-text-muted-dark">Your deposits and withdrawals will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default History;