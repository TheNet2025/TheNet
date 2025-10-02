

import { Transaction, TransactionStatus, TransactionType, Plan } from './types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx123456',
    // FIX: Added missing userId property.
    userId: 'user_admin',
    type: TransactionType.Withdrawal,
    status: TransactionStatus.Completed,
    amount: 0.534,
    currency: 'BTC',
    date: '2024-07-21 14:30',
    address: 'bc1qxy2kgdyg...',
  },
  {
    id: 'tx789012',
    // FIX: Added missing userId property.
    userId: 'user_admin',
    type: TransactionType.Deposit,
    status: TransactionStatus.Completed,
    amount: 1.2,
    currency: 'ETH',
    date: '2024-07-21 09:15',
    address: '0x3a4b5c6d7e...',
  },
  {
    id: 'tx345678',
    // FIX: Added missing userId property.
    userId: 'user_admin',
    type: TransactionType.Withdrawal,
    status: TransactionStatus.Pending,
    amount: 10.8,
    currency: 'SOL',
    date: '2024-07-20 18:00',
    address: 'So111111111...',
  },
  {
    id: 'tx901234',
    // FIX: Added missing userId property.
    userId: 'user_admin',
    type: TransactionType.Withdrawal,
    status: TransactionStatus.Failed,
    amount: 0.1,
    currency: 'BTC',
    date: '2024-07-20 11:45',
    address: 'bc1q9a8b7c6d...',
  },
   {
    id: 'tx567890',
    // FIX: Added missing userId property.
    userId: 'user_admin',
    type: TransactionType.Deposit,
    status: TransactionStatus.Completed,
    amount: 2500,
    currency: 'USDT',
    date: '2024-07-19 22:10',
    address: '0x...a1b2',
  },
];


export const MOCK_PLANS: Plan[] = [
  {
    id: 'plan_starter',
    name: 'Starter Miner',
    hashrate: 100, // GH/s
    duration: '12 Months Contract',
    price: 99,
    features: ['100 GH/s BTC Mining', 'SHA-256 Algorithm', 'Daily Payouts', 'Full-time Support'],
    bestValue: false,
  },
  {
    id: 'plan_pro',
    name: 'Pro Rig',
    hashrate: 500, // GH/s
    duration: '24 Months Contract',
    price: 449,
    features: ['500 GH/s BTC Mining', 'SHA-256 Algorithm', 'Daily Payouts', 'Priority Support'],
    bestValue: true,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Farm',
    hashrate: 2000, // TH/s -> 2000 GH/s
    duration: '36 Months Contract',
    price: 1599,
    features: ['2 TH/s BTC Mining', 'SHA-256 Algorithm', 'Instant Payouts', 'Dedicated Manager'],
    bestValue: false,
  },
];