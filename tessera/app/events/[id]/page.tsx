'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Event } from '@/app/components/EventCard'; // Reuse the Event type
import Image from 'next/image';
import Link from 'next/link';

// The page component receives `params`, which contains the dynamic parts of the URL.
export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = params;

  // --- Logic to fetch a single event from Supabase ---
  const fetchEvent = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id) // Filter to get only the event with the matching ID
      .single();    // We expect only one result

    if (error) {
      console.error('Error fetching event:', error);
      setError('Could not find the requested event.');
    } else {
      setEvent(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);
  // --- End of fetching logic ---

  const handleBook = () => {
    // We will implement the real booking logic here in the next step!
    alert(`Booking feature for ${event?.name} is coming soon!`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading event details...</div>;
  }

  if (error || !event) {
    return <div className="min-h-screen flex items-center justify-center">{error || 'Event not found.'}</div>;
  }

  const isSoldOut = event.available_seats === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="py-4 px-8">
        <Link href="/dashboard/user" className="text-blue-500 hover:underline">&larr; Back to all events</Link>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={event.image_url || '/placeholder.png'}
              alt={event.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="p-6 md:p-8 md:grid md:grid-cols-3 md:gap-8">
            {/* Left side: Event Info */}
            <div className="md:col-span-2 mb-6 md:mb-0">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{event.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{new Date(event.time).toLocaleString()}</p>
              <h2 className="text-xl font-bold mb-2">Venue</h2>
              <p className="text-gray-700 mb-6">{event.venue}</p>
              <h2 className="text-xl font-bold mb-2">About this event</h2>
              <p className="text-gray-700 leading-relaxed">
                {/* We can add a 'description' column to the events table later */}
                This is where a detailed description of the event would go. You can easily add a 'description' field to your Supabase table to store more information about each event.
              </p>
            </div>
            {/* Right side: Booking Card */}
            <div className="md:col-span-1">
              <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
                <h3 className="text-2xl font-bold text-center mb-4">Book Your Ticket</h3>
                <div className="flex justify-between items-center text-lg mb-4">
                  <span>Price:</span>
                  <span className="font-bold">$150</span>
                </div>
                <div className="flex justify-between items-center text-lg mb-6">
                  <span>Seats Left:</span>
                  <span className="font-bold">{event.available_seats} / {event.capacity}</span>
                </div>
                <button
                  onClick={handleBook}
                  disabled={isSoldOut}
                  className={`w-full font-bold py-3 px-6 rounded-lg text-white text-lg ${
                    isSoldOut
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isSoldOut ? 'Sold Out' : 'Book Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}