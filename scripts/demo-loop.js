const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const NETWORKS = ['MTN', 'Airtel', 'Glo', '9mobile'];
const ZONES = [
    { name: 'Ikeja', lat: 6.6018, lng: 3.3515 },
    { name: 'Victoria Island', lat: 6.4281, lng: 3.4215 },
    { name: 'Lekki', lat: 6.4585, lng: 3.6015 },
    { name: 'Surulere', lat: 6.5059, lng: 3.3483 }
];

async function simulateSignal() {
    // Pick a random zone
    const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
    const network = NETWORKS[Math.floor(Math.random() * NETWORKS.length)];
    
    // Random position in zone
    const lat = zone.lat + (Math.random() - 0.5) * 0.02;
    const lng = zone.lng + (Math.random() - 0.5) * 0.02;
    
    // Simulate a "dip" in Ikeja for demo purposes
    const isIkejaIncident = zone.name === 'Ikeja' && Math.random() > 0.7;
    const signal_strength = isIkejaIncident ? -110 : -70 - Math.floor(Math.random() * 20);

    const { error } = await supabase.from('signal_readings').insert({
        lat,
        lng,
        network,
        signal_strength,
        download_mbps: isIkejaIncident ? 0.5 : 15 + Math.random() * 10,
        created_at: new Date().toISOString()
    });

    if (error) console.error('Sim error:', error.message);
    else console.log(`[LIVE] New ${network} signal in ${zone.name}: ${signal_strength}dBm`);
}

console.log('🚀 Starting NetSense Live Demo Loop...');
console.log('Sending fresh signals every 5 seconds. Watch your heatmap!');

// Run every 5 seconds
setInterval(simulateSignal, 5000);

// Also trigger the aggregator every 30 seconds to update the heatmap
setInterval(async () => {
    console.log('🔄 Updating heatmap grid...');
    const { error } = await supabase.rpc('aggregate_signals');
    if (error) console.error('Aggregator error:', error.message);
}, 30000);
