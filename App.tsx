import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Wallet from './components/Wallet';
import History from './components/History';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Admin from './components/Admin';
import Store from './components/Store';
import Chat from './components/Chat';
import { BottomNav } from './components/BottomNav';
import { StatusBar } from './components/common/StatusBar';
import { Page, Theme, User, Transaction, Balances } from './types';
import { MOCK_TRANSACTIONS } from './constants';
import { useWalletBalance } from './hooks/useWalletBalance';

const MOCK_USER: User = {
  username: 'Satoshi',
  email: 'satoshi@nakamoto.com',
  avatar: 'https://i.pravatar.cc/150?u=satoshi',
};

function App() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('minerx_theme') as Theme) || Theme.Dark);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
  const [user, setUser] = useState<User>(() => {
    const storedUser = localStorage.getItem('minerx_user');
    return storedUser ? JSON.parse(storedUser) : MOCK_USER;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
      const storedTxs = localStorage.getItem('minerx_transactions');
      return storedTxs ? JSON.parse(storedTxs) : MOCK_TRANSACTIONS;
  });

  const { balances, setBalances, rates, totalUsdValue } = useWalletBalance();

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('minerx_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('minerx_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    const storedTxs = localStorage.getItem('minerx_transactions');
    if (!storedTxs) {
        localStorage.setItem('minerx_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    const handleUserUpdate = (event: Event) => setUser((event as CustomEvent<User>).detail);
    const handleThemeUpdate = (event: Event) => setTheme((event as CustomEvent<Theme>).detail);
    const handleTxsUpdate = () => setTransactions(JSON.parse(localStorage.getItem('minerx_transactions') || '[]'));
    
    window.addEventListener('admin_user_update', handleUserUpdate);
    window.addEventListener('admin_theme_update', handleThemeUpdate);
    window.addEventListener('transactions_updated', handleTxsUpdate);

    return () => {
        window.removeEventListener('admin_user_update', handleUserUpdate);
        window.removeEventListener('admin_theme_update', handleThemeUpdate);
        window.removeEventListener('transactions_updated', handleTxsUpdate);
    };
  }, []);

  const handleLogin = () => setIsLoggedIn(true);
  const handleAdminLogin = () => {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setActivePage(Page.Admin);
  };
  const handleLogout = () => {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setActivePage(Page.Dashboard);
      setAuthScreen('login');
  };

  const renderPage = () => {
    switch (activePage) {
      case Page.Dashboard:
        return <Dashboard user={user} setBalances={setBalances} totalUsdValue={totalUsdValue} rates={rates} setActivePage={setActivePage} />;
      case Page.Wallet:
        return <Wallet balances={balances} setBalances={setBalances} rates={rates} />;
      case Page.Chat:
        return <Chat />;
      case Page.Store:
        return <Store setActivePage={setActivePage} />;
      case Page.History:
        return <History transactions={transactions} />;
      case Page.Settings:
        return <Settings user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme} onNavigateToProfile={() => setActivePage(Page.Profile)} />;
      case Page.Profile:
        return <Profile user={user} setUser={setUser} onBack={() => setActivePage(Page.Settings)} />;
      case Page.Admin:
        return isAdmin ? <Admin balances={balances} setBalances={setBalances} /> : <Dashboard user={user} setBalances={setBalances} totalUsdValue={totalUsdValue} rates={rates} setActivePage={setActivePage} />;
      default:
        return <Dashboard user={user} setBalances={setBalances} totalUsdValue={totalUsdValue} rates={rates} setActivePage={setActivePage} />;
    }
  };

  if (!isLoggedIn) {
      if (authScreen === 'login') {
          return <Login onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToSignUp={() => setAuthScreen('signup')} />;
      }
      return <SignUp onSignUp={handleLogin} onSwitchToLogin={() => setAuthScreen('login')} />;
  }

  return (
    <div className="h-screen w-screen bg-background-light dark:bg-background-dark dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.08),rgba(255,255,255,0))] font-sans overflow-hidden flex justify-center items-center">
        <div className="relative w-[375px] h-[812px] border-4 border-gray-800 rounded-[60px] shadow-2xl shadow-black/50 overflow-hidden bg-background-light dark:bg-background-dark flex flex-col">
            <StatusBar />
            <main className="pt-10 flex-1 overflow-y-auto pb-20 scrollbar-hide">
                {renderPage()}
            </main>
            <BottomNav activePage={activePage} setActivePage={setActivePage} isAdmin={isAdmin} />
        </div>
    </div>
  );
}

export default App;
