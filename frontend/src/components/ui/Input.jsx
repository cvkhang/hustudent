import React from 'react';
import { cn } from './Button'; // Reusing cn utility

export const Input = React.forwardRef(({ className, label, error, startIcon: StartIcon, endIcon: EndIcon, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-bold text-slate-600 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {StartIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
            <StartIcon size={20} />
          </div>
        )}

        <input
          ref={ref}
          className={cn(
            'flex h-12 w-full rounded-2xl border-none bg-clay-bg shadow-clay-inner outline-none px-4 py-3 text-slate-700 font-bold placeholder:text-slate-400/70 placeholder:font-medium transition-all duration-300',
            'focus:ring-2 focus:ring-primary-400/50 focus:bg-white/50',
            StartIcon && 'pl-12',
            EndIcon && 'pr-12',
            error && 'ring-2 ring-red-400 bg-red-50/50 focus:ring-red-400',
            className
          )}
          {...props}
        />

        {EndIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <EndIcon size={20} />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-bold ml-1 animate-pulse">{error}</p>
      )}
    </div>
  );
});
Input.displayName = "Input";
