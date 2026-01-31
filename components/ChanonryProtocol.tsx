import React, { useState, useMemo, useEffect } from 'react';
import { 
  Skull, AlertOctagon, Terminal, Activity, 
  Flame, Droplets, Zap, ShieldAlert, Play,
  Loader2, Info, Beaker, ShieldCheck, AlertCircle,
  Scale, SlidersHorizontal, Settings2
} from 'lucide-react';

const ChanonryProtocol: React.FC = () => {
  const [sara, setSara] = useState({
    saturates: 35.5,
    aromatics: 25.0,
    resins: 20.0,
    asphaltenes: 19.5
  });
  const [fluid, setFluid] = useState('15% HCl Acid');
  const [pressure, setPressure] = useState(4200);
  const [isProcessing, setIsProcessing] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const totalPercentage = useMemo(() => {
    return (Object.values(sara) as number[]).reduce((a: number, b: number) => a + b, 0);
  }, [sara]);

  const cii = useMemo(() => {
    const denominator = sara.aromatics + sara.resins;
    if (denominator === 0) return 0;
    return (sara.saturates + sara.asphaltenes) / denominator;
  }, [sara]);

  const isAcid = fluid.toUpperCase().includes('ACID') || fluid.toUpperCase().includes('HCL');
  const isUnstable = cii > 0.9;
  const criticalAlarm = isUnstable && isAcid;

  useEffect(() => {
    const newErrors: string[] = [];
    if (Math.abs(totalPercentage - 100) > 0.01) {
      newErrors.push(`MASS_DISCORDANCE: SARA sum is ${totalPercentage.toFixed(1)}% (Target: 100.0%)`);
    }
    if (pressure <= 0) {
      newErrors.push("PRESSURE_VOID: BHP must be greater than 0 PSI.");
    }
    if (pressure > 20000) {
      newErrors.push("PRESSURE_EXCESS: BHP exceeds HPHT mechanical ceiling (20k PSI).");
    }
    setErrors(newErrors);
  }, [totalPercentage, pressure]);

  const isValid = errors.length === 0;

  const runProtocol = () => {
    if (!isValid) return;

    setIsProcessing(true);
    setLog([]);
    
    const lines = [
      ">>> INITIATING CHANONRY_PROTOCOL_V4.1",
      ">>> AUTHOR: BRAHAN_SEER_ENGINE",
      ">>> CORPORATE_AUTH: WELLTEGRA_LTD_SC876023",
      "-----------------------------------------",
      `[TELEMETRY_STREAM_VALIDATED]`,
      `> SATURATES:    ${sara.saturates.toFixed(2)} %`,
      `> AROMATICS:    ${sara.aromatics.toFixed(2)} %`,
      `> RESINS:       ${sara.resins.toFixed(2)} %`,
      `> ASPHALTENES:  ${sara.asphaltenes.toFixed(2)} %`,
      `> PUMP_FLUID:   ${fluid.toUpperCase()}`,
      `> BHP_PRESSURE: ${pressure.toFixed(2)} PSI`,
      "-----------------------------------------",
      `CII_CALCULATED: ${cii.toFixed(4)}`,
      "-----------------------------------------",
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setLog(prev => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setIsProcessing(false);
        if (isUnstable) {
          setLog(prev => [...prev, "!!! CRITICAL_STABILITY_ALERT: UNSTABLE_COLLOIDAL_STRUCTURE !!!"]);
          if (isAcid) {
            setLog(prev => [
              ...prev, 
              "!!! WARNING: ACID_INDUCTION_WILL_TRIGGER_SLUDGE_FORMATION !!!",
              "!!! RIBBONS OF BLACK DETECTED !!!",
              "!!! PREVENT THE BARREL. EXECUTE EMERGENCY_VETO. !!!"
            ]);
          } else {
            setLog(prev => [
              ...prev, 
              ">>> WARNING: OIL_UNSTABLE. BITUMEN_FLOC_POSSIBLE.",
              ">>> RECOMMEND: RE-EVALUATE_STIMULATION_CHEMISTRY."
            ]);
          }
        } else {
          setLog(prev => [
            ...prev, 
            ">>> STATUS: STABLE. COLLOIDAL_STRUCTURE_WITHIN_TOLERANCE.",
            ">>> NO_BIT_RISK: PROCEED_WITH_PUMP."
          ]);
        }
      }
    }, 100);
  };

  const handleSaraChange = (key: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    setSara(prev => ({ ...prev, [key]: clamped }));
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 font-terminal relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <Skull size={500} className={criticalAlarm ? 'text-red-500' : 'text-emerald-500'} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative z-10 h-full">
        
        {/* Module Controls */}
        <div className="w-full lg:w-96 flex flex-col space-y-4">
          <div className={`glass-panel p-5 rounded-2xl border transition-all duration-300 bg-slate-900/60 flex flex-col space-y-6 ${isValid ? 'border-emerald-900/30 shadow-2xl' : 'border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.15)]'}`}>
            <div className="flex items-center justify-between border-b border-emerald-900/20 pb-4">
              <div className="flex items-center space-x-3">
                <Beaker size={20} className={isValid ? 'text-emerald-400' : 'text-red-500'} />
                <h2 className="text-xl font-black text-emerald-400 uppercase tracking-tighter">Fluid_Matrix</h2>
              </div>
              <Settings2 size={16} className="text-emerald-900" />
            </div>

            <div className="space-y-4">
              {(Object.keys(sara) as Array<keyof typeof sara>).map(key => (
                <div key={key} className="space-y-2 p-3 bg-black/30 rounded-xl border border-emerald-900/10 group transition-all hover:border-emerald-500/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <SlidersHorizontal size={10} className="text-emerald-800" />
                       <span className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.2em]">{key}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <input 
                         type="number"
                         min="0"
                         max="100"
                         step="0.1"
                         value={sara[key]}
                         onChange={e => handleSaraChange(key as string, parseFloat(e.target.value) || 0)}
                         className="w-16 bg-slate-950 border border-emerald-900/30 rounded px-1.5 py-0.5 text-[10px] text-emerald-400 font-mono text-right outline-none focus:border-emerald-500 transition-all"
                       />
                       <span className="text-[9px] font-black text-emerald-900">%</span>
                    </div>
                  </div>
                  <input 
                    type="range" min="0" max="100" step="0.1"
                    value={sara[key]}
                    onChange={e => handleSaraChange(key as string, parseFloat(e.target.value))}
                    className={`w-full h-1.5 appearance-none rounded-full cursor-pointer bg-slate-800 accent-emerald-500 ${isValid ? '' : 'accent-red-500'}`}
                  />
                </div>
              ))}

              <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${Math.abs(totalPercentage - 100) < 0.1 ? 'bg-emerald-500/10 border-emerald-500/20 shadow-inner' : 'bg-red-500/10 border-red-500/30 animate-pulse'}`}>
                <div className="flex items-center gap-3">
                  <Scale size={14} className={Math.abs(totalPercentage - 100) < 0.1 ? 'text-emerald-400' : 'text-red-500'} />
                  <span className="text-[9px] font-black uppercase text-emerald-900 tracking-widest">Total_Constituents:</span>
                </div>
                <span className={`text-xs font-black tabular-nums ${Math.abs(totalPercentage - 100) < 0.1 ? 'text-emerald-400' : 'text-red-500'}`}>
                  {totalPercentage.toFixed(1)}%
                </span>
              </div>

              <div className="pt-2 grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black text-emerald-900 uppercase tracking-widest ml-1">Treatment_Fluid_Composition</span>
                  <select 
                    value={fluid}
                    onChange={e => setFluid(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-900/40 rounded-xl px-3 py-2 text-[10px] text-emerald-400 outline-none focus:border-emerald-500 transition-all font-mono"
                  >
                    <option>15% HCl Acid</option>
                    <option>Mud Acid (HCl/HF)</option>
                    <option>Produced Water</option>
                    <option>Inhibitor Brine</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[8px] font-black text-emerald-900 uppercase tracking-widest ml-1">BHP_Static_Pressure (PSI)</span>
                  <div className="relative">
                    <input 
                      type="number"
                      value={pressure}
                      min="0"
                      max="20000"
                      onChange={e => setPressure(parseInt(e.target.value) || 0)}
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-[10px] text-emerald-400 outline-none focus:border-emerald-500 font-mono ${pressure > 0 && pressure <= 20000 ? 'border-emerald-900/40' : 'border-red-500/50 text-red-500'}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-emerald-900 uppercase">PSI</div>
                  </div>
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-red-500 mb-1">
                  <AlertCircle size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Logic_Violation_Detected</span>
                </div>
                {errors.map((err, i) => (
                  <p key={i} className="text-[8px] text-red-200/60 font-mono leading-tight uppercase pl-5 relative">
                    <span className="absolute left-0 text-red-700">&gt;</span> {err}
                  </p>
                ))}
              </div>
            )}

            <button 
              onClick={runProtocol}
              disabled={isProcessing || !isValid}
              className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] transition-all border shadow-lg flex items-center justify-center space-x-3 group relative overflow-hidden ${
                !isValid 
                  ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed grayscale' 
                  : isProcessing 
                    ? 'bg-orange-500/20 text-orange-500 border-orange-500/40 cursor-wait' 
                    : 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 shadow-emerald-500/20'
              }`}
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
              <span>{isProcessing ? 'SYNTHESIZING...' : 'Run_Stability_Logic'}</span>
            </button>
          </div>
        </div>

        {/* Main Terminal Output */}
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 bg-slate-950/90 border border-emerald-900/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-emerald-900/20 pb-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                   <Terminal size={18} className="text-emerald-500" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">Seer_Core_Protocol_Terminal</span>
                   <span className="text-[8px] font-mono text-emerald-900 uppercase">Ver: 4.1.stable // SC876023</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ${criticalAlarm ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${criticalAlarm ? 'text-red-500' : 'text-emerald-900'}`}>
                  {criticalAlarm ? 'VETO_OVERRIDE_ENABLED' : 'ENVIRONMENT_SYNCED'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[12px] space-y-2 pr-4">
              {log.map((line, i) => {
                const isCritical = line.includes('!!!');
                const isWarning = line.includes('>>> WARNING');
                return (
                  <div key={i} className={`animate-in slide-in-from-left-2 duration-300 ${
                    isCritical ? 'text-red-500 font-black animate-pulse' : 
                    isWarning ? 'text-orange-400' : 
                    line.includes('---') ? 'text-emerald-900/40' : 
                    'text-emerald-500/90'
                  }`}>
                    {line}
                  </div>
                );
              })}
              {isProcessing && <div className="text-emerald-500 animate-pulse w-2 h-4 bg-emerald-500 ml-1"></div>}
              {log.length === 0 && !isProcessing && (
                <div className="h-full flex flex-col items-center justify-center opacity-[0.05] grayscale space-y-6">
                   <Activity size={120} className="animate-pulse" />
                   <span className="text-xl font-black uppercase tracking-[1em]">Awaiting_Input</span>
                </div>
              )}
            </div>

            {/* Live Indicator Graphic */}
            <div className="mt-8 flex items-center justify-between border-t border-emerald-900/10 pt-6 bg-black/20 -mx-8 -mb-8 px-8 pb-8">
               <div className="flex items-center space-x-10">
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] text-emerald-900 font-black uppercase tracking-widest">Colloidal_Index (CII)</span>
                     <span className={`text-2xl font-black font-terminal tracking-tighter ${isUnstable ? 'text-red-500' : 'text-emerald-400'}`}>
                       {cii.toFixed(4)}
                     </span>
                  </div>
                  <div className="h-10 w-px bg-emerald-900/20"></div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] text-emerald-900 font-black uppercase tracking-widest">Flocculation_Probability</span>
                     <span className={`text-2xl font-black font-terminal tracking-tighter ${isUnstable ? 'text-red-500' : 'text-emerald-400'}`}>
                       {isUnstable ? 'HIGH_RISK' : 'NOMINAL'}
                     </span>
                  </div>
               </div>
               <div className="flex items-center space-x-6">
                  {criticalAlarm && (
                    <div className="flex items-center space-x-3 text-red-500 bg-red-500/10 border border-red-500/40 px-4 py-2 rounded-xl animate-in zoom-in-95 duration-500">
                       <ShieldAlert size={16} className="animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest">EXECUTE_VETO</span>
                    </div>
                  )}
                  <div className="text-right flex flex-col">
                    <span className="text-[8px] text-emerald-900 font-black uppercase tracking-widest">Auth_Uplink</span>
                    <span className="text-[10px] text-emerald-700 font-mono">NODE_BRAHAN_V88</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChanonryProtocol;