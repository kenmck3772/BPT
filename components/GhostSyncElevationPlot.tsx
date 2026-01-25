import React from 'react';
import { 
  ResponsiveContainer, AreaChart, CartesianGrid, 
  XAxis, YAxis, Tooltip, Area, ReferenceLine
} from 'recharts';
import { Mountain } from 'lucide-react';

interface GhostSyncElevationPlotProps {
  combinedData: any[];
  activeDepth?: number | null;
}

const GhostSyncElevationPlot: React.FC<GhostSyncElevationPlotProps> = ({ 
  combinedData, 
  activeDepth 
}) => {
  return (
    <div className="h-32 bg-slate-950/60 rounded-xl border border-[#8b5e3c]/30 p-3 relative group overflow-hidden flex flex-col shadow-inner">
      {/* HUD Header */}
      <div className="absolute top-2 left-3 z-20 flex items-center space-x-2">
        <Mountain size={10} className="text-[#8b5e3c]" />
        <span className="text-[8px] font-black uppercase tracking-widest text-[#8b5e3c]/80">Topography_Profile_TVDSS</span>
      </div>

      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={combinedData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <defs>
               <linearGradient id="elevPlotGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5e3c" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5e3c" stopOpacity={0.0}/>
               </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="1 5" stroke="#8b5e3c" opacity={0.1} vertical={false} />
            
            {/* Hidden X-Axis for shared alignment with GR traces */}
            <XAxis dataKey="depth" hide />
            
            <YAxis 
              stroke="#8b5e3c" 
              fontSize={8} 
              axisLine={false} 
              tickLine={false}
              tick={{fill: '#8b5e3c', fontWeight: 'bold', opacity: 0.6}}
              domain={['auto', 'auto']}
              width={35}
              label={{ value: 'm TVDSS', angle: -90, position: 'insideLeft', fill: '#8b5e3c', fontSize: 7, fontWeight: 'black', opacity: 0.4 }}
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#020617', border: '1px solid #8b5e3c', fontSize: '9px', fontFamily: 'JetBrains Mono' }}
              cursor={{ stroke: '#8b5e3c', strokeWidth: 1, strokeDasharray: '3 3' }}
              labelFormatter={(val) => `DEPTH: ${val}m`}
              formatter={(value: any) => [`${value?.toFixed(2)}m`, 'ELEVATION']}
            />

            {/* Global Crosshair Sync */}
            {activeDepth !== null && (
              <ReferenceLine x={activeDepth} stroke="#8b5e3c" strokeWidth={1} strokeOpacity={0.4} />
            )}

            <Area 
              type="monotone" 
              dataKey="elevation" 
              name="ELEVATION" 
              stroke="#8b5e3c" 
              fill="url(#elevPlotGradient)"
              strokeWidth={2} 
              isAnimationActive={false} 
              connectNulls={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative HUD Elements */}
      <div className="absolute bottom-2 right-3 opacity-20 pointer-events-none">
         <span className="text-[7px] font-black uppercase text-[#8b5e3c]">Ref: Mean_Sea_Level</span>
      </div>
    </div>
  );
};

export default GhostSyncElevationPlot;