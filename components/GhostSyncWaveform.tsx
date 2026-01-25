
import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, LineChart, CartesianGrid, 
  XAxis, YAxis, Tooltip, Line, Legend, Scatter, Area, ReferenceArea
} from 'recharts';
import { Activity, Zap, TrendingDown, Mountain, Fingerprint } from 'lucide-react';
import { SignalMetadata, SyncAnomaly } from '../hooks/useGhostSync';

interface GhostSyncWaveformProps {
  combinedData: any[];
  signals: SignalMetadata[];
  ghostLabel: string;
  activeAnomalyId?: string | null;
  anomalies?: SyncAnomaly[];
  varianceWindow?: number;
}

const GhostSyncWaveform: React.FC<GhostSyncWaveformProps> = ({ 
  combinedData, 
  signals, 
  ghostLabel,
  activeAnomalyId = null,
  anomalies = [],
  varianceWindow = 5
}) => {
  const [activeDepth, setActiveDepth] = useState<number | null>(null);

  const activeAnomaly = useMemo(() => 
    anomalies.find(a => a.id === activeAnomalyId),
    [activeAnomalyId, anomalies]
  );

  const isElevationVisible = signals.find(s => s.id === 'SIG-ELEV')?.visible ?? false;
  const elevColor = signals.find(s => s.id === 'SIG-ELEV')?.color ?? '#8b5e3c';

  const activeSegmentData = useMemo(() => {
    if (!activeAnomaly) return [];
    return combinedData.filter(d => 
      d.depth >= activeAnomaly.startDepth && d.depth <= activeAnomaly.endDepth
    );
  }, [combinedData, activeAnomaly]);

  const handleMouseMove = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const depth = state.activePayload[0].payload.depth;
      setActiveDepth(depth);
    }
  };

  const handleMouseLeave = () => {
    setActiveDepth(null);
  };

  return (
    <div className="flex-1 min-h-0 bg-[#020617] rounded-xl border border-emerald-500/20 p-4 relative overflow-hidden flex flex-col shadow-[inset_0_0_40px_rgba(16,185,129,0.05)] group">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="absolute top-4 left-4 z-20">
        <div className="flex items-center space-x-2 bg-black/80 border border-emerald-500/30 px-3 py-1.5 rounded shadow-xl backdrop-blur-md">
          <Activity size={14} className="text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Signal_Oscilloscope_Array</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex space-x-2 items-start">
        {activeDepth && (
           <div className="bg-purple-600/90 border border-purple-400 px-2 py-1 rounded shadow-xl animate-in fade-in slide-in-from-right-4">
              <span className="text-[8px] font-terminal font-black text-white tracking-widest uppercase flex items-center gap-1">
                <Fingerprint size={10} /> VAR_APERTURE: {varianceWindow}m
              </span>
           </div>
        )}
        {activeAnomalyId && (
          <div className="flex items-center space-x-2 bg-emerald-500 border border-emerald-400 px-2 py-1 rounded text-[8px] font-black text-slate-950 uppercase animate-pulse">
            <Zap size={10} />
            <span>Anomaly_Voxel_Lock</span>
          </div>
        )}
        {isElevationVisible && (
          <div className="flex items-center space-x-2 bg-[#8b5e3c]/20 border border-[#8b5e3c]/40 px-2 py-1 rounded text-[8px] font-black text-[#8b5e3c] uppercase">
            <Mountain size={10} />
            <span>TVDSS_Enabled</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={combinedData} 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            margin={{ top: 40, right: 10, left: 10, bottom: 10 }}
          >
            <defs>
               <linearGradient id="waveElevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={elevColor} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={elevColor} stopOpacity={0.0}/>
               </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.05} vertical={false} />
            <XAxis 
              dataKey="depth" 
              hide={true}
            />
            <YAxis 
              yAxisId="left"
              stroke="#10b981" 
              fontSize={8} 
              axisLine={false} 
              tickLine={false}
              tick={{fill: '#064e3b', fontWeight: 'bold'}}
              domain={['auto', 'auto']}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#ef4444" 
              fontSize={8} 
              axisLine={false} 
              tickLine={false}
              tick={{fill: '#7f1d1d', fontWeight: 'bold'}}
              domain={[0, 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(16, 185, 129, 0.4)', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
              itemStyle={{ padding: '2px 0' }}
              cursor={{ stroke: '#10b981', strokeWidth: 1 }}
              labelFormatter={(value) => `DEPTH: ${value}m`}
              formatter={(value: any, name: string) => [value?.toFixed(2), (name || "").replace(/_/g, ' ')]}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle"
              wrapperStyle={{ paddingTop: '10px', fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}
            />
            
            {/* Visual Variance Window Tracking */}
            {activeDepth !== null && (
              <ReferenceArea
                yAxisId="left"
                x1={activeDepth - varianceWindow}
                x2={activeDepth + varianceWindow}
                fill="#a855f7"
                fillOpacity={0.05}
                stroke="#a855f7"
                strokeOpacity={0.1}
                strokeDasharray="2 2"
              />
            )}

            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="diff" 
              name="DISCORDANCE_DELTA" 
              stroke="#ef4444" 
              dot={false} 
              strokeWidth={1.5} 
              strokeDasharray="3 3"
              isAnimationActive={false}
              style={{ filter: 'drop-shadow(0 0 3px #ef4444)' }}
            />

            {isElevationVisible && (
              <Area 
                yAxisId="left" 
                type="monotone" 
                dataKey="elevation" 
                name="TVDSS_PROFILE" 
                stroke={elevColor} 
                fill="url(#waveElevGradient)" 
                strokeWidth={1} 
                isAnimationActive={false} 
                connectNulls={true}
                opacity={0.3}
              />
            )}

            {activeAnomalyId && (
              <Scatter
                yAxisId="left"
                data={activeSegmentData}
                name="ACTIVE_PULSE"
                fill="#ffffff"
                isAnimationActive={false}
                shape={(props: any) => {
                  const { cx, cy } = props;
                  return (
                    <circle cx={cx} cy={cy} r={3} fill="#ffffff" className="animate-pulse" />
                  );
                }}
              />
            )}

            {signals.find(s => s.id === 'SIG-001')?.visible && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="baseGR" 
                name="BASE_LOG" 
                stroke="#10b981" 
                dot={false} 
                strokeWidth={2} 
                isAnimationActive={false}
                style={{ filter: 'drop-shadow(0 0 4px #10b981)' }}
              />
            )}
            {signals.find(s => s.id === 'SIG-002')?.visible && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="ghostGR" 
                name={ghostLabel} 
                stroke="#FF5F1F" 
                dot={false} 
                strokeWidth={2} 
                isAnimationActive={false}
                style={{ filter: 'drop-shadow(0 0 4px #FF5F1F)' }}
              />
            )}
            
            {signals.map(sig => {
              if (sig.id !== 'SIG-001' && sig.id !== 'SIG-002' && sig.id !== 'SIG-ELEV' && sig.visible) {
                return (
                  <Line 
                    yAxisId="left"
                    key={sig.id} 
                    type="monotone" 
                    dataKey={sig.id} 
                    name={sig.name} 
                    stroke={sig.color} 
                    dot={false} 
                    strokeWidth={1.5} 
                    isAnimationActive={false} 
                    connectNulls={true}
                    activeDot={{ r: 4, fill: sig.color, stroke: '#fff', strokeWidth: 1.5 }}
                    style={{ filter: `drop-shadow(0 0 3px ${sig.color})` }}
                  />
                );
              }
              return null;
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute bottom-12 right-6 pointer-events-none opacity-20">
        <span className="text-[40px] font-black text-emerald-900/10 italic select-none uppercase tracking-tighter">WAVEFORM_DENSITY</span>
      </div>
    </div>
  );
};

export default GhostSyncWaveform;
