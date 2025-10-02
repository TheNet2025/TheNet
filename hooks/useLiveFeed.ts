import { useState, useEffect } from 'react';

export interface FeedItem {
    id: string;
    type: 'reward' | 'payout' | 'share';
    message: string;
    timestamp: string;
}

const generateRandomFeedItem = (): FeedItem => {
    const types: FeedItem['type'][] = ['reward', 'share', 'share', 'share', 'share'];
    const type = types[Math.floor(Math.random() * types.length)];
    let message = '';
    switch (type) {
        case 'reward':
            const amount = (Math.random() * 0.001).toFixed(6);
            message = `Block reward found! +${amount} BTC added.`;
            break;
        case 'payout':
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

export const useLiveFeed = (isMining: boolean) => {
    const [feed, setFeed] = useState<FeedItem[]>([]);

    useEffect(() => {
        let interval: number;
        if (isMining) {
            interval = window.setInterval(() => {
                setFeed(prevFeed => {
                    const newItem = generateRandomFeedItem();
                    const newFeed = [newItem, ...prevFeed];
                    return newFeed.length > 20 ? newFeed.slice(0, 20) : newFeed;
                });
            }, 2000 + Math.random() * 3000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isMining]);

    return feed;
};
