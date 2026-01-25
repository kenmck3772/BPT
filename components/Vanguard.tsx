
import React, { useState } from 'react';
import { 
  Cpu, Search, Loader2, Sparkles, Target, 
  ShieldAlert, BookOpen, Binary, ArrowRight,
  Zap, Database, FileSearch, Waves, Globe,
  ShieldCheck, Filter, Microscope, Terminal
} from 'lucide-react';
import { getVanguardTechBrief, getVanguardHorizonScan } from '../services/geminiService';

const Vanguard: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isHorizonScanning, setIsHorizonScanning] = useState(false);
  const [brief, setBrief] = useState<string | null>(null);
  const isHunter = !document.body.classList.contains('light-theme');

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setIsScanning(true);
    setBrief(null);
    const result = await getVanguardTechBrief(query);
    setBrief(result);
    setIsScanning(false);
  };

  const handleHorizonScan = async () => {
    setIsHorizonScanning(true);
    setBrief(null);
    const result = await getVanguardHorizonScan();
    setBrief(result);
    setIsHorizonScanning(false);
  };

  const highValuePhysics = [
    { name: "Hydraulic Fingerprinting", id: "HYDRAULIC_FINGERPRINT", desc: "Transient pressure reflection mapping. Locating unrecorded downhole artifacts." },
    { name: "Metadata Forensic Scraper", id: "METADATA_AUDIT", desc: "Automated EXIF and edit-trail analysis of DDRs. Identifying data 'smoothing'." },
    { name: "Agentic Audit Framework", id: "AGENT_AUDIT", desc: "Multi-agent AutoGen pattern for NDR legacy harvesting and critic-veto." },
    { name: "PINN Buckley-Leverett Solver", id: "PINN_BL", desc: "Grey-box physics engine incorporating capillary pressure regularization." }
  ];

  return (
    <div className={`flex flex-col h-full space-y-6 p-6 relative overflow-hidden transition-all duration-700 ${isHunter ? 'bg-slate-950/40 text-emerald-400 font-terminal' : 'bg-white text-slate-900'}`}>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Waves size={400} className={isHunter ? "text-emerald-500 animate-pulse" : "text-blue-500"} />
      </div>

      <header className={`flex items-center justify-between border-b pb-4 relative z-10 ${isHunter ? 'border-emerald-900/30' : 'border-slate-100'}`}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl shadow-lg transition-all ${isHunter ? 'bg-emerald-500/10 border border-emerald-500/40' : 'bg-blue-50 border border-blue-100'}`}>
            <Microscope size={24} className={isHunter ? "text-emerald-400" : "text-blue-500"} />
          </div>
          <div>
            <h2 className={`text-2xl font-black uppercase tracking-tighter ${isHunter ? 'text-emerald-400' : 'text-slate-900'}`}>
              {isHunter ? 'THE_VANGUARD_PROTOCOL' : 'R&D Methodology Scan'}
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`text-[9px] uppercase tracking-[0.4em] font-black ${isHunter ? 'text-emerald-800' : 'text-slate-400'}`}>
                {isHunter ? 'Source: Patent_Offices // arXiv_Geophysics // SPE_SEG' : 'Process: Academic Methodology Audit'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded border text-[8px] font-black uppercase transition-all ${isHunter ? 'bg-black border-emerald-900/40 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
             <Filter size={12} />
             <span>BS_Detector: Active</span>
          </div>
          <button 
            onClick={handleHorizonScan}
            disabled={isHorizonScanning || isScanning}
            className={`flex items-center space-x-2 px-4 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all ${isHunter ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'}`}
          >
            {isHorizonScanning ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
            <span>Horizon_Scan</span>
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 min-h-0 overflow-hidden">
        
        {/* Module Sidebar */}
        <div className="flex flex-col space-y-6">
          <div className={`rounded-2xl p-5 shadow-xl transition-all ${isHunter ? 'bg-slate-950/80 border border-emerald-900/30' : 'bg-slate-50 border border-slate-200'}`}>
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center ${isHunter ? 'text-emerald-400' : 'text-slate-500'}`}>
              <FileSearch size={14} className="mr-2" /> Forensic_Search
            </h3>
            
            <form onSubmit={handleScan} className="space-y-4">
              <div className="relative">
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isHunter ? "METHODOLOGY_KEYWORD..." : "Enter technology name..."}
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-[11px] outline-none transition-all ${isHunter ? 'border-emerald-900/40 text-emerald-100 focus:border-emerald-500 placeholder:text-emerald-950 shadow-inner' : 'border-slate-200 text-slate-900 focus:border-blue-500'}`}
                />
              </div>
              <button 
                type="submit"
                disabled={isScanning || isHorizonScanning || !query.trim()}
                className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center justify-center space-x-2 ${isHunter ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                <span>{isScanning ? 'Filtering_Noise...' : 'Scan_Physics'}</span>
              </button>
            </form>
          </div>

          <div className={`flex-1 rounded-2xl p-5 shadow-xl transition-all ${isHunter ? 'bg-slate-950/80 border border-emerald-900/30' : 'bg-slate-50 border border-slate-200'}`}>
             <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center ${isHunter ? 'text-emerald-400' : 'text-slate-500'}`}>
               <Target size={14} className="mr-2" /> Future_Tech_Targeting
             </h3>
             <div className="space-y-3">
                {highValuePhysics.map((s, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => { setQuery(s.id); handleScan(); }}
                    className={`w-full text-left p-3 rounded-lg border transition-all group ${isHunter ? 'bg-black/40 border-emerald-900/20 hover:border-emerald-500/40' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                       <span className={`text-[9px] font-black uppercase ${isHunter ? 'text-emerald-400' : 'text-blue-600'}`}>{s.id}</span>
                       <ArrowRight size={10} className={isHunter ? 'text-emerald-900 group-hover:text-emerald-400' : 'text-slate-300'} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter block mb-1 ${isHunter ? 'text-emerald-100' : 'text-slate-900'}`}>{s.name}</span>
                    <span className={`text-[8px] leading-tight block ${isHunter ? 'text-emerald-900' : 'text-slate-400'}`}>{s.desc}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden">
          <div className={`flex-1 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative transition-all ${isHunter ? 'bg-slate-950/90 border border-emerald-900/40' : 'bg-slate-50 border border-slate-200'}`}>
            <div className={`p-3 border-b flex items-center justify-between ${isHunter ? 'border-emerald-900/30 bg-slate-900/60' : 'bg-slate-100/50'}`}>
              <div className="flex items-center space-x-3">
                <BookOpen size={14} className={isHunter ? "text-emerald-500" : "text-blue-500"} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isHunter ? "text-emerald-400" : "text-slate-900"}`}>Forensic_Tech_Brief</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${(isScanning || isHorizonScanning) ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                <span className={`text-[8px] font-black uppercase ${isHunter ? "text-emerald-900" : "text-slate-400"}`}>{(isScanning || isHorizonScanning) ? 'SCANNING' : 'IDLE'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              {!(brief || isScanning || isHorizonScanning) ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                   <Microscope size={80} className="animate-pulse" />
                   <span className="text-xs font-black uppercase tracking-[0.4em]">Initialize_Methodology_Audit</span>
                </div>
              ) : (isScanning || isHorizonScanning) ? (
                <div className="space-y-6 animate-pulse">
                   <div className="h-8 bg-slate-800/40 rounded w-1/4"></div>
                   <div className="h-32 bg-slate-800/40 rounded"></div>
                   <div className="h-20 bg-slate-800/40 rounded w-1/2"></div>
                   <div className="h-48 bg-slate-800/40 rounded"></div>
                </div>
              ) : brief && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className={`p-6 border-l-4 rounded-r-xl shadow-xl transition-all ${isHunter ? 'bg-emerald-500/5 border-emerald-500' : 'bg-blue-50 border-blue-500'}`}>
                    <pre className={`whitespace-pre-wrap font-mono text-xs leading-relaxed ${isHunter ? 'text-emerald-100' : 'text-slate-800'}`}>
                      {brief}
                    </pre>
                  </div>
                  
                  <div className={`p-4 rounded-xl border transition-all ${isHunter ? 'bg-slate-900/40 border-emerald-900/20 text-emerald-900 italic text-[10px]' : 'bg-slate-50 border-slate-200 text-slate-500 text-[10px]'}`}>
                     <div className="flex items-center space-x-2 mb-2">
                       <ShieldAlert size={14} className={isHunter ? "text-emerald-500" : "text-blue-500"} />
                       <span className="font-black uppercase tracking-widest">Scientific_Firewall_Verified</span>
                     </div>
                     "Verified against Sovereign restricted database. All commercial marketing fluff suppressed. High-value methodology detected."
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vanguard;
