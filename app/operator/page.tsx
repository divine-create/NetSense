'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function OperatorPortal() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [stats, setStats] = useState({ active: 0, critical: 0, predicted: 0 });

  useEffect(() => {
    fetchOperatorData();
    const subscription = supabase
      .channel('operator_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grid_cells' }, () => fetchOperatorData())
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, []);

  const fetchOperatorData = async () => {
    const { data: cells } = await supabase.from('grid_cells').select('*');
    if (cells) {
      const critical = cells.filter(c => c.composite_score < 0.3).length;
      const predicted = cells.filter(c => c.predicted_risk > 0.6).length;
      setStats({ active: cells.length, critical, predicted });
    }
    const { data: inc } = await supabase.from('incidents').select('*').is('resolved_at', null);
    if (inc) setIncidents(inc);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      {/* Top Bar */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">NOC Command Center</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">System Live // Lagos Cluster 01</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all border border-slate-700">Export Report</button>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20">Trigger Alert</button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left: Metrics & Map */}
        <div className="xl:col-span-3 space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <MetricBox title="Grid Cells Monitored" value={stats.active} sub="Active 500m cells" color="text-blue-400" />
            <MetricBox title="Critical Failures" value={stats.critical} sub="Immediate response req." color="text-rose-500" />
            <MetricBox title="Predictive Outage Risk" value={stats.predicted} sub="Next 60-90 minutes" color="text-amber-500" />
          </div>

          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-2 shadow-2xl relative">
             <div className="absolute top-6 left-6 z-[1000] bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-2xl">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Live Topology</h3>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                   <span className="text-[10px] font-bold text-slate-300 italic">98.2% Accuracy Rating</span>
                </div>
             </div>
             <MapView />
          </div>
        </div>

        {/* Right: Incident Feed & AI Summary */}
        <div className="space-y-8">
          <section className="bg-slate-900 rounded-[2rem] border border-slate-800 p-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Active Incidents</h3>
            <div className="space-y-4">
              {incidents.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                  <p className="text-sm text-slate-600 font-bold italic">No active incidents detected</p>
                </div>
              ) : (
                incidents.map(inc => (
                  <div key={inc.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">{inc.severity}</span>
                      <span className="text-[10px] text-slate-500">{new Date(inc.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-bold text-white mb-1">{inc.zone}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{inc.description}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xs font-black text-blue-200 uppercase tracking-widest mb-4">AI Infrastructure Summary</h3>
              <p className="text-sm font-medium leading-relaxed italic">
                "Multiple users reporting packet loss in Ikeja. ML model predicts a 72% chance of localized outage by 18:30 due to backhaul congestion. Recommend scaling cloud capacity for MTN cluster."
              </p>
              <button className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/10">
                Generate Full NOC Report
              </button>
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ title, value, sub, color }: { title: string, value: number, sub: string, color: string }) {
  return (
    <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 hover:border-slate-700 transition-colors group">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{title}</p>
      <p className={`text-4xl font-black ${color} group-hover:scale-110 transition-transform origin-left`}>{value < 10 ? `0${value}` : value}</p>
      <p className="text-[10px] text-slate-600 font-bold mt-2 italic">{sub}</p>
    </div>
  );
}
