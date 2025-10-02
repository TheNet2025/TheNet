import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Wallet from './components/Wallet';
import History from './components/History';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import AdminUserDetail from './components/AdminUserDetail';
import Store from './components/Store';
import Chat from './components/Chat';
import { BottomNav } from './components/BottomNav';
import { StatusBar } from './components/common/StatusBar';
import TransactionDetailModal from './components/common/TransactionDetailModal';
import { Page, Theme, User, Transaction } from './types';
import { useWalletBalance } from './hooks/useWalletBalance';
import { useAuth } from './hooks/useAuth';

const MainApp: React.FC = () => {
    const { user, isUserAdmin, setUser, isAuthenticated, logout } = useAuth();
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('minerx_theme') as Theme) || Theme.Dark);
    const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const { balances, setBalances, rates, totalUsdValue } = useWalletBalance();
    const [adminSelectedUserId, setAdminSelectedUserId] = useState<string | null>(null);

    const navigateTo = (page: Page, options?: { userId?: string }) => {
        let path = '/';
        if (page === Page.Admin) {
            path = '/admin';
        } else if (page === Page.AdminUserDetail && options?.userId) {
            path = `/admin/user/${options.userId}`;
        } else if (page === Page.AdminLogin) {
            path = '/admin/login';
        }
        
        if (window.location.pathname !== path) {
            window.history.pushState({ page, userId: options?.userId }, '', path);
        }
        setActivePage(page);
        if(options?.userId) {
            setAdminSelectedUserId(options.userId);
        }
    };

    // Handle initial routing and browser navigation (back/forward)
    useEffect(() => {
        const handleLocationChange = () => {
            const path = window.location.pathname;
            
            if (!isAuthenticated) {
                // If not authenticated, redirect any admin paths to admin login
                if (path.startsWith('/admin')) {
                    setActivePage(Page.AdminLogin);
                }
                return; // Regular login flow is handled by the App component wrapper
            }

            if (path.startsWith('/admin')) {
                if (isUserAdmin) {
                    const userDetailMatch = path.match(/^\/admin\/user\/(.+)/);
                    if (userDetailMatch) {
                        setAdminSelectedUserId(userDetailMatch[1]);
                        setActivePage(Page.AdminUserDetail);
                    } else {
                        setActivePage(Page.Admin);
                    }
                } else {
                    // Non-admin trying to access /admin, redirect them to dashboard
                    window.history.replaceState({ page: Page.Dashboard }, '', '/');
                    setActivePage(Page.Dashboard);
                }
            } else {
                setActivePage(Page.Dashboard); // Default to dashboard for '/'
            }
        };
        handleLocationChange(); // Initial check
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, [isUserAdmin, isAuthenticated]);

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
        if (!user) return null; // Should be handled by wrapper, but for safety
        
        // Admin view rendering
        if (isUserAdmin && activePage === Page.Admin) {
            return <AdminPanel navigateTo={navigateTo} />;
        }
        if (isUserAdmin && activePage === Page.AdminUserDetail && adminSelectedUserId) {
            return <AdminUserDetail userId={adminSelectedUserId} navigateTo={navigateTo} />;
        }

        // Regular user view rendering
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
                // If admin is on a user page, render the user page, otherwise dashboard.
                return isUserAdmin ? <AdminPanel navigateTo={navigateTo} /> : <Dashboard user={user} setBalances={setBalances} totalUsdValue={totalUsdValue} rates={rates} navigateTo={navigateTo} />;
        }
    };
    
    if (activePage === Page.AdminLogin && !isAuthenticated) {
         return <AdminLogin navigateTo={navigateTo} />;
    }

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
    const { isAuthenticated, isLoading, isUserAdmin } = useAuth();
    const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');

    if (isLoading) {
        return <div className="h-screen w-screen bg-background-dark flex items-center justify-center text-primary">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Handle admin login route separately
        if (window.location.pathname.startsWith('/admin')) {
             return <AdminLogin navigateTo={() => {}} />;
        }

        // Standard user authentication
        switch (authScreen) {
            case 'signup':
                return <SignUp onSwitchToLogin={() => setAuthScreen('login')} />;
            case 'login':
            default:
                return <Login onSwitchToSignUp={() => setAuthScreen('signup')} />;
        }
    }

    // If authenticated as admin but not on an admin path, force redirect to admin panel
    if (isUserAdmin && !window.location.pathname.startsWith('/admin')) {
        window.history.replaceState(null, '', '/admin');
    }

    return <MainApp />;
}

export default App;