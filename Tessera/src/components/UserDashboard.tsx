/**
 * UserDashboard.tsx
 *
 * Displays a list of upcoming events for users, fetched from Supabase.
 * Allows navigation to event detail pages.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Event } from './EventEditor';
import './Dashboard.css';

export function UserDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
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

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Upcoming Events</h1>
            <p>Discover and book amazing events</p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No events available</h3>
            <p>Check back later for exciting events!</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <Link to={`/event/${event.id}`} key={event.id} className="event-card-link">
                <div className="event-card">
                  <div className="event-card-main">
                    <div className="event-card-header">
                      <h3 className="event-title">{event.name}</h3>
                    </div>
                    
                    {event.description && (
                      <p className="event-description">
                        {event.description.length > 120 
                          ? `${event.description.substring(0, 120)}...` 
                          : event.description}
                      </p>
                    )}
                    
                    <div className="event-details">
                      <div className="event-detail">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span className="detail-text">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="event-detail">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span className="detail-text">
                          {new Date(event.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div className="event-detail">
                        <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span className="detail-text">
                          {event.booked_count || 0} / {event.capacity}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="event-card-sidebar">
                    {new Date(event.date) > new Date() ? (
                      <span className="status-badge status-upcoming">Upcoming</span>
                    ) : (
                      <span className="status-badge status-past">Past</span>
                    )}
                    
                    <div className="capacity-info">
                      <p className="capacity-text">Filled</p>
                      <div className="capacity-bar">
                        <div 
                          className="capacity-fill" 
                          style={{
                            width: `${Math.min((event.booked_count || 0) / event.capacity * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <span className="view-details">View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}