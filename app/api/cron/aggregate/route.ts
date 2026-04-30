import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * CRON API: Trigger signal aggregation
 * This endpoint should be called periodically (e.g., every minute)
 * to update the grid_cells table based on recent signal_readings.
 */
export async function GET() {
  try {
    // In a real production environment, you would verify a secret header 
    // to ensure only authorized cron jobs can trigger this.
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const { error } = await supabase.rpc('aggregate_signals');

    if (error) {
      console.error('Aggregation Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Signal aggregation completed successfully.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Internal Server Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
