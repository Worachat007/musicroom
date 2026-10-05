import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  isAdmin: boolean;
  isMember: boolean;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.getUsers();
      setAllUsers(res.data);

      const savedId = localStorage.getItem('music_club_user_id');
      const found = res.data.find(u => u.id === savedId);
      if (found) {
        setCurrentUser(found);
      } else if (res.data.length > 0) {
        // Default to admin or first user
        setCurrentUser(res.data[0]);
        localStorage.setItem('music_club_user_id', res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('music_club_user_id', user.id);
    }
  };

  const switchRole = (role: UserRole) => {
    const user = allUsers.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('music_club_user_id', user.id);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const isMember = currentUser?.role === 'MEMBER';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoading,
        isAdmin,
        isMember,
        switchUser,
        switchRole,
        refreshUsers: fetchUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
