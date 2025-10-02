import React, { useState, useRef } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import { User } from '../types';
import { ArrowLeftIcon, CameraIcon, MailIcon, UserIcon } from './common/Icons';

interface ProfileProps {
  user: User;
  setUser: (user: User) => void;
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser, onBack }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
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
    setUser({ username, email, avatar });
    onBack();
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="p-5 space-y-8 text-text-dark">
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

      <div className="w-full space-y-6">
         <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} icon={<UserIcon />} />
         <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<MailIcon />} />
      </div>
      
      <Button className="w-full !py-4" onClick={handleSave}>Save Changes</Button>
    </div>
  );
};

export default Profile;