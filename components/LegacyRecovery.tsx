import React, { useState, useMemo } from 'react';
import { 
  Zap, TrendingUp, Search, Layers, Coins, 
  AlertCircle, ShieldCheck, Database, Target,
  ArrowRightLeft, Sparkles, Activity, RefreshCw,
  Droplet, Beaker, Crosshair, Binary, Eye,
  ArrowDownToLine, MoveDown, Info, ChevronRight,
  Shield, Waves, Anchor, Loader2, Lock, Unlock,
  Activity as Waveform, ShieldAlert, AlertOctagon,
  Skull, FileWarning, EyeOff
} from 'lucide-react';

const LegacyRecovery: React.FC = () => {
  const [isCorrected, setIsCorrected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [seismicVeto, setSeismicVeto] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = () => {
    if (isCorrected) {
      setIsCorrected(false);
      return;
    }
    
    setIsSyncing(true);
    // Simulate a high-intensity forensic sync process
    setTimeout(() => {
      setIsCorrected(true);
      setIsSyncing(false);
    }, 1200);
  };

  // Generate trace points for the Gamma Ray curve (The Well Truth)
  const wellTruthPoints = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      const isPeakZone = i > 45 && i < 65;
      const baseValue = isPeakZone ? 75 : 25;
      const noise = Math.random() * 8;
      return { x: baseValue + noise, y: i * 3 };
    });
  }, []);

  // Generate legacy seismic trace points (The Contradiction)
  // This trace is purposely "stretched" and offset to show the error
  const legacySeismicPoints = useMemo(() => {
    return wellTruthPoints.map((p, i) => {
      // Shift the peak zone upwards and compress it (simulating velocity push-down error)
      const offset = Math.sin(i * 0.1) * 15;
      return {
        x: p.x + offset + (i > 30 && i < 50 ? 30 : 0),
        y: p.y - 40 // Offset the entire trace vertically
      };
    });
  }, [wellTruthPoints]);

  const wellTruthPath = useMemo(() => {
    return `M ${wellTruthPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  }, [wellTruthPoints]);

  const legacySeismicPath = useMemo(() => {
    return `M ${legacySeismicPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  }, [legacySeismicPoints]);

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      {/* Background HUD Decorations */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Waves size={400} className="text-emerald-500 animate-pulse" />
      </div>

      <div id="legacy-recovery" className="flex flex-col space-y-6 max-w-6xl mx-auto w-full relative z-10 h-full">
        
        {/* Module Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/30 pb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded shadow-lg shadow-emerald-500/5">
              <Anchor size={24} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">>>> MODULE_LOAD: OFFSHORE_PAY_RECOVERY (NOPIMS)</h2>
              <p className="text-xs text-emerald-800 font-black uppercase tracking-[0.4em]">Target: Carnarvon Basin // Anomaly: Velocity Push-Down</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-right">
             <div className="flex flex-col">
                <span className="text-[8px] text-emerald-900 uppercase font-black">Audit_Veto_Status</span>
                <span className={`text-xl font-black transition-all ${seismicVeto ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                  {seismicVeto ? 'CONFLICT_DETECTED' : 'DATUM_NOMINAL'}
                </span>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] text-emerald-900 uppercase font-black">Potential_Recovery</span>
                <span className="text-xl font-black text-emerald-500">1.2M BBLS</span>
             </div>
          </div>
        </div>

        {/* Main Interface Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0 overflow-hidden">
          
          {/* Left Column: Forensic Intel & Controls */}
          <div className="lg:col-span-1 flex flex-col space-y-4">
            {/* Card 1: The Glitch - Forensic Snap Visualizer */}
            <div className={`glass-panel p-5 rounded-lg border transition-all duration-500 ${seismicVeto ? 'border-red-500/40 bg-red-950/10 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-amber-900/40 bg-slate-900/60'}`}>
              <div className="absolute top-0 right-0 p-2 opacity-10">
                {seismicVeto ? <ShieldAlert size={32} className="text-red-500 animate-pulse" /> : <AlertCircle size={32} className="text-amber-500" />}
              </div>
              <h3 className={`text-[10px] font-black mb-3 uppercase tracking-widest flex items-center ${seismicVeto ? 'text-red-500' : 'text-amber-500'}`}>
                <Layers size={14} className="mr-2" /> Data Card 1: The Glitch
              </h3>
              
              <div className="p-4 bg-slate-950/90 rounded-md border border-amber-900/20 font-mono text-[9px] leading-tight relative h-64 overflow-hidden mb-4 shadow-inner group">
                <div className={`mb-4 text-[7px] uppercase font-black border-b pb-1 flex justify-between ${seismicVeto ? 'text-red-500 border-red-900/20' : 'text-amber-900 border-amber-900/10'}`}>
                  <span>>> DATUM_ERROR_MAP</span>
                  {isSyncing && <span className="animate-pulse text-emerald-500">REALIGNING...</span>}
                  {seismicVeto && <span className="animate-pulse text-red-500 uppercase tracking-tighter">VETO_ACTIVE</span>}
                </div>
                
                <div className="relative h-44">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
                    {[...Array(8)].map((_, i) => <div key={i} className={`w-full h-px ${seismicVeto ? 'bg-red-500' : 'bg-amber-500'}`}></div>)}
                  </div>

                  {/* High-speed Scanner Beam */}
                  {isSyncing && (
                    <div className="absolute inset-x-0 h-10 bg-emerald-500/10 border-y border-emerald-500/40 z-50 animate-scanner-beam pointer-events-none shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
                  )}

                  {/* Well Truth Reference Line */}
                  <div className={`absolute top-1/4 w-full transition-all duration-1000 z-40 ${isCorrected ? (seismicVeto ? 'text-red-500' : 'text-emerald-400') : 'text-emerald-900/20'}`}>
                    <div className="flex items-center space-x-2">
                       <div className={`h-0.5 flex-1 bg-current transition-all duration-500 ${isCorrected ? 'shadow-[0_0_15px_currentColor]' : ''}`}></div>
                       <span className={`font-black bg-slate-950 px-1 transition-all ${isCorrected ? 'scale-110' : 'opacity-40'}`}>REF: 8500ft</span>
                    </div>
                  </div>

                  {/* Actual Depth Line */}
                  <div 
                    className={`absolute w-full z-40 transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${
                      isCorrected 
                        ? 'top-1/4' 
                        : 'top-[calc(25%+80px)]'
                    } ${isCorrected ? (seismicVeto ? 'text-red-500' : 'text-emerald-400') : 'text-amber-500'}`}
                  >
                    <div className="flex items-center space-x-2 relative">
                       <div className={`h-0.5 flex-1 bg-current transition-shadow duration-500 ${isCorrected ? 'animate-snap-flash' : 'shadow-[0_0_8px_currentColor] opacity-90'}`}></div>
                       <span className="font-black bg-slate-950 px-1">
                         {isCorrected ? "LOCKED: 8500'" : "GHOST: 8512.4'"}
                       </span>
                    </div>
                  </div>

                  {/* Seismic Veto Divergence Line (Shown when veto active) */}
                  {seismicVeto && (
                    <div className="absolute top-[calc(25%-30px)] w-full text-red-600/60 z-30 animate-in fade-in duration-500">
                      <div className="flex items-center space-x-2">
                        <div className="h-0.5 flex-1 bg-red-600/30 border-b border-dashed border-red-600/60"></div>
                        <span className="font-black bg-slate-950 px-1 text-[8px]">LEGACY_SEISMIC: 8488'</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center border-t border-amber-900/10 pt-2">
                  <div className={`text-[7px] font-mono transition-colors ${isCorrected ? (seismicVeto ? 'text-red-700' : 'text-emerald-700') : 'text-slate-700 italic'}`}>
                    {isCorrected ? (seismicVeto ? "CONTRADICTION: -12ft" : "RESIDUAL: 0.00") : "UNCERTAINTY: HIGH"}
                  </div>
                  <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-all ${
                    isCorrected 
                      ? (seismicVeto ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-slate-950') 
                      : 'text-amber-700 bg-amber-500/5'
                  }`}>
                    {isSyncing ? "REALIGNING..." : isCorrected ? (seismicVeto ? ">>> VETOED" : ">>> VERIFIED") : ">>> DISCORDANT"}
                  </div>
                </div>
              </div>

              <p className={`text-[9px] leading-relaxed font-mono transition-colors ${seismicVeto ? 'text-red-200/70' : 'text-amber-200/70'}`}>
                {seismicVeto 
                  ? "VETO_REASON: Seismic interpretation is physically impossible. Velocity model fails to account for gas cloud sag. Legacy data contradicts the 'Author Truth' artifacts."
                  : "CRITICAL: Gas cloud velocity attenuation identified. Legacy interpretation failed to account for vertical stretch, missing the target reservoir by 12.4ft."}
              </p>
            </div>

            {/* Toggle Controls */}
            <div className="glass-panel p-5 rounded-lg border border-emerald-900/40 bg-slate-900/80 flex flex-col space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Forensic_Engine</span>
                <RefreshCw size={14} className={`text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
              </div>
              
              <button 
                onClick={handleToggle}
                disabled={isSyncing}
                className={`w-full py-4 rounded font-black text-[10px] uppercase tracking-[0.3em] transition-all border ${
                  isCorrected 
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
                }`}
              >
                {isSyncing ? "PROCESSING_TIE..." : isCorrected ? "DISCONNECT_VAULT" : "INITIATE_BRAHAN_SYNC"}
              </button>

              <button 
                onClick={() => setSeismicVeto(!seismicVeto)}
                className={`w-full py-4 rounded font-black text-[10px] uppercase tracking-[0.3em] transition-all border flex items-center justify-center gap-3 relative overflow-hidden group ${
                  seismicVeto 
                    ? 'bg-red-500 text-white border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.5)] scale-105' 
                    : 'bg-slate-900 text-red-500 border-red-900/40 hover:bg-red-900/10'
                }`}
              >
                <ShieldAlert size={18} className={seismicVeto ? 'animate-pulse' : ''} />
                <span className="relative z-10">{seismicVeto ? "DEACTIVATE_VETO" : "ACTIVATE_SEISMIC_VETO"}</span>
                {seismicVeto && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan-horizontal"></div>
                )}
              </button>

              <div className={`p-3 rounded border transition-all ${seismicVeto ? 'bg-red-950/20 border-red-500/30' : 'bg-slate-950 border-emerald-900/20'}`}>
                <div className="flex items-center space-x-2 mb-2">
                   <Binary size={12} className={seismicVeto ? 'text-red-500' : 'text-emerald-500'} />
                   <span className={`text-[8px] font-black uppercase ${seismicVeto ? 'text-red-800' : 'text-emerald-700'}`}>Archive_State</span>
                </div>
                <div className={`text-[10px] font-black uppercase flex items-center space-x-2 ${seismicVeto ? 'text-red-500 animate-glitch' : isCorrected ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}`}>
                  {seismicVeto ? <Skull size={12} /> : isCorrected ? <Lock size={12} /> : <Unlock size={12} />}
                  <span>{seismicVeto ? "SEISMIC_DATA_INVALID" : isCorrected ? "TIE_LOCKED_STABLE" : "DATUM_UNSTABLE"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: The Forensic Log Visualizer (Main SVG) */}
          <div 
            className="lg:col-span-2 glass-panel rounded-lg bg-slate-950 border border-emerald-900/40 relative overflow-hidden flex flex-col p-4 shadow-2xl group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Visualizer HUD Overlay */}
            <div className="absolute top-6 left-6 z-20 space-y-2">
              <div className={`flex items-center space-x-2 border px-3 py-1.5 rounded shadow-xl transition-colors ${seismicVeto ? 'bg-red-900/90 border-red-500/50' : 'bg-slate-900/90 border-emerald-500/30'}`}>
                 {seismicVeto ? <ShieldAlert size={14} className="text-white animate-pulse" /> : <Crosshair size={14} className={`text-emerald-500 ${isCorrected ? 'animate-pulse' : ''}`} />}
                 <span className={`text-[9px] font-black uppercase tracking-widest ${seismicVeto ? 'text-white' : 'text-emerald-400'}`}>
                   {seismicVeto ? 'CONTRADICTION_IDENTIFIED' : 'NOPIMS_Forensic_Visualizer'}
                 </span>
              </div>
              
              {seismicVeto ? (
                <div className="flex bg-slate-950/80 border border-red-500/40 p-2 rounded-lg animate-in slide-in-from-left-2 duration-500">
                  <div className="flex flex-col gap-1">
                    <span className="text-[7px] text-red-500 font-black uppercase tracking-widest">Seismic_Veto_Protocol: ACTIVE</span>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>
                          <span className="text-[8px] text-emerald-100 uppercase font-bold tracking-tighter">Sovereign_Truth</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-600 border border-dashed border-white shadow-[0_0_5px_#ef4444] animate-pulse"></div>
                          <span className="text-[8px] text-red-400 uppercase font-bold tracking-tighter">Legacy_Fiction</span>
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 animate-in fade-in">
                   <div className="flex items-center space-x-1.5 bg-slate-950/80 px-2 py-1 rounded border border-emerald-900/40">
                     <div className="w-2 h-2 bg-slate-700"></div>
                     <span className="text-[7px] text-emerald-900 font-black uppercase">SHALE</span>
                   </div>
                   <div className="flex items-center space-x-1.5 bg-slate-950/80 px-2 py-1 rounded border border-emerald-900/40">
                     <div className="w-2 h-2 bg-emerald-500/20 border border-emerald-500/40"></div>
                     <span className="text-[7px] text-emerald-900 font-black uppercase">MUNGAROO_SAND</span>
                   </div>
                </div>
              )}
            </div>

            {/* Depth Markers */}
            <div className="absolute top-0 left-0 bottom-0 w-16 border-r border-emerald-900/20 flex flex-col justify-between items-center py-20 text-[9px] font-black text-emerald-900 bg-slate-950/40 z-10 pointer-events-none">
              <span>8480ft</span>
              <span className={`transition-all duration-700 ${!isCorrected ? 'text-amber-500 scale-125' : 'text-emerald-900'}`}>8500ft</span>
              <span className={`transition-all duration-700 ${isCorrected ? 'text-emerald-400 scale-125 font-bold' : 'text-emerald-900'}`}>8512ft</span>
              <span>8530ft</span>
              <span>8550ft</span>
              <span>8570ft</span>
            </div>

            {/* The Track Canvas */}
            <div className={`flex-1 relative transition-all duration-300 ${isSyncing ? 'blur-[1px] grayscale' : ''}`}>
              <svg width="100%" height="100%" viewBox="0 0 400 360" className="overflow-visible">
                {/* Track Boundaries */}
                <rect x="150" y="0" width="100" height="360" fill="rgba(16,185,129,0.02)" stroke="#064e3b" strokeWidth="1" strokeDasharray="5 5" />
                
                {/* Lithology & Curve Group - Shifts DOWN by 12.4 feet */}
                <g className="transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)" style={{ transform: `translateY(${isCorrected ? '38px' : '0px'})` }}>
                  
                  {/* Shale Zone */}
                  <rect x="150" y="0" width="100" height="135" fill="rgba(15, 23, 42, 0.4)" />
                  
                  {/* The Target Sand Package */}
                  <rect 
                    x="150" y="135" width="100" height="60" 
                    fill={isCorrected ? "rgba(16,185,129,0.15)" : "rgba(255,176,0,0.1)"} 
                    className="transition-colors duration-500" 
                  />
                  
                  <text x="260" y="165" fill={isCorrected ? "#10b981" : "#ffb000"} fontSize="10" fontWeight="900" className={`font-mono uppercase tracking-widest`}>
                    {isCorrected ? ">>> WELL_TRUTH" : ">>> VELOCITY_ERR"}
                  </text>

                  {/* Gamma Ray Curve (Well Truth) */}
                  <path 
                    d={wellTruthPath} 
                    fill="none" 
                    stroke={isCorrected ? "#10b981" : "#ffb000"} 
                    strokeWidth={isHovered ? 4 : 2.5} 
                    className={`transition-all duration-500 ${isHovered ? 'animate-path-flow' : ''}`}
                    style={{ 
                      filter: isCorrected 
                        ? `drop-shadow(0 0 ${isHovered ? '12px' : '5px'} #10b981)` 
                        : `drop-shadow(0 0 ${isHovered ? '12px' : '5px'} #ffb000)` 
                    }}
                  />
                  
                  {/* Legacy Seismic Trace (The Contradiction) */}
                  {seismicVeto && (
                    <g className="animate-in fade-in duration-1000">
                       <path 
                        d={legacySeismicPath} 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        strokeDasharray="4 2"
                        className="animate-glitch-jitter"
                        style={{ filter: 'drop-shadow(0 0 5px #ef4444)' }}
                      />
                      <text x="260" y="125" fill="#ef4444" fontSize="9" fontWeight="900" className="font-mono uppercase italic animate-pulse">
                        !! SEISMIC_CONFLICT !!
                      </text>
                    </g>
                  )}
                </g>

                {/* FIXED HARDWARE OVERLAY */}
                <g transform="translate(200, 150)">
                   <line x1="-150" y1="0" x2="150" y2="0" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 2" opacity="0.4" />
                   <text x="-90" y="-15" fill="#ef4444" fontSize="8" fontWeight="900" className="font-mono">1985_RANKIN_PERFS [8500ft]</text>
                   <path d="M -8,-8 L 8,8 M 8,-8 L -8,8" stroke="#ef4444" strokeWidth={3} />
                   <circle r="12" fill="none" stroke="#ef4444" strokeWidth={1} className="animate-pulse" />

                   {isCorrected && (
                     <g className="animate-in fade-in zoom-in duration-500 delay-300">
                        <text x="35" y="5" fill="#ef4444" fontSize="10" fontWeight="900" className="font-mono uppercase tracking-tighter">! MISSED_TARGET !</text>
                        <text x="35" y="18" fill="#ef4444" fontSize="7" fontWeight="bold" className="font-mono uppercase">PERFORATED_SHALE_BARRIER</text>
                     </g>
                   )}
                </g>

                {/* New Target Marker */}
                {isCorrected && !seismicVeto && (
                  <g transform="translate(200, 188)" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                     <rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" />
                     <text x="35" y="4" fill="#10b981" fontSize="11" fontWeight="900" className="font-mono uppercase tracking-[0.2em]"> [O] NEW_TGT: 8,512ft</text>
                     <circle r="4" fill="#10b981" className="animate-ping" />
                  </g>
                )}

                {/* VETO ALERT BLOCKER */}
                {seismicVeto && (
                  <g transform="translate(200, 188)" className="animate-in zoom-in duration-500">
                    <rect x="-20" y="-20" width="40" height="40" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 2" />
                    <line x1="-20" y1="-20" x2="20" y2="20" stroke="#ef4444" strokeWidth="2" />
                    <line x1="20" y1="-20" x2="-20" y2="20" stroke="#ef4444" strokeWidth="2" />
                    <text x="35" y="4" fill="#ef4444" fontSize="11" fontWeight="900" className="font-mono uppercase tracking-[0.2em] shadow-lg animate-pulse"> VETO_LOCKED_ZONE </text>
                    <text x="35" y="16" fill="#ef4444" fontSize="8" fontWeight="bold" className="font-mono uppercase"> CONTRADICTORY_EVIDENCE </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Visualizer Footer Stats */}
            <div className={`mt-4 flex items-center justify-between text-[8px] font-black uppercase tracking-widest border-t pt-3 transition-colors ${seismicVeto ? 'text-red-500 border-red-900/30' : 'text-emerald-900 border-emerald-900/20'}`}>
               <div className="flex items-center space-x-6">
                  <span className="flex items-center space-x-1"><Waveform size={10} /> <span>TRACE: CARNARVON_V2</span></span>
                  <span className="flex items-center space-x-1"><Eye size={10} /> <span>VIEW: {seismicVeto ? "CONTRADICTION_MAP" : isCorrected ? "WELL_TRUTH" : "SEISMIC_GHOST"}</span></span>
               </div>
               <span className="font-mono">|||||.....|||||||||| [ {seismicVeto ? "VETO_PROTOCOL_ACTIVE" : isCorrected ? "TIE_LOCKED" : "READY"} ]</span>
            </div>
          </div>

          {/* Right Column: State Metrics */}
          <div className="lg:col-span-1 flex flex-col space-y-4">
            
            {/* The Analysis Metrics Card */}
            <div className={`glass-panel p-6 rounded-lg border transition-all duration-500 ${seismicVeto ? 'border-red-500/40 bg-red-900/5 shadow-2xl' : isCorrected ? 'border-emerald-500/40 bg-slate-900' : 'border-amber-900/40 bg-slate-950 opacity-80'}`}>
              <h3 className={`text-[10px] font-black mb-6 uppercase tracking-widest flex items-center ${seismicVeto ? 'text-red-500' : isCorrected ? 'text-emerald-400' : 'text-amber-500'}`}>
                <Activity size={16} className="mr-2" /> Data Card 2: Forensic Logic
              </h3>
              
              <div className="space-y-6">
                <div>
                   <span className={`text-[8px] uppercase font-black block mb-2 ${seismicVeto ? 'text-red-900' : 'text-emerald-900'}`}>Target_Basin_Analysis</span>
                   <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded border font-black text-xs uppercase tracking-tighter transition-all ${
                        seismicVeto
                          ? 'bg-red-600 text-white border-red-400 shadow-[0_0_15px_#ef4444] animate-bounce-subtle'
                          : isCorrected 
                            ? 'bg-red-500/20 text-red-500 border-red-500/40' 
                            : 'bg-slate-900 text-amber-500 border-amber-900/50'
                      }`}>
                        {seismicVeto ? "VETO_ISSUED: DATA_FRAUD" : isCorrected ? "MISS: SHALE_PLUG" : "HIT: TARGET_SEISMIC"}
                      </div>
                      <span className={`text-[9px] font-mono italic transition-colors ${seismicVeto ? 'text-red-500 font-bold' : isCorrected ? 'text-emerald-700' : 'text-emerald-700'}`}>
                        {seismicVeto ? "PHYSICAL_IMPOSSIBILITY" : isCorrected ? "Impermeable" : "False Positive"}
                      </span>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className={`p-3 rounded border transition-all ${seismicVeto ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-950 border-emerald-900/10'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[8px] font-black uppercase tracking-widest ${seismicVeto ? 'text-red-900' : 'text-emerald-900'}`}>Contradiction_Magnitude</span>
                      <ShieldAlert size={12} className={seismicVeto ? 'text-red-500' : 'text-emerald-950'} />
                    </div>
                    <div className={`text-2xl font-black font-terminal transition-all ${seismicVeto ? 'text-red-500' : 'text-emerald-900'}`}>
                      {seismicVeto ? "4.8m OFFSET" : "--%"}
                    </div>
                  </div>

                  <div className={`p-3 rounded border transition-all ${seismicVeto ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-950 border-emerald-900/10'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[8px] font-black uppercase tracking-widest ${seismicVeto ? 'text-red-900' : 'text-emerald-900'}`}>Seismic_Trust_Score</span>
                      <Target size={12} className={seismicVeto ? 'text-red-500' : 'text-emerald-900' } />
                    </div>
                    <div className={`text-2xl font-black font-terminal transition-all ${seismicVeto ? 'text-red-500 animate-pulse' : isCorrected ? 'text-emerald-400' : 'text-emerald-900'}`}>
                      {seismicVeto ? "0.08%" : isCorrected ? "98.4%" : "01.2%"}
                    </div>
                  </div>
                </div>

                {seismicVeto && (
                  <div className="p-4 bg-red-600/10 border-l-4 border-red-600 rounded-r shadow-xl animate-in zoom-in duration-300">
                     <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <FileWarning size={14} /> SOVEREIGN_VETO_DOCKET
                     </span>
                     <p className="text-[9px] text-red-200/80 leading-tight font-mono">
                        Seismic artifact #NOP-442 is rejected. Depth discordance exceeds permissible threshold. Re-completion at 8,512ft is the only valid physical truth.
                     </p>
                  </div>
                )}
              </div>
            </div>

            {/* System Info */}
            <div className={`glass-panel p-4 rounded-lg border transition-all ${seismicVeto ? 'border-red-900/40 bg-red-950/20' : 'border-emerald-900/40 bg-slate-950/90'} text-[8px] space-y-2 opacity-60`}>
               <div className={`flex items-center space-x-2 font-black mb-1 ${seismicVeto ? 'text-red-500' : 'text-emerald-500'}`}>
                 {seismicVeto ? <Skull size={12} /> : <Binary size={12} />}
                 <span>{seismicVeto ? "VETO_LOCKED_KERNEL" : "VELOCITY_TIE_LOG"}</span>
               </div>
               <p className={`font-mono leading-tight ${seismicVeto ? 'text-red-700' : 'text-emerald-700'}`}>
                {">"} {seismicVeto ? "DISCARDING_LEGAL_SEISMIC..." : "SCANNING_NOPIMS_ARCHIVE..."}<br/>
                {">"} {isCorrected ? (seismicVeto ? "VETO_OVERRIDE_ACTIVE" : "VELOCITY_VETO: TIE_LOCKED") : "WAITING_FOR_USER_VETO"}<br/>
                {">"} CHANNEL_ID: MUNGAROO_A7_OFFSHORE
               </p>
            </div>
          </div>

        </div>

        {/* Global Module Footer */}
        <div className="pt-4 border-t border-emerald-900/20 flex items-center justify-between text-[8px] font-black text-emerald-900 uppercase tracking-[0.2em] mt-auto">
           <div className="flex items-center space-x-6">
              <span className="flex items-center space-x-2">
                <Database size={12} />
                <span>NOPIMS_FED_AUTH</span>
              </span>
              <span className={`flex items-center space-x-2 ${seismicVeto ? 'text-red-500' : ''}`}>
                <Target size={12} />
                <span>DATUM_LOCK: RANKIN_12</span>
              </span>
           </div>
           <div className="flex items-center space-x-4">
              <span className={seismicVeto ? 'text-red-600 animate-pulse' : 'text-emerald-950'}>
                {seismicVeto ? 'SEISMIC_VETO_SYSTEM_ACTIVE' : 'OFFSHORE_RECOVERY_HUB'}
              </span>
              <div className="flex items-center space-x-1">
                 <div className={`w-1 h-1 rounded-full ${seismicVeto ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-ping'}`}></div>
                 <div className={`w-1 h-1 rounded-full ${seismicVeto ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              </div>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-path-flow {
          stroke-dasharray: 20, 10;
          animation: path-flow-anim 1.5s linear infinite;
        }
        @keyframes path-flow-anim {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes scan-horizontal {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scan-horizontal {
          animation: scan-horizontal 2s linear infinite;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        @keyframes glitch-jitter {
          0% { transform: translate(0, 0); opacity: 0.6; }
          25% { transform: translate(1px, -1px); opacity: 0.8; }
          50% { transform: translate(-1px, 1px); opacity: 0.6; }
          75% { transform: translate(1px, 1px); opacity: 0.8; }
          100% { transform: translate(0, 0); opacity: 0.6; }
        }
        .animate-glitch-jitter {
          animation: glitch-jitter 0.15s linear infinite;
        }
      `}} />
    </div>
  );
};

export default LegacyRecovery;
