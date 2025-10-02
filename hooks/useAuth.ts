import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { User, KycStatus, Transaction } from '../types';
import { MOCK_TRANSACTIONS } from '../constants';


// --- Simulation Note ---
// This file simulates a complete authentication system on the client-side.
// In a real-world application, these operations (user storage, password hashing,
// token generation) would be handled by a secure backend server.

// In a real app, the token would be a secure, HttpOnly cookie.
// localStorage is used here for simulation purposes.
const TOKEN_KEY = 'minerx_session_token';

// This simulates a user database. In a real app, this would be a secure database
// like PostgreSQL or MongoDB on the server.
const USERS_KEY = 'minerx_users';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStoredUsers = (): User[] => {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const saveStoredUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };
  
  // --- Initialize Admin User & Data ---
  // This effect ensures the admin user and their mock data exist on first load.
  useEffect(() => {
    const users = getStoredUsers();
    const adminExists = users.some(u => u.email.toLowerCase() === 'admin');
    if (!adminExists) {
        const adminPasswordHash = btoa('1995'); 
        const adminUser: User = {
            id: 'user_admin',
            username: 'Admin',
            email: 'admin',
            password: adminPasswordHash,
            avatar: 'https://i.pravatar.cc/150?u=admin',
            kycStatus: KycStatus.Verified,
            isVerified: true,
        };
        saveStoredUsers([...users, adminUser]);
        
        // Initialize admin's data for demo purposes
        const adminBalances = { btc: 0.1234, eth: 2.5678, usdt: 5120.75 };
        localStorage.setItem(`minerx_balances_${adminUser.id}`, JSON.stringify(adminBalances));
        localStorage.setItem(`minerx_transactions_${adminUser.id}`, JSON.stringify(MOCK_TRANSACTIONS));
        localStorage.setItem(`minerx_hashrate_${adminUser.id}`, '500');
    }
  }, []);

  // --- Session Check ---
  // On initial app load, this checks if a valid session token exists.
  useEffect(() => {
    const checkSession = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          if (decodedToken.exp * 1000 > Date.now()) {
            const users = getStoredUsers();
            const loggedInUser = users.find(u => u.id === decodedToken.sub);
            if (loggedInUser) {
              const { password, ...secureUser } = loggedInUser;
              setUser(secureUser);
            }
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
  }, []);

  // Simulates a /login endpoint.
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(res => setTimeout(res, 500)); 

      const users = getStoredUsers();
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

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

        const { password, ...secureUser } = foundUser;
        setUser(secureUser);
        return true;
      } else {
        setError("Invalid email or password.");
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Simulates a /register endpoint.
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(res => setTimeout(res, 500));
      const users = getStoredUsers();
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
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
      };

      saveStoredUsers([...users, newUser]);

      // Initialize empty data stores for the new user
      localStorage.setItem(`minerx_balances_${newUser.id}`, JSON.stringify({ btc: 0, eth: 0, usdt: 0 }));
      localStorage.setItem(`minerx_transactions_${newUser.id}`, JSON.stringify([]));
      localStorage.setItem(`minerx_hashrate_${newUser.id}`, '0');
      
      // Automatically log the user in
      const payload = { sub: newUser.id, email: newUser.email, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem(TOKEN_KEY, token);

      const { password: newUserPassword, ...secureUser } = newUser;
      setUser(secureUser);
      
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
      setUser(updatedUser);
      const users = getStoredUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
          const storedPassword = users[userIndex].password;
          users[userIndex] = { ...updatedUser, password: storedPassword };
          saveStoredUsers(users);
      }
  }

  const isUserAdmin = useMemo(() => user?.email.toLowerCase() === 'admin', [user]);

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

  return React.createElement(AuthContext.Provider, { value: value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};