import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  ResponsiveContainer, ComposedChart, CartesianGrid, 
  XAxis, YAxis, Tooltip, Line, Legend, Scatter, Area, ReferenceArea, ReferenceLine
} from 'recharts';
import { Activity, Zap, TrendingDown, Mountain, Fingerprint, Maximize, RotateCcw, Move, Search as SearchIcon, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';
import { SignalMetadata, SyncAnomaly } from '../hooks/useGhostSync';

interface GhostSyncWaveformProps {
  combinedData: any[];
  signals: SignalMetadata[];
  ghostLabel: string;
  activeAnomalyId?: string | null;
  anomalies?: SyncAnomaly[];
  varianceWindow?: number;
  zoomRange: { left: number | string; right: number | string };
  onZoomRangeChange: (range: { left: number | string; right: number | string }) => void;
}

const GhostSyncWaveform: React.FC<GhostSyncWaveformProps> = ({ 
  combinedData, 
  signals, 
  ghostLabel,
  activeAnomalyId = null,
  anomalies = [],
  varianceWindow = 5,
  zoomRange,
  onZoomRangeChange
}) => {
  const [activeDepth, setActiveDepth] = useState<number | null>(null);
  const [interactionMode, setInteractionMode] = useState<'ZOOM' | 'PAN'>('ZOOM');
  const [isHoveringChart, setIsHoveringChart] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [refAreaLeft, setRefAreaLeft] = useState<number | string>('');
  const [refAreaRight, setRefAreaRight] = useState<number | string>('');
  
  const [panAnchorDepth, setPanAnchorDepth] = useState<number | null>(null);
  const [panInitialRange, setPanInitialRange] = useState<{l: number, r: number} | null>(null);

  const handleMouseMove = (state: any) => {
    if (!state) return;
    
    if (state.activePayload && state.activePayload.length > 0) {
      const depth = state.activePayload[0].payload.depth;
      if (!isNaN(depth)) setActiveDepth(depth);
    }

    if (interactionMode === 'ZOOM' && isDragging) {
      setRefAreaRight(state.activeLabel);
    } 
    else if (interactionMode === 'PAN' && isDragging && panAnchorDepth !== null && panInitialRange !== null) {
      const currentDepth = Number(state.activeLabel);
      if (isNaN(currentDepth)) return;
      
      const delta = panAnchorDepth - currentDepth;
      if (!isNaN(delta)) {
        onZoomRangeChange({
          left: panInitialRange.l + delta,
          right: panInitialRange.r + delta
        });
      }
    }
  };

  const handleMouseDown = (e: any) => {
    if (!e || !e.activeLabel) return;
    setIsDragging(true);
    
    if (interactionMode === 'ZOOM') {
      setRefAreaLeft(e.activeLabel);
    } else {
      const depth = Number(e.activeLabel);
      if (!isNaN(depth)) {
        setPanAnchorDepth(depth);
        const dataMin = combinedData[0]?.depth || 0;
        const dataMax = combinedData[combinedData.length - 1]?.depth || 0;
        setPanInitialRange({
          l: zoomRange.left === 'dataMin' ? dataMin : Number(zoomRange.left),
          r: zoomRange.right === 'dataMax' ? dataMax : Number(zoomRange.right)
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (interactionMode === 'ZOOM' && isDragging) {
      let [l, r] = [refAreaLeft, refAreaRight];
      if (l !== r && r !== '') {
        const ln = Number(l);
        const rn = Number(r);
        if (!isNaN(ln) && !isNaN(rn)) {
          if (ln > rn) [l, r] = [r, l];
          onZoomRangeChange({ left: l, right: r });
        }
      }
      setRefAreaLeft('');
      setRefAreaRight('');
    }
    setIsDragging(false);
    setPanAnchorDepth(null);
    setPanInitialRange(null);
  };

  const resetZoom = () => {
    onZoomRangeChange({ left: 'dataMin', right: 'dataMax' });
  };

  const renderScanningDot = (props: any) => {
    const { cx, cy, stroke } = props;
    if (!cy) return null;
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill={stroke} opacity={0.3}>
          <animate attributeName="r" from="4" to="20" dur="0.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.4" to="0" dur="0.6s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r={3} fill={stroke} stroke="#ffffff" strokeWidth={1} />
      </g>
    );
  };

  return (
    <div className={`flex-1 min-h-[300px] bg-[#020617] rounded-xl border border-emerald-500/20 p-4 relative overflow-hidden flex flex-col shadow-[inset_0_0_80px_rgba(0,255,65,0.05)] group select-none ${interactionMode === 'PAN' ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,65,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,2px_100%] z-0"></div>

      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <div className="flex items-center space-x-3 bg-black/90 border border-emerald-500/40 px-4 py-2 rounded shadow-2xl backdrop-blur-md">
          <Activity size={18} className="text-emerald-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">High-Res_Waveform_Telemetry</span>
            <span className="text-[7px] font-mono text-emerald-900 uppercase">Aperture: {varianceWindow}m // Trace: GR_Artifact</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-30 flex space-x-3 items-start">
        {activeDepth !== null && (
          <div className="bg-emerald-500 text-slate-950 px-3 py-1.5 rounded font-black text-[10px] tracking-widest shadow-2xl animate-in fade-in zoom-in-95">
             <Crosshair size={10} className="inline mr-2" /> DEPTH: {activeDepth.toFixed(2)}M
          </div>
        )}

        <div className="flex bg-slate-950/90 border border-emerald-900/50 p-1 rounded shadow-2xl backdrop-blur-md">
          <button onClick={() => setInteractionMode('ZOOM')} className={`p-2 rounded transition-all ${interactionMode === 'ZOOM' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-900 hover:text-emerald-500'}`}>
            <SearchIcon size={16} />
          </button>
          <button onClick={() => setInteractionMode('PAN')} className={`p-2 rounded transition-all ${interactionMode === 'PAN' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-900 hover:text-emerald-500'}`}>
            <Move size={16} />
          </button>
          <div className="w-px bg-emerald-900/20 mx-1"></div>
          <button onClick={resetZoom} className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-all">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative z-10 mt-12">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={combinedData} 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseEnter={() => setIsHoveringChart(true)}
            onMouseLeave={() => { handleMouseUp(); setActiveDepth(null); setIsHoveringChart(false); }}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="2 10" stroke="#00FF41" opacity={0.05} />
            <XAxis 
              dataKey="depth" 
              hide={true}
              domain={[zoomRange.left, zoomRange.right]}
              type="number"
              allowDataOverflow={true}
            />
            <YAxis hide={true} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#020617', border: '1px solid #00FF41', fontSize: '10px' }}
              cursor={{ stroke: '#00FF41', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            
            {interactionMode === 'ZOOM' && refAreaLeft && refAreaRight && (
              <ReferenceArea x1={refAreaLeft} x2={refAreaRight} fill="#00FF41" fillOpacity={0.1} />
            )}

            {(anomalies || []).map(anomaly => (
              <ReferenceArea
                key={anomaly.id}
                x1={anomaly.startDepth}
                x2={anomaly.endDepth}
                fill={anomaly.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}
                fillOpacity={activeAnomalyId === anomaly.id ? 0.3 : 0.15}
                className={activeAnomalyId === anomaly.id ? 'animate-pulse' : ''}
              />
            ))}

            {(signals || []).map(sig => sig?.visible && (
              <Line 
                key={sig.id} 
                type="monotone" 
                dataKey={sig.id === 'SIG-001' ? 'baseGR' : sig.id === 'SIG-002' ? 'ghostGR' : sig.id} 
                name={sig.id === 'SIG-002' ? ghostLabel : sig.name} 
                stroke={sig.color} 
                dot={false} 
                strokeWidth={sig.id === 'SIG-001' ? (isHoveringChart ? 5 : 3) : (isHoveringChart ? 4 : 2)} 
                isAnimationActive={false} 
                activeDot={renderScanningDot}
                connectNulls={true}
                className={isHoveringChart && (sig.id === 'SIG-001' || sig.id === 'SIG-002') ? 'spectral-shimmer' : ''}
                style={{ transition: 'stroke-width 0.2s ease' }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="absolute bottom-4 left-4 flex gap-6 text-[8px] font-black uppercase text-emerald-900 tracking-widest z-20">
         <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#00FF41]"></div> Signal_Staged</span>
         <span className="flex items-center gap-1.5 opacity-40"><Zap size={10} /> Dynamic_Aperture_Locked</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .spectral-shimmer {
          filter: drop-shadow(0 0 12px currentColor);
          animation: spectral-wave 2s ease-in-out infinite;
        }
        @keyframes spectral-wave {
          0% { opacity: 0.6; stroke-dasharray: 100, 0; }
          50% { opacity: 1; stroke-dasharray: 50, 50; }
          100% { opacity: 0.6; stroke-dasharray: 100, 0; }
        }
      `}} />
    </div>
  );
};

export default GhostSyncWaveform;