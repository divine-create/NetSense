'use client';

import dynamic from 'next/dynamic';
import SignalReportForm from '@/components/SignalReportForm';
import GeminiAssistant from '@/components/GeminiAssistant';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>
});

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="border-b border-slate-200 py-4 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-[1001] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">NetSense</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Lagos Intelligence Layer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Network Map</a>
            <a href="#" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Analytics</a>
            <a href="#" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Infrastructure</a>
          </nav>
          <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-slate-200">
            Operator Portal
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column: Stats & Map */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Active Signals" value="1,248" trend="+12% ↑" color="text-blue-600" bgColor="bg-blue-50" />
            <StatCard title="Network Incidents" value="03" trend="Ikeja Alert" color="text-rose-600" bgColor="bg-rose-50" />
            <StatCard title="Best Coverage" value="MTN" trend="92% Score" color="text-emerald-600" bgColor="bg-emerald-50" />
            <StatCard title="Outage Risk" value="02" trend="Next 60m" color="text-amber-600" bgColor="bg-amber-50" />
          </div>

          {/* Map Container */}
          <section className="bg-white rounded-[2rem] border border-slate-200 p-2 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Live Coverage Intelligence</h2>
                <p className="text-sm text-slate-500 font-medium">Real-time signal aggregation across 500m grid cells</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['All', 'MTN', 'Airtel', 'Glo', '9mobile'].map((net) => (
                  <button 
                    key={net} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${net === 'All' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <MapView />
            </div>
          </section>
        </div>

        {/* Right Column: AI & Actions */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">AI Analyst</h3>
            <GeminiAssistant />
          </section>

          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Field Reporting</h3>
            <SignalReportForm />
          </section>
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl border border-white/10 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Feature Phone Support</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">No data connection? Report network issues instantly via USSD.</p>
              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-center group-hover:border-blue-500/50 transition-colors">
                <span className="text-2xl font-mono font-black tracking-[0.3em] text-blue-400">*123*NET#</span>
              </div>
            </div>
            {/* Decorative background elements */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-600 rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, trend, color, bgColor }: { title: string; value: string; trend: string; color: string; bgColor: string }) {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{title}</p>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${bgColor} ${color}`}>{trend}</span>
      </div>
      <p className={`text-3xl font-black mt-3 text-slate-900 tracking-tight`}>{value}</p>
      <div className="w-full h-1 bg-slate-50 mt-4 rounded-full overflow-hidden">
        <div className={`h-full ${bgColor.replace('bg-', 'bg-').split(' ')[0].replace('50', '500')} w-2/3 opacity-20`}></div>
      </div>
    </div>
  );
}
