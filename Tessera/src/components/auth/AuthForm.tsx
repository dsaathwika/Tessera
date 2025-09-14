import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { AuthCard, AuthButton, AuthInput } from './';
import './AuthForm.css';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else setMessage('Welcome back! Redirecting...');
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) setError(error.message);
      else setMessage('Please check your email to confirm your account!');
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address first to reset your password.');
      return;
    }
    clearMessages();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) setError(error.message);
    else setMessage('Password reset link sent! Check your email.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-black relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), linear-gradient(120deg, #0f0e17 0%, #1a1b26 100%)"
        }}
      />
      
      <div className="auth-page relative z-10">
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-header">
            <h1 className="auth-title">
              Welcome to <span className="auth-title-accent">Tessera</span>
            </h1>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Sign in to access your event dashboard' 
                : 'Create your account to get started'}
            </p>
          </div>

          <AuthCard>
            {message && (
              <div className={`auth-message auth-message--${
                message.includes('Welcome') || message.includes('sent') 
                  ? 'success' 
                  : 'info'
              }`}>
                <div className="auth-message-icon">
                  {message.includes('Welcome') ? '🎉' : 
                   message.includes('sent') ? '📧' : 'ℹ️'}
                </div>
                <span>{message}</span>
              </div>
            )}
            
            {error && (
              <div className="auth-message auth-message--error">
                <div className="auth-message-icon">⚠️</div>
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-fields">
                <AuthInput
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <AuthInput
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>

              <AuthButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                className="auth-submit-btn"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </AuthButton>
            </form>

            {isLogin && (
              <div className="auth-forgot">
                <AuthButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePasswordReset}
                  disabled={loading}
                >
                  Forgot your password?
                </AuthButton>
              </div>
            )}

            <div className="auth-toggle">
              <div className="auth-divider">
                <span className="auth-divider-text">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </span>
              </div>
              <AuthButton
                variant="soft"
                size="md"
                fullWidth
                onClick={() => {
                  setIsLogin(!isLogin);
                  clearMessages();
                }}
                disabled={loading}
              >
                {isLogin ? 'Create Account' : 'Sign In Instead'}
              </AuthButton>
            </div>
          </AuthCard>

          <div className="auth-footer">
            <div className="auth-admin-hint">
              <div className="auth-admin-hint-icon">💡</div>
              <p>
                <strong>Admin Access:</strong> Use{' '}
                <code className="auth-admin-email">admin@tessera.com</code>{' '}
                to access administrator features
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}