import React from 'react';

const ClayCard = ({ children, className = "", hoverEffect = true }) => (
  <div className={`
    relative overflow-hidden
    bg-clay-card backdrop-blur-xl
    rounded-[2.5rem] 
    border border-white/40
    shadow-clay-card
    ${hoverEffect ? 'transition-all duration-300 hover:shadow-clay-card-hover hover:-translate-y-1' : ''}
    ${className}
  `}>
    {/* Shine effect on top left */}
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none rounded-[2.5rem]" />
    {children}
  </div>
);

export default ClayCard;
