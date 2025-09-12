/**
 * ProfilePage.tsx
 *
 * Displays the user's booking history and allows cancellation of bookings using Supabase.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './PageStyles.css';

export function ProfilePage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('bookings').select('id, created_at, events(*)');
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    const { data, error } = await supabase.rpc('handle_cancellation', {
      booking_id_to_cancel: bookingId
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(data);
      fetchBookings();
    }
  };

  if (loading) return <p>Loading your bookings...</p>;

  return (
    <div className="page-container">
      <h1>My Booking History</h1>
      {message && <p>{message}</p>}
      <div className="event-list">
        {bookings.length > 0 ? bookings.map(booking => (
          <div key={booking.id} className="event-item">
            <div>
              <h3>{booking.events.name}</h3>
              <p>Booked on: {new Date(booking.created_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => handleCancel(booking.id)} className="delete-btn">
              Cancel Booking
            </button>
          </div>
        )) : <p>You have no active bookings.</p>}
      </div>
    </div>
  );
}