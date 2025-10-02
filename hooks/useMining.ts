import React, { useState, useEffect } from 'react';
import { useWalletBalance } from './useWalletBalance';
import { useAuth } from './useAuth';

const MOCK_BTC_EARNING_RATE = 0.00000000005; // BTC per GH/s per second

export const useMining = () => {
  const { user } = useAuth();
  const [hashrate, setHashrate] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);
  const { rates } = useWalletBalance();
  
  useEffect(() => {
      if (user) {
          const HASHRATE_KEY = `minerx_hashrate_${user.id}`;
          const newHashrate = parseFloat(localStorage.getItem(HASHRATE_KEY) || '0');
          setHashrate(newHashrate);
          setIsMining(newHashrate > 0);
      } else {
          setHashrate(0);
          setIsMining(false);
      }
  }, [user]);

  useEffect(() => {
    const dailyEarningsInBtc = (hashrate * MOCK_BTC_EARNING_RATE) * 60 * 60 * 24;
    const btcPrice = rates.btc;
    setEstimatedEarnings(dailyEarningsInBtc * btcPrice);
  }, [hashrate, rates.btc]);

  useEffect(() => {
    const handleMiningControl = (event: Event) => {
      const { action, value } = (event as CustomEvent<{action: 'start' | 'stop' | 'set_hashrate', value?: number}>).detail;
      switch (action) {
        case 'start':
          if (hashrate > 0) setIsMining(true);
          break;
        case 'stop':
          setIsMining(false);
          break;
        case 'set_hashrate':
          if (typeof value === 'number' && user) {
            const HASHRATE_KEY = `minerx_hashrate_${user.id}`;
            setHashrate(value);
            localStorage.setItem(HASHRATE_KEY, value.toString());
          }
          break;
      }
    };
    
    const handleHashpowerUpdate = () => {
      if (user) {
          const HASHRATE_KEY = `minerx_hashrate_${user.id}`;
          const newHashrate = parseFloat(localStorage.getItem(HASHRATE_KEY) || '0');
          setHashrate(newHashrate);
          if (newHashrate > 0 && !isMining) {
              setIsMining(true);
          }
      }
    };

    window.addEventListener('admin_mining_control', handleMiningControl);
    window.addEventListener('hashpower_updated', handleHashpowerUpdate);
    return () => {
        window.removeEventListener('admin_mining_control', handleMiningControl);
        window.removeEventListener('hashpower_updated', handleHashpowerUpdate);
    };
  }, [hashrate, isMining, user]);

  return { isMining, setIsMining, hashrate, estimatedEarnings };
};