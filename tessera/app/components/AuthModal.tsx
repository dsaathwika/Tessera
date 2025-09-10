'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Adjust path if needed

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<'sign-in' | 'sign-up' | 'forgot-password'>('sign-in');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Hardcoded admin credentials
  const ADMIN_EMAIL = "admin@tessera.com";
  const ADMIN_PASSWORD = "adminpassword"; // Use a strong password in a real app

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Admin Login Logic
    if (role === 'admin') {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Only check hardcoded credentials, skip Supabase
        router.push('/dashboard/admin');
      } else {
        setError("Invalid admin credentials.");
      }
      return;
    }

    // User Login Logic
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard/user');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      alert('Sign up successful! Please check your email to verify your account.');
      setView('sign-in');
    }
  };
  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`, // You'll need to create this page later for password reset flow
    });
    if (error) {
      setError(error.message);
    } else {
      alert('If an account exists, a password reset link has been sent to your email.');
      setView('sign-in');
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        
        {/* Error Message Display */}
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</p>}
        
        {view === 'sign-in' && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-4">Sign In</h2>
            <div className="flex justify-center border-b mb-6">
              <button onClick={() => setRole('user')} className={`py-2 px-6 ${role === 'user' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>User</button>
              <button onClick={() => setRole('admin')} className={`py-2 px-6 ${role === 'admin' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Admin</button>
            </div>
            <form onSubmit={handleSignIn}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 mb-4 border rounded"/>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full p-3 mb-4 border rounded"/>
              <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">Sign In</button>
              <div className="text-center text-sm text-gray-600 mt-4">
                <a href="#" onClick={(e) => { e.preventDefault(); setView('forgot-password'); }} className="text-blue-500 hover:underline">Forgot Password?</a>
                <p className="mt-2">Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('sign-up'); }} className="text-blue-500 font-semibold hover:underline">Sign Up</a></p>
              </div>
            </form>
          </div>
        )}

        {view === 'sign-up' && (
           <div>
            <h2 className="text-2xl font-bold text-center mb-6">Create User Account</h2>
            <form onSubmit={handleSignUp}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 mb-4 border rounded"/>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full p-3 mb-4 border rounded"/>
              <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">Sign Up</button>
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('sign-in'); }} className="text-blue-500 font-semibold hover:underline">Sign In</a>
              </p>
            </form>
          </div>
        )}

        {view === 'forgot-password' && (
           <div>
            <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
            <p className="text-center text-sm text-gray-600 mb-4">Enter your email and we'll send you a link to reset your password.</p>
            <form onSubmit={handleForgotPassword}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 mb-4 border rounded"/>
              <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">Send Reset Link</button>
              <p className="text-center text-sm text-gray-600 mt-4">
                <a href="#" onClick={(e) => { e.preventDefault(); setView('sign-in'); }} className="text-blue-500 hover:underline">Back to Sign In</a>
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}