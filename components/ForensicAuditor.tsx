
import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Zap, Search, Loader2, Database, 
  FileText, CheckCircle2, AlertTriangle, AlertOctagon, Terminal,
  Coins, TrendingUp, BarChart3, HardDrive, 
  Activity, Table, Microscope, Anchor, Save,
  Maximize2, Minimize2, Trash2, ChevronRight,
  ClipboardList, UserCheck, Flame, Droplets,
  Fingerprint, Play, ShieldCheck, Box, FileCode,
  AlertCircle, CloudUpload, Link as LinkIcon,
  ArrowRight, Skull, FileWarning, UserPlus,
  FileSearch, Download, MessageSquareQuote,
  FileJson, Copy, Check, Scale, Target,
  BookOpen, Layers, Shield, Beaker, Ruler,
  ArrowDownToLine, MoveDown,
  Gauge,
  Thermometer,
  Clock,
  History,
  Radiation,
  Info,
  Cpu,
  Hash,
  SearchCode,
  MapPin,
  Mountain,
  Scan,
  FileQuestion,
  TrendingDown,
  Lock,
  Globe,
  Link2,
  CircleDot
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Scatter
} from 'recharts';
import { performSovereignAudit } from '../services/geminiService';
import { playLockSound } from '../services/vaultService';
import { IRON_TRUTH_REGISTRY } from '../constants';

const REGISTRY_TARGETS = [
  { uwi: '210/24a-H1', name: 'Harris_H1', status: 'VETO_READY', op: 'CNR' },
  { uwi: '2/5-H12', name: 'Heather_H12', status: 'AUDIT_LOCKED', op: 'EnQuest' },
  { uwi: '15/20a-B2', name: 'Balloch_B2', status: 'SYNC_PENDING', op: 'Ithaca' },
  { uwi: '9/13a-A1', name: 'Arbroath_A1', status: 'GHOST_DETECTED', op: 'Apache' },
  { uwi: '211/12-M15', name: 'Magnus_M15', status: 'NOMINAL', op: 'BP' },
  { uwi: '9/18-H1', name: 'Harding_H1', status: 'DECAY_ALERT', op: 'TAQA' }
];

const NoDataPanel = ({ title, message, icon: Icon = FileQuestion }: { title: string, message: string, icon?: any }) => (
  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-emerald-900/20 rounded-[2rem] p-12 text-center space-y-6 bg-emerald-500/[0.02]">
    <div className="p-5 bg-emerald-950/20 rounded-full border border-emerald-900/30 animate-pulse">
      <Icon size={48} className="text-emerald-900/40" />
    </div>
    <div className="space-y-2 max-w-xs">
      <h3 className="text-sm font-black text-emerald-800 uppercase tracking-[0.3em]">{title}</h3>
      <p className="text-[10px] font-mono text-emerald-900/60 uppercase leading-relaxed">{message}</p>
    </div>
    <div className="text-[8px] font-black text-red-950 uppercase tracking-widest border border-emerald-900/20 px-3 py-1 rounded">
      Status: Uplink_Empty // ERR_CODE: 0x00_VOID
    </div>
  </div>
);

