import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../../types';

const MOCK_LOG_MESSAGES = {
  INFO: [
    'User satoshi logged in successfully.',
    'GET /api/v1/balance responded 200 OK in 45ms.',
    'New hashpower plan `plan_pro` purchased.',
    'Payout cycle initiated. Processing 124 transactions.',
  ],
  WARN: [
    'API latency for /api/v1/history exceeds 500ms.',
    'Database connection pool near capacity.',
    'Unusual login pattern detected for user admin.',
  ],
  ERROR: [
    'Failed to connect to primary mining pool stratum+tcp://pool.example.com:3333',
    'FATAL: Payout transaction failed: Insufficient gas.',
    'Could not verify user signature for withdrawal tx_wd_12345.',
  ],
};

const generateRandomLog = (): LogEntry => {
    const levels: LogEntry['level'][] = ['INFO', 'INFO', 'INFO', 'INFO', 'WARN', 'ERROR'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const message = MOCK_LOG_MESSAGES[level][Math.floor(Math.random() * MOCK_LOG_MESSAGES[level].length)];
    return {
        id: `log_${Date.now()}_${Math.random()}`,
        level,
        message,
        timestamp: new Date().toISOString(),
    };
};

const LOG_LEVEL_CONFIG: Record<LogEntry['level'], { color: string }> = {
  INFO: { color: 'text-text-muted-dark' },
  WARN: { color: 'text-warning' },
  ERROR: { color: 'text-danger' },
};

const LiveLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(() => Array.from({ length: 15 }, generateRandomLog));
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prevLogs => {
        const newLogs = [generateRandomLog(), ...prevLogs];
        return newLogs.length > 50 ? newLogs.slice(0, 50) : newLogs;
      });
    }, 1500 + Math.random() * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div className="bg-secondary/50 p-4 rounded-xl">
      <h3 className="font-semibold text-lg text-text-dark mb-3">Live System Logs</h3>
      <div ref={logContainerRef} className="bg-black/50 p-3 rounded-lg h-48 overflow-y-auto font-mono text-xs space-y-1 flex flex-col-reverse scrollbar-hide">
        {logs.map(log => (
          <div key={log.id} className="flex">
            <span className="text-primary/60 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
            <span className={`${LOG_LEVEL_CONFIG[log.level].color} font-bold mr-2`}>[{log.level}]</span>
            <span className="text-text-muted-dark flex-1">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveLogViewer;