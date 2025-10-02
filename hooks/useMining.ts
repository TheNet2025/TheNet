import { useState, useEffect, useRef } from 'react';
import { Balances } from '../types';

const MOCK_HASHRATE = 250.7; // MH/s
const MOCK_BTC_EARNING_RATE = 0.000000005; // BTC per MH/s per second

export const useMining = (setBalances: React.Dispatch<React.SetStateAction<Balances>>) => {
  const [isMining, setIsMining] = useState(true);
  const [hashrate, setHashrate] = useState(MOCK_HASHRATE);
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
    if (isMining) {
      startMining();
    } else {
      stopMining();
    }
    return () => stopMining();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMining, hashrate]);

  useEffect(() => {
    // This is a placeholder for USD value, you might want to connect this to real rates
    const dailyEarningsInBtc = hashrate * MOCK_BTC_EARNING_RATE * 60 * 60 * 24;
    const btcPrice = 60000; // Mock price
    setEstimatedEarnings(dailyEarningsInBtc * btcPrice);
  }, [hashrate]);

  useEffect(() => {
    const handleMiningControl = (event: Event) => {
      const { action, value } = (event as CustomEvent<{action: 'start' | 'stop' | 'set_hashrate', value?: number}>).detail;
      switch (action) {
        case 'start':
          setIsMining(true);
          break;
        case 'stop':
          setIsMining(false);
          break;
        case 'set_hashrate':
          if (typeof value === 'number') setHashrate(value);
          break;
      }
    };

    window.addEventListener('admin_mining_control', handleMiningControl);
    return () => window.removeEventListener('admin_mining_control', handleMiningControl);
  }, []);

  return { isMining, setIsMining, hashrate, estimatedEarnings };
};
