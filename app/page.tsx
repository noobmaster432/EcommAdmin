'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      // If authenticated, redirect to dashboard
      router.push('/admin/dashboard');
    } else {
      // Otherwise redirect to login
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      Redirecting...
    </div>
  );
}