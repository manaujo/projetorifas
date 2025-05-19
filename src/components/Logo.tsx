import React from 'react';
import { Ticket } from 'lucide-react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'default' }) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-primary-500';
  const accentColor = variant === 'white' ? 'text-gold-400' : 'text-gold-500';
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative mr-2">
        <Ticket 
          size={28} 
          className={`${textColor} transform rotate-12`} 
          strokeWidth={2}
        />
        <span className={`absolute -bottom-0.5 right-0 text-xl font-bold ${accentColor}`}>
          •
        </span>
      </div>
      <span className={`font-display font-bold text-xl ${textColor}`}>
        Rif<span className={accentColor}>ativa</span>
      </span>
    </div>
  );
};