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
import { StatusBar } from './components/common/StatusBar';
import TransactionDetailModal from './components/common/TransactionDetailModal';
import { Page, Theme, User, Transaction } from './types';
import { useWalletBalance } from './hooks/useWalletBalance';
import { useAuth } from './hooks/useAuth';

const MainApp: React.FC = () => {
    const { user, isUserAdmin, setUser } = useAuth();
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('minerx_theme') as Theme) || Theme.Dark);
    const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const { balances, setBalances, rates, totalUsdValue } = useWalletBalance();

    const navigateTo = (page: Page) => {
        // Enforce access control: only admins can navigate to the Admin page.
        if (page === Page.Admin && !isUserAdmin) {
            // This is a safeguard. If a non-admin somehow tries to go to the admin page,
            // send them to their dashboard instead.
            setActivePage(Page.Dashboard);
            return;
        }
        setActivePage(page);
    };

    // On login, this effect correctly redirects the user to their default page.
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

    useEffect(() => {
        if (user) {
            const TRANSACTIONS_KEY = `minerx_transactions_${user.id}`;
            const storedTxs = localStorage.getItem(TRANSACTIONS_KEY);
            setTransactions(storedTxs ? JSON.parse(storedTxs) : []);
        } else {
            setTransactions([]); // Clear on logout
        }
    }, [user]);


    useEffect(() => {
        const handleThemeUpdate = (event: Event) => setTheme((event as CustomEvent<Theme>).detail);
        const handleTxsUpdate = () => {
             if (user) {
                const TRANSACTIONS_KEY = `minerx_transactions_${user.id}`;
                setTransactions(JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]'));
            }
        };
        
        window.addEventListener('admin_theme_update', handleThemeUpdate);
        window.addEventListener('transactions_updated', handleTxsUpdate);

        return () => {
            window.removeEventListener('admin_theme_update', handleThemeUpdate);
            window.removeEventListener('transactions_updated', handleTxsUpdate);
        };
    }, [user]);
    
    const renderPage = () => {
        if (!user) return null;

        // Securely handle rendering for the Admin page.
        // This is the single entry point for the Admin component.
        if (activePage === Page.Admin) {
            // Only render Admin component if the user is actually an admin.
            if (isUserAdmin) {
                return <Admin />;
            }
            // As a fallback, if a non-admin's state is somehow set to the admin page,
            // show them their dashboard instead of a blank or broken page.
            return <Dashboard user={user} setBalances={setBalances} totalUsdValue={totalUsdValue} rates={rates} navigateTo={navigateTo} />;
        }

        // Render standard pages
        switch (activePage) {
            case Page.Dashboard:
                return <Dashboard user={user} setBalances={setBalances} totalUsdValue={totalUsdValue} rates={rates} navigateTo={navigateTo} />;
            case Page.Wallet:
                return <Wallet balances={balances} setBalances={setBalances} rates={rates} />;
            case Page.Chat:
                return <Chat />;
            case Page.Store:
                return <Store navigateTo={navigateTo} balances={balances} setBalances={setBalances} />;
            case Page.History:
                return <History transactions={transactions} onSelectTx={setSelectedTx} />;
            case Page.Settings:
                return <Settings user={user} setUser={setUser} theme={theme} setTheme={setTheme} />;
            default:
                // Default to dashboard for any unknown page state
                return <Dashboard user={user} setBalances={setBalances} totalUsdValue={totalUsdValue} rates={rates} navigateTo={navigateTo} />;
        }
    };

    return (
        <div className="h-screen w-screen bg-background-light dark:bg-background-dark dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.08),rgba(255,255,255,0))] font-sans overflow-hidden flex justify-center items-center">
            <div className="relative w-[375px] h-[812px] border-4 border-gray-800 rounded-[60px] shadow-2xl shadow-black/50 overflow-hidden bg-background-light dark:bg-background-dark flex flex-col">
                <StatusBar />
                <main className="pt-10 flex-1 overflow-y-auto pb-20 scrollbar-hide">
                    {renderPage()}
                </main>
                <BottomNav activePage={activePage} navigateTo={navigateTo} isAdmin={isUserAdmin} />
                {selectedTx && <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
            </div>
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
        // Standard user authentication
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