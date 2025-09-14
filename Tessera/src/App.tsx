// src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

// Import your components
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { AuthForm } from './components/auth';
import { EventDetailPage } from './components/pages/EventDetailPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { Navbar } from './components/layout';
import './App.css';

const ADMIN_EMAIL = 'admin@tessera.com';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);
  

  if (!session) {
    return <AuthForm />;
  }
  
  const isAdmin = session.user.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen w-full bg-black relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), linear-gradient(120deg, #0f0e17 0%, #1a1b26 100%)"
        }}
      />
      
      <div className="app relative z-10">
        <Navbar isAdmin={isAdmin} userEmail={session.user.email} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={isAdmin ? <AdminDashboard /> : <UserDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;