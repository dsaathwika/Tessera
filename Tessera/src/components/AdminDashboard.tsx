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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventUpcoming = (eventDate: string) => {
    return new Date(eventDate) > new Date();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="admin-dashboard-header">
          <div className="admin-dashboard-title">
            <h1>Admin Dashboard</h1>
            <p>Manage events and monitor analytics</p>
          </div>
          <div className="admin-actions">
            <button 
              className="create-event-btn" 
              onClick={() => { setEventToEdit(null); setShowEditor(true); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Event
            </button>
          </div>
        </div>

        <div className="analytics-section">
          <h2 className="section-title">Analytics Overview</h2>
          <div className="analytics-grid">
            <div className="stat-card">
              <h4>Total Bookings</h4>
              <div className="stat-value">{totalBookings}</div>
            </div>
            <div className="stat-card">
              <h4>Most Popular Event</h4>
              <div className="stat-value">{mostPopularEvent}</div>
            </div>
            <div className="stat-card">
              <h4>Total Events</h4>
              <div className="stat-value">{events.length}</div>
            </div>
          </div>
        </div>

        {showEditor && (
          <EventEditor
            eventToEdit={eventToEdit}
            onClose={() => setShowEditor(false)}
            onSave={handleSave}
          />
        )}

        <div className="events-section">
          <h2 className="section-title">Manage Events</h2>
          {events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No events created yet</h3>
              <p>Create your first event to get started</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map(event => (
                <div key={event.id} className="admin-event-card">
                  <div className="admin-event-main">
                    <div className="admin-event-header">
                      <h3 className="admin-event-title">{event.name}</h3>
                    </div>
                    
                    {event.description && (
                      <p className="admin-event-description">
                        {event.description.length > 100 
                          ? `${event.description.substring(0, 100)}...` 
                          : event.description}
                      </p>
                    )}
                    
                    <div className="admin-event-details">
                      <div className="admin-event-detail">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span className="detail-text">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      <div className="admin-event-detail">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span className="detail-text">
                          {formatTime(event.date)}
                        </span>
                      </div>
                      <div className="admin-event-detail">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span className="detail-text">
                          {event.capacity} seats
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="admin-event-sidebar">
                    {isEventUpcoming(event.date) ? (
                      <span className="status-badge status-upcoming">Upcoming</span>
                    ) : (
                      <span className="status-badge status-past">Past</span>
                    )}
                    
                    <div className="admin-event-info">
                      <p className="admin-event-text">Event Management</p>
                    </div>
                    
                    <div className="admin-event-actions">
                      <button 
                        onClick={() => handleEdit(event)} 
                        className="edit-btn"
                        title="Edit event"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id!)} 
                        className="delete-btn"
                        title="Delete event"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}