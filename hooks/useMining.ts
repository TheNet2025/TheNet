import React, { useState, useEffect, useRef } from 'react';
import { Balances } from '../types';

const MOCK_BTC_EARNING_RATE = 0.00000000005; // BTC per GH/s per second

interface Rates {
    btc: number;
    eth: number;
    usdt: number;
}

export const useMining = (setBalances: React.Dispatch<React.SetStateAction<Balances>>, rates: Rates) => {
  const [hashrate, setHashrate] = useState(() => parseFloat(localStorage.getItem('minerx_hashrate') || '0'));
  const [isMining, setIsMining] = useState(hashrate > 0);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);

  const intervalRef = useRef<number | null>(null);

  const startMining = () => {
    if (intervalRef.current !== null) return;
    setIsMining(true);
    intervalRef.current = window.setInterval(() => {
        const earningsPerSecond = hashrate * MOCK_BTC_EARNING_RATE;
        setBalances(prev => ({ ...prev, btc: prev.btc + earningsPerSecond }));
    }, 1000);
  };

  const stopMining = () => {
    setIsMining(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isMining && hashrate > 0) {
      startMining();
    } else {
      stopMining();
    }
    return () => stopMining();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMining, hashrate]);

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
          if (typeof value === 'number') {
            setHashrate(value);
            localStorage.setItem('minerx_hashrate', value.toString());
          }
          break;
      }
    };
    
    const handleHashpowerUpdate = () => {
      const newHashrate = parseFloat(localStorage.getItem('minerx_hashrate') || '0');
      setHashrate(newHashrate);
      if (newHashrate > 0 && !isMining) {
          setIsMining(true);
      }
    };

    window.addEventListener('admin_mining_control', handleMiningControl);
    window.addEventListener('hashpower_updated', handleHashpowerUpdate);
    return () => {
        window.removeEventListener('admin_mining_control', handleMiningControl);
        window.removeEventListener('hashpower_updated', handleHashpowerUpdate);
    };
  }, [hashrate, isMining]);

  return { isMining, setIsMining, hashrate, estimatedEarnings };
};
