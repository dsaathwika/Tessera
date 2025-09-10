'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LogoutButton from "@/app/components/LogoutButton";
import EventForm from '@/app/components/EventForm';

// Define a type for our event object for better TypeScript support
type Event = {
  id: number;
  name: string;
  venue: string;
  time: string;
  capacity: number;
  available_seats: number;
};

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('time', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data);
    }
    setLoading(false);
  }, []);

  // Use useEffect to fetch events when the component mounts
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Function to handle event deletion
  const handleDelete = async (eventId: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        alert('Error deleting event: ' + error.message);
      } else {
        // Refresh the event list after deletion
        fetchEvents();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </header>
      
      <main className="space-y-12">
        {/* Section for Creating Events */}
        <section>
          <EventForm onNewEvent={fetchEvents} />
        </section>

        <hr/>

        {/* Section for Listing Events */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Manage Events</h2>
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <ul className="space-y-4">
                {events.length > 0 ? events.map((event) => (
                  <li key={event.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="text-xl font-semibold">{event.name}</h3>
                      <p className="text-gray-600">{event.venue}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(event.time).toLocaleString()} | 
                        <span className="font-medium"> Seats: {event.available_seats} / {event.capacity}</span>
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                )) : (
                  <p>No events found. Create one above to get started!</p>
                )}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}