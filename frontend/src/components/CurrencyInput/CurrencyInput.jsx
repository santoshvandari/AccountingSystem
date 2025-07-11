import React from 'react';
import InputField from '../InputField/InputField';
import { getCurrencySymbol, parseAmount, formatAmount, validateAmount } from '../../config/currency';

const CurrencyInput = ({ 
  label = 'Amount',
  name,
  value,
  onChange,
  error,
  placeholder = '0.00',
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const currencySymbol = getCurrencySymbol();

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Remove currency symbol and non-numeric characters except dots and commas
    const cleanValue = inputValue.replace(/[^\d.,]/g, '');
    
    // Update the original event target value for consistent handling
    e.target.value = cleanValue;
    e.target.name = name;
    
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    const numericValue = parseAmount(e.target.value);
    if (!isNaN(numericValue)) {
      // Format the value nicely on blur
      const formattedValue = formatAmount(numericValue);
      e.target.value = formattedValue;
      
      // Create a new event for consistency
      const newEvent = {
        target: {
          name: name,
          value: formattedValue
        }
      };
      
      if (onChange) {
        onChange(newEvent);
      }
    }
    
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <InputField
        label={label}
        name={name}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        error={error}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        inputClassName="pl-8"
        {...props}
      />
      <div className="absolute top-8 left-3 flex items-center pointer-events-none">
        <span className="text-gray-500 text-sm font-medium">
          {currencySymbol}
        </span>
      </div>
    </div>
  );
};

export default CurrencyInput;
