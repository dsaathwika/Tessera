// src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

// Import your components
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { AuthForm } from './components/AuthForm';
import { EventDetailPage } from './components/pages/EventDetailPage'; // New
import { ProfilePage } from './components/pages/ProfilePage';     // New
import './App.css';

const ADMIN_EMAIL = 'admin@tessera.com';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!session) {
    return <AuthForm />;
  }
  
  const isAdmin = session.user.email === ADMIN_EMAIL;

  return (
    <div>
      <nav className="main-nav">
        <Link to="/">Home</Link>
        {!isAdmin && <Link to="/profile">My Profile</Link>}
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={isAdmin ? <AdminDashboard /> : <UserDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;