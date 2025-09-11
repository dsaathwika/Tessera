'use client';

import Image from 'next/image';
import Link from 'next/link'; // Import the Link component

// Define the type for an event object
export type Event = {
  id: number;
  name: string;
  venue: string;
  time: string;
  capacity: number;
  available_seats: number;
  image_url?: string; 
};

// The onBook prop is no longer needed here
type EventCardProps = {
  event: Event;
};

export default function EventCard({ event }: EventCardProps) {
  
  let status: 'Open' | 'Nearly full' | 'Sold out' = 'Open';
  let statusClasses = 'bg-green-100 text-green-800';
  const seatsLeftPercentage = (event.available_seats / event.capacity) * 100;

  if (event.available_seats === 0) {
    status = 'Sold out';
    statusClasses = 'bg-red-100 text-red-800';
  } else if (seatsLeftPercentage <= 10) {
    status = 'Nearly full';
    statusClasses = 'bg-yellow-100 text-yellow-800';
  }

  return (
    // Wrap the entire card content in a Link component
    <Link href={`/events/${event.id}`} className="block"> 
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between h-full transition-transform hover:scale-105 hover:shadow-lg">
        <div>
          <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden">
            <Image
              src={event.image_url || '/placeholder.png'}
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
          <p className="text-xl font-semibold text-gray-800">$150</p>
          {/* We display the status in the button area for clarity */}
          <div
            className={`font-bold py-2 px-6 rounded-lg text-white text-sm ${
              status === 'Sold out' 
              ? 'bg-gray-400' 
              : 'bg-blue-500'
            }`}
          >
            {status === 'Sold out' ? 'Unavailable' : 'View Details'}
          </div>
        </div>
      </div>
    </Link>
  );
}