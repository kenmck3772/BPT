
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, Zap, Activity, AlertTriangle, 
  Settings2, Play, Loader2, Gauge, 
  Thermometer, Wind, Scale, Target,
  RefreshCw, History, FileWarning, MoveDown,
  ShieldAlert, AlertOctagon, RotateCw, ArrowDownToLine, 
  TrendingUp, Drill, Mountain, Droplets, Box,
  Fingerprint, Maximize2, Minimize2, Ship
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Line, ComposedChart } from 'recharts';

const SIM_STEPS = 80;

const RIG_TYPES = [
  { id: 'JACKUP', name: 'Standard Jackup', friction_mult: 1.0, ecd_bias: 0 },
  { id: 'SEMISUB', name: 'Heavy Semi-Sub', friction_mult: 1.2, ecd_bias: 5 },
  { id: 'DRILLSHIP', name: 'Ultra-Deepwater Ship', friction_mult: 1.5, ecd_bias: 12 },
];

const LIMITS = {
  FRICTION: { MIN: 0.1, MAX: 0.6, WARN_LOW: 0.15, WARN_HIGH: 0.55 },
  PUMP: { MIN: 0, MAX: 10, WARN_HIGH: 9.0 }
};

const STRATA = [
  { id: 'OVERBURDEN', start: 0, end: 1200, color: 'rgba(148, 163, 184, 0.1)', label: 'QUATERNARY_OVERBURDEN' },
  { id: 'SHALE', start: 1200, end: 2800, color: 'rgba(71, 85, 105, 0.15)', label: 'TERTIARY_COMPACTION_SHALE' },
  { id: 'RESERVOIR', start: 2800, end: 3400, color: 'rgba(16, 185, 129, 0.1)', label: 'JURASSIC_RESERVOIR_TARGET' },
  { id: 'BASEMENT', start: 3400, end: 5000, color: 'rgba(2, 6, 23, 0.4)', label: 'CRYSTALLINE_BASEMENT' }
];

