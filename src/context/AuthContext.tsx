import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (studentId: string, password: string) => Promise<void>;
  register: (name: string, studentId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCurrentUser()
      .then((result) => setCurrentUser(result.data))
      .catch(() => setCurrentUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (studentId: string, password: string) => {
    const result = await api.login({ studentId, password });
    setCurrentUser(result.data);
  };

  const register = async (name: string, studentId: string, password: string) => {
    const result = await api.register({ name, studentId, password });
    setCurrentUser(result.data);
  };

  const logout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, isAdmin: currentUser?.role === 'ADMIN', login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
