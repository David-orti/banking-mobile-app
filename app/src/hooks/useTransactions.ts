// app/src/hooks/useTransactions.ts
import { useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction } from '../types';

export const useTransactions = (accountNumber: string | undefined) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountNumber) {
      loadTransactions();
    }
  }, [accountNumber]);

  const loadTransactions = async () => {
    if (!accountNumber) return;

    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await transactionService.getTransactions(accountNumber);
      
      if (err) {
        setError(err);
      } else {
        setTransactions(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadTransactions();
  };

  return { transactions, loading, error, refresh };
};

export const useRecentTransactions = (accountNumber: string | undefined, limit: number = 5) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountNumber) {
      loadRecentTransactions();
    }
  }, [accountNumber, limit]);

  const loadRecentTransactions = async () => {
    if (!accountNumber) return;

    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await transactionService.getRecentTransactions(accountNumber, limit);
      
      if (err) {
        setError(err);
      } else {
        setTransactions(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadRecentTransactions();
  };

  return { transactions, loading, error, refresh };
};