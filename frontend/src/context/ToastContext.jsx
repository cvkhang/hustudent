import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ message, type, onClose }) => {
  const styles = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-50/90',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-500'
    },
    error: {
      icon: AlertTriangle,
      bg: 'bg-red-50/90',
      border: 'border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-500'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50/90',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  };

  const style = styles[type] || styles.info;
  const Icon = style.icon;

  return (
    <div
      className={`
        pointer-events-auto
        flex items-start gap-3 px-4 py-3 rounded-2xl shadow-clay-card
        border ${style.border} ${style.bg} backdrop-blur-md
        min-w-[300px] max-w-sm
        animate-fade-in-up transition-all duration-300
      `}
    >
      <div className={`mt-0.5 ${style.iconColor}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-bold ${style.text}`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
