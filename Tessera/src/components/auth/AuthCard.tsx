import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './AuthCard.css';

export interface AuthCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated';
}

export const AuthCard = forwardRef<HTMLDivElement, AuthCardProps>(
  ({ children, className = '', ...props }, ref) => {
    const cardClasses = [
      'auth-card',
      className
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={cardClasses} {...props}>
        <div className="auth-card__content">
          {children}
        </div>
      </div>
    );
  }
);

AuthCard.displayName = 'AuthCard';