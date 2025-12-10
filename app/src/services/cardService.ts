// app/src/services/cardService.ts
import { supabase } from '../lib/supabase';
import { Card } from '../types';

export const cardService = {
  // Obtener todas las tarjetas de una cuenta
  async getCards(accountNumber: string) {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('account_number', accountNumber)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Card[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Obtener tarjeta por ID
  async getCardById(id: string) {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as Card, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Crear nueva tarjeta
  async createCard(cardData: Omit<Card, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([cardData])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Card, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Bloquear/Desbloquear tarjeta
  async updateCardStatus(cardId: string, status: 'active' | 'blocked' | 'expired') {
    try {
      const { data, error } = await supabase
        .from('cards')
        .update({ status })
        .eq('id', cardId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Card, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Eliminar tarjeta
  async deleteCard(cardId: string) {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Verificar si la tarjeta está expirada
  isCardExpired(expiration: string): boolean {
    const [month, year] = expiration.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month));
    return expiryDate < new Date();
  },

  // Obtener tarjetas activas
  async getActiveCards(accountNumber: string) {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('account_number', accountNumber)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Card[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};