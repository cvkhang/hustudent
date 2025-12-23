import React from 'react';
import { Zap } from 'lucide-react';

export const Logo = ({ size = 'md', className = '' }) => {
  // Size mapping
  const sizes = {
    sm: {
      wrapper: 'w-8 h-8 rounded-lg',
      icon: 20,
      text: 'text-xl'
    },
    md: {
      wrapper: 'w-10 h-10 rounded-xl',
      icon: 24,
      text: 'text-2xl'
    },
    lg: {
      wrapper: 'w-12 h-12 rounded-2xl',
      icon: 28,
      text: 'text-3xl'
    },
    xl: {
      wrapper: 'w-16 h-16 rounded-[1.25rem]',
      icon: 40,
      text: 'text-5xl'
    }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${currentSize.wrapper} bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg`}>
        <Zap size={currentSize.icon} fill="currentColor" className="drop-shadow-sm" />
      </div>
      <span className={`font-heading font-black ${currentSize.text} text-slate-800 tracking-tight`}>
        HUST<span className="text-primary-600">UDENT</span>
      </span>
    </div>
  );
};

export default Logo;
