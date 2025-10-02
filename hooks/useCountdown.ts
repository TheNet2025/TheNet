import { useState, useEffect } from 'react';

const calculateRemainingTime = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const difference = expiry.getTime() - now.getTime();

    if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return { days, hours, minutes, seconds, isExpired: false };
};

export const useCountdown = (expiryDate: string) => {
    const [remainingTime, setRemainingTime] = useState(calculateRemainingTime(expiryDate));

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime(calculateRemainingTime(expiryDate));
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryDate]);
    
    const { days, hours, minutes, seconds } = remainingTime;
    
    let formattedString = '';
    if (days > 0) {
        formattedString += `${days}d `;
    }
    if (hours > 0 || days > 0) {
        formattedString += `${hours}h `;
    }
    if (minutes > 0 || hours > 0 || days > 0) {
        formattedString += `${minutes}m `;
    }
    formattedString += `${seconds}s`;

    return { ...remainingTime, formattedString: formattedString.trim(), isExpired: remainingTime.isExpired };
};
