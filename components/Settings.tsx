import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Toggle from './common/Toggle';
import { Theme, User } from '../types';
import { ChevronRightIcon, BellIcon, MoonIcon, ShieldIcon, LockIcon, BiometricIcon as BiometricSettingsIcon } from './common/Icons';
import TwoFactorAuthModal from './common/TwoFactorAuthModal';

interface SettingsProps {
  user: User;
  onLogout: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onNavigateToProfile: () => void;
}

const SettingsItem: React.FC<{icon: React.ReactNode, label: string, children?: React.ReactNode, onClick?: () => void}> = ({ icon, label, children, onClick }) => (
    <div 
        className={`flex justify-between items-center py-5 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
        <div className="flex items-center space-x-4">
            <div className="w-8 h-8 flex items-center justify-center text-primary">{icon}</div>
            <span className="font-medium text-lg text-text-dark">{label}</span>
        </div>
        <div>{children}</div>
    </div>
)

const Settings: React.FC<SettingsProps> = ({ user, onLogout, theme, setTheme, onNavigateToProfile }) => {
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
                        className="flex items-center space-x-5 p-6 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={onNavigateToProfile}
                    >
                        <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                        <div className="flex-grow">
                            <h2 className="font-bold text-xl text-text-dark">{user.username}</h2>
                            <p className="text-sm text-text-muted-dark">{user.email}</p>
                        </div>
                        <ChevronRightIcon className="text-text-muted-dark" />
                    </div>
                </Card>

                <Card className="!px-6">
                    <h3 className="font-bold text-lg pt-2 text-text-dark">Security</h3>
                    <div className="divide-y divide-border-dark">
                        <SettingsItem icon={<ShieldIcon />} label="2FA Authentication">
                            <Toggle label="2FA" enabled={isTwoFactorEnabled} onChange={handle2faToggle} />
                        </SettingsItem>
                        <SettingsItem icon={<BiometricSettingsIcon />} label="Biometric Login">
                            <Toggle label="Biometric" enabled={biometric} onChange={setBiometric} />
                        </SettingsItem>
                        <SettingsItem icon={<LockIcon />} label="Change Password" onClick={() => {}} >
                            <ChevronRightIcon className="text-text-muted-dark" />
                        </SettingsItem>
                    </div>
                </Card>
                
                <Card className="!px-6">
                    <h3 className="font-bold text-lg pt-2 text-text-dark">Preferences</h3>
                    <div className="divide-y divide-border-dark">
                        <SettingsItem icon={<BellIcon />} label="Notifications">
                            <Toggle label="Notifications" enabled={notifications} onChange={setNotifications} />
                        </SettingsItem>
                        <SettingsItem icon={<MoonIcon />} label="Dark Mode">
                            <Toggle label="Theme" enabled={theme === Theme.Dark} onChange={handleThemeChange} />
                        </SettingsItem>
                    </div>
                </Card>

                <Button variant="danger" className="w-full !py-4" onClick={onLogout}>
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
