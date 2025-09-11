'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LogoutButton from "@/app/components/LogoutButton";
import EventCard, { Event } from '@/app/components/EventCard'; // Import the new component and type

export default function UserDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch upcoming events from Supabase ---
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gt('time', new Date().toISOString()) // Only fetch future events
      .order('time', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } else {
      setEvents(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  // --- End of fetching logic ---

  // --- Placeholder for booking logic ---
  const handleBookEvent = (eventId: number) => {
    // This is where we'll add the booking logic in the next step!
    console.log(`Booking event with ID: ${eventId}`);
    alert(`You are about to book event #${eventId}. Functionality coming soon!`);
  };
  // --- End of placeholder ---

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Evently</h1>
          {/* We can add 'My Bookings' link here later */}
          <LogoutButton />
        </nav>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          {/* We will add the Search and Filter component here later */}
          <h2 className="text-3xl font-bold text-gray-800">Upcoming Events</h2>
        </div>

        {loading ? (
          <p>Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.length > 0 ? (
              events.map((event, idx) => (
                event && event.id !== undefined ? (
                  <EventCard key={event.id} event={event} />
                ) : null
              ))
            ) : (
              <p>No upcoming events found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}