// app/src/services/authService.ts
import { supabase } from '../../lib/supabase';
import { LoginForm, RegisterForm } from '../types';
import { userService } from './userService';

export const authService = {
  // Registro de usuario
  async register(formData: RegisterForm) {
    try {
      // 1. Verificar si el email ya existe
      const emailExists = await userService.emailExists(formData.email);
      if (emailExists) {
        return { data: null, error: 'Este email ya está registrado' };
      }

      // 2. Verificar si el teléfono ya existe
      const phoneExists = await userService.phoneExists(formData.mobile_number);
      if (phoneExists) {
        return { data: null, error: 'Este número de teléfono ya está registrado' };
      }

      // 3. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 4. Crear usuario en tu tabla personalizada
      const { data: userData, error: userError } = await userService.createUser({
        email: formData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        mobile_number: formData.mobile_number,
        status: 'active',
      });

      if (userError) {
        // Si falla crear el usuario, eliminar el auth user
        if (authData.user?.id) {
          await supabase.auth.admin.deleteUser(authData.user.id);
        }
        throw new Error(userError);
      }

      return { data: { auth: authData, user: userData }, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al registrar usuario' };
    }
  },

  // Login de usuario
  async login(formData: LoginForm) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Obtener datos adicionales del usuario
      const { data: userData } = await userService.getUserByEmail(formData.email);

      return { 
        data: { 
          session: data.session, 
          user: data.user,
          userData 
        }, 
        error: null 
      };
    } catch (error: any) {
      return { data: null, error: error.message || 'Email o contraseña incorrectos' };
    }
  },

  // Cerrar sesión
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Obtener sesión actual
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { data: data.session, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Verificar si hay una sesión activa
  async isAuthenticated(): Promise<boolean> {
    const { data } = await this.getSession();
    return !!data;
  },

  // Cambiar contraseña
  async changePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Recuperar contraseña
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};