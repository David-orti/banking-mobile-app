// app/src/services/accountService.ts
import { supabase } from '../../lib/supabase';
import { Account } from '../types';

export const accountService = {
  // Obtener todas las cuentas de un usuario
  async getAccounts(userEmail: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Account[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Obtener cuenta principal (la primera creada o marcada como principal)
  async getPrimaryAccount(userEmail: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      return { data: data as Account, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Obtener cuenta por número
  async getAccountByNumber(accountNumber: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('account_number', accountNumber)
        .single();

      if (error) throw error;
      return { data: data as Account, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Obtener saldo de una cuenta
  async getBalance(accountNumber: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('balance')
        .eq('account_number', accountNumber)
        .single();

      if (error) throw error;
      return { data: data.balance, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Actualizar saldo de una cuenta
  async updateBalance(accountNumber: string, newBalance: number) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('account_number', accountNumber)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Account, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Crear nueva cuenta
  async createAccount(accountData: Omit<Account, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Account, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Verificar si una cuenta existe
  async accountExists(accountNumber: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('account_number')
        .eq('account_number', accountNumber)
        .single();

      return !!data && !error;
    } catch {
      return false;
    }
  },

  // Bloquear/desbloquear cuenta
  async updateAccountStatus(accountNumber: string, status: 'active' | 'blocked' | 'closed') {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update({ status })
        .eq('account_number', accountNumber)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Account, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};