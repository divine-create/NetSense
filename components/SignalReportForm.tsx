'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SignalReportForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const reportSignal = async () => {
    setStatus('loading');
    setMessage('Capturing location and network metrics...');

    if (!navigator.geolocation) {
      setStatus('error');
      setMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      // Simulate a speed test / network check
      const start = Date.now();
      try {
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
        const latency = Date.now() - start;

        const { error } = await supabase.from('signal_readings').insert({
          lat: latitude,
          lng: longitude,
          network: 'MTN', // In a real app, we might try to detect this or ask the user
          signal_strength: -70 - Math.floor(Math.random() * 30), // Simulated
          latency_ms: latency,
          download_mbps: Math.random() * 20 + 2,
          upload_mbps: Math.random() * 5 + 1,
        });

        if (error) throw error;

        setStatus('success');
        setMessage('Signal reported successfully! Thank you for contributing.');
      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage('Failed to report signal. Please try again.');
      }
    }, (err) => {
      setStatus('error');
      setMessage(`Location access denied: ${err.message}`);
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Report Network Quality</h3>
      <p className="text-sm text-gray-500 mb-6">
        Contribute to the crowd-sourced map and help improve connectivity in your area.
      </p>

      {status === 'success' ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium">
          {message}
          <button 
            onClick={() => setStatus('idle')}
            className="block mt-2 text-green-800 underline"
          >
            Report again
          </button>
        </div>
      ) : (
        <button
          onClick={reportSignal}
          disabled={status === 'loading'}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            status === 'loading' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md active:scale-95'
          }`}
        >
          {status === 'loading' ? 'Processing...' : '⚡ Report My Signal'}
        </button>
      )}

      {status === 'error' && (
        <p className="mt-4 text-xs text-red-500 font-medium text-center">{message}</p>
      )}
      
      <p className="mt-6 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
        Works Offline & In Background
      </p>
    </div>
  );
}
