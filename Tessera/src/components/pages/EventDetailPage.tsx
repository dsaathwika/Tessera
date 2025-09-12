/**
 * EventDetailPage.tsx
 *
 * Shows details for a single event, allows booking via Supabase, and displays seat availability.
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './PageStyles.css';

export function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setEvent(data);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  const handleBooking = async () => {
    setMessage('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        setMessage('Error: You must be logged in.');
        return;
    }
    const { data, error } = await supabase.rpc('handle_booking', {
      event_id_to_book: event.id,
      user_id_to_book: session.user.id
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(data);
    }
  };

  if (loading) return <p>Loading event details...</p>;
  if (!event) return <p>Event not found.</p>;

  const availableSeats = event.capacity - event.booked_count;

  return (
    <div className="page-container">
      <h1>{event.name}</h1>
      <p>{event.description}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
      <p><strong>Seats Available:</strong> {availableSeats > 0 ? availableSeats : 'Sold Out'}</p>
      {message && <p>{message}</p>}
      <button onClick={handleBooking} disabled={availableSeats <= 0}>
        Book Now
      </button>
    </div>
  );
}