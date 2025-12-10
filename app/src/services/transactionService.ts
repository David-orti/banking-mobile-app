// app/src/services/transactionService.ts
import { supabase } from '../../lib/supabase';
import { Transaction, TransferForm } from '../types';
import { TRANSFER_LIMITS } from '../utils/constants';
import { accountService } from './accountService';

export const transactionService = {
  // Obtener transacciones de una cuenta
  async getTransactions(accountNumber: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_number', accountNumber)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Transaction[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Obtener últimas N transacciones
  async getRecentTransactions(accountNumber: string, limit: number = 5) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_number', accountNumber)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data as Transaction[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Crear transacción (depósito/retiro)
  async createTransaction(
    accountNumber: string,
    amount: number,
    type: 'deposit' | 'withdrawal',
    description: string
  ) {
    try {
      // 1. Obtener saldo actual
      const { data: balanceData, error: balanceError } = await accountService.getBalance(accountNumber);
      if (balanceError) throw new Error(balanceError);

      const currentBalance = balanceData || 0;

      // 2. Validar saldo para retiros
      if (type === 'withdrawal' && amount > currentBalance) {
        return { data: null, error: 'Saldo insuficiente' };
      }

      // 3. Calcular nuevo saldo
      const newBalance = type === 'deposit' 
        ? currentBalance + amount 
        : currentBalance - amount;

      // 4. Crear transacción
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          account_number: accountNumber,
          amount: type === 'deposit' ? amount : -amount,
          type,
          description,
          status: 'completed',
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // 5. Actualizar saldo
      const { error: updateError } = await accountService.updateBalance(accountNumber, newBalance);
      if (updateError) throw new Error(updateError);

      return { data: transactionData as Transaction, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Realizar transferencia
  async transfer(
    fromAccount: string,
    transferData: TransferForm,
    userEmail: string
  ) {
    try {
      // 1. Validar que la cuenta destino existe
      const destinationExists = await accountService.accountExists(transferData.destinationAccount);
      if (!destinationExists) {
        return { data: null, error: 'La cuenta destino no existe' };
      }

      // 2. Validar que no sea la misma cuenta
      if (fromAccount === transferData.destinationAccount) {
        return { data: null, error: 'No puedes transferir a la misma cuenta' };
      }

      // 3. Obtener saldo actual
      const { data: balanceData, error: balanceError } = await accountService.getBalance(fromAccount);
      if (balanceError) throw new Error(balanceError);

      const currentBalance = balanceData || 0;

      // 4. Validar saldo suficiente
      if (transferData.amount > currentBalance) {
        return { data: null, error: 'Saldo insuficiente' };
      }

      // 5. Validar límites
      if (transferData.amount < TRANSFER_LIMITS.MIN) {
        return { data: null, error: `El monto mínimo es $${TRANSFER_LIMITS.MIN.toLocaleString()}` };
      }

      if (transferData.amount > TRANSFER_LIMITS.MAX_PER_TRANSACTION) {
        return { data: null, error: `El monto máximo es $${TRANSFER_LIMITS.MAX_PER_TRANSACTION.toLocaleString()}` };
      }

      // 6. Crear transacción de salida
      const { data: transactionOut, error: errorOut } = await supabase
        .from('transactions')
        .insert([{
          account_number: fromAccount,
          amount: -transferData.amount,
          type: 'transfer_out',
          description: transferData.description,
          destination_account: transferData.destinationAccount,
          status: 'completed',
        }])
        .select()
        .single();

      if (errorOut) throw errorOut;

      // 7. Crear transacción de entrada
      await supabase
        .from('transactions')
        .insert([{
          account_number: transferData.destinationAccount,
          amount: transferData.amount,
          type: 'transfer_in',
          description: `Transferencia de ${fromAccount}`,
          status: 'completed',
        }]);

      // 8. Actualizar saldos
      const newBalanceFrom = currentBalance - transferData.amount;
      await accountService.updateBalance(fromAccount, newBalanceFrom);

      const { data: balanceTo } = await accountService.getBalance(transferData.destinationAccount);
      const newBalanceTo = (balanceTo || 0) + transferData.amount;
      await accountService.updateBalance(transferData.destinationAccount, newBalanceTo);

      return { data: transactionOut as Transaction, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Obtener estadísticas de transacciones
  async getStats(accountNumber: string, month: number, year: number) {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_number', accountNumber)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const transactions = data as Transaction[];
      
      const income = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return { 
        data: { 
          income, 
          expenses, 
          balance: income - expenses,
          transactionCount: transactions.length 
        }, 
        error: null 
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};