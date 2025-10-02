
import React, { useState, useEffect } from 'react';

export const StatusBar: React.FC = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const timerId = setInterval(update, 60000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-10 px-6 flex justify-between items-center text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark z-10">
      <span className="text-sm font-semibold">{time}</span>
      <div className="flex items-center space-x-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.556A5.5 5.5 0 017.5 12.5a5.5 5.5 0 011.083-3.28" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18.5a8.5 8.5 0 01-1.889-.22" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.889 16.556a5.5 5.5 0 00.528-6.364" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12.5a.5.5 0 100-1 .5.5 0 000 1z" /></svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </div>
    </div>
  );
};
