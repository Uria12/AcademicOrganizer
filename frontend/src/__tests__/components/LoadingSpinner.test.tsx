import React from 'react';
import { render } from '@testing-library/react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Helper to get the spinner element
const getSpinner = (container: HTMLElement) => container.querySelector('svg');

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = getSpinner(container);
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-5 h-5');
    expect(spinner).toHaveClass('text-primary-600');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders with custom size', () => {
    const { container } = render(<LoadingSpinner size="xl" />);
    const spinner = getSpinner(container);
    expect(spinner).toHaveClass('w-8 h-8');
  });

  it('renders with custom variant', () => {
    const { container } = render(<LoadingSpinner variant="white" />);
    const spinner = getSpinner(container);
    expect(spinner).toHaveClass('text-white');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const spinner = getSpinner(container);
    expect(spinner).toHaveClass('custom-class');
  });

  it('renders with all size and variant combinations', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    const variants = ['primary', 'white', 'secondary'] as const;
    sizes.forEach(size => {
      variants.forEach(variant => {
        const { container } = render(<LoadingSpinner size={size} variant={variant} />);
        const spinner = getSpinner(container);
        expect(spinner).toHaveClass(`w-${size === 'xs' ? 3 : size === 'sm' ? 4 : size === 'md' ? 5 : size === 'lg' ? 6 : 8}`);
        if (variant === 'primary') expect(spinner).toHaveClass('text-primary-600');
        if (variant === 'white') expect(spinner).toHaveClass('text-white');
        if (variant === 'secondary') expect(spinner).toHaveClass('text-secondary-600');
      });
    });
  });
}); 