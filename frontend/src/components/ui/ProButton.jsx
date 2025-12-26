import React from 'react';
import { Loader2 } from 'lucide-react';

const ProButton = ({ children, variant = "primary", className = "", icon: Icon, iconPosition = "right", isLoading, ...props }) => {
  const variants = {
    primary: "bg-linear-to-r from-primary-500 to-primary-600 text-white shadow-clay-btn hover:shadow-glow-primary hover:scale-[1.02]",
    secondary: "bg-white text-slate-700 shadow-clay-btn hover:text-primary-600 hover:scale-[1.02]",
    accent: "bg-linear-to-r from-accent-orange to-red-500 text-white shadow-clay-btn hover:shadow-glow-accent hover:scale-[1.02]",
    ghost: "bg-transparent text-slate-600 hover:bg-white/50 hover:text-primary-600",
  };

  return (
    <button className={`
      relative overflow-hidden group
      py-3.5 px-8 rounded-2xl font-bold tracking-wide 
      transition-all duration-300 flex items-center justify-center gap-2
      active:scale-95 active:shadow-inner
      disabled:opacity-70 disabled:pointer-events-none
      ${variants[variant]}
      ${className}
    `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {isLoading && <Loader2 size={20} className="animate-spin" />}
        {!isLoading && children}
        {!isLoading && Icon && <Icon size={20} className="transition-transform group-hover:translate-x-1" />}
      </span>
      {/* Glossy overlay swipe */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
    </button>
  );
};

export default ProButton;
