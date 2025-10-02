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
    History = 'history',
    Settings = 'settings',
    Profile = 'profile',
    Admin = 'admin',
}

export interface Balances {
    btc: number;
    eth: number;
    usdt: number;
}
