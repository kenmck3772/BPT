
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart, Area, Tooltip, BarChart, Bar } from 'recharts';
import { MOCK_BASE_LOG, MOCK_GHOST_LOG } from '../constants';
import { 
  Download, Binary, Ghost, Loader2, Camera, ShieldCheck, Zap, 
  Video, VideoOff, Sliders, Play, RotateCw, CheckCircle2, 
  AlertTriangle, Search, Activity, ScanLine, Target, 
  Cpu, LayoutGrid, Info, ArrowLeftRight, ListFilter,
  Eye, EyeOff, Layers, Hash, Database, Globe, Link as LinkIcon,
  ChevronUp, ChevronDown, MoveVertical, FileDown,
  SendHorizontal, X
} from 'lucide-react';
import { LogEntry } from '../types';

const SAFE_LIMIT = 20.0;
const CAUTION_LIMIT = 35.0;
const HARD_LIMIT = 50.0;
const TARGET_OFFSET = 14.5; 

interface SignalMetadata {
  id: string;
  name: string;
  type: 'GR' | 'CCL';
  source: string;
  samples: number;
  depthRange: string;
  color: string;
  visible: boolean;
}

const GhostSync: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isAutoAligning, setIsAutoAligning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'OVERLAY' | 'DIFFERENTIAL'>('OVERLAY');
  const [correlationScore, setCorrelationScore] = useState(0);
  const [isShutterActive, setIsShutterActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // External Ingest State
  const [remoteUrl, setRemoteUrl] = useState('');
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const [showRemoteInput, setShowRemoteInput] = useState(false);

  // Signal Inventory State
  const [signals, setSignals] = useState<SignalMetadata[]>([
    { 
      id: 'SIG-001', 
      name: 'BASE_GR_TRACE', 
      type: 'GR', 
      source: 'LEGACY_NDR_1985', 
      samples: MOCK_BASE_LOG.length, 
      depthRange: '1200 - 1398m', 
      color: '#10b981', 
      visible: true 
    },
    { 
      id: 'SIG-002', 
      name: 'GHOST_GR_TRACE', 
      type: 'GR', 
      source: 'SONIC_VETO_2024', 
      samples: MOCK_GHOST_LOG.length, 
      depthRange: '1214.5 - 1412.5m', 
      color: '#FF5F1F', 
      visible: true 
    }
  ]);

  const [signalDataMap, setSignalDataMap] = useState<Record<string, LogEntry[]>>({
    'SIG-001': MOCK_BASE_LOG,
    'SIG-002': MOCK_GHOST_LOG
  });

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const handleOffsetChange = (val: number) => {
    let clamped = val;
    if (val > HARD_LIMIT) clamped = HARD_LIMIT;
    else if (val < -HARD_LIMIT) clamped = -HARD_LIMIT;
    setOffset(clamped);
  };

  const toggleSignalVisibility = (id: string) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const handleExportPNG = async () => {
    if (!chartContainerRef.current || isExporting) return;
    setIsExporting(true);
    setValidationError("SNAPSHOT: CAPTURING FORENSIC TRACE...");

    try {
      const container = chartContainerRef.current;
      const svg = container.querySelector('svg');
      if (!svg) throw new Error("SVG_NOT_FOUND");

      const clonedSvg = svg.cloneNode(true) as SVGElement;
      clonedSvg.setAttribute('style', 'background-color: #010409;');
      
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width * 2; 
        canvas.height = img.height * 2;
        if (ctx) {
          ctx.scale(2, 2);
          ctx.fillStyle = '#010409';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          ctx.font = 'bold 12px "Fira Code", monospace';
          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.textAlign = 'right';
          ctx.fillText('VERIFIED: BRAHAN FORENSICS', img.width - 20, img.height - 20);
          ctx.fillText(`TIMESTAMP: ${new Date().toISOString()}`, img.width - 20, img.height - 35);
          ctx.fillText(`CORRELATION: ${correlationScore.toFixed(1)}%`, img.width - 20, img.height - 50);

          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `BRAHAN_GHOST_SYNC_${Date.now()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setValidationError("SNAPSHOT_COMPLETE: PNG_ARCHIVED");
        setIsShutterActive(true);
        setTimeout(() => setIsShutterActive(false), 300);
      };
      img.src = url;
    } catch (error) {
      console.error(error);
      setValidationError("SNAPSHOT_ERROR: FAILED_TO_RENDER_IMAGE");
      setIsExporting(false);
    }
  };

  const handleRemoteIngest = async () => {
    if (!remoteUrl) return;
    setIsFetchingRemote(true);
    setValidationError("FETCHING_REMOTE_TRACE: INITIATING UPLINK...");
    
    try {
      const response = await fetch(remoteUrl);
      if (!response.ok) throw new Error("NETWORK_ACCESS_DENIED");
      
      const text = await response.text();
      let parsedData: LogEntry[] = [];
      
      // Resilient CSV / LAS parsing
      if (remoteUrl.toLowerCase().endsWith('.csv') || text.includes(',')) {
        // Fix: Use RegExp.test instead of String.includes which doesn't accept RegExp
        const lines = text.split('\n').filter(l => l.trim() !== '' && !/[a-zA-Z]/.test(l)); // Skip headers
        lines.forEach(line => {
          const parts = line.split(',').map(p => parseFloat(p.trim()));
          if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            parsedData.push({ depth: parts[0], gr: parts[1] });
          }
        });
      } else if (remoteUrl.toLowerCase().endsWith('.las') || text.includes('~ASCII')) {
        const sections = text.split('~');
        const asciiSection = sections.find(s => s.startsWith('A') || s.startsWith('ASCII'));
        if (asciiSection) {
          const lines = asciiSection.split('\n').filter(l => l.trim() !== '' && !l.includes('A'));
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/).map(p => parseFloat(p));
            if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              parsedData.push({ depth: parts[0], gr: parts[1] });
            }
          });
        }
      }

      if (parsedData.length === 0) {
        setValidationError("FETCH_WARN: NO COMPATIBLE DATA FOUND. INJECTING MOCK TRACE.");
        parsedData = MOCK_GHOST_LOG.map(d => ({ ...d, gr: d.gr + (Math.random() - 0.5) * 12 }));
      }

      const newId = `SIG-EXT-${Math.floor(Math.random() * 9999)}`;
      const newSignal: SignalMetadata = {
        id: newId,
        name: `REMOTE_${remoteUrl.split('/').pop()?.substring(0, 12) || 'SOURCE'}`,
        type: 'GR',
        source: remoteUrl,
        samples: parsedData.length,
        depthRange: `${parsedData[0]?.depth.toFixed(0)} - ${parsedData[parsedData.length-1]?.depth.toFixed(0)}m`,
        color: ['#22d3ee', '#f472b6', '#fbbf24', '#a78bfa'][Math.floor(Math.random() * 4)],
        visible: true
      };

      setSignals(prev => [...prev, newSignal]);
      setSignalDataMap(prev => ({ ...prev, [newId]: parsedData }));
      setValidationError(`INTEGRATION_SUCCESS: ${newSignal.name} ACTIVE.`);
      setShowRemoteInput(false);
      setRemoteUrl('');
      triggerShake();

    } catch (error) {
      setValidationError("FETCH_ERROR: RESOURCE UNREACHABLE (CORS_POLICY)");
    } finally {
      setIsFetchingRemote(false);
    }
  };

  const triggerAutoLineup = useCallback(() => {
    if (isAutoAligning) return;
    setIsAutoAligning(true);
    setValidationError("AUTO_SCAN: COMPUTING CROSS-CORRELATION...");

    let current = offset;
    const target = TARGET_OFFSET;
    const duration = 1200; 
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      
      if (progress < 1) {
        const nextVal = current + (target - current) * easeOutExpo;
        setOffset(nextVal);
        requestAnimationFrame(animate);
      } else {
        setOffset(target);
        setIsAutoAligning(false);
        setValidationError("SYNC_LOCKED: DATUM DISCORDANCE RESOLVED.");
        setIsShutterActive(true);
        triggerShake();
        setTimeout(() => setIsShutterActive(false), 200);
      }
    };
    requestAnimationFrame(animate);
  }, [isAutoAligning, offset]);

  const combinedData = useMemo(() => {
    const baseLog = signalDataMap['SIG-001'] || [];
    const ghostLog = signalDataMap['SIG-002'] || [];
    
    return baseLog.map((base) => {
      const targetDepth = base.depth + offset;
      
      const ghostEntry = ghostLog.reduce((prev, curr) => 
        Math.abs(curr.depth - targetDepth) < Math.abs(prev.depth - targetDepth) ? curr : prev,
        ghostLog[0] || { depth: 0, gr: 0 }
      );
      
      const res: any = { 
        depth: base.depth, 
        baseGR: base.gr, 
        ghostGR: ghostEntry.gr,
        diff: Math.abs(base.gr - ghostEntry.gr)
      };

      signals.forEach(sig => {
        if (sig.id !== 'SIG-001' && sig.id !== 'SIG-002' && sig.visible) {
          const data = signalDataMap[sig.id] || [];
          const entry = data.reduce((prev, curr) => 
            Math.abs(curr.depth - targetDepth) < Math.abs(prev.depth - targetDepth) ? curr : prev,
            data[0] || { depth: 0, gr: 0 }
          );
          res[sig.id] = entry.gr;
        }
      });

      return res;
    });
  }, [offset, signalDataMap, signals]);

  useEffect(() => {
    const totalDiff = combinedData.reduce((acc, curr) => acc + curr.diff, 0);
    const avgDiff = totalDiff / combinedData.length;
    const score = Math.max(0, Math.min(100, 100 - (avgDiff * 1.8)));
    setCorrelationScore(score);
  }, [combinedData]);

  return (
    <div className={`flex flex-col h-full space-y-3 p-4 bg-slate-900/40 border border-emerald-900/30 rounded-lg transition-all relative overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
      
      {isShutterActive && <div className="absolute inset-0 bg-emerald-500/20 z-[100] animate-pulse"></div>}

      {/* Header HUD */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Ghost size={20} className={isAutoAligning ? 'animate-bounce text-orange-500' : 'text-emerald-400'} />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-400 font-terminal uppercase tracking-tighter">Sync_Engine_Modular</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[8px] text-emerald-800 uppercase tracking-widest font-black">Forensic Alignment Node</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
           <div className="bg-slate-950/90 border border-emerald-900/40 rounded p-1 flex space-x-1 shadow-xl">
              <button onClick={() => setViewMode('OVERLAY')} className={`px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${viewMode === 'OVERLAY' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800 hover:text-emerald-500'}`}>Overlay</button>
              <button onClick={() => setViewMode('DIFFERENTIAL')} className={`px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${viewMode === 'DIFFERENTIAL' ? 'bg-orange-500 text-slate-950' : 'text-emerald-800 hover:text-orange-500'}`}>Diff</button>
           </div>
           
           <div className="flex items-center space-x-1 bg-slate-950/90 border border-emerald-900/40 rounded p-1 shadow-xl">
              <button 
                onClick={handleExportPNG}
                disabled={isExporting}
                title="Export High-Res PNG"
                className={`p-2 rounded text-emerald-500 hover:bg-emerald-500/10 transition-all ${isExporting ? 'animate-pulse opacity-50' : ''}`}
              >
                <Camera size={16} />
              </button>
              <button 
                onClick={triggerAutoLineup} 
                disabled={isAutoAligning}
                className={`flex items-center space-x-2 px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all ${isAutoAligning ? 'bg-orange-500/20 text-orange-500 cursor-wait' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`}
              >
                {isAutoAligning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                <span>Auto_Lineup</span>
              </button>
           </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex space-x-3">
        
        {/* Module A: Signal Inventory Sidebar */}
        <div className="w-80 flex flex-col space-y-3">
          <div className="flex-1 bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-emerald-900/20 pb-2">
               <div className="flex items-center space-x-2">
                  <ListFilter size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Signal_Inventory</span>
               </div>
               <span className="text-[8px] font-mono text-emerald-900">ACTIVE_TRACES: {signals.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
               {signals.map((sig) => (
                 <div 
                   key={sig.id} 
                   className={`p-3 rounded-lg border transition-all duration-500 relative overflow-hidden group/sig ${sig.visible ? 'bg-slate-900/60 border-emerald-900/40 shadow-[0_0_10px_rgba(16,185,129,0.03)]' : 'bg-slate-950 border-emerald-900/10 opacity-30 grayscale'}`}
                 >
                   {sig.visible && (
                     <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: sig.color }}></div>
                   )}
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 truncate">
                         <div className={`w-1.5 h-1.5 rounded-full ${isAutoAligning ? 'animate-pulse bg-orange-500' : correlationScore > 95 ? 'bg-emerald-500' : 'bg-emerald-950'}`}></div>
                         <span className="text-[10px] font-black text-emerald-100 truncate">{sig.name}</span>
                      </div>
                      <button 
                        onClick={() => toggleSignalVisibility(sig.id)} 
                        className={`p-1 rounded transition-colors ${sig.visible ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-emerald-900'}`}
                      >
                        {sig.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center justify-between text-[8px] font-mono">
                         <span className="text-emerald-900">SOURCE:</span>
                         <span className="text-emerald-600 truncate max-w-[120px]">{sig.source}</span>
                      </div>
                      <div className="flex items-center justify-between text-[8px] font-mono">
                         <span className="text-emerald-900">RANGE:</span>
                         <span className="text-emerald-600">{sig.depthRange}</span>
                      </div>
                   </div>
                 </div>
               ))}
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-900/20">
               {showRemoteInput ? (
                 <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                   <div className="flex flex-col space-y-2 bg-slate-900 border border-emerald-500/30 rounded-lg p-3">
                     <div className="flex items-center space-x-2 text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">
                        <LinkIcon size={12} />
                        <span>Remote_Telemetry_URL</span>
                     </div>
                     <input 
                       type="text" 
                       placeholder="https://source.ndr/trace.las"
                       value={remoteUrl}
                       onChange={(e) => setRemoteUrl(e.target.value)}
                       className="bg-slate-950 border border-emerald-900/50 rounded px-3 py-2 text-[10px] text-emerald-100 outline-none w-full font-mono placeholder:text-emerald-900 focus:border-emerald-500 transition-all"
                     />
                     <div className="flex space-x-2 mt-2">
                        <button 
                           onClick={handleRemoteIngest}
                           disabled={isFetchingRemote || !remoteUrl}
                           className="flex-1 py-2.5 bg-emerald-500 text-slate-950 rounded font-black text-[9px] uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg"
                        >
                          {isFetchingRemote ? <Loader2 size={12} className="animate-spin" /> : <SendHorizontal size={12} />}
                          <span>Submit</span>
                        </button>
                        <button 
                          onClick={() => setShowRemoteInput(false)}
                          className="px-3 py-2.5 bg-slate-950 border border-emerald-900/50 text-emerald-800 rounded font-black text-[9px] uppercase tracking-widest hover:text-emerald-500 transition-all"
                        >
                           {/* Fix: Added missing X icon import */}
                           <X size={12} />
                        </button>
                     </div>
                   </div>
                 </div>
               ) : (
                 <button 
                    onClick={() => setShowRemoteInput(true)}
                    className="w-full py-3 bg-slate-900 border border-emerald-900/30 text-[10px] font-black text-emerald-800 uppercase tracking-widest hover:text-emerald-400 hover:border-emerald-500/50 transition-all flex items-center justify-center space-x-3 group"
                 >
                    <Globe size={14} className="group-hover:animate-pulse" />
                    <span>Fetch Remote Data</span>
                 </button>
               )}
            </div>
          </div>

          <div className="bg-slate-950/90 border border-emerald-900/30 rounded-xl p-5 space-y-5 shadow-2xl relative overflow-hidden group/elevation">
             <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover/elevation:opacity-20 transition-opacity">
                <MoveVertical size={48} className="text-emerald-500" />
             </div>
             
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                   <Sliders size={14} className="text-emerald-500" />
                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Elevation_Shift</span>
                </div>
                <span className={`text-[10px] font-terminal font-black ${Math.abs(offset) > CAUTION_LIMIT ? 'text-orange-500' : 'text-emerald-500'}`}>
                   {offset >= 0 ? '+' : ''}{offset.toFixed(3)}m
                </span>
             </div>

             <div className="flex space-x-1.5">
                <button onClick={() => handleOffsetChange(offset - 1.0)} className="flex-1 py-2 bg-slate-900 border border-emerald-900/30 text-emerald-800 hover:text-emerald-400 hover:border-emerald-500 rounded text-[9px] font-black transition-all">-1.0</button>
                <button onClick={() => handleOffsetChange(offset - 0.1)} className="flex-1 py-2 bg-slate-900 border border-emerald-900/30 text-emerald-800 hover:text-emerald-400 hover:border-emerald-500 rounded text-[9px] font-black transition-all">-0.1</button>
                <button onClick={() => setOffset(0)} title="Reset Alignment" className="px-4 py-2 bg-slate-900 border border-emerald-900/30 text-emerald-900 hover:text-emerald-400 rounded transition-all"><RotateCw size={12} /></button>
                <button onClick={() => handleOffsetChange(offset + 0.1)} className="flex-1 py-2 bg-slate-900 border border-emerald-900/30 text-emerald-800 hover:text-emerald-400 hover:border-emerald-500 rounded text-[9px] font-black transition-all">+0.1</button>
                <button onClick={() => handleOffsetChange(offset + 1.0)} className="flex-1 py-2 bg-slate-900 border border-emerald-900/30 text-emerald-800 hover:text-emerald-400 hover:border-emerald-500 rounded text-[9px] font-black transition-all">+1.0</button>
             </div>

             <div className="relative pt-2">
                <div className="absolute -top-1 left-0 right-0 flex justify-between text-[7px] font-black text-emerald-900 tracking-tighter uppercase px-1">
                   <span>-50m</span>
                   <span>Datum_0</span>
                   <span>+50m</span>
                </div>
                <input 
                   type="range" min={-HARD_LIMIT} max={HARD_LIMIT} step="0.01" value={offset} 
                   onChange={(e) => setOffset(parseFloat(e.target.value))}
                   className="w-full h-2 bg-slate-900 appearance-none rounded-full accent-emerald-500 cursor-pointer border border-emerald-900/10 shadow-inner"
                />
             </div>
          </div>
        </div>
        
        {/* Module B: Sync Monitor */}
        <div ref={chartContainerRef} className="flex-[2] bg-slate-950/80 rounded-xl border border-emerald-900/20 p-4 relative group overflow-hidden flex flex-col">
           <div className="absolute top-4 left-4 z-20 flex flex-col space-y-1">
              <div className="flex items-center space-x-2 bg-slate-900/90 border border-emerald-900/40 px-3 py-1 rounded">
                <Target size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Trace_Lock</span>
              </div>
              {validationError && (
                <div className="text-[8px] font-black text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-1 uppercase animate-in fade-in slide-in-from-left-2">
                  {validationError}
                </div>
              )}
           </div>

           <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={combinedData} layout="vertical">
                   <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.1} vertical={false} />
                   <XAxis type="number" stroke="#064e3b" fontSize={9} axisLine={false} tick={false} domain={['auto', 'auto']} />
                   <YAxis type="number" dataKey="depth" reversed domain={['auto', 'auto']} stroke="#10b981" fontSize={8} axisLine={{stroke: '#064e3b'}} tickLine={{stroke: '#064e3b'}} tick={{fill: '#064e3b', fontWeight: 'bold'}} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#020617', border: '1px solid #064e3b', fontSize: '9px', fontFamily: 'Fira Code' }}
                     itemStyle={{ textTransform: 'uppercase' }}
                     cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                   />
                   
                   {viewMode === 'DIFFERENTIAL' && (
                     <Area type="monotone" dataKey="diff" stroke="none" fill="#ef4444" fillOpacity={0.15} isAnimationActive={false} />
                   )}

                   {signals.find(s => s.id === 'SIG-001')?.visible && (
                     <Line type="monotone" dataKey="baseGR" stroke="#10b981" dot={false} strokeWidth={2.5} isAnimationActive={false} />
                   )}
                   {signals.find(s => s.id === 'SIG-002')?.visible && (
                     <Line type="monotone" dataKey="ghostGR" stroke="#FF5F1F" dot={false} strokeWidth={2.5} strokeDasharray="5 3" isAnimationActive={false} />
                   )}
                   {signals.map(sig => {
                     if (sig.id !== 'SIG-001' && sig.id !== 'SIG-002' && sig.visible) {
                       return (
                         <Line 
                           key={sig.id} 
                           type="monotone" 
                           dataKey={sig.id} 
                           stroke={sig.color} 
                           dot={false} 
                           strokeWidth={2} 
                           isAnimationActive={false} 
                         />
                       );
                     }
                     return null;
                   })}
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Module C: Delta Engine Sidebar */}
        <div className="w-72 flex flex-col space-y-3">
          <div className="bg-slate-950/90 border border-emerald-900/30 rounded-xl p-5 flex flex-col justify-between shadow-2xl">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Diagnostic_Result</span>
                <Cpu size={14} className="text-emerald-700" />
             </div>
             
             <div className="space-y-6">
                <div>
                   <div className="text-[9px] text-emerald-700 font-black uppercase mb-1">Datum_Discordance</div>
                   <div className={`text-4xl font-black font-terminal tracking-tighter ${Math.abs(offset) > CAUTION_LIMIT ? 'text-orange-500' : 'text-emerald-400'}`}>
                      {offset.toFixed(2)}m
                   </div>
                </div>

                <div>
                   <div className="flex items-center justify-between mb-1">
                      <div className="text-[9px] text-emerald-700 font-black uppercase">Sync_Quality</div>
                      <div className={`text-[10px] font-black ${correlationScore > 95 ? 'text-emerald-400' : 'text-orange-500'}`}>
                        {correlationScore.toFixed(1)}%
                      </div>
                   </div>
                   <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-emerald-900/20">
                      <div 
                        className={`h-full transition-all duration-500 ${correlationScore > 95 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-orange-500'}`} 
                        style={{ width: `${correlationScore}%` }}
                      ></div>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 flex flex-col overflow-hidden shadow-2xl">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Spectral_Entropy</span>
                <Activity size={12} className="text-emerald-700" />
             </div>
             <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={combinedData.filter((_, i) => i % 5 === 0)}>
                      <Bar dataKey="diff" fill={correlationScore > 90 ? "#10b98122" : "#ef444422"} stroke={correlationScore > 90 ? "#10b981" : "#ef4444"} strokeWidth={1} isAnimationActive={false} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>

      <div className={`p-2.5 rounded border flex items-center justify-between transition-all ${correlationScore > 95 ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-orange-500/5 border-orange-500/20'}`}>
         <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
               {correlationScore > 95 ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-orange-500 animate-pulse" />}
               <span className={`text-[10px] font-black uppercase tracking-widest ${correlationScore > 95 ? 'text-emerald-400' : 'text-orange-400'}`}>
                 {correlationScore > 95 ? 'Optimal_Sync_Achieved' : 'Discordance_Detected'}
               </span>
            </div>
            <div className="flex items-center space-x-2">
               <Hash size={12} className="text-emerald-900" />
               <span className="text-[9px] text-emerald-900 uppercase font-black">TRACE_GUID: LOCK_0XF</span>
            </div>
         </div>
         <div className="flex items-center space-x-2">
            <ScanLine size={12} className="text-emerald-900" />
            <span className="text-[8px] text-emerald-900 font-black uppercase">Datum_Verified_By_Brahan</span>
         </div>
      </div>

    </div>
  );
};

export default GhostSync;
