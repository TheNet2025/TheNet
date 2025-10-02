import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { User, KycStatus } from '../types';
import { useDatabase } from './useDatabase';

const TOKEN_KEY = 'minerx_session_token';
const ADMIN_EMAIL = 'albertonani79@gmail.com';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isUserAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = useDatabase();

  const setUser = (user: User | null) => {
      if(user) {
        const { password, ...secureUser } = user;
        setUserState(secureUser);
      } else {
        setUserState(null);
      }
  };
  
  // Session Check
  useEffect(() => {
    const checkSession = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          if (decodedToken.exp * 1000 > Date.now()) {
            const loggedInUser = db.getUserById(decodedToken.sub);
            if (loggedInUser) setUser(loggedInUser);
          } else {
            logout();
          }
        }
      } catch (e) {
        console.error("Session check failed:", e);
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [db]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(res => setTimeout(res, 500)); 
      
      const foundUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        setError("Invalid email or password.");
        return false;
      }
      if (!foundUser.isVerified) {
          setError("Please verify your email before logging in.");
          return false;
      }

      const isPasswordCorrect = btoa(password) === foundUser.password;

      if (isPasswordCorrect) {
        const payload = { sub: foundUser.id, email: foundUser.email, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) };
        const token = `header.${btoa(JSON.stringify(payload))}.signature`;
        localStorage.setItem(TOKEN_KEY, token);
        setUser(foundUser);
        return true;
      } else {
        setError("Invalid email or password.");
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(res => setTimeout(res, 500));
      if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError("An account with this email already exists.");
        return false;
      }

      const hashedPassword = btoa(password);
      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        email,
        password: hashedPassword,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        kycStatus: KycStatus.NotVerified,
        isVerified: true,
        balances: { btc: 0, eth: 0, usdt: 0 },
        contracts: [],
      };

      // Use the centralized database function to add the new user
      db.addUser(newUser);
      
      // Automatically log the user in
      const payload = { sub: newUser.id, email: newUser.email, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem(TOKEN_KEY, token);
      setUser(newUser);
      
      return true;

    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };
  
  const updateUser = (updatedUser: User) => {
      db.updateUser(updatedUser);
      setUser(updatedUser);
  }

  const isUserAdmin = useMemo(() => user?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  const value = {
    user,
    isAuthenticated: !!user,
    isUserAdmin,
    isLoading,
    error,
    login,
    register,
    logout,
    setUser: updateUser,
  };

  // FIX: Replaced JSX with React.createElement to support .ts file extension.
  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};