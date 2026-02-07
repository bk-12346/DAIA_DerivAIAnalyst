
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Map as MapIcon, 
  TrendingDown, 
  Layers, 
  Search, 
  Bell, 
  User, 
  Activity,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { INITIAL_DASHBOARD_DATA } from './constants';
import StatCard from './components/StatCard';
import { RegionChart, InstrumentAnalysis } from './components/Charts';
import DAIAChat from './components/DAIAChat';

const App: React.FC = () => {
  const [data] = useState(INITIAL_DASHBOARD_DATA);

  return (
    <div className="min-h-screen flex bg-[#0f1115] text-gray-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-[#0f1115] flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white">D</div>
            <h1 className="text-xl font-bold text-white tracking-tight">DERIV OBS</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-gray-600 px-3 py-2 tracking-widest">Main</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-red-600/10 text-red-500 rounded-lg font-medium transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors group">
            <Activity className="w-4 h-4 group-hover:text-white" /> Real-time Metrics
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors group">
            <AlertTriangle className="w-4 h-4 text-orange-500" /> Anomalies <span className="ml-auto bg-orange-500/20 text-orange-500 text-[10px] px-1.5 py-0.5 rounded">1</span>
          </a>

          <div className="text-[10px] uppercase font-bold text-gray-600 px-3 py-2 mt-6 tracking-widest">Intelligence</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors group">
            <Layers className="w-4 h-4 group-hover:text-white" /> Platform Signals
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors group">
            <MapIcon className="w-4 h-4 group-hover:text-white" /> Regional Analysis
          </a>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800/50 rounded-xl p-3">
            <div className="text-xs font-bold text-gray-400 mb-1">System Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[11px] font-medium text-red-400">Critical Anomaly Detected</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-gray-800 bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Global</span>
            <ChevronRight className="w-3 h-3 text-gray-700" />
            <span className="text-white font-medium">Enterprise Intelligence Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search metrics..." 
                className="bg-gray-900 border border-gray-800 rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-gray-700" 
              />
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-gray-700"></div>
          </div>
        </header>

        <div className="p-8">
          {/* Top Banner Alert */}
          <div className="mb-8 bg-red-900/10 border border-red-900/40 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center text-red-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-red-500 font-bold">Anomaly Alert: North America Regional Drop</h4>
              <p className="text-sm text-red-400/80">
                Significant DAU decline detected in NA (-41.1%). Investigation path mapped to Trader platform Synthetics instruments.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-red-400/60 uppercase font-bold tracking-widest mb-1">Statistical Sig.</div>
              <div className="text-2xl font-mono font-bold text-red-500">Z: {data.zScore}</div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard data={data.globalDau} />
            <StatCard data={data.tradingVolume} />
            <StatCard data={data.netPnl} />
            <StatCard data={data.exposureImbalance} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Regional Performance */}
            <div className="lg:col-span-2 bg-[#1a1d23] border border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Regional DAU Comparison</h3>
                  <p className="text-xs text-gray-500 mt-1">Relative performance vs rolling baseline</p>
                </div>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">HEALTHY: 2</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">ANOMALY: 1</span>
                </div>
              </div>
              <RegionChart data={data.regions} />
            </div>

            {/* Platform & Instrument Signals */}
            <div className="bg-[#1a1d23] border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Instrument Analysis</h3>
              <InstrumentAnalysis data={data.instruments} />
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Platform Health</h4>
                <div className="space-y-4">
                  {data.platforms.map(p => (
                    <div key={p.platform} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">{p.platform}</div>
                        <div className="text-[10px] text-gray-500">Volume: {p.volumeChange > 0 ? '+' : ''}{p.volumeChange}%</div>
                      </div>
                      <div className={`text-sm font-mono font-bold ${p.dauChange < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {p.dauChange > 0 ? '+' : ''}{p.dauChange}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Investigation Path Visualization */}
          <div className="mt-8 bg-[#1a1d23] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI-Driven Investigation Path</h3>
                <p className="text-xs text-gray-500">Propagated signal tracing for NA anomaly</p>
              </div>
            </div>
            
            <div className="flex items-center justify-around py-8 bg-[#16181d] rounded-xl border border-gray-800">
              <div className="text-center group">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                  <MapIcon className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-sm font-bold text-white">North America</div>
                <div className="text-[10px] text-red-400 font-mono mt-1">-41.1% DAU</div>
              </div>
              <ChevronRight className="w-8 h-8 text-gray-700" />
              <div className="text-center group">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <Layers className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-sm font-bold text-white">Trader Platform</div>
                <div className="text-[10px] text-orange-400 font-mono mt-1">-10.57% DAU</div>
              </div>
              <ChevronRight className="w-8 h-8 text-gray-700" />
              <div className="text-center group">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-8 h-8 text-amber-500" />
                </div>
                <div className="text-sm font-bold text-white">Synthetics</div>
                <div className="text-[10px] text-amber-400 font-mono mt-1">-11.84% DAU</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat Agent */}
      <DAIAChat />
    </div>
  );
};

export default App;
