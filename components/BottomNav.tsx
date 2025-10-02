import React from 'react';
import { HomeIcon, WalletIcon, HistoryIcon, SettingsIcon, AdjustmentsIcon, BoltIcon, ChatBubbleLeftRightIcon } from './common/Icons';
import { Page } from '../types';

interface BottomNavProps {
  activePage: Page;
  navigateTo: (page: Page) => void;
  isAdmin: boolean;
}

const NavItem: React.FC<{label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void}> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`relative flex flex-col items-center justify-center w-full pt-3 pb-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-muted-dark hover:text-white'}`}>
        {isActive && <div className="absolute top-0 h-1 w-8 rounded-full bg-primary shadow-[0_0_10px_theme(colors.primary)]"></div>}
        <div className="w-7 h-7">{icon}</div>
        <span className="text-xs font-medium mt-1">{label}</span>
    </button>
)

export const BottomNav: React.FC<BottomNavProps> = ({ activePage, navigateTo, isAdmin }) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-card-light/80 dark:bg-secondary/50 backdrop-blur-lg shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.3)] flex justify-around items-start px-2 rounded-t-[32px] border-t border-white/10">
            <NavItem label="Dashboard" icon={<HomeIcon />} isActive={activePage === Page.Dashboard} onClick={() => navigateTo(Page.Dashboard)} />
            <NavItem label="Wallet" icon={<WalletIcon />} isActive={activePage === Page.Wallet} onClick={() => navigateTo(Page.Wallet)} />
            <NavItem label="Chat" icon={<ChatBubbleLeftRightIcon />} isActive={activePage === Page.Chat} onClick={() => navigateTo(Page.Chat)} />
            <NavItem label="Store" icon={<BoltIcon />} isActive={activePage === Page.Store} onClick={() => navigateTo(Page.Store)} />
            <NavItem label="History" icon={<HistoryIcon />} isActive={activePage === Page.History} onClick={() => navigateTo(Page.History)} />
            <NavItem label="Settings" icon={<SettingsIcon />} isActive={activePage === Page.Settings} onClick={() => navigateTo(Page.Settings)} />
            {isAdmin && (
                <NavItem label="Admin" icon={<AdjustmentsIcon />} isActive={activePage === Page.Admin} onClick={() => navigateTo(Page.Admin)} />
            )}
        </div>
    );
};