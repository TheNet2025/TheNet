import React, { useState, useEffect, useRef } from 'react';
import { Balances, Transaction, TransactionStatus, TransactionType } from '../types';
import { useAuth } from './useAuth';

const MOCK_BTC_EARNING_RATE = 0.00000000005; // BTC per GH/s per second
const PAYOUT_INTERVAL_SECONDS = 180; // 3 minutes
const PAYOUT_CONFIRMATION_SECONDS = 10; // 10 seconds to confirm

export const usePayouts = (
  hashrate: number,
  isMining: boolean,
  setBalances: React.Dispatch<React.SetStateAction<Balances>>
) => {
  const { user } = useAuth();
  const [pendingPayout, setPendingPayout] = useState(0);
  const [nextPayoutTime, setNextPayoutTime] = useState(PAYOUT_INTERVAL_SECONDS);

  const earningsIntervalRef = useRef<number | null>(null);
  const payoutIntervalRef = useRef<number | null>(null);

  const processPayout = () => {
    if (pendingPayout <= 0 || !user) return;

    const payoutAmount = pendingPayout;
    setPendingPayout(0);
    
    const payoutId = `payout_${Date.now()}`;
    const newTx: Transaction = {
        id: payoutId,
        type: TransactionType.Payout,
        status: TransactionStatus.Pending,
        amount: payoutAmount,
        currency: 'BTC',
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        address: 'MinerX Pool',
        payoutCycleId: `cycle-${Math.floor(Date.now() / (PAYOUT_INTERVAL_SECONDS * 1000))}`,
        txHash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        confirmations: 0,
    };
    
    const TRANSACTIONS_KEY = `minerx_transactions_${user.id}`;
    const existingTxs = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([newTx, ...existingTxs]));
    window.dispatchEvent(new Event('transactions_updated'));

    // Simulate confirmation delay
    setTimeout(() => {
        setBalances(prev => ({ ...prev, btc: prev.btc + payoutAmount }));

        const currentTxs: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
        const txIndex = currentTxs.findIndex(t => t.id === payoutId);
        if (txIndex !== -1) {
            currentTxs[txIndex].status = TransactionStatus.Completed;
            currentTxs[txIndex].confirmations = Math.floor(Math.random() * 20) + 6;
            localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(currentTxs));
            window.dispatchEvent(new Event('transactions_updated'));
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