import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Wallet from './components/Wallet';
import History from './components/History';
import Settings from './components/Settings';
import Admin from './components/Admin';
import Store from './components/Store';
import Chat from './components/Chat';
import { BottomNav } from './components/BottomNav';
import TransactionDetailModal from './components/common/TransactionDetailModal';
import { Page, Theme, Transaction } from './types';
import { useWalletBalance } from './hooks/useWalletBalance';
import { useAuth } from './hooks/useAuth';
import { useDatabase } from './hooks/useDatabase';

const MainApp: React.FC = () => {
    const { user, isUserAdmin, setUser } = useAuth();
    const { getTransactionsByUserId } = useDatabase();
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('minerx_theme') as Theme) || Theme.Dark);
    const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const { balances, setBalances, rates, totalUsdValue } = useWalletBalance();

    const navigateTo = (page: Page) => {
        if (page === Page.Admin && !isUserAdmin) {
            setActivePage(Page.Dashboard);
            return;
        }
        setActivePage(page);
    };

     useEffect(() => {
        if (isUserAdmin) {
            setActivePage(Page.Admin);
        } else {
            setActivePage(Page.Dashboard);
        }
    }, [isUserAdmin]);

    useEffect(() => {
        document.documentElement.className = theme;
        localStorage.setItem('minerx_theme', theme);
    }, [theme]);
    
    const refreshTransactions = () => {
        if(user) {
            setTransactions(getTransactionsByUserId(user.id));
        }
    };
    
    // Load initial transactions and listen for updates
    useEffect(() => {
        refreshTransactions();
        window.addEventListener('db_updated', refreshTransactions);
        return () => window.removeEventListener('db_updated', refreshTransactions);
    }, [user, getTransactionsByUserId]);

    
    const renderPage = () => {
        if (!user) return null;

        if (activePage === Page.Admin) {
            if (isUserAdmin) {
                return <Admin />;
            }
            return <Dashboard user={user} totalUsdValue={totalUsdValue} rates={rates} navigateTo={navigateTo} />;
        }

        switch (activePage) {
            case Page.Dashboard:
                return <Dashboard user={user} totalUsdValue={totalUsdValue} rates={rates} navigateTo={navigateTo} />;
            case Page.Wallet:
                return <Wallet balances={balances} setBalances={setBalances} rates={rates} />;
            case Page.Chat:
                return <Chat />;
            case Page.Store:
                return <Store navigateTo={navigateTo} />;
            case Page.History:
                return <History transactions={transactions} onSelectTx={setSelectedTx} />;
            case Page.Settings:
                return <Settings user={user} setUser={setUser} theme={theme} setTheme={setTheme} />;
            default:
                return <Dashboard user={user} totalUsdValue={totalUsdValue} rates={rates} navigateTo={navigateTo} />;
        }
    };

    return (
        <div className="relative h-screen w-screen bg-background-light dark:bg-background-dark dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.08),rgba(255,255,255,0))] font-sans overflow-hidden flex flex-col">
            <main className="flex-1 overflow-y-auto scrollbar-hide pt-[env(safe-area-inset-top)] pb-[calc(5rem+env(safe-area-inset-bottom))]">
                {renderPage()}
            </main>
            <BottomNav activePage={activePage} navigateTo={navigateTo} isAdmin={isUserAdmin} />
            {selectedTx && <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
        </div>
    );
}

function App() {
    const { isAuthenticated, isLoading } = useAuth();
    const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');

    if (isLoading) {
        return <div className="h-screen w-screen bg-background-dark flex items-center justify-center text-primary">Loading...</div>;
    }

    if (!isAuthenticated) {
        switch (authScreen) {
            case 'signup':
                return <SignUp onSwitchToLogin={() => setAuthScreen('login')} />;
            case 'login':
            default:
                return <Login onSwitchToSignUp={() => setAuthScreen('signup')} />;
        }
    }

    return <MainApp />;
}

export default App;
