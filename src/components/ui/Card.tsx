import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  padding = true 
}) => {
  return (
    <div className={cn(
      'bg-white rounded-lg shadow-md border border-gray-200',
      padding && 'p-6',
      className
    )}>
      {children}
    </div>
  );
};