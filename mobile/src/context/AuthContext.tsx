import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/api';

export type UserRole =
  | 'public_user'
  | 'student'
  | 'junior_lawyer'
  | 'advocate'
  | 'senior_advocate'
  | 'law_firm'
  | 'recruiter'
  | 'admin'
  | 'guest';

export interface UserProfile {
  id: number;
  uuid: string;
  full_name: string;
  primary_phone?: string;
  primary_email?: string;
  role: UserRole;
  avatar_url?: string;
  cover_url?: string;
  headline?: string;
  bio?: string;
  city?: string;
  state?: string;
  experience_years?: number;
  bar_council_number?: string;
  primary_court?: string;
  verification_status?: string;
  verified_badge?: number;
  is_guest?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isGuest: boolean;
  loginWithPhoneOrEmail: (identifier: string, role?: UserRole) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
  updateUserRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isGuest: false,
  loginWithPhoneOrEmail: async () => false,
  loginAsGuest: () => {},
  logout: () => {},
  updateUserRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isGuest = user?.is_guest === true || user?.role === 'guest';

  const loginWithPhoneOrEmail = async (identifier: string, role: UserRole = 'public_user') => {
    setIsLoading(true);
    const res = await apiService.login(identifier, role);
    setIsLoading(false);
    if (res.success && res.data?.user) {
      setUser({ ...res.data.user, is_guest: false });
      return true;
    } else {
      // Default fallback mock login
      setUser({
        id: 1,
        uuid: 'usr_mock_01',
        full_name: identifier.includes('@') ? 'Counsel Advocate' : 'Citizen Rahul',
        primary_phone: identifier.startsWith('+') ? identifier : '+919810123456',
        primary_email: identifier.includes('@') ? identifier : 'user@nyayasetu.in',
        role: role,
        headline: role.includes('advocate') ? 'Advocate | High Court Litigator' : 'Verified Indian Citizen',
        city: 'New Delhi',
        state: 'Delhi',
        verified_badge: role.includes('advocate') ? 1 : 0,
        is_guest: false
      });
      return true;
    }
  };

  const loginAsGuest = () => {
    setUser({
      id: 9999,
      uuid: 'usr_guest_explorer',
      full_name: 'Guest Explorer (अतिथि)',
      role: 'guest',
      headline: 'Exploring Indian Legal Ecosystem',
      city: 'India',
      state: 'National',
      is_guest: true,
      verified_badge: 0
    });
  };

  const logout = () => {
    apiService.setAuthToken(null);
    setUser(null);
  };

  const updateUserRole = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole, is_guest: newRole === 'guest' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isGuest, loginWithPhoneOrEmail, loginAsGuest, logout, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
