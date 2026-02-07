
import React, { useState, useRef } from 'react';
import { 
  Map as MapIcon, 
  TrendingDown, 
  Layers, 
  Search, 
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Upload,
  FileText,
  Play,
  Activity,
  Loader2,
  TrendingUp,
  ClipboardList
} from 'lucide-react';
import Papa from 'papaparse';
import ReactMarkdown from 'react-markdown';
import { INITIAL_DASHBOARD_DATA } from './constants';
import StatCard from './components/StatCard';
import { RegionChart, InstrumentAnalysis, TrendChart, TrendDataPoint } from './components/Charts';
import DAIAChat from './components/DAIAChat';
import { geminiService } from './services/geminiService';
import { DashboardState } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<DashboardState>(INITIAL_DASHBOARD_DATA);
  const [fileInfo, setFileInfo] = useState<{ name: string; rows: number } | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mode, setMode] = useState<'BASELINE VIEW' | 'LIVE ANALYSIS'>('BASELINE VIEW');
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [executiveReport, setExecutiveReport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isHealthy = data.zScore > -2.0 && data.zScore < 2.0;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setFileInfo({
            name: file.name.toUpperCase(),
            rows: results.data.length
          });
          setParsedRows(results.data);
        },
        error: (error) => {
          console.error("CSV Parsing Error:", error);
          alert("Error parsing CSV file.");
        }
      });
    }
  };

  const handleAnalyze = async () => {
    if (parsedRows.length === 0) return;
    
    setIsAnalyzing(true);
    setExecutiveReport(null);
    try {
      const result = await geminiService.analyzeTelemetryData(parsedRows);
      setData(result);
      
      // Process trend data for chart
      const uniqueDates = Array.from(new Set(parsedRows.map(r => r.date))).sort();
      const processedTrend: TrendDataPoint[] = uniqueDates.map(date => {
        const dayRows = parsedRows.filter(r => r.date === date);
        const globalSum = dayRows.reduce((sum, r) => sum + (Number(r.daily_active_users) || 0), 0);
        const naSum = dayRows
          .filter(r => r.region === 'NA')
          .reduce((sum, r) => sum + (Number(r.daily_active_users) || 0), 0);
        
        return {
          date,
          global: globalSum,
          na: naSum
        };
      });
      
      setTrendData(processedTrend);
      setMode('LIVE ANALYSIS');

      // Generate Executive Briefing after analysis
      const report = await geminiService.generateExecutiveReport(result);
      setExecutiveReport(report);

    } catch (error) {
      console.error("Analysis Failed:", error);
      alert("Failed to analyze data. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden h-screen relative">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-600/20">D</div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tighter uppercase">Deriv Observability</h1>
            <p className="text-[9px] text-slate-500 font-bold tracking-[0.2em] -mt-0.5">ENGINE: STREAMLIT | MODEL: GEMINI 3 FLASH</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isHealthy ? 'text-emerald-600' : 'text-red-600'}`}>
              {isHealthy ? 'System Healthy' : 'Anomaly Detected'}
            </span>
          </div>
          
          <a href="#" className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest border-l border-slate-200 pl-6 ml-2">
            Documentation <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          {/* Loading Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">AI Engine Processing</h3>
                  <p className="text-sm text-slate-500">DAIA is generating your executive briefing report...</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-8 max-w-7xl mx-auto pb-24">
            {/* Top Row: File Upload & Actions */}
            <div className="flex items-center justify-between mb-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".csv" 
                  className="hidden" 
                />
                <button 
                  onClick={triggerFileSelect}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border border-slate-200"
                >
                  {fileInfo ? (
                    <>
                      <FileText className="w-4 h-4 text-slate-900" />
                      {fileInfo.name} ({fileInfo.rows} ROWS)
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-slate-500" />
                      Upload Telemetry CSV
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={handleAnalyze}
                  disabled={!fileInfo || isAnalyzing}
                  className="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-slate-900/10"
                >
                  {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  Analyze Data
                </button>
                <div className="h-4 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode:</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${mode === 'LIVE ANALYSIS' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-900'}`}>
                    {mode}
                  </span>
                </div>
              </div>
            </div>

            {/* Context Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8 bg-white w-fit px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <span>Global</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-900">Enterprise Dashboard</span>
            </div>

            {/* Status Banner */}
            <div className={`mb-8 border rounded-2xl p-5 flex items-center gap-5 shadow-sm transition-all duration-500 ${isHealthy ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className={`w-14 h-14 bg-white rounded-xl flex items-center justify-center border shadow-sm ${isHealthy ? 'text-emerald-600 border-emerald-100' : 'text-red-600 border-red-100'}`}>
                {isHealthy ? <ShieldCheck className="w-7 h-7" /> : <Activity className="w-7 h-7" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold text-lg ${isHealthy ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isHealthy ? 'System Healthy — All metrics within expected thresholds' : 'CRITICAL: Data Anomaly Detected'}
                </h4>
                <p className={`text-sm mt-0.5 ${isHealthy ? 'text-emerald-600/80' : 'text-red-600/80'}`}>
                  {isHealthy 
                    ? 'Business indicators show optimal performance. Variance is within statistical boundaries.' 
                    : `Statistical drift identified (Z: ${data.zScore}). Investigation path indicates ${data.investigationPath.join(' → ')} impact.`}
                </p>
              </div>
              <div className={`text-right px-6 border-l ${isHealthy ? 'border-emerald-100' : 'border-red-100'}`}>
                <div className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isHealthy ? 'text-emerald-500/60' : 'text-red-500/60'}`}>Statistical Variance</div>
                <div className={`text-3xl font-mono font-bold tracking-tighter ${isHealthy ? 'text-emerald-600' : 'text-red-600'}`}>Z: {data.zScore}</div>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard data={data.globalDau} />
              <StatCard data={data.tradingVolume} />
              <StatCard data={data.netPnl} />
              <StatCard data={data.exposureImbalance} />
            </div>

            {/* Trend Analysis Section - Only show in Live Analysis mode */}
            {mode === 'LIVE ANALYSIS' && trendData.length > 0 && (
              <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">28-Day ADU Trend Analysis</h3>
                    <p className="text-xs text-slate-500">Historical performance vs current telemetry snapshot</p>
                  </div>
                </div>
                <TrendChart data={trendData} baseline={data.globalDau.baseline} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Regional Performance */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Regional Distribution</h3>
                    <p className="text-xs text-slate-500 mt-1">Variance against calculated baseline</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`flex items-center gap-1 text-[10px] font-bold border px-3 py-1.5 rounded-lg uppercase tracking-tight ${isHealthy ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                      Status: {isHealthy ? 'Healthy' : 'Anomaly'}
                    </span>
                  </div>
                </div>
                <RegionChart data={data.regions} />
              </div>

              {/* Platform & Instrument Signals */}
              <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Component Signals</h3>
                <InstrumentAnalysis data={data.instruments} />
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">Platform Performance</h4>
                  <div className="space-y-4">
                    {data.platforms.map(p => (
                      <div key={p.platform} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <div className="text-sm font-bold text-slate-800">{p.platform}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">Volume change: {p.volumeChange > 0 ? '+' : ''}{p.volumeChange}%</div>
                        </div>
                        <div className={`text-sm font-mono font-bold px-2 py-1 rounded ${p.dauChange < 0 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
                          {p.dauChange > 0 ? '+' : ''}{p.dauChange}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Investigation Path Visualization - Only show when NOT healthy */}
            {!isHealthy && data.investigationPath.length > 0 && (
              <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 mb-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Automated Investigation Path</h3>
                    <p className="text-xs text-slate-500 mt-1">Trace logic identifying propagation of the {data.zScore} variance</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-around py-10 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden">
                  {data.investigationPath.map((step, idx) => (
                    <React.Fragment key={step}>
                      <div className="text-center group relative z-10">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-red-200 flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                          {idx === 0 ? <MapIcon className="w-10 h-10 text-red-500" /> : idx === 1 ? <Layers className="w-10 h-10 text-orange-500" /> : <TrendingDown className="w-10 h-10 text-amber-500" />}
                        </div>
                        <div className="text-sm font-bold text-slate-900 uppercase tracking-tighter">{step}</div>
                        <div className="text-[10px] text-red-600 font-mono font-bold mt-1.5">Anomaly Node</div>
                      </div>
                      {idx < data.investigationPath.length - 1 && (
                        <ChevronRight className="w-10 h-10 text-slate-200" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Executive Briefing Report Section */}
            {mode === 'LIVE ANALYSIS' && executiveReport && (
              <div className="mt-8 bg-white border-2 border-slate-900/5 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/10">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Executive Briefing Report</h3>
                    <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Generated by DAIA | {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="report-content max-w-4xl">
                  <ReactMarkdown>{executiveReport}</ReactMarkdown>
                </div>
                <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <span>Authorized Briefing Document</span>
                  <span>Confidential | Deriv Data Health</span>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* AI Side Panel */}
        <aside className="w-[400px] shrink-0 h-full z-20 shadow-xl">
          <DAIAChat />
        </aside>
      </div>
    </div>
  );
};

export default App;
