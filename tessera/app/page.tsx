'use client';

import { useState } from 'react';
import AuthModal from './components/AuthModal';

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Tessera</h1>
        <p className="text-lg text-gray-600 mb-8">Your one-stop platform for event ticketing and management.</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-600 transition duration-300"
        >
          Get Started
        </button>
      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </main>
  );
}