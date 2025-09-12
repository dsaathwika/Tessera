// src/components/UserDashboard.tsx
import { supabase } from '../supabaseClient';
import './Dashboard.css';

export function UserDashboard() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome, User! 👋</h1>
        <p>This is your personal dashboard.</p>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}