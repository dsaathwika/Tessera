import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import './AuthButton.css';

export interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    fullWidth = false,
    disabled,
    className = '',
    ...props 
  }, ref) => {
    const classNames = [
      'auth-btn',
      `auth-btn--${variant}`,
      `auth-btn--${size}`,
      isLoading && 'auth-btn--loading',
      fullWidth && 'auth-btn--full-width',
      className
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || isLoading}
        {...props}
      >
        <div className="auth-btn__content">
          {isLoading ? (
            <div className="auth-btn__spinner">
              <div className="spinner"></div>
              <span>Loading...</span>
            </div>
          ) : (
            children
          )}
        </div>
      </button>
    );
  }
);

AuthButton.displayName = 'AuthButton';