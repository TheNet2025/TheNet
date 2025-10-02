import { ReactNode } from "react";

export enum TransactionType {
  Deposit = 'Deposit',
  Withdrawal = 'Withdrawal',
  Payout = 'Payout',
  Purchase = 'Purchase',
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
  txHash?: string;
  confirmations?: number;
  payoutCycleId?: string;
  details?: string; // For purchase details
}

export enum KycStatus {
    NotVerified = 'Not Verified',
    Pending = 'Pending',
    Verified = 'Verified',
    Rejected = 'Rejected',
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  kycStatus: KycStatus;
  password?: string; // Hashed password
  isVerified: boolean;
  verificationToken?: string;
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
}

export enum Page {
    Dashboard = 'dashboard',
    Wallet = 'wallet',
    Chat = 'chat',
    Store = 'store',
    History = 'history',
    Settings = 'settings',
    Admin = 'admin',
    AdminLogin = 'admin_login',
    AdminUserDetail = 'admin_user_detail',
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

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

// Monitoring & Ops Types
export interface LogEntry {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
}

export interface SystemAlert {
  id: string;
  severity: 'Critical' | 'Warning';
  message: string;
  timestamp: string;
}

export interface WorkerNode {
  id: string;
  name: string;
  status: 'Healthy' | 'Degraded' | 'Unresponsive';
  ip: string;
}