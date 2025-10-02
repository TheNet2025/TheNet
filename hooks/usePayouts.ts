import React, { useState, useEffect, useRef } from 'react';
import { Balances, Transaction, TransactionStatus, TransactionType } from '../types';
import { useAuth } from './useAuth';
import { useDatabase } from './useDatabase';

const MOCK_BTC_EARNING_RATE = 0.00000000005; // BTC per GH/s per second
const PAYOUT_INTERVAL_SECONDS = 180; // 3 minutes
const PAYOUT_CONFIRMATION_SECONDS = 10; // 10 seconds to confirm

export const usePayouts = (
  hashrate: number,
  isMining: boolean,
) => {
  const { user } = useAuth();
  const { addTransaction, updateTransactionStatus } = useDatabase();
  const [pendingPayout, setPendingPayout] = useState(0);
  const [nextPayoutTime, setNextPayoutTime] = useState(PAYOUT_INTERVAL_SECONDS);

  const earningsIntervalRef = useRef<number | null>(null);
  const payoutIntervalRef = useRef<number | null>(null);

  const processPayout = () => {
    if (pendingPayout <= 0 || !user) return;

    const payoutAmount = pendingPayout;
    setPendingPayout(0);
    
    const newTx: Omit<Transaction, 'id' | 'date' | 'status'> = {
        userId: user.id,
        type: TransactionType.Payout,
        amount: payoutAmount,
        currency: 'BTC',
        address: 'MinerX Pool',
        payoutCycleId: `cycle-${Math.floor(Date.now() / (PAYOUT_INTERVAL_SECONDS * 1000))}`,
        txHash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        confirmations: 0,
    };
    
    addTransaction(newTx);
    
    // The transaction ID is generated inside addTransaction, so we can't know it here.
    // This is a limitation of the simulation. A real backend would return the new TX.
    // We'll simulate confirmation by finding the latest pending payout for this user.
    setTimeout(() => {
        const userTxs = JSON.parse(localStorage.getItem('minerx_db_transactions') || '[]') as Transaction[];
        const latestPayout = userTxs.find(tx => tx.userId === user.id && tx.type === TransactionType.Payout && tx.status === TransactionStatus.Pending);
        
        if (latestPayout) {
            updateTransactionStatus(latestPayout.id, TransactionStatus.Completed);
        }
    }, PAYOUT_CONFIRMATION_SECONDS * 1000);
  };


  // Effect for accumulating earnings
  useEffect(() => {
    if (isMining && hashrate > 0) {
      earningsIntervalRef.current = window.setInterval(() => {
        const earningsPerSecond = hashrate * MOCK_BTC_EARNING_RATE;
        setPendingPayout(prev => prev + earningsPerSecond);
      }, 1000);
    }
    return () => {
      if (earningsIntervalRef.current) clearInterval(earningsIntervalRef.current);
    };
  }, [isMining, hashrate]);

  // Effect for payout cycle timer
  useEffect(() => {
    payoutIntervalRef.current = window.setInterval(() => {
      setNextPayoutTime(prev => {
        if (prev <= 1) {
          if (isMining && hashrate > 0) {
            processPayout();
          }
          return PAYOUT_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (payoutIntervalRef.current) clearInterval(payoutIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMining, hashrate, pendingPayout, user]);


  return { pendingPayout, nextPayoutTime };
};