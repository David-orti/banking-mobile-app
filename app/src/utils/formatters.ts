// app/src/utils/formatters.ts

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCardNumber = (cardNumber: string): string => {
  // Formatea: 1234567890123456 -> 1234 5678 9012 3456
  return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
};

export const maskCardNumber = (cardNumber: string): string => {
  // Enmascara: 1234567890123456 -> **** **** **** 3456
  const last4 = cardNumber.slice(-4);
  return `**** **** **** ${last4}`;
};

export const maskAccountNumber = (accountNumber: string): string => {
  // Enmascara: 8666241660 -> **** 1660
  const last4 = accountNumber.slice(-4);
  return `**** ${last4}`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPhoneNumber = (phone: string): string => {
  // Formatea: 3135351555 -> (313) 535-1555
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

export const getTransactionSign = (type: string): string => {
  switch (type) {
    case 'deposit':
    case 'transfer_in':
      return '+';
    case 'withdrawal':
    case 'transfer_out':
      return '-';
    default:
      return '';
  }
};

export const getRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Ahora';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  if (diffInDays < 7) return `Hace ${diffInDays}d`;
  return formatDate(d);
};