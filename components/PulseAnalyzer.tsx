
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Line, ComposedChart, Scatter } from 'recharts';
import { MOCK_PRESSURE_DATA, MOCK_HISTORICAL_BARRIER_LOGS, MOCK_SCAVENGED_PRESSURE_TESTS } from '../constants';
import { calculateLinearRegression, diagnoseSawtooth } from '../forensic_logic/math';
import { 
  Activity, Zap, ShieldCheck, Target, TrendingUp, Cpu, 
  Scan, History, Search, Download, Database, Info, 
  AlertCircle, Droplet, Beaker, FileText, ChevronRight,
  Loader2, Waves, Fingerprint as FingerprintIcon
} from 'lucide-react';
import { BarrierEvent } from '../types';
import { secureAsset } from '../services/vaultService';

const PulseAnalyzer: React.FC = () => {
  const [view, setView] = useState<'LIVE' | 'SCAVENGER' | 'FINGERPRINT'>('LIVE');
  const [scavengeProgress, setScavengeProgress] = useState(0);
  const [isScavenging, setIsScavenging] = useState(false);
  const [showHistoricalOverlay, setShowHistoricalOverlay] = useState(false);
  const [isSecuring, setIsSecuring] = useState(false);

  const rechargePhaseData = MOCK_PRESSURE_DATA.slice(0, 4);
  const pressures = rechargePhaseData.map(d => d.pressure);
  
  const analysis = useMemo(() => {
    const { slope, rSquared } = calculateLinearRegression(pressures);
    const diagnosis = diagnoseSawtooth(rSquared, slope);
    return { slope, rSquared, ...diagnosis };
  }, [pressures]);

  // Simulated Echo Data for Fingerprint Mode
  const fingerprintData = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const t = i * 0.1;
      const decay = 2500 * Math.exp(-t/5);
      const echo = (i === 42 || i === 78) ? (Math.random() * 20 + 30) : (Math.random() * 2);
      return {
        time: t.toFixed(1),
        pressure: decay + echo,
        echo: i === 42 || i === 78 ? echo : null,
        depth: (1450 * t / 2).toFixed(0)
      };
    });
  }, []);

  const triggerScavenge = () => {
    setIsScavenging(true);
    setScavengeProgress(0);
    const interval = setInterval(() => {
      setScavengeProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScavenging(false);
          return 100;
        }
        return prev + 5;
      });
    }, 80);
  };

  const handleSecureAsset = () => {
    setIsSecuring(true);
    setTimeout(() => {
        secureAsset({
            title: `Integrity Pulse Audit: ${analysis.status}`,
            status: analysis.color === '#ef4444' ? 'CRITICAL' : 'VERIFIED',
            summary: `Sawtooth pressure analysis. Slope: ${analysis.slope.toFixed(2)} PSI/U. R2: ${(analysis.rSquared * 100).toFixed(1)}%. ${analysis.diagnosis}`,
            region: 'Gulf of Mexico',
            valueEst: analysis.color === '#ef4444' ? 12000000 : 250000,
            confidence: analysis.rSquared * 100
        });
        setIsSecuring(false);
    }, 1000);
  };

  const getEventIcon = (type: BarrierEvent['type']) => {
    switch (type) {
      case 'TOPUP': return <Droplet size={14} className="text-cyan-400" />;
      case 'SQUEEZE': return <Beaker size={14} className="text-purple-400" />;
      case 'TEST': return <ShieldCheck size={14} className="text-emerald-400" />;
      case 'BREACH': return <AlertCircle size={14} className="text-red-500" />;
      default: return <Info size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 backdrop-blur-md relative overflow-hidden border border-emerald-900/10">
      
      {/* Background HUD Graphics */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <TrendingUp size={200} className="text-emerald-500" />
      </div>

      <div className="flex justify-between items-center p-4 border-b border-emerald-900/20 relative z-20 bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-900/20 border border-emerald-500/30 rounded">
            <Activity size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-400 font-terminal uppercase tracking-tighter">Barrier_Integrity_Pulse</h2>
            <div className="flex items-center space-x-2">
               <span className="text-[8px] text-emerald-800 uppercase tracking-widest font-black">Sawtooth_Scavenger_Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
           <div className="bg-slate-900 border border-emerald-900/40 p-1 rounded-sm flex space-x-1">
              <button 
                onClick={() => setView('LIVE')}
                className={`px-4 py-1.5 rounded-sm text-[9px] font-black uppercase transition-all ${view === 'LIVE' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-emerald-800 hover:text-emerald-400'}`}
              >
                Live_Monitor
              </button>
              <button 
                onClick={() => setView('FINGERPRINT')}
                className={`px-4 py-1.5 rounded-sm text-[9px] font-black uppercase transition-all ${view === 'FINGERPRINT' ? 'bg-orange-500 text-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'text-emerald-800 hover:text-orange-400'}`}
              >
                Fingerprint
              </button>
              <button 
                onClick={() => setView('SCAVENGER')}
                className={`px-4 py-1.5 rounded-sm text-[9px] font-black uppercase transition-all ${view === 'SCAVENGER' ? 'bg-purple-500 text-slate-950 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-emerald-800 hover:text-purple-400'}`}
              >
                Scavenger
              </button>
           </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 relative">
        
        {/* Main Chart Area */}
        <div className="flex-1 p-6 flex flex-col space-y-4">
          <div className="flex-1 bg-slate-950/60 rounded-xl border border-emerald-900/30 p-6 relative group overflow-hidden">
             <div className="absolute top-4 left-4 z-20 flex items-center space-x-3">
                <div className="bg-slate-950/90 border border-emerald-900/50 px-3 py-1.5 rounded flex items-center space-x-2 shadow-2xl">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[9px] font-black text-emerald-100 uppercase tracking-widest">
                     {view === 'LIVE' ? 'ACTIVE_PRESSURE_STREAM' : view === 'FINGERPRINT' ? 'ACOUSTIC_REFLECTION_MAP' : 'SCAVENGED_OVERLAY'}
                   </span>
                </div>
                {view === 'SCAVENGER' && (
                  <button 
                    onClick={() => setShowHistoricalOverlay(!showHistoricalOverlay)}
                    className={`px-3 py-1.5 rounded border text-[9px] font-black uppercase transition-all ${showHistoricalOverlay ? 'bg-purple-500 border-purple-400 text-slate-950' : 'bg-slate-900 border-purple-900/30 text-purple-400'}`}
                  >
                    Overlay_10YR_Ghost
                  </button>
                )}
             </div>

             <ResponsiveContainer width="100%" height="100%">
               {view === 'FINGERPRINT' ? (
                 <ComposedChart data={fingerprintData} margin={{ top: 40, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="1 5" stroke="#064e3b" opacity={0.1} />
                    <XAxis dataKey="time" stroke="#10b981" fontSize={9} label={{ value: 'TIME (s)', position: 'bottom', offset: -5, fill: '#064e3b', fontSize: 8 }} />
                    <YAxis stroke="#10b981" fontSize={9} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #064e3b', fontSize: '10px' }}
                      formatter={(val: any, name: string) => [val, name === 'pressure' ? 'P_TRANS' : 'ECHO_MAG']}
                    />
                    <Area type="monotone" dataKey="pressure" stroke="#10b981" fill="#10b981" fillOpacity={0.05} dot={false} isAnimationActive={false} />
                    <Scatter dataKey="echo" fill="#f97316" shape={(props: any) => {
                      const { cx, cy } = props;
                      if (!cy) return null;
                      return (
                        <g>
                          <circle cx={cx} cy={cy} r={8} fill="#f97316" fillOpacity={0.2} className="animate-ping" />
                          <circle cx={cx} cy={cy} r={3} fill="#f97316" />
                          <text x={cx + 10} y={cy - 10} fill="#f97316" fontSize="8" fontWeight="black" className="uppercase font-terminal">ECHO_DETECTED</text>
                        </g>
                      );
                    }} />
                 </ComposedChart>
               ) : (
                 <ComposedChart data={MOCK_PRESSURE_DATA} margin={{ top: 40, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={view === 'LIVE' ? analysis.color : '#a855f7'} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={view === 'LIVE' ? analysis.color : '#a855f7'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.1} />
                    <XAxis dataKey="timestamp" stroke="#10b981" fontSize={9} axisLine={{stroke: '#064e3b'}} />
                    <YAxis stroke="#10b981" fontSize={9} axisLine={{stroke: '#064e3b'}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #064e3b', fontSize: '10px' }}
                      itemStyle={{ textTransform: 'uppercase' }}
                    />
                    {showHistoricalOverlay && (
                      <Line type="monotone" data={MOCK_SCAVENGED_PRESSURE_TESTS} dataKey="pressure" stroke="#a855f7" strokeWidth={1} strokeDasharray="4 4" dot={false} opacity={0.4} />
                    )}
                    <Area type="monotone" dataKey="pressure" stroke={view === 'LIVE' ? analysis.color : '#a855f7'} fillOpacity={1} fill="url(#colorPressure)" strokeWidth={3} dot={{ r: 4, fill: '#020617', stroke: view === 'LIVE' ? analysis.color : '#a855f7', strokeWidth: 2 }} />
                    <ReferenceLine y={800} stroke="#FF5F1F" strokeDasharray="5 5" label={{ value: 'CRITICAL BLEED', position: 'insideRight', fill: '#FF5F1F', fontSize: 8, fontWeight: 'bold' }} />
                 </ComposedChart>
               )}
             </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-slate-950/80 border border-emerald-900/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-emerald-800 uppercase font-black tracking-widest">Lease_Slope</span>
                  <Activity size={12} className="text-emerald-700" />
                </div>
                <div className="text-2xl font-black text-emerald-100 font-terminal">{analysis.slope.toFixed(2)} PSI/U</div>
                <div className="text-[8px] text-emerald-900 mt-1 uppercase font-black tracking-widest">DRIVE_FORCE: {Math.abs(analysis.slope) > 5 ? 'SUSTAINED' : 'RESIDUAL'}</div>
             </div>
             <div className="p-4 bg-slate-950/80 border border-emerald-900/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-emerald-800 uppercase font-black tracking-widest">Integrity_Lock</span>
                  <ShieldCheck size={12} className="text-emerald-700" />
                </div>
                <div className="text-2xl font-black text-emerald-100 font-terminal">{(analysis.rSquared * 100).toFixed(1)}%</div>
                <div className="text-[8px] text-emerald-900 mt-1 uppercase font-black tracking-widest">R2_CONCORDANCE: {analysis.rSquared > 0.95 ? 'HIGH' : 'UNSTABLE'}</div>
             </div>
          </div>
        </div>

        {/* Sidebar: Chronology or Diagnostic */}
        <div className="w-96 border-l border-emerald-900/20 flex flex-col bg-slate-950/40 overflow-hidden">
          {view === 'LIVE' ? (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.3em]">Sovereign_Diagnosis</h3>
                <button onClick={handleSecureAsset} disabled={isSecuring} className="px-2 py-1 bg-amber-500 text-slate-950 rounded text-[8px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all">
                    {isSecuring ? 'Securing...' : 'Secure_Pulse'}
                </button>
              </div>
              <div className="p-5 bg-slate-900/50 border-l-4 rounded-r shadow-xl relative overflow-hidden" style={{ borderColor: analysis.color }}>
                 <div className="absolute top-0 right-0 p-2 opacity-5"><Cpu size={40} className="text-emerald-500" /></div>
                 <span className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: analysis.color }}>{analysis.status}</span>
                 <p className="text-[11px] text-emerald-100 font-terminal italic leading-relaxed">"{analysis.diagnosis}"</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-emerald-900/20">
                 <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Active_Alert_Log</h4>
                 <div className="space-y-2">
                    <div className="p-3 bg-slate-950 border border-emerald-900/30 rounded text-[10px] font-terminal text-emerald-100/60 flex items-center justify-between">
                       <span>BLEED_THRESHOLD_EXCEEDED</span>
                       <span className="text-red-500 font-black">@09:12</span>
                    </div>
                    <div className="p-3 bg-slate-950 border border-emerald-900/30 rounded text-[10px] font-terminal text-emerald-100/60 flex items-center justify-between">
                       <span>GRADIENT_STABILIZED</span>
                       <span className="text-emerald-500 font-black">@08:45</span>
                    </div>
                 </div>
              </div>
            </div>
          ) : view === 'FINGERPRINT' ? (
            <div className="p-6 flex flex-col h-full space-y-6">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[12px] font-black text-orange-400 uppercase tracking-[0.3em]">Acoustic_Audit</h3>
                  <Waves size={18} className="text-orange-700" />
               </div>
               
               <div className="p-4 bg-orange-950/20 border border-orange-500/20 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-orange-400 uppercase">
                    <FingerprintIcon size={14} /> <span>Echo Analysis Results</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] border-b border-orange-900/10 pb-1">
                      <span className="text-slate-500">Echo #1 Depth:</span>
                      <span className="text-orange-400 font-bold font-terminal">3,045m</span>
                    </div>
                    <div className="flex justify-between text-[11px] border-b border-orange-900/10 pb-1">
                      <span className="text-slate-500">Classification:</span>
                      <span className="text-red-500 font-black">PHANTOM_STEEL</span>
                    </div>
                    <p className="text-[9px] text-orange-200/50 italic leading-tight mt-2">
                      "Impedance reflection at 3,045m corresponds to an unrecorded change in tubing geometry. Possible phantom bridge plug or structural collapse."
                    </p>
                  </div>
               </div>

               <div className="flex-1 border border-orange-900/20 rounded-xl p-4 bg-black/40 overflow-y-auto custom-scrollbar">
                  <span className="text-[8px] font-black text-orange-900 uppercase block mb-3 tracking-widest">Digital_Reflection_Stream</span>
                  {fingerprintData.filter(d => d.echo !== null).map((echo, i) => (
                    <div key={i} className="mb-3 p-2 bg-orange-500/5 border-l-2 border-orange-500 rounded-r flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-orange-100 uppercase">Reflector_{i+1}</span>
                          <span className="text-[8px] font-mono text-orange-900">{echo.depth}m // {echo.time}s</span>
                       </div>
                       <Target size={14} className="text-orange-500" />
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col h-full">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[12px] font-black text-purple-400 uppercase tracking-[0.3em]">Integrity_Artifacts</h3>
                  <History size={18} className="text-purple-700" />
               </div>

               <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 pb-6">
                  {MOCK_HISTORICAL_BARRIER_LOGS.map((event) => (
                    <div key={event.id} className={`p-4 rounded-lg border-l-2 bg-slate-900/40 transition-all hover:bg-slate-900 relative group ${event.severity === 'CRITICAL' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-purple-900/50'}`}>
                       <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                             {getEventIcon(event.type)}
                             <span className={`text-[10px] font-black uppercase tracking-widest ${event.severity === 'CRITICAL' ? 'text-red-400' : 'text-purple-300'}`}>{event.type}</span>
                          </div>
                          <span className="text-[8px] font-mono text-slate-500">{event.date}</span>
                       </div>
                       <p className="text-[10px] text-slate-300 font-terminal leading-relaxed mb-2 opacity-80">{event.summary}</p>
                       <div className="flex items-center justify-between">
                          <span className="text-[8px] text-purple-900 font-black uppercase tracking-widest">ANNULUS: {event.annulus}</span>
                          {event.volume && (
                            <span className="text-[8px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full font-black">{event.volume} {event.unit}</span>
                          )}
                       </div>
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight size={12} className="text-purple-500" />
                       </div>
                    </div>
                  ))}
               </div>

               <div className="pt-6 border-t border-purple-900/30 space-y-4">
                  <button 
                    onClick={triggerScavenge}
                    disabled={isScavenging}
                    className="w-full py-4 bg-purple-500 text-slate-950 font-black uppercase text-[10px] tracking-[0.3em] rounded shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center space-x-3 group relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                     {isScavenging ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                     <span>{isScavenging ? 'Scavenging_Artifacts...' : 'Scavenge NDR for Logs'}</span>
                  </button>
                  
                  {isScavenging && (
                    <div className="h-1 bg-slate-900 rounded-full overflow-hidden border border-purple-900/30">
                       <div className="h-full bg-purple-500 shadow-[0_0_10px_#a855f7]" style={{ width: `${scavengeProgress}%` }}></div>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PulseAnalyzer;
