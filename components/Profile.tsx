import React, { useState, useRef } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import { User, KycStatus } from '../types';
import { ArrowLeftIcon, CameraIcon, MailIcon, UserIcon, ShieldCheckIcon, ClockIcon, ShieldExclamationIcon } from './common/Icons';
import KycModal from './common/KycModal';


interface ProfileProps {
  user: User;
  setUser: (user: User) => void;
  onBack: () => void;
}

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


const Profile: React.FC<ProfileProps> = ({ user, setUser, onBack }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setUser({ ...user, username, email, avatar });
    onBack();
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();
  
  const handleKycSubmit = () => {
      setUser({ ...user, kycStatus: KycStatus.Pending });
      setIsKycModalOpen(false);
  };

  return (
    <>
        <div className="p-5 space-y-6 text-text-dark">
            <div className="flex items-center space-x-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-3xl font-bold">Edit Profile</h1>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                <img src={avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-primary/50 shadow-lg" />
                <button 
                    onClick={triggerFileSelect} 
                    className="absolute -bottom-1 -right-1 bg-primary h-10 w-10 rounded-full flex items-center justify-center text-black hover:brightness-110 transition shadow-md border-4 border-background-dark">
                    <CameraIcon className="w-6 h-6"/>
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden" 
                    accept="image/*"
                />
                </div>
            </div>

            <Card>
                <h3 className="font-bold text-lg mb-4 text-text-dark">Identity Verification (KYC)</h3>
                <div className="flex justify-between items-center">
                    <KycStatusIndicator status={user.kycStatus} />
                    {(user.kycStatus === KycStatus.NotVerified || user.kycStatus === KycStatus.Rejected) && (
                         <Button variant="secondary" onClick={() => setIsKycModalOpen(true)}>
                            Start Verification
                        </Button>
                    )}
                </div>
                {user.kycStatus === KycStatus.Rejected && <p className="text-sm text-danger mt-3">Your previous submission was rejected. Please try again.</p>}
            </Card>

            <div className="w-full space-y-6">
                <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} icon={<UserIcon />} />
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<MailIcon />} />
            </div>
            
            <Button className="w-full !py-4" onClick={handleSave}>Save Changes</Button>
        </div>

        {isKycModalOpen && (
            <KycModal 
                onClose={() => setIsKycModalOpen(false)}
                onSubmit={handleKycSubmit}
            />
        )}
    </>
  );
};

export default Profile;
