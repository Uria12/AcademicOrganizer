import React from 'react';
import { GraduationCap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'full', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const containerSizes = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
    xl: 'p-5'
  };

  if (variant === 'icon') {
    return (
      <div className={`${containerSizes[size]} bg-primary-100 rounded-full ${className}`}>
        <GraduationCap className={`${iconSizes[size]} text-primary-600`} />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center gap-2 ${sizeClasses[size]} font-bold text-secondary-900 ${className}`}>
        <GraduationCap className={`${iconSizes[size]} text-primary-600`} />
        <span>Academic Organizer</span>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${containerSizes[size]} bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg`}>
        <div className="flex items-center justify-center">
          <GraduationCap className={`${iconSizes[size]} text-white`} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className={`${sizeClasses[size]} font-bold text-secondary-900 leading-tight`}>
          Academic Organizer
        </span>
        <span className={`text-xs text-secondary-500 leading-tight`}>
          Super Student Management
        </span>
      </div>
    </div>
  );
};

export default Logo; 