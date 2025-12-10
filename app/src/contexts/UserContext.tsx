// app/src/contexts/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { accountService } from '../services/accountService';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { Account, User } from '../types';

interface UserContextType {
  user: User | null;
  account: Account | null;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (data: any) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAccount: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar
  useEffect(() => {
    loadUser();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserData(session.user.email!);
      } else {
        setUser(null);
        setAccount(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await authService.getSession();
      
      if (sessionData?.user) {
        setSession(sessionData);
        await loadUserData(sessionData.user.email!);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (email: string) => {
    try {
      // Cargar datos del usuario
      const { data: userData } = await userService.getUserByEmail(email);
      if (userData) {
        setUser(userData);
        
        // Cargar cuenta principal
        const { data: accountData } = await accountService.getPrimaryAccount(email);
        if (accountData) {
          setAccount(accountData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await authService.login({ email, password });
      
      if (error) {
        return { error };
      }

      if (data) {
        setSession(data.session);
        setUser(data.userData!);
        
        // Cargar cuenta
        const { data: accountData } = await accountService.getPrimaryAccount(email);
        if (accountData) {
          setAccount(accountData);
        }
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al iniciar sesión' };
    }
  };

  const register = async (formData: any) => {
    try {
      const { data, error } = await authService.register(formData);
      
      if (error) {
        return { error };
      }

      // Después del registro, hacer login automático
      await login(formData.email, formData.password);

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al registrar usuario' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setAccount(null);
      setSession(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const refreshUser = async () => {
    if (user?.email) {
      await loadUserData(user.email);
    }
  };

  const refreshAccount = async () => {
    if (user?.email) {
      const { data } = await accountService.getPrimaryAccount(user.email);
      if (data) {
        setAccount(data);
      }
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        account,
        session,
        loading,
        isAuthenticated: !!session,
        login,
        register,
        logout,
        refreshUser,
        refreshAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de UserProvider');
  }
  return context;
};