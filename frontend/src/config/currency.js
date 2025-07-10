// Currency configuration for the accounting system
export const CURRENCY_CONFIG = {
  // Primary currency (default)
  primary: {
    code: 'NPR',
    symbol: 'Rs.',
    name: 'Nepalese Rupee',
    position: 'before', // 'before' or 'after' the amount
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  
  // Available currencies (for future multi-currency support)
  available: [
    {
      code: 'NPR',
      symbol: 'Rs.',
      name: 'Nepalese Rupee',
      position: 'before',
      decimals: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    },
    {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      position: 'before',
      decimals: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    },
    {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      position: 'before',
      decimals: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    },
    {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee',
      position: 'before',
      decimals: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    }
  ]
};

// Get the current currency (defaults to NPR)
export const getCurrentCurrency = () => {
  // In the future, this could read from user preferences or localStorage
  return CURRENCY_CONFIG.primary;
};

// Format amount with currency
export const formatCurrency = (amount, currencyConfig = null) => {
  const currency = currencyConfig || getCurrentCurrency();
  
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency.symbol}0.00`;
  }
  
  const numAmount = parseFloat(amount);
  const formattedAmount = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
    useGrouping: true
  });
  
  if (currency.position === 'before') {
    return `${currency.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount}${currency.symbol}`;
  }
};

// Format amount without currency symbol (for inputs)
export const formatAmount = (amount, currencyConfig = null) => {
  const currency = currencyConfig || getCurrentCurrency();
  
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00';
  }
  
  const numAmount = parseFloat(amount);
  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
    useGrouping: true
  });
};

// Parse formatted amount string to number
export const parseAmount = (amountString) => {
  if (!amountString) return 0;
  
  // Remove currency symbol, thousand separators, and spaces
  const cleanAmount = amountString
    .replace(/[Rs.$€₹,\s]/g, '')
    .replace(/[^\d.-]/g, '');
    
  return parseFloat(cleanAmount) || 0;
};

// Validate amount input
export const validateAmount = (amount) => {
  const numAmount = typeof amount === 'string' ? parseAmount(amount) : amount;
  return !isNaN(numAmount) && numAmount >= 0;
};

// Get currency symbol only
export const getCurrencySymbol = (currencyConfig = null) => {
  const currency = currencyConfig || getCurrentCurrency();
  return currency.symbol;
};

// Get currency code only
export const getCurrencyCode = (currencyConfig = null) => {
  const currency = currencyConfig || getCurrentCurrency();
  return currency.code;
};

export default {
  CURRENCY_CONFIG,
  getCurrentCurrency,
  formatCurrency,
  formatAmount,
  parseAmount,
  validateAmount,
  getCurrencySymbol,
  getCurrencyCode
};
