
import React, { useState, useMemo } from 'react';
import { 
  Zap, TrendingUp, Search, Layers, Coins, 
  AlertCircle, ShieldCheck, Database, Target,
  ArrowRightLeft, Sparkles, Activity, RefreshCw,
  Droplet, Beaker, Crosshair, Binary, Eye,
  ArrowDownToLine, MoveDown, Info, ChevronRight,
  Shield, Waves, Anchor, Loader2, Lock, Unlock,
  Activity as Waveform
} from 'lucide-react';

const LegacyRecovery: React.FC = () => {
  const [isCorrected, setIsCorrected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  // Generate trace points for the Gamma Ray curve
  const curvePoints = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      // Create a prominent sand package (high GR deflection)
      const isPeakZone = i > 45 && i < 65;
      const baseValue = isPeakZone ? 75 : 25;
      const noise = Math.random() * 10;
      return {
        x: baseValue + noise,
        y: i * 3
      };
    });
  }, []);

  const curvePath = useMemo(() => {
    return `M ${curvePoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  }, [curvePoints]);

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
              <Anchor size={24} className="text-emerald-400 animate-bounce-slow" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">>>> MODULE_LOAD: OFFSHORE_PAY_RECOVERY (NOPIMS)</h2>
              <p className="text-xs text-emerald-800 font-black uppercase tracking-[0.4em]">Target: Carnarvon Basin // Anomaly: Velocity Push-Down</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-right">
             <div className="flex flex-col">
                <span className="text-[8px] text-emerald-900 uppercase font-black">Seismic_Veto_Auth</span>
                <span className="text-xl font-black text-emerald-500">NOPIMS_VALID</span>
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
            <div className="glass-panel p-5 rounded-lg border border-amber-900/40 bg-slate-900/60 relative overflow-hidden h-fit">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <AlertCircle size={32} className="text-amber-500" />
              </div>
              <h3 className="text-[10px] font-black text-amber-500 mb-3 uppercase tracking-widest flex items-center">
                <Layers size={14} className="mr-2" /> Data Card 1: The Glitch
              </h3>
              
              <div className="p-4 bg-slate-950/90 rounded-md border border-amber-900/20 font-mono text-[9px] leading-tight relative h-64 overflow-hidden mb-4 shadow-inner group">
                <div className="mb-4 text-amber-900 text-[7px] uppercase font-black border-b border-amber-900/10 pb-1 flex justify-between">
                  <span>>> DATUM_ERROR_MAP</span>
                  {isSyncing && <span className="animate-pulse text-emerald-500">REALIGNING...</span>}
                </div>
                
                <div className="relative h-44">
                  {/* Grid Lines for scale */}
                  <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
                    {[...Array(8)].map((_, i) => <div key={i} className="w-full h-px bg-amber-500"></div>)}
                  </div>

                  {/* High-speed Scanner Beam (Only active during sync) */}
                  {isSyncing && (
                    <div className="absolute inset-x-0 h-10 bg-emerald-500/10 border-y border-emerald-500/40 z-50 animate-scanner-beam pointer-events-none shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
                  )}

                  {/* Target Depth Line (The fixed emerald reference) */}
                  <div className={`absolute top-1/4 w-full transition-all duration-1000 z-40 ${isCorrected ? 'text-emerald-400' : 'text-emerald-900/20'}`}>
                    <div className="flex items-center space-x-2">
                       <div className={`h-0.5 flex-1 bg-current transition-all duration-500 ${isCorrected ? 'shadow-[0_0_15px_#10b981]' : ''}`}></div>
                       <span className={`font-black bg-slate-950 px-1 transition-all ${isCorrected ? 'scale-110' : 'opacity-40'}`}>REF: 8500'</span>
                    </div>
                  </div>

                  {/* Measurement Error Bracket (Red) */}
                  <div 
                    className={`absolute left-6 w-1 bg-red-500/20 transition-all duration-[1200ms] ease-in-out z-30 ${
                      isCorrected ? 'h-0 top-1/4 opacity-0' : 'h-20 top-1/4 opacity-100'
                    }`}
                  >
                    <div className="absolute top-1/2 left-3 -translate-y-1/2 whitespace-nowrap text-[7px] font-black text-red-500 uppercase tracking-tighter flex items-center">
                       <ArrowRightLeft size={8} className="mr-1 rotate-90" /> DELTA: 12.4'
                    </div>
                    {/* Tick marks for bracket */}
                    <div className="absolute top-0 right-0 w-2 h-px bg-red-500/40"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-px bg-red-500/40"></div>
                  </div>

                  {/* Actual Depth Line (The "Ghost" that snaps) */}
                  <div 
                    className={`absolute w-full z-40 transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${
                      isCorrected 
                        ? 'top-1/4 text-emerald-400' 
                        : 'top-[calc(25%+80px)] text-amber-500'
                    } ${isSyncing ? 'animate-glitch-vibrate' : ''}`}
                  >
                    <div className="flex items-center space-x-2 relative">
                       {/* Subtle flickering ghost line when not corrected */}
                       {!isCorrected && !isSyncing && (
                         <div className="absolute inset-0 h-0.5 bg-amber-500/10 blur-sm animate-pulse"></div>
                       )}
                       
                       <div className={`h-0.5 flex-1 bg-current transition-shadow duration-500 ${isCorrected ? 'animate-snap-flash' : 'shadow-[0_0_8px_currentColor] opacity-90'}`}></div>
                       
                       <span className={`font-black bg-slate-950 px-1 transition-transform ${isCorrected ? 'scale-110 text-emerald-400' : 'text-amber-500'}`}>
                         {isCorrected ? 'LOCKED: 8500\'' : 'GHOST: 8512.4\''}
                       </span>

                       {isCorrected && (
                         <div className="absolute -left-4 animate-in fade-in zoom-in duration-300">
                           <Crosshair size={12} className="text-emerald-500" />
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center border-t border-amber-900/10 pt-2">
                  <div className={`text-[7px] font-mono transition-colors ${isCorrected ? 'text-emerald-700' : 'text-slate-700 italic'}`}>
                    {isCorrected ? 'RESIDUAL: 0.00' : 'UNCERTAINTY: HIGH'}
                  </div>
                  <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-all ${isCorrected ? 'bg-emerald-500 text-slate-950' : 'text-amber-700 bg-amber-500/5'}`}>
                    {isSyncing ? 'REALIGNING...' : isCorrected ? '>>> VERIFIED' : '>>> DISCORDANT'}
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-amber-200/70 leading-relaxed font-mono">
                CRITICAL: Gas cloud velocity attenuation identified. Legacy interpretation failed to account for vertical stretch, missing the target reservoir by 12.4'.
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
                {isSyncing ? 'PROCESSING_TIE...' : isCorrected ? 'DISCONNECT_VAULT' : 'INITIATE_BRAHAN_SYNC'}
              </button>

              <div className="p-3 bg-slate-950 rounded border border-emerald-900/20">
                <div className="flex items-center space-x-2 mb-2">
                   <Binary size={12} className="text-emerald-500" />
                   <span className="text-[8px] font-black text-emerald-700 uppercase">Archive_State</span>
                </div>
                <div className={`text-[10px] font-black uppercase flex items-center space-x-2 ${isCorrected ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}`}>
                  {isCorrected ? <Lock size={12} /> : <Unlock size={12} />}
                  <span>{isCorrected ? 'TIE_LOCKED_STABLE' : 'DATUM_UNSTABLE'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: The Forensic Log Visualizer (Main SVG) */}
          <div className="lg:col-span-2 glass-panel rounded-lg bg-slate-950 border border-emerald-900/40 relative overflow-hidden flex flex-col p-4 shadow-2xl">
            {/* Visualizer HUD Overlay */}
            <div className="absolute top-6 left-6 z-20 space-y-2">
              <div className="flex items-center space-x-2 bg-slate-900/90 border border-emerald-500/30 px-3 py-1.5 rounded shadow-xl">
                 <Crosshair size={14} className={`text-emerald-500 ${isCorrected ? 'animate-pulse' : ''}`} />
                 <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">NOPIMS_Forensic_Visualizer</span>
              </div>
              <div className="flex items-center space-x-3">
                 <div className="flex items-center space-x-1.5 bg-slate-950/80 px-2 py-1 rounded border border-emerald-900/40">
                   <div className="w-2 h-2 bg-slate-700"></div>
                   <span className="text-[7px] text-emerald-900 font-black uppercase">SHALE</span>
                 </div>
                 <div className="flex items-center space-x-1.5 bg-slate-950/80 px-2 py-1 rounded border border-emerald-900/40">
                   <div className="w-2 h-2 bg-emerald-500/20 border border-emerald-500/40"></div>
                   <span className="text-[7px] text-emerald-900 font-black uppercase">MUNGAROO_SAND</span>
                 </div>
              </div>
            </div>

            {/* Depth Markers */}
            <div className="absolute top-0 left-0 bottom-0 w-16 border-r border-emerald-900/20 flex flex-col justify-between items-center py-20 text-[9px] font-black text-emerald-900 bg-slate-950/40 z-10 pointer-events-none">
              <span>8480'</span>
              <span className={`transition-all duration-700 ${!isCorrected ? 'text-amber-500 scale-125' : 'text-emerald-900'}`}>8500'</span>
              <span className={`transition-all duration-700 ${isCorrected ? 'text-emerald-400 scale-125 font-bold' : 'text-emerald-900'}`}>8512'</span>
              <span>8530'</span>
              <span>8550'</span>
              <span>8570'</span>
            </div>

            {/* The Track Canvas */}
            <div className={`flex-1 relative transition-all duration-300 ${isSyncing ? 'blur-[1px] grayscale' : ''}`}>
              <svg width="100%" height="100%" viewBox="0 0 400 360" className="overflow-visible">
                {/* Track Boundaries */}
                <rect x="150" y="0" width="100" height="360" fill="rgba(16,185,129,0.02)" stroke="#064e3b" strokeWidth="1" strokeDasharray="5 5" />
                
                {/* Lithology & Curve Group - Shifts DOWN by 12.4 feet (approx 38px in SVG space) */}
                <g className="transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)" style={{ transform: `translateY(${isCorrected ? '38px' : '0px'})` }}>
                  
                  {/* Shale Zone (Top) */}
                  <rect x="150" y="0" width="100" height="135" fill="rgba(15, 23, 42, 0.4)" />
                  
                  {/* The Target Sand Package */}
                  <rect 
                    x="150" y="135" width="100" height="60" 
                    fill={isCorrected ? "rgba(16,185,129,0.15)" : "rgba(255,176,0,0.1)"} 
                    className="transition-colors duration-500" 
                  />
                  <line x1="150" y1="135" x2="250" y2="135" stroke={isCorrected ? "#10b98144" : "#ffb00044"} strokeWidth="1" />
                  <line x1="150" y1="195" x2="250" y2="195" stroke={isCorrected ? "#10b98144" : "#ffb00044"} strokeWidth="1" />
                  
                  <text x="260" y="165" fill={isCorrected ? "#10b981" : "#ffb000"} fontSize="10" fontWeight="black" className="font-mono uppercase tracking-widest">
                    {isCorrected ? '>>> VERIFIED_PAY_ZONE' : '>>> VELOCITY_PUSH_DOWN'}
                  </text>

                  {/* Gamma Ray Curve */}
                  <path 
                    d={curvePath} 
                    fill="none" 
                    stroke={isCorrected ? "#10b981" : "#ffb000"} 
                    strokeWidth="2.5" 
                    className="transition-colors duration-500"
                    style={{ filter: isCorrected ? 'drop-shadow(0 0 5px #10b981)' : 'drop-shadow(0 0 5px #ffb000)' }}
                  />
                </g>

                {/* FIXED HARDWARE OVERLAY (The wellbore perfs at 8500ft stay fixed in space) */}
                <g transform="translate(200, 150)">
                   <line x1="-150" y1="0" x2="150" y2="0" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />
                   <text x="-90" y="-15" fill="#ef4444" fontSize="8" fontWeight="black" className="font-mono">1985_RANKIN_PERFS [8500']</text>
                   
                   {/* Perforation Gun Marker */}
                   <path d="M -8,-8 L 8,8 M 8,-8 L -8,8" stroke="#ef4444" strokeWidth="3" />
                   <circle r="12" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-pulse" />

                   {isCorrected && (
                     <g className="animate-in fade-in zoom-in duration-500 delay-300">
                        <text x="35" y="5" fill="#ef4444" fontSize="10" fontWeight="black" className="font-mono uppercase tracking-tighter">! MISSED_TARGET !</text>
                        <text x="35" y="18" fill="#ef4444" fontSize="7" fontWeight="bold" className="font-mono uppercase">PERFORATED_SHALE_BARRIER</text>
                     </g>
                   )}
                </g>

                {/* Brahan New Target Marker (Shown only when corrected, at 8512ft relative to 8500ft) */}
                {isCorrected && (
                  <g transform="translate(200, 188)" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                     <rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" className="animate-spin-slow" />
                     <text x="35" y="4" fill="#10b981" fontSize="11" fontWeight="black" className="font-mono uppercase tracking-[0.2em] shadow-lg">[O] NEW_TGT: 8,512'</text>
                     <text x="35" y="16" fill="#10b981" fontSize="8" fontWeight="bold" className="font-mono uppercase">OFFSHORE_RE-COMPLETE</text>
                     <circle r="4" fill="#10b981" className="animate-ping" />
                  </g>
                )}

                {/* Vertical Annotations */}
                <g transform="translate(130, 0)">
                   <line x1="0" y1="0" x2="0" y2="360" stroke="#064e3b" strokeWidth="1" />
                   {!isCorrected ? (
                     <g transform="translate(0, 150)" className="animate-in fade-in duration-500">
                        <text x="-110" y="4" fill="#ffb000" fontSize="8" className="font-mono uppercase font-black">SEISMIC_DATUM</text>
                        <path d="M -15,0 L 0,0" stroke="#ffb000" strokeWidth="2" />
                     </g>
                   ) : (
                     <g transform="translate(0, 188)" className="animate-in fade-in duration-500">
                        <text x="-110" y="4" fill="#10b981" fontSize="8" className="font-mono uppercase font-black">WELL_DATUM</text>
                        <path d="M -15,0 L 0,0" stroke="#10b981" strokeWidth="2" />
                     </g>
                   )}
                </g>
              </svg>
            </div>

            {/* Visualizer Footer Stats */}
            <div className="mt-4 flex items-center justify-between text-[8px] font-black text-emerald-900 uppercase tracking-widest border-t border-emerald-900/20 pt-3">
               <div className="flex items-center space-x-6">
                  <span className="flex items-center space-x-1"><Waveform size={10} /> <span>TRACE: CARNARVON_V2</span></span>
                  <span className="flex items-center space-x-1"><Eye size={10} /> <span>VIEW: {isCorrected ? 'WELL_TRUTH' : 'SEISMIC_GHOST'}</span></span>
               </div>
               <span className="text-emerald-950 font-mono">|||||.....|||||||||| [ {isCorrected ? 'TIE_LOCKED' : 'READY'} ]</span>
            </div>
          </div>

          {/* Right Column: State Metrics */}
          <div className="lg:col-span-1 flex flex-col space-y-4">
            
            {/* The Analysis Metrics Card */}
            <div className={`glass-panel p-6 rounded-lg border transition-all duration-500 ${isCorrected ? 'border-emerald-500/40 bg-slate-900 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'border-amber-900/40 bg-slate-950 opacity-80'}`}>
              <h3 className={`text-[10px] font-black mb-6 uppercase tracking-widest flex items-center ${isCorrected ? 'text-emerald-400' : 'text-amber-500'}`}>
                <Activity size={16} className="mr-2" /> Data Card 2: Forensic Logic
              </h3>
              
              <div className="space-y-6">
                <div>
                   <span className="text-[8px] text-emerald-900 uppercase font-black block mb-2">Original_Perfs (Rankin)</span>
                   <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded border font-black text-xs uppercase tracking-tighter transition-all ${isCorrected ? 'bg-red-500/20 text-red-500 border-red-500/40' : 'bg-slate-900 text-amber-500 border-amber-900/50'}`}>
                        {isCorrected ? 'MISS: SHALE_PLUG' : 'HIT: TARGET_SEISMIC'}
                      </div>
                      <span className="text-[9px] text-emerald-700 font-mono italic">{isCorrected ? 'Impermeable' : 'False Positive'}</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-slate-950 rounded border border-emerald-900/10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] text-emerald-900 font-black uppercase tracking-widest">Water_Saturation (Sw)</span>
                      <Droplet size={12} className={isCorrected ? 'text-cyan-500' : 'text-emerald-950'} />
                    </div>
                    <div className={`text-2xl font-black font-terminal transition-all ${isCorrected ? 'text-cyan-400' : 'text-emerald-900'}`}>
                      {isCorrected ? '92%' : '--%'}
                    </div>
                    <div className="h-1 bg-slate-900 mt-2 rounded-full overflow-hidden">
                       <div className={`h-full transition-all duration-1000 ${isCorrected ? 'bg-cyan-500' : 'bg-slate-800'}`} style={{ width: isCorrected ? '92%' : '0%' }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded border border-emerald-900/10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] text-emerald-900 font-black uppercase tracking-widest">Mungaroo_Resistivity</span>
                      <Zap size={12} className={isCorrected ? 'text-emerald-400' : 'text-emerald-900' } />
                    </div>
                    <div className={`text-2xl font-black font-terminal transition-all ${isCorrected ? 'text-emerald-400' : 'text-emerald-900'}`}>
                      {isCorrected ? '42.5' : '01.2'} <span className="text-xs">Ohm-m</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-900/20">
                  <span className="text-[8px] text-emerald-900 font-black uppercase mb-1 block">Pay_Zone_Status</span>
                  <div className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-[0.2em] text-center border transition-all ${isCorrected ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                    {isCorrected ? 'BYPASSED_OFFSHORE_OIL' : 'MISSING_PAY_ARTIFACT'}
                  </div>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="glass-panel p-4 rounded-lg border border-emerald-900/40 bg-slate-950/90 text-[8px] space-y-2 opacity-60">
               <div className="flex items-center space-x-2 text-emerald-500 font-black mb-1">
                 <Binary size={12} />
                 <span>VELOCITY_TIE_LOG</span>
               </div>
               <p className="font-mono text-emerald-700 leading-tight">
                > SCANNING_NOPIMS_ARCHIVE...<br/>
                > {isCorrected ? 'VELOCITY_VETO: TIE_LOCKED' : 'WAITING_FOR_USER_VETO'}<br/>
                > CHANNEL_ID: MUNGAROO_A7_OFFSHORE
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
              <span className="flex items-center space-x-2">
                <Target size={12} />
                <span>DATUM_LOCK: RANKIN_12</span>
              </span>
           </div>
           <div className="flex items-center space-x-4">
              <span className="text-emerald-950">OFFSHORE_VETO_SYSTEM_ACTIVE</span>
              <div className="flex items-center space-x-1">
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
                 <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LegacyRecovery;
