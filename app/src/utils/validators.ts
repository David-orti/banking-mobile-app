// app/src/utils/validators.ts
import { TRANSFER_LIMITS } from './constants';

export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  password: (value: string): boolean => {
    // Mínimo 6 caracteres
    return value.length >= 6;
  },

  phone: (value: string): boolean => {
    // 10 dígitos
    return /^\d{10}$/.test(value);
  },

  accountNumber: (value: string): boolean => {
    // 10 dígitos
    return /^\d{10}$/.test(value);
  },

  cardNumber: (value: string): boolean => {
    // 16 dígitos
    return /^\d{16}$/.test(value);
  },

  cvv: (value: string): boolean => {
    // 3 o 4 dígitos
    return /^\d{3,4}$/.test(value);
  },

  pin: (value: string): boolean => {
    // 4 o 6 dígitos
    return /^\d{4,6}$/.test(value);
  },

  amount: (value: number, balance?: number): { valid: boolean; error?: string } => {
    if (isNaN(value) || value <= 0) {
      return { valid: false, error: 'Ingresa un monto válido' };
    }

    if (value < TRANSFER_LIMITS.MIN) {
      return { 
        valid: false, 
        error: `El monto mínimo es $${TRANSFER_LIMITS.MIN.toLocaleString()}` 
      };
    }

    if (value > TRANSFER_LIMITS.MAX_PER_TRANSACTION) {
      return { 
        valid: false, 
        error: `El monto máximo es $${TRANSFER_LIMITS.MAX_PER_TRANSACTION.toLocaleString()}` 
      };
    }

    if (balance !== undefined && value > balance) {
      return { valid: false, error: 'Saldo insuficiente' };
    }

    return { valid: true };
  },

  dailyLimit: (currentSpent: number, newAmount: number): { valid: boolean; error?: string } => {
    const total = currentSpent + newAmount;
    
    if (total > TRANSFER_LIMITS.MAX_DAILY) {
      const remaining = TRANSFER_LIMITS.MAX_DAILY - currentSpent;
      return { 
        valid: false, 
        error: `Límite diario excedido. Disponible: $${remaining.toLocaleString()}` 
      };
    }

    return { valid: true };
  },

  name: (value: string): boolean => {
    // Al menos 2 caracteres, solo letras y espacios
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/.test(value);
  },
};

export const getErrorMessage = (field: string, value: any): string | null => {
  switch (field) {
    case 'email':
      if (!value) return 'El email es requerido';
      if (!validators.email(value)) return 'Email inválido';
      break;
    case 'password':
      if (!value) return 'La contraseña es requerida';
      if (!validators.password(value)) return 'Mínimo 6 caracteres';
      break;
    case 'phone':
      if (!value) return 'El teléfono es requerido';
      if (!validators.phone(value)) return 'Debe tener 10 dígitos';
      break;
    case 'accountNumber':
      if (!value) return 'El número de cuenta es requerido';
      if (!validators.accountNumber(value)) return 'Debe tener 10 dígitos';
      break;
    case 'firstname':
    case 'lastname':
      if (!value) return 'Este campo es requerido';
      if (!validators.name(value)) return 'Nombre inválido';
      break;
    case 'pin':
      if (!value) return 'El PIN es requerido';
      if (!validators.pin(value)) return 'Debe tener 4 o 6 dígitos';
      break;
  }
  return null;
};