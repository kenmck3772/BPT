
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, 
  Tooltip, Line, Area, Scatter, ScatterChart, ZAxis, Cell
} from 'recharts';
import { 
  Activity, Thermometer, ShieldCheck, Target, 
  Clock, History, Info, ShieldAlert,
  Loader2, Maximize2, Minimize2, Terminal, AlertCircle,
  TrendingUp, Save, Check, Scale,
  Globe, Play, Pause, RotateCcw, AlertOctagon,
  Zap, BarChart2, MousePointer2, Focus,
  Droplets, Ruler, CheckCircle2,
  Waves, Fingerprint, Lock, AlertTriangle,
  Link2, Link2Off, Anchor, Microscope
} from 'lucide-react';
import { MOCK_BALLOCH_THERMAL_CORRELATION } from '../constants';
import { calculateThermalLag, detectCyclicalCorrelation } from '../forensic_logic/math';
import { getBallochForensicAudit, BallochThermalAudit } from '../services/geminiService';
import { playLockSound, secureAsset } from '../services/vaultService';

const BallochAudit: React.FC<{isFocused?: boolean; onToggleFocus?: () => void}> = ({ isFocused, onToggleFocus }) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditData, setAuditData] = useState<BallochThermalAudit | null>(null);
  const [isSecuring, setIsSecuring] = useState(false);
  const [viewMode, setViewMode] = useState<'TIME_SERIES' | 'ELASTICITY'>('TIME_SERIES');
  const [playbackIndex, setPlaybackIndex] = useState(MOCK_BALLOCH_THERMAL_CORRELATION.length - 1);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<any>(null);

  const fullData = MOCK_BALLOCH_THERMAL_CORRELATION;
  
  const anomalies = useMemo(() => {
    return fullData.filter((d) => {
      const expectedP = 800 + ((d.temperature || 30) - 30) * 12.4;
      const deviation = Math.abs(d.pressure - expectedP);
      return deviation > 18; 
    });
  }, [fullData]);

  const currentVisibleData = useMemo(() => {
    if (!isAnimating && playbackIndex === fullData.length - 1) return fullData;
    return fullData.slice(0, playbackIndex + 1);
  }, [isAnimating, playbackIndex, fullData]);

  const thermalLag = useMemo(() => {
    const p = currentVisibleData.map(d => d.pressure);
    const t = currentVisibleData.map(d => d.temperature || 0);
    return calculateThermalLag(p, t);
  }, [currentVisibleData]);

  const pearsonR = useMemo(() => {
    const p = currentVisibleData.map(d => d.pressure);
    const t = currentVisibleData.map(d => d.temperature || 0);
    return detectCyclicalCorrelation(p, t);
  }, [currentVisibleData]);

  useEffect(() => {
    if (isAnimating) {
      animationRef.current = setInterval(() => {
        setPlaybackIndex(prev => {
          if (prev >= fullData.length - 1) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100);
    } else {
      if (animationRef.current) clearInterval(animationRef.current);
    }
    return () => { if (animationRef.current) clearInterval(animationRef.current); };
  }, [isAnimating, fullData.length]);

  const runAudit = async () => {
    setIsAuditing(true);
    setAuditData(null);
    try {
      const data = await getBallochForensicAudit();
      setAuditData(data);
      playLockSound();
    } catch (err) {
      console.error("BALLOCH_AUDIT_FAIL:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  const togglePlayback = () => {
    if (playbackIndex >= fullData.length - 1) setPlaybackIndex(0);
    setIsAnimating(!isAnimating);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal text-[#E0E0E0]">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-blue-900/30 pb-4 relative z-10 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/40 rounded-xl shadow-lg">
            <Waves size={24} className="text-blue-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-blue-400 uppercase tracking-tighter">BALLOCH_B2: THERMAL_SLAVE</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAudit} disabled={isAuditing} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase hover:bg-blue-500 transition-all flex items-center gap-3">
            {isAuditing ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            <span>Run_Audit</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col relative min-h-0 overflow-hidden">
        <div className="flex-1 bg-black/60 border border-blue-900/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={currentVisibleData} margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.1} />
              <XAxis dataKey="timestamp" hide />
              <YAxis yAxisId="left" stroke="#3b82f6" fontSize={9} domain={[780, 950]} />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={9} domain={[20, 50]} />
              <Area yAxisId="left" type="monotone" dataKey="pressure" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={4} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BallochAudit;
