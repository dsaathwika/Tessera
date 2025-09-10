'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// A prop to refresh the event list after a new event is created
type EventFormProps = {
  onNewEvent: () => void;
};

export default function EventForm({ onNewEvent }: EventFormProps) {
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Basic validation
    if (!name || !venue || !time || !capacity) {
      setError("Please fill out all fields.");
      return;
    }

    // Call Supabase to insert the new event
    const { error: insertError } = await supabase
      .from('events')
      .insert({ 
        name, 
        venue, 
        time: new Date(time).toISOString(), // Ensure time is in ISO format
        capacity: parseInt(capacity) 
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      // Clear form and show success message
      setName('');
      setVenue('');
      setTime('');
      setCapacity('');
      setMessage('Event created successfully!');
      // Trigger the refresh of the event list in the parent component
      onNewEvent();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create a New Event</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
        
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Event Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded"/>
        </div>
        <div className="mb-4">
          <label htmlFor="venue" className="block text-gray-700 font-semibold mb-2">Venue</label>
          <input type="text" id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full p-3 border rounded"/>
        </div>
        <div className="mb-4">
          <label htmlFor="time" className="block text-gray-700 font-semibold mb-2">Date and Time</label>
          <input type="datetime-local" id="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-3 border rounded"/>
        </div>
        <div className="mb-4">
          <label htmlFor="capacity" className="block text-gray-700 font-semibold mb-2">Capacity</label>
          <input type="number" id="capacity" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full p-3 border rounded"/>
        </div>
        
        <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 font-bold">Create Event</button>
      </form>
    </div>
  );
}