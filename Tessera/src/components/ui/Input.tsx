import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const inputClasses = [
      'input',
      error && 'input--error',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="input-group">
        {label && (
          <label className="input-label" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {error && (
          <span className="input-error">{error}</span>
        )}
        {!error && helperText && (
          <span className="input-helper">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';