interface CerberusSimulatorProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const CerberusSimulator: React.FC<CerberusSimulatorProps> = ({ isFocused, onToggleFocus }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [frictionFactor, setFrictionFactor] = useState(0.24);
  const [pumpRate, setPumpRate] = useState(2.5);
  const [maxDepth, setMaxDepth] = useState(4200);
  const [activeRig, setActiveRig] = useState(RIG_TYPES[0]);
  
  const [frictionError, setFrictionError] = useState<string | null>(null);
  const [pumpError, setPumpError] = useState<string | null>(null);

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
        return prev + 1.2;
      });
    }, 50);
  };

  const handleFrictionChange = (val: number) => {
    let error: string | null = null;
    let clampedVal = val;
    if (val < LIMITS.FRICTION.MIN) { clampedVal = LIMITS.FRICTION.MIN; error = `ERR: FRICTION_FLOOR_BREACH`; }
    else if (val > LIMITS.FRICTION.MAX) { clampedVal = LIMITS.FRICTION.MAX; error = `ERR: FRICTION_CEILING_BREACH`; }
    else if (val > LIMITS.FRICTION.WARN_HIGH) { error = `WARN: CRITICAL_TORQUE_LOAD`; }
    setFrictionFactor(clampedVal);
    setFrictionError(error);
  };

  const simData = useMemo(() => {
    return Array.from({ length: SIM_STEPS }, (_, i) => {
      const depth = (i / (SIM_STEPS - 1)) * maxDepth;
      const fatigueBase = Math.pow(i / SIM_STEPS, 2) * 60;
      const frictionEffect = frictionFactor * depth * 0.05 * activeRig.friction_mult;
      const noise = Math.random() * 2;
      const fatigue = Math.min(100, fatigueBase + frictionEffect + noise);
      const hydrostatic = depth * 0.098; 
      let overpressure = depth >= 2800 && depth <= 3400 ? 120 : 0;
      const porePressure = hydrostatic + overpressure;
      const fractureGradient = (hydrostatic * 1.5) + 80;
      const ecd = porePressure + (pumpRate * 12) + activeRig.ecd_bias;
      return { depth, fatigue, porePressure, formationTemp: 15 + (depth * 0.032), poreVolume: 32 * Math.exp(-depth / 3500), fractureGradient, ecd };
    });
  }, [maxDepth, frictionFactor, pumpRate, activeRig]);

  const telemetryData = useMemo(() => {
    const progressFactor = simProgress / 100;
    const currentIdx = Math.floor(progressFactor * (simData.length - 1));
    const currentPoint = simData[currentIdx] || simData[0];
    const surfaceTension = 12000 + (progressFactor * 6000) + (frictionFactor * 8000);
    return {
      technical: [
        { label: 'Surface_Tension', val: `${Math.round(surfaceTension)} lbs`, color: 'emerald', icon: <Scale size={12}/> },
        { label: 'Pressure_Balance', val: `${((currentPoint.ecd / currentPoint.fractureGradient) * 100).toFixed(1)}%`, color: 'cyan', icon: <Fingerprint size={12}/> },
        { label: 'Active_Rig', val: activeRig.name, color: 'blue', icon: <Ship size={12}/> }
      ],
      subsurface: [
        { label: 'Pore_Pressure', val: `${currentPoint.porePressure.toFixed(1)} bar`, color: 'blue', icon: <Droplets size={12}/> },
        { label: 'Formation_Temp', val: `${currentPoint.formationTemp.toFixed(1)} °C`, color: 'orange', icon: <Thermometer size={12}/> }
      ]
    };
  }, [simProgress, frictionFactor, activeRig, simData]);

  return (
    <div className="flex flex-col h-full space-y-3 p-4 bg-slate-900/40 border border-emerald-900/30 rounded-lg transition-all relative overflow-hidden font-terminal">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded shadow-lg">
            <ShieldCheck size={20} className={isSimulating ? 'animate-pulse text-orange-500' : 'text-emerald-400'} />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-400 font-terminal uppercase tracking-tighter">Cerberus_Subsurface_Sim</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[8px] text-emerald-800 uppercase tracking-widest font-black">Reactive Reservoir Physics Kernel v3.0</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-black/60 border border-emerald-900/40 rounded-lg px-3 py-1.5 gap-3">
             <span className="text-[9px] font-black text-emerald-900 uppercase">Change_Device:</span>
             <select 
               value={activeRig.id}
               onChange={(e) => setActiveRig(RIG_TYPES.find(r => r.id === e.target.value) || RIG_TYPES[0])}
               className="bg-transparent text-[10px] font-black text-emerald-400 outline-none cursor-pointer uppercase"
             >
                {RIG_TYPES.map(rig => (
                  <option key={rig.id} value={rig.id} className="bg-slate-900">{rig.name}</option>
                ))}
             </select>
          </div>
          <button 
            onClick={runSimulation}
            className={`flex items-center space-x-2 px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-xl`}
          >
            {isSimulating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            <span>{isSimulating ? 'Simulating...' : 'Initialize_Audit'}</span>
          </button>
          {onToggleFocus && (
            <button onClick={onToggleFocus} className="p-2 text-emerald-900 hover:text-[#00FF41] transition-all ml-2">
              {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex space-x-4">
        <div className="w-72 flex flex-col space-y-3">
          <div className="bg-slate-950/90 border border-emerald-900/30 rounded-xl p-5 shadow-2xl">
             <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-black text-emerald-900 uppercase">
                    <span>Torque_Coefficient</span>
                    <span className="text-emerald-500">{frictionFactor.toFixed(2)}</span>
                  </div>
                  <input type="range" min={0.1} max={0.6} step="0.01" value={frictionFactor} onChange={e => handleFrictionChange(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-900 appearance-none rounded-full cursor-pointer accent-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-black text-emerald-900 uppercase">
                    <span>Injection_Rate (BPM)</span>
                    <span className="text-emerald-500">{pumpRate.toFixed(1)}</span>
                  </div>
                  <input type="range" min={0} max={10} step="0.5" value={pumpRate} onChange={e => setPumpRate(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-900 appearance-none rounded-full cursor-pointer accent-emerald-500" />
                </div>
             </div>
          </div>

          <div className="flex-1 bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 flex flex-col space-y-3 overflow-hidden">
             {telemetryData.technical.concat(telemetryData.subsurface).map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-900/40 p-3 rounded border border-emerald-900/10">
                   <div className="flex items-center gap-2">
                      <span className="text-emerald-700">{item.icon}</span>
                      <span className="text-[9px] font-black text-emerald-800 uppercase">{item.label}</span>
                   </div>
                   <span className="text-[10px] font-black text-emerald-400 tabular-nums">{item.val}</span>
                </div>
             ))}
          </div>
        </div>

        <div className="flex-1 bg-slate-950/80 rounded-xl border border-emerald-900/20 p-4 relative overflow-hidden shadow-inner min-h-[400px]">
           <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={simData} layout="vertical" margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.1} vertical={false} />
                 <XAxis type="number" hide />
                 <YAxis dataKey="depth" type="number" reversed stroke="#10b981" fontSize={8} />
                 <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #064e3b', fontSize: '9px' }} />
                 <Area type="monotone" dataKey="porePressure" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} isAnimationActive={false} />
                 <Area type="monotone" dataKey="fatigue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} isAnimationActive={false} />
                 <Line type="monotone" dataKey="ecd" stroke="#ef4444" strokeWidth={2} dot={false} />
              </ComposedChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CerberusSimulator;
