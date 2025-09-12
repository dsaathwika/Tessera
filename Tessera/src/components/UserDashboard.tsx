/**
 * UserDashboard.tsx
 *
 * Displays a list of upcoming events for users, fetched from Supabase.
 * Allows navigation to event detail pages.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

export function UserDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="section-title">Upcoming Events</h1>
      <div className="event-list">
        {events.map(event => (
          <Link to={`/event/${event.id}`} key={event.id} className="event-item-link">
            <div className="event-item">
              <h3>{event.name}</h3>
              <p>Date: {new Date(event.date).toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}