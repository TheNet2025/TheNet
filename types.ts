export enum TransactionType {
  Deposit = 'Deposit',
  Withdrawal = 'Withdrawal',
}

export enum TransactionStatus {
  Completed = 'Completed',
  Pending = 'Pending',
  Failed = 'Failed',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  date: string;
  address: string;
}

export interface User {
  username: string;
  email: string;
  avatar: string;
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
}

export enum Page {
    Dashboard = 'dashboard',
    Wallet = 'wallet',
    Store = 'store',
    History = 'history',
    Settings = 'settings',
    Profile = 'profile',
    Admin = 'admin',
}

export interface Plan {
  id: string;
  name: string;
  hashrate: number; // in GH/s
  duration: string;
  price: number;
  features: string[];
  bestValue: boolean;
}

export interface Balances {
    btc: number;
    eth: number;
    usdt: number;
}
