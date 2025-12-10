// app/src/types/index.ts

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  mobile_number: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface Account {
  id: string;
  user_email: string;
  account_number: string;
  account_type: 'savings' | 'checking';
  balance: number;
  status?: 'active' | 'blocked' | 'closed';
  created_at: string;
}

export interface Transaction {
  id: string;
  account_number: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';
  description: string;
  created_at: string;
  destination_account?: string;
  from_user_id?: string;
  to_user_id?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface Card {
  id: string;
  account_number: string;
  card_number: string;
  cvv: string;
  expiration: string;
  status: 'active' | 'blocked' | 'expired';
  created_at: string;
}

export interface TransferLimit {
  id: string;
  user_email: string;
  daily_limit: number;
  daily_spent: number;
  last_reset_date: string;
  created_at: string;
}

export interface TransactionReceipt {
  id: string;
  transaction_id: string;
  receipt_number: string;
  generated_at: string;
  downloaded: boolean;
  category?: string;
}

// Tipos para formularios
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstname: string;
  lastname: string;
  email: string;
  mobile_number: string;
  password: string;
  confirmPassword: string;
}

export interface TransferForm {
  destinationAccount: string;
  amount: number;
  description: string;
}

export interface TransactionForm {
  type: 'deposit' | 'withdrawal';
  amount: number;
}