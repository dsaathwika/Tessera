'use client';

import Image from 'next/image';

// Define the type for an event object
export type Event = {
  id: number;
  name: string;
  venue: string;
  time: string;
  capacity: number;
  available_seats: number;
  // You can add an image_url to your Supabase table later!
  image_url?: string; 
};

type EventCardProps = {
  event: Event;
  onBook: (eventId: number) => void;
};

export default function EventCard({ event, onBook }: EventCardProps) {
  
  // --- Logic to determine event status ---
  let status: 'Open' | 'Nearly full' | 'Sold out' = 'Open';
  let statusClasses = 'bg-green-100 text-green-800';
  const seatsLeftPercentage = (event.available_seats / event.capacity) * 100;

  if (event.available_seats === 0) {
    status = 'Sold out';
    statusClasses = 'bg-red-100 text-red-800';
  } else if (seatsLeftPercentage <= 10) { // Less than 10% of seats left
    status = 'Nearly full';
    statusClasses = 'bg-yellow-100 text-yellow-800';
  }
  // --- End of status logic ---

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between transition-transform hover:scale-105">
      <div>
        <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden">
          <Image
            src={event.image_url || '/placeholder.png'} // Use a placeholder image for now
            alt={event.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold truncate">{event.name}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClasses}`}>
            {status}
          </span>
        </div>
        <p className="text-gray-600 text-sm">{event.venue}</p>
        <p className="text-gray-500 text-xs mb-4">
          {new Date(event.time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
      <div className="flex justify-between items-center mt-auto">
        {/* We'll add price later if you add it to your table */}
        <p className="text-xl font-semibold text-gray-800">$150</p> 
        <button
          onClick={() => onBook(event.id)}
          disabled={status === 'Sold out'}
          className={`font-bold py-2 px-6 rounded-lg text-white ${
            status === 'Sold out' 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {status === 'Sold out' ? 'Unavailable' : 'Book'}
        </button>
      </div>
    </div>
  );
}