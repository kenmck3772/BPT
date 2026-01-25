
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, Zap, Activity, AlertTriangle, 
  Settings2, Play, Loader2, Gauge, 
  Thermometer, Wind, Scale, Target,
  RefreshCw, History, FileWarning, MoveDown,
  ShieldAlert, AlertOctagon, RotateCw, ArrowDownToLine, 
  TrendingUp, Drill, Mountain, Droplets, Box
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const SIM_STEPS = 60;

// Validation Constraints
const LIMITS = {
  FRICTION: { MIN: 0.1, MAX: 0.6, WARN_LOW: 0.15, WARN_HIGH: 0.55 },
  PUMP: { MIN: 0, MAX: 10, WARN_HIGH: 9.0 }
};

// Geological Strata Configuration
const STRATA = [
  { id: 'OVERBURDEN', start: 0, end: 1200, color: 'rgba(148, 163, 184, 0.1)', label: 'QUATERNARY_OVERBURDEN' },
  { id: 'SHALE', start: 1200, end: 2800, color: 'rgba(71, 85, 105, 0.15)', label: 'TERTIARY_COMPACTION_SHALE' },
  { id: 'RESERVOIR', start: 2800, end: 3400, color: 'rgba(16, 185, 129, 0.1)', label: 'JURASSIC_RESERVOIR_TARGET' },
  { id: 'BASEMENT', start: 3400, end: 5000, color: 'rgba(2, 6, 23, 0.4)', label: 'CRYSTALLINE_BASEMENT' }
];

