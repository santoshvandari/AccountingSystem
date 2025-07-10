# Currency Configuration

This file provides centralized currency configuration for the accounting system.

## Default Currency

The system is currently configured to use **NPR (Nepalese Rupee)** as the default currency with the symbol **Rs.**

## Usage

### Importing Currency Functions

```javascript
import { 
  formatCurrency, 
  formatAmount, 
  parseAmount, 
  getCurrencySymbol,
  getCurrencyCode,
  validateAmount 
} from '../config/currency';
```

### Formatting Currency

```javascript
// Format amount with currency symbol
const formatted = formatCurrency(1234.56); // "Rs.1,234.56"

// Format amount without currency symbol
const amountOnly = formatAmount(1234.56); // "1,234.56"
```

### Parsing Amounts

```javascript
// Parse formatted amount to number
const number = parseAmount("Rs.1,234.56"); // 1234.56
const number2 = parseAmount("1,234.56"); // 1234.56
```

### Using Currency Components

#### CurrencyInput Component

Use the `CurrencyInput` component for amount input fields:

```jsx
import CurrencyInput from '../components/CurrencyInput/CurrencyInput';

<CurrencyInput
  label="Amount"
  name="amount"
  value={formData.amount}
  onChange={handleFormChange}
  error={formErrors.amount}
  required
/>
```

## Changing Currency

To change the default currency, edit the `CURRENCY_CONFIG.primary` object in `/src/config/currency.js`:

```javascript
primary: {
  code: 'USD',           // Currency code
  symbol: '$',           // Currency symbol
  name: 'US Dollar',     // Full currency name
  position: 'before',    // 'before' or 'after' the amount
  decimals: 2,           // Number of decimal places
  thousandsSeparator: ',',  // Thousands separator
  decimalSeparator: '.'     // Decimal separator
}
```

## Available Functions

- `formatCurrency(amount)` - Format amount with currency symbol
- `formatAmount(amount)` - Format amount without currency symbol
- `parseAmount(amountString)` - Parse formatted amount string to number
- `validateAmount(amount)` - Validate if amount is valid
- `getCurrencySymbol()` - Get current currency symbol
- `getCurrencyCode()` - Get current currency code
- `getCurrentCurrency()` - Get current currency configuration

## Future Enhancements

The configuration supports multiple currencies and can be extended for:
- User-specific currency preferences
- Multi-currency support
- Exchange rate integration
- Dynamic currency switching
