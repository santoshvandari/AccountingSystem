import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className = '' 
}) => {
  const baseClasses = 'border rounded-lg p-4 flex items-start space-x-3';
  
  const types = {
    success: {
      icon: CheckCircle,
      classes: 'border-green-200 bg-green-50 text-green-800',
      iconColor: 'text-green-400',
    },
    error: {
      icon: XCircle,
      classes: 'border-red-200 bg-red-50 text-red-800',
      iconColor: 'text-red-400',
    },
    warning: {
      icon: AlertTriangle,
      classes: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      iconColor: 'text-yellow-400',
    },
    info: {
      icon: Info,
      classes: 'border-blue-200 bg-blue-50 text-blue-800',
      iconColor: 'text-blue-400',
    },
  };

  const { icon: Icon, classes, iconColor } = types[type];

  return (
    <div className={`${baseClasses} ${classes} ${className}`}>
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
      <div className="flex-1">
        {title && (
          <h4 className="font-medium">{title}</h4>
        )}
        {message && (
          <p className={title ? 'mt-1 text-sm' : 'text-sm'}>{message}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
