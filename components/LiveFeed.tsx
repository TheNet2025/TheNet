import React from 'react';
import { FeedItem } from '../hooks/useLiveFeed';
import { CheckCircleIcon, CurrencyDollarIcon, ShareIcon } from './common/Icons';

interface LiveFeedProps {
    feed: FeedItem[];
}

const FeedIcon: React.FC<{ type: FeedItem['type'] }> = ({ type }) => {
    const baseClasses = "w-5 h-5 mr-3 shrink-0";
    switch (type) {
        case 'reward':
            return <CurrencyDollarIcon className={`${baseClasses} text-success`} />;
        case 'payout':
            return <CheckCircleIcon className={`${baseClasses} text-primary`} />;
        case 'share':
            return <ShareIcon className={`${baseClasses} text-text-muted-dark`} />;
        default:
            return null;
    }
};

const LiveFeed: React.FC<LiveFeedProps> = ({ feed }) => {
    return (
        <div>
            <h3 className="font-bold text-lg mb-4 text-text-dark">Live Mining Feed</h3>
            <div className="space-y-3 h-48 overflow-y-auto pr-2 scrollbar-hide">
                {feed.map(item => (
                    <div key={item.id} className="flex items-center text-sm animate-fade-in-up">
                        <FeedIcon type={item.type} />
                        <span className="flex-grow text-text-muted-dark">{item.message}</span>
                        <span className="text-xs text-text-muted-dark/50 ml-2">{item.timestamp}</span>
                    </div>
                ))}
                {feed.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-text-muted-dark text-center">Start mining to see live updates...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveFeed;
