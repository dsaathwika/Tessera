import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { EventEditor, type Event } from './EventEditor';
import './Dashboard.css';

interface Booking {
  event_id: string;
  events: { name: string };
}

export function AdminDashboard() {
  const [showEditor, setShowEditor] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Basic Analytics State
  const [totalBookings, setTotalBookings] = useState(0);
  const [mostPopularEvent, setMostPopularEvent] = useState('N/A');

  // Advanced Analytics State
  const [advancedAnalytics, setAdvancedAnalytics] = useState<any[]>([]);

  async function fetchEventsAndAnalytics() {
    setLoading(true);

    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (eventsError) console.error('Error fetching events:', eventsError);
    else setEvents(eventsData || []);

    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('event_id, events ( name )');

    if (bookingsError) console.error('Error fetching bookings:', bookingsError);
    else if (bookingsData) {
      setTotalBookings(bookingsData.length);
      if (bookingsData.length > 0) {
        const bookingCounts = bookingsData.reduce((acc: Record<string, number>, booking: Booking) => {
          acc[booking.events.name] = (acc[booking.events.name] || 0) + 1;
          return acc;
        }, {});
        const popularEvent = Object.keys(bookingCounts).reduce((a, b) => bookingCounts[a] > bookingCounts[b] ? a : b);
        setMostPopularEvent(popularEvent);
      }
    }

    const { data: advancedData, error: advancedError } = await supabase
      .from('event_analytics')
      .select('*')
      .order('utilization_percentage', { ascending: false });
      
    if (advancedError) console.error('Error fetching advanced analytics:', advancedError);
    else setAdvancedAnalytics(advancedData || []);

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
      fetchEventsAndAnalytics();
    }
  };

  const handleSave = () => {
    fetchEventsAndAnalytics();
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard ⚙️</h1>
        {/* The logout button is now in the main nav */}
      </div>

      <h2 className="section-title">Booking Analytics</h2>
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

      <h2 className="section-title">Event Utilization</h2>
      <div className="analytics-list">
        {advancedAnalytics.map(analytic => (
          <div key={analytic.id} className="analytic-item">
            <strong>{analytic.name}</strong>
            <span>{analytic.booked_count} / {analytic.capacity} Booked</span>
            <span>({analytic.utilization_percentage.toFixed(2)}%)</span>
          </div>
        ))}
      </div>

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
              <p>{new Date(event.date).toLocaleString()} - Booked: {event.booked_count}/{event.capacity}</p>
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