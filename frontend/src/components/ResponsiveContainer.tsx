import React from 'react';
import { motion } from 'framer-motion';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = '',
  maxWidth = 'lg',
  padding = 'md'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-12'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`w-full ${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default ResponsiveContainer; 