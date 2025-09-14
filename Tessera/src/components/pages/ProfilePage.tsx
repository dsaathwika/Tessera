import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './ProfilePage.css';

interface Booking {
  id: string;
  created_at: string;
  events: {
    id: string;
    name: string;
    date: string;
    description?: string;
  }[];
}

export function ProfilePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('id, created_at, events(id, name, date, description)');
    
    if (error) {
      setMessage(error.message);
    } else {
      setBookings(data || []);
      setMessage('');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    const { error } = await supabase.rpc('handle_cancellation', {
      booking_id_to_cancel: bookingId
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Booking cancelled successfully!');
      fetchBookings();
      
      setTimeout(() => setMessage(''), 3000);
    }
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
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            <div className="profile-loading-spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-title">
            <h1>My Bookings</h1>
            <p>Manage your event reservations</p>
          </div>
        </div>

        {message && (
          <div className={`profile-message ${message.includes('Error') ? 'error' : ''}`}>
            {message}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="profile-empty">
            <div className="profile-empty-icon">🎫</div>
            <h3>No bookings yet</h3>
            <p>When you book events, they'll appear here</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-main">
                  <div className="booking-card-header">
                    <h3 className="booking-title">{booking.events[0]?.name}</h3>
                  </div>
                  
                  {booking.events[0]?.description && (
                    <p className="booking-description">
                      {booking.events[0].description.length > 120 
                        ? `${booking.events[0].description.substring(0, 120)}...` 
                        : booking.events[0].description}
                    </p>
                  )}
                  
                  <div className="booking-details">
                    <div className="booking-detail">
                      <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span className="detail-text">
                        {formatDate(booking.events[0]?.date)}
                      </span>
                    </div>
                    <div className="booking-detail">
                      <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                      </svg>
                      <span className="detail-text">
                        {formatTime(booking.events[0]?.date)}
                      </span>
                    </div>
                    <div className="booking-detail">
                      <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span className="detail-text">
                        Booked {formatDate(booking.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="booking-card-sidebar">
                  {isEventUpcoming(booking.events[0]?.date) ? (
                    <span className="status-badge status-upcoming">Upcoming</span>
                  ) : (
                    <span className="status-badge status-past">Past</span>
                  )}
                  
                  <div className="booking-info">
                    <p className="booking-text">Your ticket</p>
                  </div>
                  
                  {isEventUpcoming(booking.events[0]?.date) && (
                    <button 
                      onClick={() => handleCancel(booking.id)} 
                      className="cancel-btn"
                      title="Cancel this booking"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}