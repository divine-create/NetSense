'use client';

import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { supabase } from '@/lib/supabase';

interface GridCell {
  cell_id: string;
  composite_score: number;
  predicted_risk: number;
  lat: number;
  lng: number;
  network: string;
}

export default function MapView() {
  const [cells, setCells] = useState<GridCell[]>([]);
  const lagosCenter: [number, number] = [6.5244, 3.3792];

  useEffect(() => {
    // Fix Leaflet icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Initial Fetch
    fetchCells();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('grid_cells_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grid_cells' }, payload => {
        fetchCells();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchCells = async () => {
    // In a real app, we'd use a PostGIS RPC to get lat/lng from the bounds polygon
    // For the demo, we'll select everything. Note: in the actual DB these are polygons, 
    // so we'd need to extract the centroid.
    const { data, error } = await supabase.from('grid_cells').select('*');
    if (data) {
      // Mocking lat/lng extraction for the demo visualization
      const processed = data.map(d => ({
        ...d,
        lat: 6.5244 + (Math.random() - 0.5) * 0.1, // Fallback for demo
        lng: 3.3792 + (Math.random() - 0.5) * 0.1,
      }));
      setCells(processed);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0.8) return '#22c55e'; // Vibrant Green
    if (score > 0.6) return '#84cc16'; // Lime
    if (score > 0.4) return '#eab308'; // Amber
    if (score > 0.2) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-2xl border border-gray-200 relative group">
      <MapContainer 
        center={lagosCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Using a cleaner, lighter base map
        />
        
        {cells.map((cell) => (
          <div key={cell.cell_id}>
            {/* The core "Heat" bubble - Reduced size and opacity */}
            <CircleMarker
              center={[cell.lat, cell.lng]}
              radius={12} // Reduced from 18 to 12
              pathOptions={{
                fillColor: getScoreColor(cell.composite_score),
                fillOpacity: 0.5, // Reduced from 0.8 to 0.5 for transparency
                color: 'white',
                weight: 1,
                className: 'drop-shadow-sm'
              }}
            >
              <Popup>
                <div className="text-sm p-1">
                  <p className="font-black text-gray-900 border-b pb-1 mb-2">{cell.network} Intelligence</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-gray-500 font-bold uppercase text-[10px]">Quality</span>
                      <span className="font-mono font-bold text-blue-600">{(cell.composite_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-gray-500 font-bold uppercase text-[10px]">Risk</span>
                      <span className={`font-mono font-bold ${cell.predicted_risk > 0.6 ? 'text-red-500' : 'text-gray-400'}`}>
                        {(cell.predicted_risk * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>

            {/* Subtle Outage Risk Ring */}
            {cell.predicted_risk > 0.6 && (
              <Circle
                center={[cell.lat, cell.lng]}
                radius={400} // Reduced from 800 to 400
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.08, // Reduced from 0.15 to 0.08
                  weight: 1.5,
                  dashArray: '5, 10',
                  className: 'animate-pulse'
                }}
              />
            )}
          </div>
        ))}
      </MapContainer>
      
      {/* Enhanced Floating Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-xl pointer-events-none">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Network Quality</h4>
        <div className="space-y-3">
          <LegendItem color="bg-green-500" label="Excellent" />
          <LegendItem color="bg-yellow-500" label="Fair / Congested" />
          <LegendItem color="bg-orange-500" label="Poor" />
          <LegendItem color="bg-red-500" label="Critical" />
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-dashed border-red-500 animate-pulse"></div>
              <span className="text-[11px] font-bold text-gray-700">Predictive Outage Risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color} shadow-sm`}></div>
      <span className="text-[11px] font-bold text-gray-700">{label}</span>
    </div>
  );
}
