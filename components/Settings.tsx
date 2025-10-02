import React, { useState, useRef, useEffect } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import Toggle from './common/Toggle';
import { Theme, User, KycStatus } from '../types';
import { 
    ChevronRightIcon, BellIcon, MoonIcon, ShieldIcon, LockIcon, 
    LogoutIcon, UserIcon, MailIcon, 
    CameraIcon, ShieldCheckIcon, ClockIcon, ShieldExclamationIcon 
} from './common/Icons';
import TwoFactorAuthModal from './common/TwoFactorAuthModal';
import KycModal from './common/KycModal';
import { useAuth } from '../hooks/useAuth';

interface SettingsProps {
  user: User;
  setUser: (user: User) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
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


const KycStatusIndicator: React.FC<{ status: KycStatus }> = ({ status }) => {
    const statusConfig = {
        [KycStatus.Verified]: { text: 'Verified', icon: <ShieldCheckIcon className="w-6 h-6" />, color: 'text-success' },
        [KycStatus.Pending]: { text: 'Pending Review', icon: <ClockIcon className="w-6 h-6" />, color: 'text-warning' },
        [KycStatus.NotVerified]: { text: 'Not Verified', icon: <ShieldExclamationIcon className="w-6 h-6" />, color: 'text-danger' },
        [KycStatus.Rejected]: { text: 'Rejected', icon: <ShieldExclamationIcon className="w-6 h-6" />, color: 'text-danger' },
    };

    const config = statusConfig[status];

    return (
        <div className={`flex items-center space-x-2 font-semibold ${config.color}`}>
            {config.icon}
            <span>{config.text}</span>
        </div>
    );
};


const Settings: React.FC<SettingsProps> = ({ user, setUser, theme, setTheme }) => {
    const { logout } = useAuth();
    // Profile editing state
    const [isProfileExpanded, setIsProfileExpanded] = useState(false);
    const [editedUsername, setEditedUsername] = useState(user.username);
    const [editedEmail, setEditedEmail] = useState(user.email);
    const [editedAvatar, setEditedAvatar] = useState(user.avatar);
    const [isKycModalOpen, setIsKycModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // General settings state
    const [notifications, setNotifications] = useState(true);
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(() => {
        return localStorage.getItem('minerx_2fa_enabled') === 'true';
    });
    const [is2faModalOpen, setIs2faModalOpen] = useState(false);
    const [biometric, setBiometric] = useState(true);

    // Reset form when user prop changes (e.g., after save)
    useEffect(() => {
        setEditedUsername(user.username);
        setEditedEmail(user.email);
        setEditedAvatar(user.avatar);
    }, [user]);
    
    useEffect(() => {
        localStorage.setItem('minerx_2fa_enabled', String(isTwoFactorEnabled));
    }, [isTwoFactorEnabled]);

    const isProfileChanged = user.username !== editedUsername || user.email !== editedEmail || user.avatar !== editedAvatar;

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setEditedAvatar(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleProfileSave = () => {
        setUser({ ...user, username: editedUsername, email: editedEmail, avatar: editedAvatar });
        setIsProfileExpanded(false);
    };
    
    const handleProfileCancel = () => {
        setEditedUsername(user.username);
        setEditedEmail(user.email);
        setEditedAvatar(user.avatar);
        setIsProfileExpanded(false);
    }
    
    const handleKycSubmit = () => {
        setUser({ ...user, kycStatus: KycStatus.Pending });
        setIsKycModalOpen(false);
    };

    const handleThemeChange = (enabled: boolean) => {
        setTheme(enabled ? Theme.Dark : Theme.Light);
    }

    const handle2faToggle = (enabled: boolean) => {
        if (enabled) {
            setIs2faModalOpen(true);
        } else {
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
                
                <Card className="!p-0 !px-6">
                    <div 
                        className="flex items-center py-4 cursor-pointer group"
                        onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                    >
                        <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover mr-4" />
                        <div className="flex-grow">
                            <span className="font-bold text-lg text-text-dark">{user.username}</span>
                            <p className="text-sm text-text-muted-dark">{user.email}</p>
                        </div>
                        <div className="transition-transform duration-300 group-hover:translate-x-1">
                            <ChevronRightIcon className={`text-text-muted-dark transition-transform duration-300 ${isProfileExpanded ? 'rotate-90' : ''}`} />
                        </div>
                    </div>
                    
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isProfileExpanded ? 'max-h-[700px]' : 'max-h-0'}`}>
                        <div className="py-6 space-y-6 border-t border-border-dark">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <img src={editedAvatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-primary/50 shadow-lg" />
                                    <button 
                                        onClick={triggerFileSelect}
                                        className="absolute -bottom-1 -right-1 bg-primary h-9 w-9 rounded-full flex items-center justify-center text-black hover:brightness-110 transition shadow-md border-4 border-card-light dark:border-card-dark">
                                        <CameraIcon className="w-5 h-5"/>
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                </div>
                            </div>
                            
                            <div className="w-full space-y-4">
                                <Input label="Username" value={editedUsername} onChange={(e) => setEditedUsername(e.target.value)} icon={<UserIcon />} />
                                <Input label="Email" type="email" value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} icon={<MailIcon />} />
                            </div>

                             <div>
                                <h3 className="font-semibold text-text-dark mb-2 ml-1">Identity Verification (KYC)</h3>
                                <div className="flex justify-between items-center bg-secondary/50 p-3 rounded-2xl">
                                    <KycStatusIndicator status={user.kycStatus} />
                                    {(user.kycStatus === KycStatus.NotVerified || user.kycStatus === KycStatus.Rejected) && (
                                        <Button variant="ghost" className="!py-1.5 !px-3 !text-sm" onClick={() => setIsKycModalOpen(true)}>
                                            Verify Now
                                        </Button>
                                    )}
                                </div>
                                {user.kycStatus === KycStatus.Rejected && <p className="text-xs text-danger mt-2 ml-1">Your previous submission was rejected. Please try again.</p>}
                            </div>
                            
                            <div className="flex space-x-4 pt-2">
                                <Button variant="secondary" className="w-full !py-3" onClick={handleProfileCancel}>Cancel</Button>
                                <Button className="w-full !py-3" onClick={handleProfileSave} disabled={!isProfileChanged}>Save Changes</Button>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="!p-0 !px-6">
                    <h3 className="font-bold text-xl pt-5 text-text-dark">Security</h3>
                    <SettingsItem icon={<ShieldIcon />} label="2FA Authentication" subtitle={isTwoFactorEnabled ? 'Enabled' : 'Disabled'}>
                        <Toggle label="2FA" enabled={isTwoFactorEnabled} onChange={handle2faToggle} />
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
            {isKycModalOpen && (
                <KycModal 
                    onClose={() => setIsKycModalOpen(false)}
                    onSubmit={handleKycSubmit}
                />
            )}
        </>
    );
};

export default Settings;