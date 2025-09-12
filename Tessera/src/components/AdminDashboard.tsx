/**
 * AdminDashboard.tsx
 *
 * Provides an admin interface for managing events and viewing booking analytics.
 * Allows event creation, editing, deletion, and displays booking statistics from Supabase.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { EventEditor, type Event } from './EventEditor';
import './Dashboard.css';

interface Booking {
  event_id: string;
  events: { name: string }[];
}

export function AdminDashboard() {
  const [showEditor, setShowEditor] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalBookings, setTotalBookings] = useState(0);
  const [mostPopularEvent, setMostPopularEvent] = useState('N/A');

  async function fetchEventsAndAnalytics() {
    setLoading(true);
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    } else {
      setEvents(eventsData || []);
    }

    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('event_id, events ( name )');

    if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
    } else if (bookingsData) {
        setTotalBookings(bookingsData.length);

        if (bookingsData.length > 0) {
            const bookingCounts = bookingsData.reduce((acc: Record<string, number>, booking: Booking) => {
                const eventName = booking.events && booking.events[0]?.name;
                if (eventName) {
                  acc[eventName] = (acc[eventName] || 0) + 1;
                }
                return acc;
            }, {});

            const eventNames = Object.keys(bookingCounts);
            if (eventNames.length > 0) {
              const popularEvent = eventNames.reduce((a, b) => bookingCounts[a] > bookingCounts[b] ? a : b);
              setMostPopularEvent(popularEvent);
            } else {
              setMostPopularEvent('N/A');
            }
        }
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchEventsAndAnalytics();
  }, []);

  const handleEdit = (event: Event) => {
    setEventToEdit(event);
    setShowEditor(true);
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await supabase.from('events').delete().eq('id', eventId);
      fetchEventsAndAnalytics(); // Refresh list
    }
  };

  const handleSave = () => {
    fetchEventsAndAnalytics(); // Refresh list after saving
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard ⚙️</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <h2 className="section-title">Booking Analytics</h2>
      {loading ? <p>Loading analytics...</p> : (
        <div className="analytics-grid">
          <div className="stat-card">
            <h4>Total Bookings</h4>
            <p>{totalBookings}</p>
          </div>
          <div className="stat-card">
            <h4>Most Popular Event</h4>
            <p>{mostPopularEvent}</p>
          </div>
        </div>
      )}

      <h2 className="section-title">Manage Events</h2>
      <button className="create-btn" onClick={() => { setEventToEdit(null); setShowEditor(true); }}>
        Create New Event
      </button>

      {showEditor && (
        <EventEditor
          eventToEdit={eventToEdit}
          onClose={() => setShowEditor(false)}
          onSave={handleSave}
        />
      )}

      <div className="event-list">
        {loading ? <p>Loading events...</p> : events.map(event => (
          <div key={event.id} className="event-item">
            <div>
              <h3>{event.name}</h3>
              <p>{new Date(event.date).toLocaleString()} - Capacity: {event.capacity}</p>
            </div>
            <div className="event-actions">
              <button onClick={() => handleEdit(event)} className="edit-btn">Edit</button>
              <button onClick={() => handleDelete(event.id!)} className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}