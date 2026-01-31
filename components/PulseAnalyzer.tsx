import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MOCK_PRESSURE_DATA, MOCK_BALLOCH_THERMAL_CORRELATION } from '../constants';
import { calculateLinearRegression, diagnoseSawtooth, detectCyclicalCorrelation } from '../forensic_logic/math';
import { 
  Activity, Zap, TrendingUp, Maximize2, Minimize2
} from 'lucide-react';
import { secureAsset } from '../services/vaultService';

interface PulseAnalyzerProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

// Added missing default export and completed truncated component logic
const PulseAnalyzer: React.FC<PulseAnalyzerProps> = ({ isFocused, onToggleFocus }) => {
  const [view, setView] = useState<'LIVE' | 'WAVEFORM'>('WAVEFORM');
  const [isLive, setIsLive] = useState(true);
  const [waveformOffset, setWaveformOffset] = useState(0);
  const animationRef = useRef<number | null>(null);

  const pressures = MOCK_PRESSURE_DATA.slice(0, 4).map(d => d.pressure);
  const analysis = useMemo(() => {
    const { slope, rSquared } = calculateLinearRegression(pressures);
    const diagnosis = diagnoseSawtooth(rSquared, slope);
    return { slope, rSquared, ...diagnosis };
  }, [pressures]);

  const thermalCorrelation = useMemo(() => {
    const pData = MOCK_BALLOCH_THERMAL_CORRELATION.map(d => d.pressure);
    const tData = MOCK_BALLOCH_THERMAL_CORRELATION.map(d => d.temperature || 30);
    return detectCyclicalCorrelation(pData, tData);
  }, []);

  // Rolling Waveform Data Synthesis
  const waveformData = useMemo(() => {
    const points = 120;
    return Array.from({ length: points }, (_, i) => {
      const x = i + waveformOffset;
      const base = 850;
      const h1 = Math.sin(x * 0.4) * 20; // Fundamental
      const h2 = Math.sin(x * 1.2) * 8;  // 2nd Harmonic
      const noise = (Math.random() - 0.5) * 12;
      const transient = (x % 300 > 280) ? Math.random() * 50 : 0;
      
      return {
        sample: i,
        raw: base + h1 + h2 + noise + transient,
        envelope: base + h1,
      };
    });
  }, [waveformOffset]);

  // Simulated FFT / Spectral Density
  const spectralData = useMemo(() => {
    return [
      { freq: '0.1 Hz', power: 85, type: 'Fundamental' },
      { freq: '0.3 Hz', power: 42, type: 'Harmonic' },
      { freq: '0.8 Hz', power: 15, type: 'Turbulence' },
      { freq: '1.2 Hz', power: 8, type: 'Noise' },
      { freq: '2.5 Hz', power: 32, type: 'Scale_Choke' }
    ];
  }, []);

  useEffect(() => {
    if (view === 'WAVEFORM' && isLive) {
      const animate = () => {
        setWaveformOffset(prev => prev + 1);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [view, isLive]);

  const handleSecureAsset = () => {
    secureAsset({
      title: view === 'WAVEFORM' ? 'High_Res_Waveform_Veto' : `Integrity Pulse Audit: ${analysis.status}`,
      status: analysis.color === '#ef4444' ? 'CRITICAL' : 'VERIFIED',
      summary: view === 'WAVEFORM' 
        ? "High-frequency pressure telemetry analyzed. Harmonic transients identified at surface. Physical signature suggests turbulent flow bypass rather than static seal failure."
        : `Sawtooth pressure analysis. Slope: ${analysis.slope.toFixed(2)} PSI/U. R2: ${(analysis.rSquared * 100).toFixed(1)}%. ${analysis.diagnosis}`,
      region: 'UKCS (Balloch Hub)',
      valueEst: view === 'WAVEFORM' ? 3200000 : 250000,
      confidence: analysis.rSquared * 100
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 backdrop-blur-md relative overflow-hidden border border-emerald-900/10 font-terminal">
      {/* HUD Header */}
      <div className="flex items-center justify-between p-4 border-b border-emerald-900/20 bg-black/20">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-emerald-500 animate-pulse" />
          <div>
            <h2 className="text-lg font-black text-emerald-400 uppercase tracking-tighter leading-none">Pulse_Analyzer</h2>
            <span className="text-[8px] font-black text-emerald-900 uppercase tracking-widest">High-Freq Telemetry Autopsy</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setView('WAVEFORM')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all ${view === 'WAVEFORM' ? 'bg-emerald-500 text-black' : 'text-emerald-800 hover:text-emerald-400'}`}>Waveform</button>
           <button onClick={() => setView('LIVE')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all ${view === 'LIVE' ? 'bg-emerald-500 text-black' : 'text-emerald-800 hover:text-emerald-400'}`}>Pulse_Audit</button>
           {onToggleFocus && (
              <button onClick={onToggleFocus} aria-label="Toggle Focus Mode" className="p-1.5 text-emerald-900 hover:text-emerald-400 transition-colors">
                 {isFocused ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
           )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
        {view === 'WAVEFORM' && (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
             <div className="flex-1 bg-black/40 rounded-2xl border border-emerald-900/20 p-4 relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 bg-black/60 rounded border border-emerald-500/20">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live_Telemetry_Stream</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={waveformData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.1} />
                      <XAxis dataKey="sample" hide />
                      <YAxis hide domain={[750, 950]} />
                      <Area type="monotone" dataKey="raw" stroke="#10b981" fill="#10b981" fillOpacity={0.1} isAnimationActive={false} />
                      <Area type="monotone" dataKey="envelope" stroke="#3b82f6" fill="none" strokeWidth={1} isAnimationActive={false} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
             
             <div className="h-48 flex gap-4">
                <div className="flex-1 bg-black/40 rounded-2xl border border-emerald-900/20 p-4 overflow-hidden">
                   <span className="text-[9px] font-black text-emerald-900 uppercase tracking-widest block mb-4">Spectral_Density_Analysis</span>
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spectralData}>
                         <XAxis dataKey="freq" fontSize={8} stroke="#064e3b" />
                         <YAxis hide />
                         <Bar dataKey="power" fill="#10b981" radius={[2, 2, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
                <div className="w-64 bg-slate-900/60 rounded-2xl border border-emerald-900/20 p-4 flex flex-col justify-between shadow-lg">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Fundamental</span>
                         <span className="text-xs font-black text-emerald-100">0.1 Hz</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Scale_Choke</span>
                         <span className="text-xs font-black text-orange-500 uppercase">Detected</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">R_Squared</span>
                         <span className="text-xs font-black text-emerald-100">{(analysis.rSquared * 100).toFixed(1)}%</span>
                      </div>
                   </div>
                   <button 
                     onClick={handleSecureAsset} 
                     className="w-full py-3 bg-emerald-500 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-400 transition-all active:scale-95"
                   >
                     Secure_Audit_Veto
                   </button>
                </div>
             </div>
          </div>
        )}
        
        {view === 'LIVE' && (
           <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-30 group cursor-default">
              <Activity size={80} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-black text-emerald-900 uppercase tracking-[1em]">Audit_Mode_Standby</span>
           </div>
        )}
      </div>
    </div>
  );
};

// Fixed App.tsx import error: line 18
export default PulseAnalyzer;
