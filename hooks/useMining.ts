import React, { useState, useEffect } from 'react';
import { useWalletBalance } from './useWalletBalance';
import { useAuth } from './useAuth';
import { useDatabase } from './useDatabase';

const MOCK_BTC_EARNING_RATE = 0.00000000005; // BTC per GH/s per second

export const useMining = () => {
  const { user } = useAuth();
  const { getUserById, updateUser } = useDatabase();
  const currentUser = user ? getUserById(user.id) : null;
  
  const hashrate = currentUser?.hashrate || 0;
  const [isMining, setIsMining] = useState(false);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);
  const { rates } = useWalletBalance();
  
  useEffect(() => {
    setIsMining(hashrate > 0);
  }, [hashrate]);

  useEffect(() => {
    const dailyEarningsInBtc = (hashrate * MOCK_BTC_EARNING_RATE) * 60 * 60 * 24;
    const btcPrice = rates.btc;
    setEstimatedEarnings(dailyEarningsInBtc * btcPrice);
  }, [hashrate, rates.btc]);
  
  // This effect listens for external hashrate updates (e.g., from the Store)
  // The 'db_updated' event signals that we should re-check the user's hashrate
  useEffect(() => {
    const handleDbUpdate = () => {
      if (user) {
        const freshUser = getUserById(user.id);
        if (freshUser && freshUser.hashrate > 0) {
          setIsMining(true);
        }
      }
    };
    window.addEventListener('db_updated', handleDbUpdate);
    return () => window.removeEventListener('db_updated', handleDbUpdate);
  }, [user, getUserById]);


  return { isMining, setIsMining, hashrate, estimatedEarnings };
};