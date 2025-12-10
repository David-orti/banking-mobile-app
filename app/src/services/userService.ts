// app/src/services/userService.ts
import { supabase } from '../../lib/supabase';
import { User } from '../types';

export const userService = {
  // Obtener usuario por email
  async getUserByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return { data: data as User, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Crear usuario (después del registro en auth)
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          firstname: userData.firstname,
          lastname: userData.lastname,
          mobile_number: userData.mobile_number,
          status: 'active',
        }])
        .select()
        .single();

      if (error) throw error;
      return { data: data as User, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Actualizar información del usuario
  async updateUser(email: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('email', email)
        .select()
        .single();

      if (error) throw error;
      return { data: data as User, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Verificar si el email ya existe
  async emailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      return !!data && !error;
    } catch {
      return false;
    }
  },

  // Verificar si el número de teléfono ya existe
  async phoneExists(phone: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('mobile_number')
        .eq('mobile_number', phone)
        .single();

      return !!data && !error;
    } catch {
      return false;
    }
  },
};