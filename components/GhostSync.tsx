import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart, Area, Tooltip, BarChart, Bar } from 'recharts';
import { MOCK_BASE_LOG, MOCK_GHOST_LOG } from '../constants';
import { 
  Download, Binary, Ghost, Loader2, Camera, ShieldCheck, Zap, 
  Video, VideoOff, Sliders, Play, RotateCw, CheckCircle2, 
  AlertTriangle, Search, Activity, ScanLine, Target, 
  Cpu, LayoutGrid, Info, ArrowLeftRight, ListFilter,
  Eye, EyeOff, Layers, Hash, Database
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
  const [viewMode, setViewMode] = useState<'OVERLAY' | 'DIFFERENTIAL'>('OVERLAY');
  const [correlationScore, setCorrelationScore] = useState(0);
  const [isShutterActive, setIsShutterActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

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

  const [baseLog] = useState<LogEntry[]>(MOCK_BASE_LOG);
  const [ghostLog] = useState<LogEntry[]>(MOCK_GHOST_LOG);

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
    return baseLog.map((base) => {
      const targetDepth = base.depth + offset;
      const ghostEntry = ghostLog.reduce((prev, curr) => 
        Math.abs(curr.depth - targetDepth) < Math.abs(prev.depth - targetDepth) ? curr : prev
      );
      const diff = Math.abs(base.gr - ghostEntry.gr);
      return { 
        depth: base.depth, 
        baseGR: base.gr, 
        ghostGR: ghostEntry.gr,
        diff: diff,
        absDiff: Math.abs(diff)
      };
    });
  }, [offset, baseLog, ghostLog]);

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

      {/* Modular Desktop Layout */}
      <div className="flex-1 min-h-0 flex space-x-3">
        
        {/* Module A: Signal Inventory Sidebar */}
        <div className="w-80 flex flex-col space-y-3">
          <div className="flex-1 bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-emerald-900/20 pb-2">
               <div className="flex items-center space-x-2">
                  <ListFilter size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Signal_Inventory</span>
               </div>
               <span className="text-[8px] font-mono text-emerald-900">VERIFIED: 0x22</span>
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
                         <div className={`w-1.5 h-1.5 rounded-full ${isAutoAligning ? 'animate-pulse bg-orange-500' : correlationScore > 95 ? 'bg-emerald-500' : 'bg-emerald-900'}`}></div>
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
                      <div className="flex items-center justify-between text-[8px] font-mono">
                         <span className="text-emerald-900">SAMPLES:</span>
                         <span className="text-emerald-600">{sig.samples} @ 0.5m</span>
                      </div>
                   </div>
                   
                   {isAutoAligning && (
                     <div className="mt-2 h-0.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 animate-[scanline_1s_infinite]"></div>
                     </div>
                   )}
                 </div>
               ))}
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-900/20">
               <button className="w-full py-2 bg-slate-900 border border-emerald-900/30 text-[9px] font-black text-emerald-800 uppercase tracking-widest hover:text-emerald-400 hover:border-emerald-500/50 transition-all flex items-center justify-center space-x-2 group">
                  <Database size={12} className="group-hover:animate-pulse" />
                  <span>Ingest_New_Curve</span>
               </button>
            </div>
          </div>

          <div className="bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 space-y-4">
             <div className="flex items-center space-x-2">
                <Sliders size={12} className="text-emerald-700" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Micro_Shifter</span>
             </div>
             <div className="flex space-x-2">
                <button onClick={() => handleOffsetChange(offset - 0.01)} className="flex-1 py-2 bg-slate-900 border border-emerald-900/30 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 rounded text-xs transition-all">-0.01</button>
                <button onClick={() => setOffset(0)} className="px-4 py-2 bg-slate-900 border border-emerald-900/30 text-emerald-800 hover:text-emerald-400 rounded text-[9px] font-black uppercase"><RotateCw size={12} /></button>
                <button onClick={() => handleOffsetChange(offset + 0.01)} className="flex-1 py-2 bg-slate-900 border border-emerald-900/30 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 rounded text-xs transition-all">+0.01</button>
             </div>
             <input 
                type="range" min={-HARD_LIMIT} max={HARD_LIMIT} step="0.1" value={offset} 
                onChange={(e) => setOffset(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-900 appearance-none rounded-full accent-emerald-500 cursor-pointer"
             />
          </div>
        </div>
        
        {/* Module B: Sync Monitor */}
        <div className="flex-[2] bg-slate-950/80 rounded-xl border border-emerald-900/20 p-4 relative group overflow-hidden flex flex-col">
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

           {isAutoAligning && (
             <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-emerald-500/5 backdrop-blur-[1px]">
                <div className="w-full h-px bg-emerald-500/40 animate-[scanline_1s_infinite] shadow-[0_0_15px_#10b981]"></div>
                <div className="text-[10px] font-black text-emerald-400 mt-4 tracking-[1em] animate-pulse uppercase">Syncing_Vectors</div>
             </div>
           )}

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
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Module C: Delta Engine Sidebar */}
        <div className="w-72 flex flex-col space-y-3">
          
          {/* Sync Stats Module */}
          <div className="bg-slate-950/90 border border-emerald-900/30 rounded-xl p-5 flex flex-col justify-between">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Diagnostic_Result</span>
                <Cpu size={14} className="text-emerald-700" />
             </div>
             
             <div className="space-y-6">
                <div>
                   <div className="text-[9px] text-emerald-700 font-black uppercase mb-1">Offset_Shift</div>
                   <div className="text-4xl font-black text-emerald-400 font-terminal tracking-tighter">{offset.toFixed(2)}m</div>
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

          {/* Discordance Meter */}
          <div className="flex-1 bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 flex flex-col overflow-hidden">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Delta_Engine</span>
                <Activity size={12} className="text-emerald-700" />
             </div>
             <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={combinedData.filter((_, i) => i % 5 === 0)}>
                      <Bar dataKey="absDiff" fill={correlationScore > 90 ? "#10b98122" : "#ef444422"} stroke={correlationScore > 90 ? "#10b981" : "#ef4444"} strokeWidth={1} isAnimationActive={false} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-2 text-center">
                <span className="text-[8px] font-black text-emerald-900 uppercase tracking-tighter">Gap_Magnitude_Distribution</span>
             </div>
          </div>

        </div>
      </div>

      {/* Footer Alert Bar */}
      <div className={`p-2.5 rounded border flex items-center justify-between transition-all ${correlationScore > 95 ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-orange-500/5 border-orange-500/20'}`}>
         <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
               {correlationScore > 95 ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-orange-500 animate-pulse" />}
               <span className={`text-[10px] font-black uppercase tracking-widest ${correlationScore > 95 ? 'text-emerald-400' : 'text-orange-400'}`}>
                 {correlationScore > 95 ? 'Optimal_Sync_Achieved' : 'Discordance_Detected'}
               </span>
            </div>
            <div className="h-4 w-px bg-emerald-900/30"></div>
            <div className="flex items-center space-x-2">
               <Hash size={12} className="text-emerald-900" />
               <span className="text-[9px] text-emerald-900 uppercase font-black">TRACE_GUID: {signals[1].id}_LOCK_0XF</span>
            </div>
         </div>
         <div className="flex items-center space-x-4">
            <span className="text-[9px] text-emerald-900 font-mono tracking-tighter">STATUS: {isAutoAligning ? 'COMPUTING' : 'VALID'}</span>
            <button className="p-1 text-emerald-900 hover:text-emerald-400 transition-colors"><Info size={14} /></button>
         </div>
      </div>

    </div>
  );
};

export default GhostSync;