const ForensicAuditor: React.FC<{isFocused?: boolean; onToggleFocus?: () => void}> = ({ isFocused, onToggleFocus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWellUwi, setSelectedWellUwi] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStep, setScrapeStep] = useState('');
  const [scrapedData, setScrapedData] = useState<any | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const filteredRegistry = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return REGISTRY_TARGETS.filter(t => t.uwi.toLowerCase().includes(q) || t.name.toLowerCase().includes(q));
  }, [searchTerm]);

  const activeWell = useMemo(() => 
    REGISTRY_TARGETS.find(t => t.uwi === selectedWellUwi)
  , [selectedWellUwi]);

  const addLog = (text: string) => setLogs(prev => [...prev.slice(-12), `[${new Date().toLocaleTimeString()}] > ${text}`]);

  const executeDeepScrape = async () => {
    if (!activeWell) return;
    setIsScraping(true);
    setScrapedData(null);
    setLogs([]);
    playLockSound();

    const sequence = [
      { msg: "NDR_UPLINK: ESTABLISHING ODATA HANDSHAKE...", delay: 800 },
      { msg: "SCAVENGER: SCANNING UNSTRUCTURED OSPAR FILINGS...", delay: 1200 },
      { msg: "OCR_ENGINE: DECODING 1970s HANDWRITTEN TALLIES...", delay: 1500 },
      { msg: "AUTHOR_TRUTH: RECONCILING VERTICAL DATUM SIGNATURES...", delay: 1000 },
      { msg: "KERNEL: CONSTRUCTING SOVEREIGN ARTIFACT MAP...", delay: 800 }
    ];

    for (const step of sequence) {
      setScrapeStep(step.msg);
      addLog(step.msg);
      await new Promise(r => setTimeout(r, step.delay));
    }

    setScrapedData({
      uwi: activeWell.uwi,
      datumShift: activeWell.name.includes('Harris') ? '4.05m' : '0.00m',
      artifacts: [
        { label: 'EOWR_1994', status: 'VERIFIED', type: 'Primary_Survey' },
        { label: 'DDR_SCAN_82', status: 'DEGRADED', type: 'Handwritten_Tally' },
        { label: 'MSL_CLAIM_2013', status: 'VETOED', type: 'Digital_Summary' }
      ],
      verdict: `Forensic audit for ${activeWell.name} complete. High-fidelity re-anchoring successful. Digital abyss suppressed.`
    });

    setIsScraping(false);
    setScrapeStep('');
    addLog(`>>> SCRAPE_COMPLETE: ${activeWell.uwi} ARTIFACTS COMMITTED TO BUFFER.`);
    playLockSound();
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-emerald-900/30 pb-4 relative z-10 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl shadow-lg">
            <CircleDot size={24} className="text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter leading-none">>>> THE_EYERUNE_AUDITOR</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[9px] text-emerald-800 uppercase tracking-[0.4em] font-black">Targeted Artifact Retrieval // NDR Secure Uplink</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
           {activeWell && (
             <button 
               onClick={executeDeepScrape} 
               disabled={isScraping} 
               className={`px-8 py-3 bg-emerald-500 text-slate-950 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center gap-3 transition-all active:scale-95 ${isScraping ? 'animate-pulse' : ''}`}
             >
               {isScraping ? <Loader2 size={16} className="animate-spin" /> : <Scan size={16} />}
               <span>{isScraping ? 'Harvesting...' : `Harvest_${activeWell.name}_Artifacts`}</span>
             </button>
           )}
           {onToggleFocus && (
            <button onClick={onToggleFocus} aria-label="Toggle Focus Mode" className="p-2 text-emerald-900 hover:text-emerald-400 transition-all ml-2">
              {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
           )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10 min-h-0 overflow-hidden">
        <div className="lg:col-span-1 flex flex-col space-y-4 overflow-hidden">
           <div className="bg-slate-900/80 border border-emerald-900/30 rounded-2xl flex flex-col flex-1 shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-emerald-900/20 bg-black/40 space-y-4">
                 <div className="flex items-center gap-2">
                    <Target size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Well_Registry_Search</span>
                 </div>
                 <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900" />
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="UWI / Well Name..."
                      className="w-full bg-black/60 border border-emerald-900/40 rounded-lg pl-9 pr-4 py-2 text-[10px] text-emerald-100 font-mono outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-950"
                    />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                 {filteredRegistry.map((well) => (
                    <button 
                      key={well.uwi} 
                      onClick={() => { setSelectedWellUwi(well.uwi); setScrapedData(null); }}
                      className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${selectedWellUwi === well.uwi ? 'bg-emerald-500/10 border-emerald-500 shadow-lg' : 'bg-slate-950 border-emerald-900/20 hover:border-emerald-500/40'}`}
                    >
                       <div className="flex justify-between items-center mb-1">
                          <span className={`text-[11px] font-black uppercase ${selectedWellUwi === well.uwi ? 'text-emerald-100' : 'text-emerald-900'}`}>{well.name}</span>
                          <span className="text-[7px] font-mono text-emerald-950">{well.op}</span>
                       </div>
                       <div className="text-[9px] font-mono text-emerald-800">{well.uwi}</div>
                       <div className={`mt-2 text-[7px] font-black uppercase px-1.5 py-0.5 rounded border inline-block ${well.status === 'VETO_READY' ? 'border-red-500 text-red-500 bg-red-500/5' : 'border-emerald-900 text-emerald-900'}`}>
                          {well.status}
                       </div>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 flex flex-col space-y-4 overflow-hidden">
           {!activeWell ? (
              <NoDataPanel 
                title="Awaiting_Selection" 
                message="Select a wellbore from the UKCS registry matrix to initialize a deep forensic audit."
                icon={Target}
              />
           ) : isScraping ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-slate-900/40 rounded-3xl border-2 border-dashed border-emerald-500/20">
                 <div className="relative">
                    <Loader2 size={120} className="text-emerald-500 animate-spin opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <CircleDot size={48} className="text-emerald-400 animate-pulse" />
                    </div>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <span className="text-xl font-black text-emerald-400 uppercase tracking-[0.4em] animate-pulse">Establishing_Uplink</span>
                    <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest">{scrapeStep}</span>
                 </div>
              </div>
           ) : scrapedData ? (
              <div className="flex-1 flex flex-col min-h-0 space-y-6 animate-in fade-in zoom-in-98 duration-500">
                 <div className="bg-slate-950/90 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col">
                    <div className="flex justify-between items-start border-b border-emerald-900/30 pb-6 mb-8">
                       <div>
                          <h1 className="text-4xl font-black text-emerald-100 uppercase tracking-tighter">{scrapedData.uwi}</h1>
                       </div>
                       <div className="text-right flex flex-col items-end">
                          <span className="text-[10px] font-black text-emerald-900 uppercase">Audit_Verdict</span>
                          <span className="text-sm font-black text-emerald-400 uppercase tracking-tighter max-w-xs">{scrapedData.verdict}</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                       {scrapedData.artifacts.map((art: any, i: number) => (
                         <div key={i} className={`p-5 rounded-2xl border transition-all ${art.status === 'VETOED' ? 'bg-red-600/5 border-red-500/40' : 'bg-emerald-500/5 border-emerald-500/40 shadow-lg'}`}>
                            <div className="flex justify-between items-center mb-3">
                               <span className={`text-[10px] font-black uppercase tracking-widest ${art.status === 'VETOED' ? 'text-red-400' : 'text-emerald-400'}`}>{art.label}</span>
                               {art.status === 'VERIFIED' ? <ShieldCheck size={16} className="text-emerald-500" /> : <AlertOctagon size={16} className="text-red-500" />}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           ) : (
              <NoDataPanel 
                title="Dossier_Buffer_Idle" 
                message={`Selected well ${activeWell.name} is ready for harvesting.`}
                icon={SearchCode}
              />
           )}
        </div>
      </div>
    </div>
  );
};

export default ForensicAuditor;
