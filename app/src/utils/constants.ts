// app/src/utils/constants.ts

export const TRANSFER_LIMITS = {
  MIN: 1000,
  MAX_PER_TRANSACTION: 2000000,
  MAX_DAILY: 5000000,
};

export const ACCOUNT_TYPES = {
  SAVINGS: 'savings',
  CHECKING: 'checking',
} as const;

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER_IN: 'transfer_in',
  TRANSFER_OUT: 'transfer_out',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const CARD_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  EXPIRED: 'expired',
} as const;

export const COLORS = {
  primary: '#1E3A8A',
  secondary: '#3B82F6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#0F172A',
  cardBackground: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
};

export const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Saldo insuficiente',
  INVALID_ACCOUNT: 'Número de cuenta inválido',
  AMOUNT_TOO_LOW: `El monto mínimo es $${TRANSFER_LIMITS.MIN.toLocaleString()}`,
  AMOUNT_TOO_HIGH: `El monto máximo por transacción es $${TRANSFER_LIMITS.MAX_PER_TRANSACTION.toLocaleString()}`,
  DAILY_LIMIT_EXCEEDED: `Has excedido el límite diario de $${TRANSFER_LIMITS.MAX_DAILY.toLocaleString()}`,
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
  GENERIC_ERROR: 'Ocurrió un error. Intenta nuevamente',
};

export const SUCCESS_MESSAGES = {
  TRANSFER_SUCCESS: 'Transferencia exitosa',
  TRANSACTION_SUCCESS: 'Transacción completada',
  REGISTRATION_SUCCESS: 'Registro exitoso',
  PIN_SETUP_SUCCESS: 'PIN configurado correctamente',
};