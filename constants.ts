
import { Transaction, TransactionStatus, TransactionType } from './types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx123456',
    type: TransactionType.Withdrawal,
    status: TransactionStatus.Completed,
    amount: 0.534,
    currency: 'BTC',
    date: '2024-07-21 14:30',
    address: 'bc1qxy2kgdyg...',
  },
  {
    id: 'tx789012',
    type: TransactionType.Deposit,
    status: TransactionStatus.Completed,
    amount: 1.2,
    currency: 'ETH',
    date: '2024-07-21 09:15',
    address: '0x3a4b5c6d7e...',
  },
  {
    id: 'tx345678',
    type: TransactionType.Withdrawal,
    status: TransactionStatus.Pending,
    amount: 10.8,
    currency: 'SOL',
    date: '2024-07-20 18:00',
    address: 'So111111111...',
  },
  {
    id: 'tx901234',
    type: TransactionType.Withdrawal,
    status: TransactionStatus.Failed,
    amount: 0.1,
    currency: 'BTC',
    date: '2024-07-20 11:45',
    address: 'bc1q9a8b7c6d...',
  },
   {
    id: 'tx567890',
    type: TransactionType.Deposit,
    status: TransactionStatus.Completed,
    amount: 2500,
    currency: 'USDT',
    date: '2024-07-19 22:10',
    address: '0x...a1b2',
  },
];
