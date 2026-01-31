
import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, ComposedChart, CartesianGrid, 
  XAxis, YAxis, Tooltip, Area, Line, ReferenceArea, Scatter
} from 'recharts';
import { Target, Crosshair, AlertTriangle, Activity, Zap, SearchCode, Flame } from 'lucide-react';
import { SignalMetadata, SyncAnomaly } from '../hooks/useGhostSync';

interface SyncMonitorChartProps {
  combinedData: any[];
  signals: SignalMetadata[];
  viewMode: 'OVERLAY' | 'DIFFERENTIAL' | 'WAVEFORM';
  ghostLabel: string;
  validationError: string | null;
  offset: number;
  anomalies?: SyncAnomaly[];
  anomalyThreshold?: number;
  activeAnomalyId?: string | null;
  onDepthChange?: (depth: number | null) => void;
  varianceWindow?: number;
  isAuditingVariance?: boolean;
  onInspectAnomaly?: (anomaly: SyncAnomaly) => void;
}

const getAnomalyColor = (severity: string) => {
  if (severity === 'CRITICAL') return '#ef4444';
  if (severity === 'WARNING') return '#f97316';
  if (severity === 'MICRO') return '#fbbf24';
  return '#10b981';
};

const CustomForensicTooltip = (props: any) => {
  const { active, payload, label, anomalies, onInspectAnomaly } = props;
  if (active && payload && payload.length) {
    const depth = parseFloat(label);
    const isBypassed = payload.some((p: any) => p.payload && p.payload.bypassed_pay);
    const gasPeak = payload.find((p: any) => typeof p.dataKey === 'string' && (p.dataKey.includes('_peak') || p.dataKey === 'total_gas'));
    const anomalyAtDepth = (anomalies || []).find((a: any) => depth >= a.startDepth && depth <= a.endDepth);

    return (
      <div className="bg-slate-950/95 border border-emerald-500/40 p-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md rounded-lg font-terminal min-w-[240px] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2 mb-2">
           <div className="flex items-center gap-2">
              {isBypassed ? <Zap size={12} className="text-cyan-400" /> : gasPeak ? <Flame size={12} className="text-orange-500" /> : <Crosshair size={12} className="text-emerald-500" />}
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                {isBypassed ? 'RESERVOIR_RECOVERY_ALERT' : gasPeak ? 'Gas_Artifact_Check' : 'Voxel_Inspection'}
              </span>
           </div>
           <span className="text-[10px] font-bold text-white tabular-nums">{depth.toFixed(2)}m</span>
        </div>

        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            if (!entry || entry.dataKey === 'diff' || entry.dataKey === 'activePulse' || entry.dataKey === 'bypassed_pay') return null; 
            const val = entry.value;
            const isMissing = typeof val === 'string' && (val.includes('DATA_MISSING') || val.includes('DATA_UNREADABLE'));
            return (
              <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-[9px] font-black text-emerald-100/60 uppercase truncate max-w-[120px]">
                    {String(entry.name || "").replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                   <span className={`text-[10px] font-black tabular-nums ${isMissing ? 'text-red-500 animate-pulse font-black' : 'text-white'}`}>
                     {typeof val === 'number' ? val.toLocaleString() : val || '--'}
                   </span>
                </div>
              </div>
            );
          })}
        </div>

        {anomalyAtDepth && (
          <div className="mt-4 pt-3 border-t border-emerald-900/30">
            <button 
              onClick={(e) => { e.stopPropagation(); onInspectAnomaly?.(anomalyAtDepth); }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500 text-black rounded text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            >
              <SearchCode size={12} />
              Launch Deep Audit
            </button>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const GasPeakRenderer = (props: any) => {
  const { cx, cy, payload, color, label, peakKey } = props;
  if (cy === null || isNaN(cy) || cx === null || isNaN(cx)) return null;
  const ppm = payload[peakKey];
  const isCritical = typeof ppm === 'number' && ppm > 10000;
  return (
    <g>
      {isCritical && <circle cx={cx} cy={cy} r={12} fill={color} fillOpacity={0.15} className="animate-pulse" />}
      <path d="M 0 -8 L 6 4 L -6 4 Z" transform={`translate(${cx}, ${cy})`} fill={isCritical ? '#ef4444' : color} stroke="#ffffff" strokeWidth={1} />
      <text x={cx + 12} y={cy + 4} fill={isCritical ? '#ef4444' : color} fontSize="8" fontStyle="italic" fontWeight="black" className="uppercase font-mono pointer-events-none drop-shadow-md">
         {label} {isCritical ? '[CRITICAL]' : ''}
      </text>
    </g>
  );
};

const AnomalyRenderer = (props: any) => {
  const { cx, cy, payload, activeAnomalyId, onInspectAnomaly } = props;
  if (cy === null || isNaN(cy) || cx === null || isNaN(cx)) return null;
  const anomaly = payload?.anomaly;
  if (!anomaly) return null;
  const color = getAnomalyColor(anomaly.severity);
  const isFocused = activeAnomalyId === anomaly.id;
  return (
    <g className="cursor-pointer" onClick={() => onInspectAnomaly?.(anomaly)}>
      <circle cx={cx} cy={cy} r={isFocused ? 14 : 8} fill={color} fillOpacity={0.1} stroke={color} strokeWidth={2} className={anomaly.severity === 'CRITICAL' ? 'animate-pulse' : ''} />
      <circle cx={cx} cy={cy} r={2} fill={color} />
      <path d="M -4 4 L 0 -4 L 4 4 Z" transform={`translate(${cx}, ${cy - 12})`} fill={color} />
    </g>
  );
};

const SyncMonitorChart: React.FC<SyncMonitorChartProps> = ({ 
  combinedData, signals, viewMode, ghostLabel, offset,
  anomalies = [], anomalyThreshold = 25, activeAnomalyId = null, onDepthChange,
  onInspectAnomaly
}) => {
  const handleMouseMove = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const depth = state.activePayload[0].payload.depth;
      if (!isNaN(depth)) onDepthChange?.(depth);
    }
  };

  const handleMouseLeave = () => onDepthChange?.(null);

  const anomalyMarkers = useMemo(() => (anomalies || []).map(a => ({
    depth: (a.startDepth + a.endDepth) / 2,
    baseGR: 150,
    anomaly: a
  })), [anomalies]);

  const gasPeaksData = useMemo(() => (combinedData || []).filter(d => d.c1_peak), [combinedData]);

  // Explicit mapping to avoid any ambiguous JSX expressions that can cause syntax errors
  const activeSignals = (signals || []).filter(sig => sig && sig.visible);

  return (
    <div id="Forensic-Chart-Viewport" className="flex-1 min-h-[350px] bg-slate-950/80 rounded-xl border border-emerald-500/10 p-4 relative group overflow-hidden flex flex-col shadow-inner">
      <div className="absolute top-4 left-4 z-20">
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-emerald-500/20 px-3 py-1 rounded shadow-lg">
          <Target size={12} className="text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Trace_Lock_Active</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combinedData} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <defs>
               <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={0.2}/><stop offset="100%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
               <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4"><path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" /></pattern>
            </defs>
            <CartesianGrid strokeDasharray="1 5" stroke="#10b981" opacity={0.1} />
            <XAxis dataKey="depth" stroke="#10b981" fontSize={10} />
            <YAxis yAxisId="left" stroke="#10b981" fontSize={10} domain={['auto', 300]} />
            <YAxis yAxisId="gas" orientation="right" hide domain={[0, 20000]} />

            {(anomalies || []).map((anomaly) => (
              <ReferenceArea key={`ref-area-${anomaly.id}`} yAxisId="left" x1={anomaly.startDepth} x2={anomaly.endDepth} fill={getAnomalyColor(anomaly.severity)} fillOpacity={activeAnomalyId === anomaly.id ? 0.25 : 0.1} />
            ))}

            <Tooltip content={<CustomForensicTooltip threshold={anomalyThreshold} anomalies={anomalies} onInspectAnomaly={onInspectAnomaly} />} />

            <Area yAxisId="left" type="stepAfter" dataKey={(d) => d.bypassed_pay ? 200 : null} name="Bypassed_Pay_Reservoir" stroke="none" fill="url(#diagonalHatch)" fillOpacity={0.6} isAnimationActive={false} />
            <Area yAxisId="gas" type="monotone" dataKey="total_gas" name="Total_Gas_Profile" stroke="#f97316" fill="url(#gasGradient)" strokeWidth={2} connectNulls={true} isAnimationActive={false} />

            {activeSignals.map(sig => {
              if (sig.id === 'SIG-001') {
                return <Line key="sig-001" type="monotone" dataKey="baseGR" name="BASE_LOG (1994)" stroke={sig.color} dot={false} strokeWidth={2.5} isAnimationActive={false} />;
              }
              if (sig.id === 'SIG-002') {
                return <Line key="sig-002" type="monotone" dataKey="ghostGR" name={ghostLabel} stroke={sig.color} dot={false} strokeWidth={2.5} strokeDasharray="5 3" isAnimationActive={false} />;
              }
              return null;
            })}

            <Scatter yAxisId="left" data={anomalyMarkers} shape={<AnomalyRenderer activeAnomalyId={activeAnomalyId} onInspectAnomaly={onInspectAnomaly} />} isAnimationActive={false} />
            <Scatter yAxisId="left" data={gasPeaksData} dataKey="baseGR" shape={<GasPeakRenderer color="#f97316" label="C1: Methane" peakKey="c1_peak" />} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SyncMonitorChart;