const CerberusSimulator: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [frictionFactor, setFrictionFactor] = useState(0.24);
  const [pumpRate, setPumpRate] = useState(2.5); // BPM
  const [maxDepth, setMaxDepth] = useState(4200); // meters
  
  // Validation States
  const [frictionError, setFrictionError] = useState<string | null>(null);
  const [pumpError, setPumpError] = useState<string | null>(null);

  // HUD Status (The "Three Heads" of Cerberus)
  const [status, setStatus] = useState({
    mechanical: 88,
    hydraulic: 92,
    thermal: 74
  });

  const runSimulation = () => {
    if (frictionError || pumpError) return;
    setIsSimulating(true);
    setSimProgress(0);
    const interval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          return 100;
        }
        return prev + 1.5;
      });
    }, 50);
  };

  const handleFrictionChange = (val: number) => {
    let error: string | null = null;
    let clampedVal = val;

    if (val < LIMITS.FRICTION.MIN) {
      clampedVal = LIMITS.FRICTION.MIN;
      error = `ERR: FRICTION_FLOOR_BREACH [${LIMITS.FRICTION.MIN}]`;
    } else if (val > LIMITS.FRICTION.MAX) {
      clampedVal = LIMITS.FRICTION.MAX;
      error = `ERR: FRICTION_CEILING_BREACH [${LIMITS.FRICTION.MAX}]`;
    } else if (val > LIMITS.FRICTION.WARN_HIGH) {
      error = `WARN: CRITICAL_TORQUE_LOAD`;
    }

    setFrictionFactor(clampedVal);
    setFrictionError(error);
  };

  const handlePumpChange = (val: number) => {
    let error: string | null = null;
    let clampedVal = val;

    if (val < LIMITS.PUMP.MIN) {
      clampedVal = LIMITS.PUMP.MIN;
      error = `ERR: FLOW_VOID_DETECTION`;
    } else if (val > LIMITS.PUMP.MAX) {
      clampedVal = LIMITS.PUMP.MAX;
      error = `ERR: PRESSURE_RATING_EXCEEDED [${LIMITS.PUMP.MAX} BPM]`;
    } else if (val > LIMITS.PUMP.WARN_HIGH) {
      error = `WARN: TURBULENT_FLOW_RISK`;
    }

    setPumpRate(clampedVal);
    setPumpError(error);
  };

  const simData = useMemo(() => {
    return Array.from({ length: SIM_STEPS }, (_, i) => {
      const depth = (i / (SIM_STEPS - 1)) * maxDepth;
      const fatigueBase = Math.pow(i / SIM_STEPS, 2) * 60;
      const frictionEffect = frictionFactor * depth * 0.05;
      const noise = Math.random() * 3;
      
      const fatigue = Math.min(100, fatigueBase + frictionEffect + noise);
      const bucklingLimit = 85 - (i / SIM_STEPS) * 40; 

      // Reservoir Physics
      const isReservoir = depth >= 2800 && depth <= 3400;
      const isShale = depth >= 1200 && depth < 2800;
      
      // Pore Pressure (Pp) - Hydrostatic + Overpressure
      let overpressure = 0;
      if (isShale) overpressure = (depth - 1200) * 0.05;
      if (isReservoir) overpressure = 80 + (Math.random() * 15);
      const porePressure = (depth * 0.1) + overpressure; // bar approx

      // Formation Temperature (Tf) - Geothermal Gradient
      let thermalAnomaly = isReservoir ? 15 : 0;
      const formationTemp = 15 + (depth * 0.035) + thermalAnomaly; // Celsius

      // Pore Volume (Vp) - Compaction Model
      let poreVolume = Math.max(0.1, 28 * Math.exp(-depth / 2500)); // Percentage
      if (isReservoir) poreVolume += 5; // Reservoir porosity boost

      return {
        depth,
        fatigue,
        bucklingLimit,
        stress: Math.min(100, fatigue * 1.2),
        porePressure,
        formationTemp,
        poreVolume
      };
    });
  }, [maxDepth, frictionFactor]);

  // Real-time Telemetry and Surface Logging
  const telemetryData = useMemo(() => {
    const progressFactor = simProgress / 100;
    const currentIdx = Math.floor(progressFactor * (simData.length - 1));
    const currentPoint = simData[currentIdx] || simData[0];
    
    const jitter = isSimulating ? (Math.random() - 0.5) * 1.5 : 0;
    const highJitter = isSimulating ? (Math.random() - 0.5) * 5 : 0;
    
    const surfaceTension = 12000 + (progressFactor * 6000) + (frictionFactor * 8000) + (jitter * 50);
    const ecd = 9.8 + (pumpRate * 0.25) + (progressFactor * 0.4) + (jitter * 0.05);

    const currentStrata = STRATA.find(s => currentPoint.depth >= s.start && currentPoint.depth <= s.end);

    return {
      technical: [
        { label: 'Surface_Tension', val: `${surfaceTension.toLocaleString(undefined, { maximumFractionDigits: 0 })} lbs`, color: surfaceTension > 22000 ? 'red' : 'emerald', icon: <Scale size={12}/> },
        { label: 'ECD_Correction', val: `${ecd.toFixed(2)} PPG`, color: 'cyan', icon: <Wind size={12}/> },
        { label: 'Cycle_Fatigue', val: `${currentPoint.fatigue.toFixed(1)}%`, color: currentPoint.fatigue > 75 ? 'red' : 'emerald', icon: <Zap size={12}/> }
      ],
      subsurface: [
        { label: 'Pore_Pressure', val: `${currentPoint.porePressure.toFixed(1)} bar`, color: currentPoint.porePressure > 350 ? 'orange' : 'blue', icon: <Droplets size={12}/> },
        { label: 'Formation_Temp', val: `${currentPoint.formationTemp.toFixed(1)} °C`, color: 'orange', icon: <Thermometer size={12}/> },
        { label: 'Pore_Volume', val: `${currentPoint.poreVolume.toFixed(2)}%`, color: 'emerald', icon: <Box size={12}/> },
        { label: 'Current_Strata', val: currentStrata?.id || 'UNKNOWN', color: 'slate', icon: <Mountain size={12}/> }
      ],
      surface: [
        { label: 'ROP (Avg)', val: `${(25 + (pumpRate * 3.2) - (frictionFactor * 45) + jitter).toFixed(2)} m/hr`, color: 'emerald', icon: <Gauge size={12}/> },
        { label: 'Rotary_Speed', val: `${(80 + (progressFactor * 40 * frictionFactor) + highJitter).toFixed(1)} RPM`, color: 'blue', icon: <RotateCw size={12}/> }
      ]
    };
  }, [simProgress, isSimulating, frictionFactor, pumpRate, simData]);

  const riskLevel = useMemo(() => {
    const maxFatigue = Math.max(...simData.map(d => d.fatigue));
    if (maxFatigue > 85) return 'CRITICAL';
    if (maxFatigue > 60) return 'ELEVATED';
    return 'STABLE';
  }, [simData]);

  return (
    <div className="flex flex-col h-full space-y-3 p-4 bg-slate-900/40 border border-emerald-900/30 rounded-lg transition-all relative overflow-hidden font-terminal">
      
      {/* Three-Headed Watchdog HUD Overlay */}
      <div className="absolute top-20 right-8 z-30 flex flex-col space-y-4">
        {[
          { label: 'MECHANICAL', val: status.mechanical, icon: <Scale size={14} />, color: 'emerald' },
          { label: 'HYDRAULIC', val: status.hydraulic, icon: <Wind size={14} />, color: 'cyan' },
          { label: 'THERMAL', val: status.thermal, icon: <Thermometer size={14} />, color: 'orange' },
        ].map(head => (
          <div key={head.label} className="flex items-center space-x-3 bg-slate-950/90 border border-emerald-900/20 p-2 rounded-lg shadow-2xl backdrop-blur-md">
            <div className={`p-1.5 rounded bg-${head.color}-500/10 text-${head.color}-400`}>
              {head.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[7px] font-black uppercase tracking-widest text-emerald-900">{head.label}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-${head.color}-500`} style={{ width: `${head.val}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-emerald-100">{head.val}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header HUD */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ShieldCheck size={20} className={isSimulating ? 'animate-pulse text-orange-500' : 'text-emerald-400'} />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-400 font-terminal uppercase tracking-tighter">Cerberus_Simulator</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[8px] text-emerald-800 uppercase tracking-widest font-black">Subsurface Reservoir Physics v2.2</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <button 
          onClick={runSimulation}
          disabled={isSimulating || !!frictionError || !!pumpError}
          className={`flex items-center space-x-2 px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all ${isSimulating ? 'bg-orange-500/20 text-orange-500 cursor-wait' : (frictionError || pumpError ? 'bg-red-900/20 text-red-900 border-red-900/40 cursor-not-allowed' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]')}`}
        >
          {isSimulating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          <span>Run_Survival_Sim</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 flex space-x-4">
        
        {/* Module A: Simulation Parameters */}
        <div className="w-72 flex flex-col space-y-3">
          <div className="bg-slate-950/90 border border-emerald-900/30 rounded-xl p-5 flex flex-col space-y-6 shadow-2xl">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Physics_Veto</span>
                <Settings2 size={14} className="text-emerald-700" />
             </div>
             
             <div className="space-y-6">
                <div className={`space-y-1.5 p-2 rounded border transition-all ${frictionError?.startsWith('ERR') ? 'border-red-500 bg-red-500/5' : frictionError?.startsWith('WARN') ? 'border-orange-500 bg-orange-500/5' : 'border-transparent'}`}>
                  <div className="flex justify-between text-[8px] font-black text-emerald-900 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Target size={10} className={frictionError ? 'text-red-500' : ''} />
                      Friction_Factor
                    </span>
                    <span className={frictionError ? 'text-red-400' : 'text-emerald-500'}>{frictionFactor.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" min={LIMITS.FRICTION.MIN - 0.05} max={LIMITS.FRICTION.MAX + 0.05} step="0.01" 
                    value={frictionFactor} 
                    onChange={e => handleFrictionChange(parseFloat(e.target.value))}
                    className={`w-full h-1.5 bg-slate-900 appearance-none rounded-full cursor-pointer accent-emerald-500 ${frictionError ? 'accent-red-500' : ''}`} 
                  />
                </div>

                <div className={`space-y-1.5 p-2 rounded border transition-all ${pumpError?.startsWith('ERR') ? 'border-red-500 bg-red-500/5' : pumpError?.startsWith('WARN') ? 'border-orange-500 bg-orange-500/5' : 'border-transparent'}`}>
                  <div className="flex justify-between text-[8px] font-black text-emerald-900 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Wind size={10} className={pumpError ? 'text-red-500' : ''} />
                      Flow_Rate_BPM
                    </span>
                    <span className={pumpError ? 'text-red-400' : 'text-emerald-500'}>{pumpRate.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min={LIMITS.PUMP.MIN - 1} max={LIMITS.PUMP.MAX + 1} step="0.5" 
                    value={pumpRate} 
                    onChange={e => handlePumpChange(parseFloat(e.target.value))}
                    className={`w-full h-1.5 bg-slate-900 appearance-none rounded-full cursor-pointer accent-emerald-500 ${pumpError ? 'accent-red-500' : ''}`} 
                  />
                </div>
             </div>

             <div className={`p-4 rounded border transition-all ${riskLevel === 'CRITICAL' ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'bg-emerald-500/5 border-emerald-900/20 text-emerald-500'}`}>
                <div className="flex items-center space-x-2 mb-2">
                   <AlertTriangle size={14} className={riskLevel === 'CRITICAL' ? 'animate-pulse' : ''} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Survival_Risk</span>
                </div>
                <div className="text-xl font-black">{riskLevel}</div>
             </div>
          </div>

          <div className="flex-1 bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 flex flex-col space-y-3 overflow-hidden shadow-2xl">
             <div className="flex items-center justify-between border-b border-emerald-900/10 pb-2">
                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Formation_Telemetry</span>
                <RefreshCw size={12} className={`text-emerald-900 ${isSimulating ? 'animate-spin' : ''}`} />
             </div>
             <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* Subsurface Reservoir Physics */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black text-blue-900 uppercase tracking-tighter ml-1">Subsurface_Audit</span>
                  {telemetryData.subsurface.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-blue-900/5 border border-blue-900/10 p-2 rounded transition-colors group">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-700 opacity-50 group-hover:opacity-100">{item.icon}</span>
                        <span className="text-[9px] font-black text-blue-800 uppercase tracking-tighter group-hover:text-blue-600">{item.label}</span>
                      </div>
                      <span className={`text-[10px] font-terminal font-black text-${item.color === 'slate' ? 'slate' : 'blue'}-400 tabular-nums`}>{item.val}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-emerald-900/10">
                  <span className="text-[8px] font-black text-emerald-900 uppercase tracking-tighter ml-1">Eng_Audit</span>
                  {telemetryData.technical.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-900/40 p-2 rounded transition-colors group">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 opacity-50 group-hover:opacity-100">{item.icon}</span>
                        <span className="text-[9px] font-black text-emerald-800 uppercase tracking-tighter group-hover:text-emerald-600">{item.label}</span>
                      </div>
                      <span className={`text-[10px] font-terminal font-black text-${item.color}-400 tabular-nums`}>{item.val}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Module B: Multi-Variate Fatigue & Reservoir Plot */}
        <div className="flex-1 bg-slate-950/80 rounded-xl border border-emerald-900/20 p-4 flex flex-col relative overflow-hidden shadow-inner">
           <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
              <div className="flex items-center space-x-2 bg-slate-950 border border-emerald-900/50 px-2 py-1 rounded">
                 <div className="w-2 h-2 bg-emerald-500"></div>
                 <span className="text-[8px] font-black uppercase text-emerald-900">TOOL_FATIGUE (%)</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-950 border border-blue-900/50 px-2 py-1 rounded">
                 <div className="w-2 h-2 bg-blue-500"></div>
                 <span className="text-[8px] font-black uppercase text-blue-900">PORE_PRESSURE (BAR)</span>
              </div>
           </div>

           <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={simData} layout="vertical">
                    <defs>
                       <linearGradient id="fatigueGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.8}/>
                       </linearGradient>
                       <linearGradient id="poreGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.6}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.1} vertical={false} />
                    <XAxis type="number" stroke="#064e3b" hide domain={[0, 'auto']} />
                    <YAxis dataKey="depth" type="number" reversed domain={[0, maxDepth]} stroke="#10b981" fontSize={8} label={{ value: 'DEPTH (m)', angle: -90, position: 'insideLeft', fill: '#064e3b', fontSize: 10, fontWeight: 'black' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #064e3b', fontSize: '9px' }} />
                    
                    <Area type="monotone" dataKey="porePressure" stroke="#3b82f6" fill="url(#poreGrad)" strokeWidth={1} isAnimationActive={isSimulating} />
                    <Area type="monotone" dataKey="fatigue" stroke="#10b981" fill="url(#fatigueGrad)" strokeWidth={2} isAnimationActive={isSimulating} />
                    
                    <ReferenceLine x={80} stroke="#ef4444" strokeDasharray="3 3" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Module C: Survival Schematic Visualizer with Strata */}
        <div className="w-64 bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 flex flex-col relative shadow-2xl">
           <div className="flex items-center justify-between mb-4 border-b border-emerald-900/20 pb-2">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Strata_Survival_Map</span>
              <Target size={14} className="text-emerald-700" />
           </div>

           <div className="flex-1 bg-slate-900/10 rounded border border-emerald-900/20 flex flex-col items-center relative py-0 overflow-hidden">
              {/* Vertical Strata Backdrop */}
              <svg width="100%" height="100%" className="absolute inset-0 z-0">
                 {STRATA.map(s => (
                    <rect 
                       key={s.id}
                       x="0" 
                       y={(s.start / maxDepth) * 100 + "%"} 
                       width="100%" 
                       height={((s.end - s.start) / maxDepth) * 100 + "%"} 
                       fill={s.color}
                    />
                 ))}
              </svg>

              {/* Drill String Schematic SVG */}
              <svg width="60" height="100%" className="relative z-10 opacity-80">
                <rect x="25" y="0" width="10" height="100%" fill="none" stroke="#064e3b" strokeWidth="1" strokeDasharray="4 2" />
                
                {/* Friction Hotspots */}
                <rect x="25" y="150" width="10" height="60" fill="#f9731633" stroke="#f97316" strokeWidth={1} />

                {/* Simulated Tool Indicator */}
                {isSimulating && (
                  <g style={{ transform: `translateY(${(simProgress / 100) * 350}px)` }} className="transition-transform duration-100">
                    <circle cx="30" cy="0" r="12" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" className="animate-ping" />
                    <path d="M20,0 L40,0 L30,15 Z" fill="#10b981" />
                    <line x1="15" y1="0" x2="45" y2="0" stroke="#10b981" strokeWidth="2" />
                  </g>
                )}
              </svg>

              <div className="absolute top-0 right-2 bottom-0 flex flex-col justify-between py-2 pointer-events-none z-20">
                 <span className="text-[7px] text-emerald-900 font-black">0m</span>
                 <span className="text-[7px] text-emerald-900 font-black">{maxDepth.toFixed(0)}m</span>
              </div>
           </div>

           <div className="mt-4 p-3 bg-black/40 border border-emerald-900/20 rounded-lg">
              <div className="flex justify-between items-center text-[8px] font-black uppercase text-emerald-900 tracking-widest mb-1.5">
                <span className="flex items-center gap-1"><Box size={10} /> Pore_Volume_Est</span>
                <span className="text-emerald-500">{(simData[Math.floor((simProgress/100) * (simData.length-1))]?.poreVolume || 0).toFixed(1)}%</span>
              </div>
              <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(100, (simData[Math.floor((simProgress/100) * (simData.length-1))]?.poreVolume || 0) * 3)}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer Alert Bar */}
      <div className={`p-2.5 rounded border flex items-center justify-between transition-all ${riskLevel === 'CRITICAL' ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-slate-950/80 border-emerald-900/20'}`}>
         <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
               {riskLevel === 'CRITICAL' ? <FileWarning size={14} className="text-red-500 animate-pulse" /> : <Gauge size={14} className="text-emerald-900" />}
               <span className={`text-[10px] font-black uppercase tracking-widest ${riskLevel === 'CRITICAL' ? 'text-red-400' : 'text-emerald-900'}`}>
                 {isSimulating ? 'SIMULATION_IN_PROGRESS' : riskLevel === 'CRITICAL' ? 'SURVIVAL_ENVELOPE_BREACH' : 'FORMATION_NORMAL'}
               </span>
            </div>
            <div className="h-4 w-px bg-emerald-900/30"></div>
            <div className="flex items-center space-x-2">
               <History size={12} className="text-emerald-900" />
               <span className="text-[9px] text-emerald-900 uppercase font-black">SOLVER: CERBERUS_STRATA_v2.2</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CerberusSimulator;
