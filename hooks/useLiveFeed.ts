import { useState, useEffect } from 'react';

export interface FeedItem {
    id: string;
    type: 'reward' | 'payout' | 'share';
    message: string;
    timestamp: string;
}

const generateRandomFeedItem = (): FeedItem => {
    const types: FeedItem['type'][] = ['reward', 'share', 'share', 'share', 'share', 'share', 'share'];
    const type = types[Math.floor(Math.random() * types.length)];
    let message = '';
    switch (type) {
        case 'reward':
            const amount = (Math.random() * 0.0001).toFixed(6);
            message = `Micro-block reward! +${amount} BTC found.`;
            break;
        case 'payout': // This type can be triggered by the payout hook instead
            const payoutAmount = (Math.random() * 0.01).toFixed(4);
            message = `Payout of ${payoutAmount} BTC processed.`;
            break;
        case 'share':
            const difficulty = (Math.random() * 1000).toFixed(2);
            message = `New share found. Difficulty: ${difficulty}k`;
            break;
    }

    return {
        id: `feed_${Date.now()}_${Math.random()}`,
        type,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
};

export const useLiveFeed = (isMining: boolean, hashrate: number) => {
    const [feed, setFeed] = useState<FeedItem[]>([]);

    useEffect(() => {
        let interval: number;
        if (isMining && hashrate > 0) {
            // Base interval of 5 seconds, gets faster with more hashrate
            // At 100 GH/s, interval is ~4s. At 1000 GH/s, interval is ~1.5s
            const dynamicInterval = 5000 / (1 + Math.log10(hashrate)); 
            
            interval = window.setInterval(() => {
                setFeed(prevFeed => {
                    const newItem = generateRandomFeedItem();
                    // Prevent payout messages from being randomly generated here
                    if (newItem.type === 'payout') return prevFeed;
                    
                    const newFeed = [newItem, ...prevFeed];
                    return newFeed.length > 20 ? newFeed.slice(0, 20) : newFeed;
                });
            }, dynamicInterval + Math.random() * 500);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isMining, hashrate]);

    return feed;
};
