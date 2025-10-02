import React, { useState, useEffect, useMemo } from 'react';
import { useWalletBalance } from './useWalletBalance';
import { useAuth } from './useAuth';
import { useDatabase } from './useDatabase';

const MOCK_BTC_EARNING_RATE = 0.00000000005; // BTC per GH/s per second

export const useMining = () => {
  const { user } = useAuth();
  
  const contracts = user?.contracts || [];

  const activeContracts = useMemo(() => {
    const now = new Date();
    return contracts.filter(c => new Date(c.expiryDate) > now);
  }, [contracts]);

  const totalActiveHashrate = useMemo(() => {
    return activeContracts.reduce((sum, contract) => sum + contract.hashrate, 0);
  }, [activeContracts]);
  
  const [isMining, setIsMining] = useState(false);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);
  const { rates } = useWalletBalance();
  
  useEffect(() => {
    setIsMining(totalActiveHashrate > 0);
  }, [totalActiveHashrate]);

  useEffect(() => {
    const dailyEarningsInBtc = (totalActiveHashrate * MOCK_BTC_EARNING_RATE) * 60 * 60 * 24;
    const btcPrice = rates.btc;
    setEstimatedEarnings(dailyEarningsInBtc * btcPrice);
  }, [totalActiveHashrate, rates.btc]);

  return { isMining, setIsMining, hashrate: totalActiveHashrate, estimatedEarnings, activeContracts };
};