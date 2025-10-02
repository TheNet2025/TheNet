import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { User, KycStatus } from '../types';

// In a real app, this would be in a secure, HttpOnly cookie.
const TOKEN_KEY = 'minerx_session_token';
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
  verifyEmail: (code: string) => Promise<boolean>;
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
  
  // --- Initialize Admin User ---
  // This effect ensures the admin user exists in our local storage "database" on first load.
  useEffect(() => {
    const users = getStoredUsers();
    const adminExists = users.some(u => u.email.toLowerCase() === 'admin');
    if (!adminExists) {
        // In a real app, this password would be hashed server-side with bcrypt/argon2.
        // We are base64 encoding it here to simulate a non-plaintext password.
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
    }
  }, []);

  // --- Session Check ---
  // On initial app load, check if a valid session token exists.
  useEffect(() => {
    const checkSession = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          // In a real app, we would send this token to a /me endpoint to get user data.
          // Here, we decode the token to get the user ID.
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          if (decodedToken.exp * 1000 > Date.now()) {
            const users = getStoredUsers();
            const loggedInUser = users.find(u => u.id === decodedToken.sub);
            if (loggedInUser) {
              // Don't store password in the active user state
              const { password, ...secureUser } = loggedInUser;
              setUser(secureUser);
            }
          } else {
            // Token expired
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(res => setTimeout(res, 500)); // Simulate network latency

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

      // In a real app, the server would compare hashes. We simulate it here.
      const isPasswordCorrect = btoa(password) === foundUser.password;

      if (isPasswordCorrect) {
        // Create a simulated JWT token
        const payload = { sub: foundUser.id, email: foundUser.email, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) }; // 24h expiry
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

      // Simulate hashing the password. A real backend would use bcrypt.
      const hashedPassword = btoa(password);
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        email,
        password: hashedPassword,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        kycStatus: KycStatus.NotVerified,
        isVerified: false,
        verificationToken,
      };

      saveStoredUsers([...users, newUser]);
      
      // In a real app, an email would be sent with this token.
      // For this simulation, we'll log it to the console for easy access.
      console.log(`--- EMAIL VERIFICATION ---`);
      console.log(`To: ${email}`);
      console.log(`Your verification code is: ${verificationToken}`);
      console.log(`--------------------------`);
      
      return true;

    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
        await new Promise(res => setTimeout(res, 500));
        const users = getStoredUsers();
        const userToVerify = users.find(u => u.verificationToken === code && !u.isVerified);

        if (userToVerify) {
            userToVerify.isVerified = true;
            userToVerify.verificationToken = undefined;
            saveStoredUsers(users);
            return true;
        } else {
            setError("Invalid or expired verification code.");
            return false;
        }
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
          // Make sure we don't overwrite the stored password
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
    verifyEmail,
    setUser: updateUser,
  };

  // Fix: Replaced JSX with React.createElement to avoid parsing issues in a .ts file.
  return React.createElement(AuthContext.Provider, { value: value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
