import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './EventDetailPage.css';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  capacity: number;
  booked_count: number;
  created_at: string;
}

export function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [hasBooking, setHasBooking] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    const fetchEventAndBooking = async () => {
      if (!id) return;
      setLoading(true);
      
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (eventError) {
        setMessage(eventError.message);
        setMessageType('error');
        setLoading(false);
        return;
      }
      
      setEvent(eventData);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('id')
          .eq('event_id', id)
          .eq('user_id', session.user.id)
          .single();
        
        if (bookingData) {
          setHasBooking(true);
          setBookingId(bookingData.id);
        } else {
          const { data: waitlistData } = await supabase
            .from('waitlist')
            .select('position')
            .eq('event_id', id)
            .eq('user_id', session.user.id)
            .single();
          
          if (waitlistData) {
            setIsOnWaitlist(true);
            setWaitlistPosition(waitlistData.position);
          }
        }
      }
      
      setLoading(false);
    };
    
    fetchEventAndBooking();
  }, [id]);

  const handleBooking = async () => {
    if (!event) return;
    
    if (isRateLimited) {
      setMessage('Please wait before trying again.');
      setMessageType('error');
      return;
    }
    
    setMessage('');
    setIsRateLimited(true);
    
    setTimeout(() => setIsRateLimited(false), 2000);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setMessage('You must be logged in to book events.');
      setMessageType('error');
      return;
    }
    const { data, error } = await supabase.rpc('handle_booking_with_waitlist', {
      event_id_to_book: event.id,
      user_id_to_book: session.user.id
    });

    if (error) {
      setMessage(error.message);
      setMessageType('error');
    } else {
      const response = data || 'Booking successful!';
      setMessage(response);
      setMessageType('success');
      
      if (response.includes('WAITLIST')) {
        setIsOnWaitlist(true);
        const position = response.match(/position (\d+)/)?.[1];
        setWaitlistPosition(position ? parseInt(position) : null);
      } else {
        setHasBooking(true);
        
        const { data: newBooking } = await supabase
          .from('bookings')
          .select('id')
          .eq('event_id', id)
          .eq('user_id', session.user.id)
          .single();
        
        if (newBooking) {
          setBookingId(newBooking.id);
        }
      }
      
      const { data: updatedEvent } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (updatedEvent) {
        setEvent(updatedEvent);
      }

      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingId) return;
    
    const { data, error } = await supabase.rpc('handle_cancellation_with_waitlist', {
      booking_id_to_cancel: bookingId
    });
    
    if (error) {
      setMessage(error.message);
      setMessageType('error');
    } else {
      setMessage(data || 'Booking cancelled successfully!');
      setMessageType('success');
      setHasBooking(false);
      setBookingId(null);
      
      const { data: updatedEvent } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (updatedEvent) {
        setEvent(updatedEvent);
      }

      setTimeout(() => setMessage(''), 3000);
    }
    
    setShowCancelModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
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
      <div className="event-detail-page">
        <div className="event-detail-container">
          <div className="event-loading">
            <div className="event-loading-spinner"></div>
            <p>Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail-page">
        <div className="event-detail-container">
          <div className="event-not-found">
            <div className="event-not-found-icon">🎫</div>
            <h2>Event not found</h2>
            <p>The event you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const availableSeats = event.capacity - event.booked_count;
  const bookingPercentage = event.capacity > 0 ? (event.booked_count / event.capacity) * 100 : 0;
  const isSoldOut = availableSeats <= 0;
  const isPastEvent = !isEventUpcoming(event.date);

  return (
    <div className="event-detail-page">
      <div className="event-detail-container">
        <div className="event-content">
          <div className="event-hero">
            <div className="hero-content">
              <div className="hero-badge">
                {isPastEvent ? (
                  <span className="status-badge past">Event Ended</span>
                ) : isSoldOut ? (
                  <span className="status-badge sold-out">Sold Out</span>
                ) : (
                  <span className="status-badge available">Tickets Available</span>
                )}
              </div>
              
              <h1 className="hero-title">{event.name}</h1>
              
              <div className="hero-details">
                <div className="detail-item">
                  <div className="detail-icon">📅</div>
                  <span className="detail-text">{formatDate(event.date)}</span>
                </div>
                <div className="detail-separator">•</div>
                <div className="detail-item">
                  <div className="detail-icon">⏰</div>
                  <span className="detail-text">{formatTime(event.date)}</span>
                </div>
                <div className="detail-separator">•</div>
                <div className="detail-item">
                  <div className="detail-icon">👥</div>
                  <span className="detail-text">{event.capacity} seats</span>
                </div>
              </div>

              <div className="hero-availability">
                <div className="availability-info">
                  <span className={`seats-remaining ${isSoldOut ? 'sold-out' : ''}`}>
                    {isSoldOut ? 'No seats remaining' : `${availableSeats} ${availableSeats === 1 ? 'seat' : 'seats'} remaining`}
                  </span>
                  <div className="availability-bar">
                    <div 
                      className="availability-fill"
                      style={{ width: `${bookingPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="event-description">
              <h3>About this event</h3>
              <p>{event.description}</p>
            </div>
          )}

          <div className="event-booking-section">
            <div className="booking-header">
              <h3>Get your ticket</h3>
              <p className="booking-subtext">Reserve your spot for this event</p>
            </div>

            <div className="booking-details">
              <div className="booking-price">
                <p className="booking-price-label">Ticket Price</p>
                <p className="booking-price-value">Free</p>
              </div>

              <div className="event-availability">
                <p className="availability-label">Seats Available</p>
                <p className={`availability-value ${isSoldOut ? 'sold-out' : 'available'}`}>
                  {isSoldOut ? 'Sold Out' : `${availableSeats} remaining`}
                </p>
                <div className="availability-progress">
                  <div 
                    className="availability-progress-bar"
                    style={{ width: `${bookingPercentage}%` }}
                  />
                </div>
              </div>

              <div className="booking-actions">
                {hasBooking ? (
                  <>
                    <div className="booking-status booked">
                      <span>✓</span>
                      <span>You're booked!</span>
                    </div>
                    <button 
                      onClick={() => setShowCancelModal(true)}
                      className="booking-btn cancel"
                    >
                      Cancel Booking
                    </button>
                  </>
                ) : isOnWaitlist ? (
                  <>
                    <div className="booking-status waitlist">
                      <span>🕒</span>
                      <span>You're on the waitlist</span>
                    </div>
                    <div className="waitlist-position">
                      Position #{waitlistPosition}
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={handleBooking}
                    disabled={isPastEvent}
                    className={`booking-btn ${isPastEvent ? '' : 'primary'}`}
                  >
                    {isPastEvent ? 'Event Ended' : isSoldOut ? 'Join Waitlist' : 'Book Now'}
                  </button>
                )}

                {message && (
                  <div className={`event-message ${messageType}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-text">
              <h4>Cancel booking?</h4>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-buttons">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="modal-btn-cancel"
              >
                Keep
              </button>
              <button 
                onClick={handleCancelBooking}
                className="modal-btn-confirm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}