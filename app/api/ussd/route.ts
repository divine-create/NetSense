import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Africa's Talking USSD Webhook Handler
 * Flow: 
 * 1. User dials *123*NET#
 * 2. AT sends POST to this route
 * 3. We respond with text starting with "CON" (continue) or "END" (finish)
 */
export async function POST(req: Request) {
  const formData = await req.formData();
  
  const sessionId = formData.get('sessionId');
  const serviceCode = formData.get('serviceCode');
  const phoneNumber = formData.get('phoneNumber');
  const text = formData.get('text') as string;

  let response = '';

  if (text === '') {
    // Main Menu
    response = `CON Welcome to NetSense. 
Identify your network provider:
1. MTN
2. Airtel
3. Glo
4. 9mobile`;
  } else if (text === '1' || text === '2' || text === '3' || text === '4') {
    const networks: Record<string, string> = { '1': 'MTN', '2': 'Airtel', '3': 'Glo', '4': '9mobile' };
    const network = networks[text];
    
    // In a real USSD app, we'd use the phoneNumber or cell tower ID from the carrier
    // Here we simulate capturing a "bad signal" report
    await supabase.from('signal_readings').insert({
      network: network,
      lat: 6.4585, // Default to a central Lagos point for USSD demo
      lng: 3.6015,
      signal_strength: -105, // High degradation report
      created_at: new Date().toISOString(),
    });

    response = `END Thank you. Your ${network} signal issue has been logged at your current location.`;
  } else {
    response = `END Invalid selection. Please try again.`;
  }

  return new NextResponse(response, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
