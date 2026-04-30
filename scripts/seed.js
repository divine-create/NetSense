const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-project-url') {
    console.error('Please set valid NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const NETWORKS = ['MTN', 'Airtel', 'Glo', '9mobile'];
const ZONES = [
    { name: 'Ikeja', lat: 6.6018, lng: 3.3515 },
    { name: 'Victoria Island', lat: 6.4281, lng: 3.4215 },
    { name: 'Lekki', lat: 6.4585, lng: 3.6015 },
    { name: 'Surulere', lat: 6.5059, lng: 3.3483 },
    { name: 'Yaba', lat: 6.5095, lng: 3.3711 },
    { name: 'Apapa', lat: 6.4446, lng: 3.3615 }
];

async function seed() {
    console.log('Starting seed process...');
    
    const readings = [];
    
    for (const zone of ZONES) {
        console.log(`Generating data for ${zone.name}...`);
        for (let i = 0; i < 50; i++) {
            // Randomize position slightly within the zone
            const lat = zone.lat + (Math.random() - 0.5) * 0.05;
            const lng = zone.lng + (Math.random() - 0.5) * 0.05;
            
            const network = NETWORKS[Math.floor(Math.random() * NETWORKS.length)];
            
            // Generate realistic signal quality (dBm usually -120 to -40)
            // Higher is better. Let's make some zones "worse"
            const baseSignal = zone.name === 'Lekki' ? -95 : -75;
            const signal_strength = baseSignal + Math.floor((Math.random() - 0.5) * 30);
            
            const download_mbps = Math.max(0.1, (120 + signal_strength) * 0.5 + Math.random() * 10);
            const upload_mbps = download_mbps * 0.3;
            const latency_ms = Math.max(20, 150 + signal_strength * 1.2 + Math.random() * 50);

            readings.push({
                lat,
                lng,
                network,
                signal_strength,
                download_mbps,
                upload_mbps,
                latency_ms,
                created_at: new ColumnDate(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
            });
        }
    }

    const { error } = await supabase.from('signal_readings').insert(readings);
    
    if (error) {
        console.error('Error inserting data:', error);
    } else {
        console.log(`Successfully inserted ${readings.length} readings.`);
    }
}

// Helper to handle date correctly in JS for Postgres
function ColumnDate(timestamp) {
    this.timestamp = timestamp;
}
ColumnDate.prototype.toISOString = function() {
    return new Date(this.timestamp).toISOString();
};

seed();
