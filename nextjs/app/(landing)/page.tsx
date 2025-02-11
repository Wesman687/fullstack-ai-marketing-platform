"use client"; // ✅ Ensure it's a client component
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/projects'); // ✅ Redirect after mount
  }, [router]); // ✅ Runs only once after mounting

  return <div>Redirecting...</div>; // Optional loading message
}
