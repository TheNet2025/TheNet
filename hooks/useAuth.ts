import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { User, KycStatus } from '../types';

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
  
  // --- Initialize Admin User ---
  // This effect ensures the admin user exists in our local storage "database" on first load.
  useEffect(() => {
    const users = getStoredUsers();
    const adminExists = users.some(u => u.email.toLowerCase() === 'admin');
    if (!adminExists) {
        // REQUIREMENT: "password hashed with bcrypt"
        // SIMULATION: In a real app, this password would be securely hashed server-side
        // with a library like bcrypt. We use base64 encoding (`btoa`) here to simulate
        // a non-plaintext password, as bcrypt is not suitable for client-side execution.
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
  // On initial app load, this checks if a valid session token exists.
  // This simulates a protected "/me" endpoint that verifies the user's token.
  useEffect(() => {
    const checkSession = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          // In a real app, we would send this token to a backend /me endpoint for validation.
          // Here, we decode and validate the token on the client for simulation.
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          if (decodedToken.exp * 1000 > Date.now()) {
            const users = getStoredUsers();
            const loggedInUser = users.find(u => u.id === decodedToken.sub);
            if (loggedInUser) {
              // Don't store the password in the active user state for security.
              const { password, ...secureUser } = loggedInUser;
              setUser(secureUser);
            }
          } else {
            // Token expired, log the user out.
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

      // In a real app, the server would compare the provided password against the stored hash.
      const isPasswordCorrect = btoa(password) === foundUser.password;

      if (isPasswordCorrect) {
        // REQUIREMENT: "returns a JWT stored in HttpOnly cookie"
        // SIMULATION: Create a simulated JWT and store it in localStorage. A real
        // HttpOnly cookie cannot be created or accessed by client-side JavaScript.
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

      // Simulate hashing the password. A real backend would use bcrypt.
      const hashedPassword = btoa(password);

      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        email,
        password: hashedPassword,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        kycStatus: KycStatus.NotVerified,
        // REQUIREMENT: "After registration, log the user in automatically (no email verification)."
        // This is handled here by setting isVerified to true immediately.
        isVerified: true,
      };

      saveStoredUsers([...users, newUser]);
      
      // Automatically log the user in after successful registration.
      const payload = { sub: newUser.id, email: newUser.email, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) }; // 24h expiry
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
          // Ensure we don't overwrite the stored password with an empty one.
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