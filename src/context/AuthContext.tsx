import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, JLPTLevel } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password?: string, targetLevel?: JLPTLevel) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateTargetLevel: (level: JLPTLevel) => void;
  demoLogin: (level?: JLPTLevel) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session on mount
    const savedUser = storageService.getAuthUser();
    if (savedUser) {
      setUser(savedUser);
    } else {
      // Create default guest user if first time
      const guestUser: UserProfile = {
        id: 'guest-learner-001',
        name: 'JLPT Scholar',
        email: 'learner@jlptmastery.jp',
        targetLevel: 'n5',
        createdAt: new Date().toISOString(),
        avatarSeed: 'scholar',
      };
      storageService.setAuthUser(guestUser);
      setUser(guestUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string, _rememberMe: boolean = true) => {
    setIsLoading(true);
    // Simulate async network request
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!email || !email.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Load registered users or fallback to email name
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const loggedUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: user?.name && user.email === email ? user.name : formattedName,
      email,
      targetLevel: user?.targetLevel || 'n5',
      createdAt: user?.createdAt || new Date().toISOString(),
      avatarSeed: namePart,
    };

    storageService.setAuthUser(loggedUser);
    setUser(loggedUser);
    setIsLoading(false);
    return { success: true };
  };

  const signup = async (name: string, email: string, _password?: string, targetLevel: JLPTLevel = 'n5') => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!name.trim()) {
      setIsLoading(false);
      return { success: false, error: 'Name cannot be empty.' };
    }
    if (!email || !email.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      targetLevel,
      createdAt: new Date().toISOString(),
      avatarSeed: name.toLowerCase().replace(/\s+/g, ''),
    };

    storageService.setAuthUser(newUser);
    setUser(newUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    storageService.setAuthUser(null);
    setUser(null);
  };

  const updateTargetLevel = (level: JLPTLevel) => {
    if (user) {
      const updated: UserProfile = { ...user, targetLevel: level };
      storageService.setAuthUser(updated);
      setUser(updated);
    }
  };

  const demoLogin = (level: JLPTLevel = 'n5') => {
    const demoUser: UserProfile = {
      id: 'demo-learner',
      name: 'Kenji Sato (佐藤 健二)',
      email: 'kenji.sato@jlpt.jp',
      targetLevel: level,
      createdAt: new Date().toISOString(),
      avatarSeed: 'kenji',
    };
    storageService.setAuthUser(demoUser);
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateTargetLevel,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
