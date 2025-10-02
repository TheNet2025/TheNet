import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Toggle from './common/Toggle';
import { Theme, User } from '../types';
import { ChevronRightIcon, BellIcon, MoonIcon, ShieldIcon, LockIcon, BiometricIcon as BiometricSettingsIcon, LogoutIcon } from './common/Icons';
import TwoFactorAuthModal from './common/TwoFactorAuthModal';
import { useAuth } from '../hooks/useAuth';

interface SettingsProps {
  user: User;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onNavigateToProfile: () => void;
}

const SettingsItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    subtitle?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    isLast?: boolean;
}> = ({ icon, label, subtitle, children, onClick, isLast = false }) => (
    <div 
        className={`flex items-center py-4 ${!isLast ? 'border-b border-border-dark' : ''} ${onClick ? 'cursor-pointer group' : ''}`}
        onClick={onClick}
    >
        <div className="w-10 h-10 flex items-center justify-center bg-secondary rounded-full mr-4 text-primary shrink-0">{icon}</div>
        <div className="flex-grow">
            <span className="font-semibold text-lg text-text-dark">{label}</span>
            {subtitle && <p className="text-sm text-text-muted-dark">{subtitle}</p>}
        </div>
        <div className={`transition-transform duration-300 ${onClick ? 'group-hover:translate-x-1' : ''}`}>{children}</div>
    </div>
);


const Settings: React.FC<SettingsProps> = ({ user, theme, setTheme, onNavigateToProfile }) => {
    const { logout } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(() => {
        return localStorage.getItem('minerx_2fa_enabled') === 'true';
    });
    const [is2faModalOpen, setIs2faModalOpen] = useState(false);
    const [biometric, setBiometric] = useState(true);
    
    useEffect(() => {
        localStorage.setItem('minerx_2fa_enabled', String(isTwoFactorEnabled));
    }, [isTwoFactorEnabled]);

    const handleThemeChange = (enabled: boolean) => {
        setTheme(enabled ? Theme.Dark : Theme.Light);
    }

    const handle2faToggle = (enabled: boolean) => {
        if (enabled) {
            setIs2faModalOpen(true);
        } else {
            // In a real app, this would require verification
            setIsTwoFactorEnabled(false);
        }
    };

    const handle2faSuccess = () => {
        setIsTwoFactorEnabled(true);
        setIs2faModalOpen(false);
    };

    return (
        <>
            <div className="p-5 space-y-6 text-text-light dark:text-text-dark">
                <h1 className="text-4xl font-extrabold">Settings</h1>
                
                <Card className="!p-0 overflow-hidden">
                    <div 
                        className="flex items-center space-x-5 p-5 cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        onClick={onNavigateToProfile}
                    >
                        <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary/50" />
                        <div className="flex-grow">
                            <h2 className="font-bold text-xl text-text-dark">{user.username}</h2>
                            <p className="text-sm text-text-muted-dark">View and edit profile</p>
                        </div>
                        <ChevronRightIcon className="text-text-muted-dark" />
                    </div>
                </Card>

                <Card className="!p-0 !px-6">
                    <h3 className="font-bold text-xl pt-5 text-text-dark">Security</h3>
                    <SettingsItem icon={<ShieldIcon />} label="2FA Authentication" subtitle="Secure your account">
                        <Toggle label="2FA" enabled={isTwoFactorEnabled} onChange={handle2faToggle} />
                    </SettingsItem>
                    <SettingsItem icon={<BiometricSettingsIcon />} label="Biometric Login" subtitle="Enabled for quick access">
                        <Toggle label="Biometric" enabled={biometric} onChange={setBiometric} />
                    </SettingsItem>
                    <SettingsItem icon={<LockIcon />} label="Change Password" subtitle="Update your credentials" onClick={() => {}} isLast={true} >
                        <ChevronRightIcon className="text-text-muted-dark" />
                    </SettingsItem>
                </Card>
                
                <Card className="!p-0 !px-6">
                    <h3 className="font-bold text-xl pt-5 text-text-dark">Preferences</h3>
                    <SettingsItem icon={<BellIcon />} label="Notifications" subtitle="Push & email alerts">
                        <Toggle label="Notifications" enabled={notifications} onChange={setNotifications} />
                    </SettingsItem>
                    <SettingsItem icon={<MoonIcon />} label="Dark Mode" subtitle={theme === Theme.Dark ? 'Enabled' : 'Disabled'} isLast={true}>
                        <Toggle label="Theme" enabled={theme === Theme.Dark} onChange={handleThemeChange} />
                    </SettingsItem>
                </Card>

                <Button variant="danger" className="w-full !py-4" onClick={logout} icon={<LogoutIcon />}>
                    Logout
                </Button>
            </div>
            {is2faModalOpen && (
                <TwoFactorAuthModal
                    onClose={() => setIs2faModalOpen(false)}
                    onSuccess={handle2faSuccess}
                />
            )}
        </>
    );
};

export default Settings;