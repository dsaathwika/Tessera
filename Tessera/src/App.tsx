// src/App.tsx
import { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

// Define your admin email here
const ADMIN_EMAIL = 'dsaathwika15@gmail.com'; 

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for an active session when the component mounts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes in authentication state (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Conditionally render components based on the session and user role
  if (!session) {
    return <AuthForm />;
  } else if (session.user.email === ADMIN_EMAIL) {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  }
}

export default App;