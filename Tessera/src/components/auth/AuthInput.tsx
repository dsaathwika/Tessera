import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './AuthInput.css';

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const inputClasses = [
      'auth-input',
      error && 'auth-input--error',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="auth-input-group">
        {label && (
          <label className="auth-input-label" htmlFor={props.id}>
            {label}
          </label>
        )}
        <div className="auth-input-wrapper">
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
        </div>
        {error && (
          <span className="auth-input-error">{error}</span>
        )}
        {!error && helperText && (
          <span className="auth-input-helper">{helperText}</span>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';