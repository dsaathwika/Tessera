'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Adjust path if needed

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition duration-300"
    >
      Logout
    </button>
  );
}