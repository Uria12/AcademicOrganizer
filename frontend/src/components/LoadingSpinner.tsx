import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'secondary';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const variantClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
    secondary: 'text-secondary-600'
  };

  return (
    <Loader2 
      className={`${sizeClasses[size]} ${variantClasses[variant]} animate-spin ${className}`} 
    />
  );
};

export default LoadingSpinner; 