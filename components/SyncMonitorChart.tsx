
import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, ComposedChart, CartesianGrid, 
  XAxis, YAxis, Tooltip, Area, Line, ReferenceLine, ReferenceArea, Legend, Scatter
} from 'recharts';
import { Target, Crosshair, AlertTriangle, Activity, Zap, ShieldAlert, Mountain, Fingerprint } from 'lucide-react';
import { SignalMetadata, SyncAnomaly } from '../hooks/useGhostSync';

interface SyncMonitorChartProps {
  combinedData: any[];
  signals: SignalMetadata[];
  viewMode: 'OVERLAY' | 'DIFFERENTIAL';
  ghostLabel: string;
  validationError: string | null;
  offset: number;
  anomalies?: SyncAnomaly[];
  anomalyThreshold?: number;
  activeAnomalyId?: string | null;
  onDepthChange?: (depth: number | null) => void;
  varianceWindow?: number;
}

const CustomForensicTooltip = ({ active, payload, label, offset, threshold }: any) => {
  if (active && payload && payload.length) {
    const diffVal = payload.find((p: any) => p.dataKey === 'diff')?.value || 0;
    const isCritical = diffVal > (threshold || 25);

    return (
      <div className="bg-slate-950/95 border border-emerald-500/40 p-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md rounded-lg font-terminal min-w-[180px] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2 mb-2">
           <div className="flex items-center gap-2">
              <Crosshair size={12} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Voxel_Inspection</span>
           </div>
           <span className="text-[10px] font-bold text-white tabular-nums">{parseFloat(label).toFixed(2)}m</span>
        </div>

        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            if (!entry || entry.dataKey === 'diff' || entry.dataKey === 'activePulse') return null; 
            const entryName = String(entry.name || "");
            const isGhost = entryName.includes('GHOST') || entryName.includes('CALIBRATED');
            const isElev = entry.dataKey === 'elevation';
            
            return (
              <div key={index} className="flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-[9px] font-black text-emerald-100/60 uppercase truncate max-w-[100px]">
                    {entryName.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                   <span className="text-[10px] font-black text-white tabular-nums">
                     {entry.value?.toFixed(2)}{isElev ? 'm' : ''}
                   </span>
                   {isGhost && offset !== 0 && (
                     <span className="text-[7px] font-mono text-orange-500/60">({offset > 0 ? '+' : ''}{offset.toFixed(1)}m)</span>
                   )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={`mt-3 pt-2 border-t border-emerald-900/40 flex flex-col gap-1`}>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black text-emerald-900 uppercase">Discordance_Delta</span>
            <span className={`text-[10px] font-black tabular-nums ${isCritical ? 'text-red-500' : 'text-emerald-500'}`}>
              {diffVal.toFixed(2)} API
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black text-emerald-900 uppercase">Integrity_Status</span>
            <div className="flex items-center gap-1">
              {isCritical ? (
                <>
                  <ShieldAlert size={10} className="text-red-500 animate-pulse" />
                  <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">ANOMALY</span>
                </>
              ) : (
                <>
                  <Activity size={10} className="text-emerald-500" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">NOMINAL</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SyncMonitorChart: React.FC<SyncMonitorChartProps> = ({ 
  combinedData, 
  signals, 
  viewMode, 
  ghostLabel, 
  validationError,
  offset,
  anomalies = [],
  anomalyThreshold = 25,
  activeAnomalyId = null,
  onDepthChange,
  varianceWindow = 5
}) => {
  const [activeDepth, setActiveDepth] = useState<number | null>(null);

  const isElevationVisible = signals.find(s => s.id === 'SIG-ELEV')?.visible ?? false;
  const elevColor = signals.find(s => s.id === 'SIG-ELEV')?.color ?? '#8b5e3c';

  const highlightedAnomaly = useMemo(() => 
    anomalies.find(a => a.id === activeAnomalyId),
    [activeAnomalyId, anomalies]
  );

  const activeSegmentData = useMemo(() => {
    if (!highlightedAnomaly) return [];
    return combinedData.filter(d => 
      d.depth >= highlightedAnomaly.startDepth && d.depth <= highlightedAnomaly.endDepth
    );
  }, [combinedData, highlightedAnomaly]);

  const handleMouseMove = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const depth = state.activePayload[0].payload.depth;
      setActiveDepth(depth);
      onDepthChange?.(depth);
    }
  };

  const handleMouseLeave = () => {
    setActiveDepth(null);
    onDepthChange?.(null);
  };

  return (
    <div id="sync-chart-container" className="flex-1 min-h-0 bg-slate-950/80 rounded-xl border border-emerald-500/10 p-4 relative group overflow-hidden flex flex-col shadow-inner">
      <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-emerald-500/20 px-3 py-1 rounded shadow-lg">
          <Target size={12} className="text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Trace_Lock_Active</span>
        </div>
        {anomalies.length > 0 && (
          <div className="text-[9px] font-black text-red-400 bg-red-400/10 border border-red-400/30 px-3 py-1 uppercase animate-in fade-in slide-in-from-left-4 duration-500 backdrop-blur-md flex items-center space-x-2">
            <AlertTriangle size={10} />
            <span>{anomalies.length} Datum Shifts Flagged</span>
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 z-20 flex flex-col items-end space-y-1">
        {activeDepth && (
          <div className="flex flex-col items-end gap-1">
            <div className="bg-emerald-500/90 border border-emerald-400 px-3 py-1 rounded shadow-2xl animate-in fade-in slide-in-from-right-4">
              <span className="text-[10px] font-terminal font-black text-slate-950 tracking-widest uppercase flex items-center">
                <Crosshair size={10} className="mr-1.5" /> DEPTH: {activeDepth.toFixed(2)}m
              </span>
            </div>
            <div className="bg-purple-600/90 border border-purple-400 px-2 py-0.5 rounded shadow-xl animate-in fade-in slide-in-from-right-4 delay-75">
              <span className="text-[8px] font-terminal font-black text-white tracking-widest uppercase flex items-center gap-1">
                <Fingerprint size={10} /> WINDOW: ±{varianceWindow}m
              </span>
            </div>
          </div>
        )}
        {isElevationVisible && (
           <div className="bg-[#8b5e3c]/20 border border-[#8b5e3c]/40 px-2 py-0.5 rounded backdrop-blur-sm mt-1">
             <span className="text-[8px] font-black text-[#8b5e3c] uppercase flex items-center gap-1">
               <Mountain size={10} /> Secondary_Axis: TVDSS
             </span>
           </div>
        )}
      </div>

      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={combinedData} 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <defs>
               <linearGradient id="diffGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
               </linearGradient>
               <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={elevColor} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={elevColor} stopOpacity={0.0}/>
               </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="1 5" stroke="#10b981" opacity={0.1} />
            <XAxis 
              dataKey="depth" 
              stroke="#10b981" 
              fontSize={10} 
              axisLine={{stroke: '#10b981', strokeOpacity: 0.3}} 
              tickLine={{stroke: '#10b981', strokeOpacity: 0.3}} 
              tick={{fill: '#10b981', fontWeight: 'bold', opacity: 0.6}}
              label={{ value: 'DEPTH (m)', position: 'bottom', offset: 0, fill: '#064e3b', fontSize: 9, fontWeight: 'black' }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#10b981" 
              fontSize={10} 
              axisLine={{stroke: '#10b981', strokeOpacity: 0.3}} 
              tickLine={{stroke: '#10b981', strokeOpacity: 0.3}} 
              tick={{fill: '#10b981', fontWeight: 'bold', opacity: 0.6}}
              label={{ value: 'GAMMA RAY (API)', angle: -90, position: 'insideLeft', fill: '#064e3b', fontSize: 9, fontWeight: 'black' }}
            />
            
            {isElevationVisible && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke={elevColor} 
                fontSize={10} 
                axisLine={{stroke: elevColor, strokeOpacity: 0.3}} 
                tickLine={{stroke: elevColor, strokeOpacity: 0.3}} 
                tick={{fill: elevColor, fontWeight: 'bold', opacity: 0.6}}
                domain={['auto', 'auto']}
                label={{ value: 'm TVDSS', angle: 90, position: 'insideRight', fill: elevColor, fontSize: 9, fontWeight: 'black' }}
              />
            )}
            
            <Tooltip 
              content={<CustomForensicTooltip offset={offset} threshold={anomalyThreshold} />}
              cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3' }} 
            />

            <Legend 
              verticalAlign="bottom" 
              align="center" 
              iconType="plainline"
              wrapperStyle={{ paddingTop: '20px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}
            />
            
            {/* Visual Variance Window Tracking */}
            {activeDepth !== null && (
              <ReferenceArea
                yAxisId="left"
                x1={activeDepth - varianceWindow}
                x2={activeDepth + varianceWindow}
                fill="#a855f7"
                fillOpacity={0.08}
                stroke="#a855f7"
                strokeOpacity={0.15}
                strokeDasharray="3 3"
              />
            )}

            {anomalies.map(anomaly => {
              const isActive = activeAnomalyId === anomaly.id;
              return (
                <ReferenceArea
                  key={anomaly.id}
                  yAxisId="left"
                  x1={anomaly.startDepth}
                  x2={anomaly.endDepth}
                  fill={anomaly.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}
                  fillOpacity={isActive ? 0.6 : 0.35}
                  stroke={anomaly.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}
                  strokeOpacity={isActive ? 1 : 0.8}
                  strokeWidth={isActive ? 3 : 2}
                  className={isActive ? 'animate-pulse' : ''}
                  label={{ 
                    position: 'top', 
                    value: isActive ? 'LOCKING_VOXEL...' : (anomaly.severity === 'CRITICAL' ? 'DATUM_BREACH' : 'SHIFT_DETECTED'), 
                    fill: '#ffffff', 
                    fontSize: 7, 
                    fontWeight: 'black', 
                    className: 'uppercase tracking-tighter'
                  }}
                />
              );
            })}

            {activeDepth !== null && (
              <ReferenceLine x={activeDepth} stroke="#10b981" strokeWidth={1} strokeOpacity={0.6} />
            )}

            {isElevationVisible && (
              <Area 
                yAxisId="right" 
                type="monotone" 
                dataKey="elevation" 
                name="TOPOGRAPHY_TVDSS" 
                stroke={elevColor} 
                fill="url(#elevGradient)" 
                strokeWidth={2} 
                isAnimationActive={false} 
                connectNulls={true}
              />
            )}

            {viewMode === 'DIFFERENTIAL' && (
              <>
                <Area yAxisId="left" type="monotone" dataKey="diff" name="DISCORDANCE_DELTA" stroke="#ef4444" fill="url(#diffGradient)" isAnimationActive={false} />
                <ReferenceLine yAxisId="left" y={anomalyThreshold} stroke="#f97316" strokeDasharray="3 3" label={{ position: 'right', value: 'Discordance Threshold', fill: '#f97316', fontSize: 8 }} />
              </>
            )}

            {signals.find(s => s.id === 'SIG-001')?.visible && (
              <Line yAxisId="left" type="monotone" dataKey="baseGR" name="BASE_LOG" stroke="#10b981" dot={false} strokeWidth={2.5} isAnimationActive={false} activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }} />
            )}
            {signals.find(s => s.id === 'SIG-002')?.visible && (
              <Line yAxisId="left" type="monotone" dataKey="ghostGR" name={ghostLabel} stroke="#FF5F1F" dot={false} strokeWidth={2.5} strokeDasharray="5 3" isAnimationActive={false} activeDot={{ r: 6, fill: '#FF5F1F', strokeWidth: 0 }} />
            )}
            
            {activeAnomalyId && (
              <>
                {/* Base Log Pulse Trace */}
                <Scatter
                  yAxisId="left"
                  data={activeSegmentData}
                  dataKey="baseGR"
                  name="BASE_VOXEL_SYNC"
                  isAnimationActive={false}
                  shape={(props: any) => {
                    const { cx, cy } = props;
                    return (
                      <g className="origin-center">
                        <circle cx={cx} cy={cy} r={6} fill="#10b981" className="animate-pulse" opacity={0.3} />
                        <circle cx={cx} cy={cy} r={2} fill="#ffffff" />
                        <circle cx={cx} cy={cy} r={4} fill="none" stroke="#ffffff" strokeWidth={0.5} className="animate-ping" opacity={0.5} />
                      </g>
                    );
                  }}
                />
                {/* Ghost Log Pulse Trace */}
                <Scatter
                  yAxisId="left"
                  data={activeSegmentData}
                  dataKey="ghostGR"
                  name="GHOST_VOXEL_SYNC"
                  isAnimationActive={false}
                  shape={(props: any) => {
                    const { cx, cy } = props;
                    if (cy === null || isNaN(cy)) return null;
                    return (
                      <g className="origin-center">
                        <circle cx={cx} cy={cy} r={6} fill="#FF5F1F" className="animate-pulse" opacity={0.3} />
                        <circle cx={cx} cy={cy} r={2} fill="#ffffff" />
                        <circle cx={cx} cy={cy} r={4} fill="none" stroke="#ffffff" strokeWidth={0.5} className="animate-ping" opacity={0.5} />
                      </g>
                    );
                  }}
                />
              </>
            )}

            {signals.map(sig => {
              if (sig.id !== 'SIG-001' && sig.id !== 'SIG-002' && sig.id !== 'SIG-ELEV' && sig.visible) {
                return (
                  <Line 
                    key={sig.id} 
                    yAxisId="left"
                    type="monotone" 
                    dataKey={sig.id} 
                    name={sig.name} 
                    stroke={sig.color} 
                    dot={false} 
                    strokeWidth={2} 
                    isAnimationActive={false} 
                    connectNulls={true}
                    activeDot={{ r: 5, fill: sig.color, strokeWidth: 2, stroke: '#fff' }}
                  />
                );
              }
              return null;
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute bottom-4 left-4 flex items-center space-x-4 pointer-events-none opacity-40">
        <div className="flex items-center space-x-2">
           <div className="w-3 h-0.5 bg-emerald-500"></div>
           <span className="text-[8px] font-black uppercase text-emerald-900">Truth_Trace</span>
        </div>
        <div className="flex items-center space-x-2">
           <div className="w-3 h-0.5 bg-orange-500 border-t border-dashed border-orange-500"></div>
           <span className="text-[8px] font-black uppercase text-emerald-900">Datum_Ghost</span>
        </div>
      </div>
    </div>
  );
};

export default SyncMonitorChart;
