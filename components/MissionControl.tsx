
import React, { useState } from 'react';
import { 
  Globe, Shield, Target, AlertCircle, 
  Map as MapIcon, ChevronRight, Activity, 
  Cpu, Radar, Compass, CornerDownRight,
  Database, Zap, Loader2, Scan
} from 'lucide-react';
import { GHOST_HUNTER_MISSION } from '../constants';
import { MissionTarget } from '../types';

interface MissionControlProps {
  onSelectTarget: (target: MissionTarget) => void;
  isAnalyzing?: boolean;
}

const MissionControl: React.FC<MissionControlProps> = ({ onSelectTarget, isAnalyzing }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getPriorityStyles = (priority: MissionTarget['PRIORITY']) => {
    switch (priority) {
      case 'CRITICAL': return 'border-red-500/40 text-red-500 bg-red-500/5 shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]';
      case 'HIGH': return 'border-orange-500/40 text-orange-500 bg-orange-500/5 shadow-[inset_0_0_15px_rgba(249,115,22,0.05)]';
      case 'MEDIUM': return 'border-amber-500/40 text-amber-500 bg-amber-500/5';
      case 'LOW': return 'border-emerald-500/40 text-emerald-500 bg-emerald-500/5';
      default: return 'border-emerald-900/40 text-emerald-900';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 relative font-terminal overflow-hidden p-4 lg:p-8 space-y-6">
      {/* Background World Mesh HUD */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
         <Globe size={800} className="text-emerald-500 animate-spin-slow" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-emerald-900/30 pb-6 relative z-10 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Radar size={32} className="text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-emerald-400 uppercase tracking-tighter">
              {GHOST_HUNTER_MISSION.MISSION_ID}
            </h2>
            <div className="flex items-center space-x-3 text-[9px] text-emerald-900 font-black uppercase tracking-[0.3em] mt-1">
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
                ACTIVE_SCAN
              </span>
              <span className="h-2 w-px bg-emerald-900/40"></span>
              <span>Operator: {GHOST_HUNTER_MISSION.OPERATOR}</span>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
           <div className="text-[14px] text-emerald-100 font-mono tracking-widest bg-slate-950/50 px-3 py-1 border border-emerald-900/30 rounded">
             {new Date(GHOST_HUNTER_MISSION.TIMESTAMP).toLocaleDateString()} // {new Date(GHOST_HUNTER_MISSION.TIMESTAMP).toLocaleTimeString()}
           </div>
           <div className="text-[9px] text-emerald-800 font-black uppercase mt-2 tracking-[0.2em]">ANOMALIES_DISCOVERED: {GHOST_HUNTER_MISSION.TARGETS.length}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 lg:pr-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10 pb-12">
        {GHOST_HUNTER_MISSION.TARGETS.map((target, idx) => (
          <div 
            key={`${target.ASSET}-${idx}`}
            onMouseEnter={() => setHoveredId(target.ASSET)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectTarget(target)}
            className={`group p-6 glass-panel rounded-lg border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between h-80
              ${hoveredId === target.ASSET ? 'scale-[1.02] shadow-[0_0_40px_rgba(0,0,0,0.4)] border-emerald-500/50' : 'opacity-80 border-emerald-900/20'}
              ${getPriorityStyles(target.PRIORITY)}`}
          >
            {/* Corner Accents */}
            <div className="corner-accent corner-tl"></div>
            <div className="corner-accent corner-tr"></div>
            <div className="corner-accent corner-bl"></div>
            <div className="corner-accent corner-br"></div>

            {/* Target Scan Effect */}
            {hoveredId === target.ASSET && (
              <div className="absolute inset-x-0 h-px bg-emerald-400/30 animate-[scan_2s_linear_infinite] pointer-events-none z-0"></div>
            )}

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-60 mb-1">{target.REGION}</span>
                  <h3 className="text-xl font-black tracking-tight uppercase text-white group-hover:text-emerald-400 transition-colors">{target.ASSET}</h3>
                </div>
                <div className="p-2 bg-black/40 border border-white/5 rounded">
                  <Scan size={14} className="text-current" />
                </div>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center space-x-2 text-emerald-300">
                    <AlertCircle size={12} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{target.ANOMALY_TYPE}</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {target.BLOCKS.map(block => (
                      <span key={block} className="px-2 py-0.5 bg-black/60 border border-white/10 rounded text-[9px] font-mono text-emerald-700">{block}</span>
                    ))}
                 </div>
              </div>
            </div>

            <div className="mt-auto pt-6 relative z-10">
              <div className="p-4 bg-black/50 rounded border border-white/5 space-y-2 backdrop-blur-md">
                 <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest opacity-60">
                    <div className="flex items-center space-x-2">
                       <Database size={10} />
                       <span>PORTAL: {target.DATA_PORTAL}</span>
                    </div>
                    {target.WELLS && <span className="text-emerald-500">WELLS: {target.WELLS.length}</span>}
                 </div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                    <div className={`h-full transition-all duration-1000 ${target.PRIORITY === 'CRITICAL' ? 'bg-red-500 w-full' : 'bg-emerald-500 w-2/3'}`}></div>
                 </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                 <div className={`px-3 py-1 rounded text-[8px] font-black tracking-[0.2em] border ${getPriorityStyles(target.PRIORITY)}`}>
                    {target.PRIORITY}
                 </div>
                 <button className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 group-hover:text-white transition-all">
                    <span>Infiltrate</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-5 rounded-lg border border-emerald-900/30 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
         <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-emerald-500/10 rounded-full">
                  <Cpu size={18} className="text-emerald-500" />
               </div>
               <div>
                  <div className="text-[7px] text-emerald-900 font-black uppercase">Grid_Topology</div>
                  <div className="text-[11px] font-black text-emerald-100 uppercase tracking-widest">Distributed_Veto_Array</div>
               </div>
            </div>
            <div className="h-8 w-px bg-emerald-900/30 hidden md:block"></div>
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-emerald-500/10 rounded-full">
                  <Compass size={18} className="text-emerald-500" />
               </div>
               <div>
                  <div className="text-[7px] text-emerald-900 font-black uppercase">Navigation_Lock</div>
                  <div className="text-[11px] font-black text-emerald-100 uppercase tracking-widest">RT_GEO_COORDINATES_LOCKED</div>
               </div>
            </div>
         </div>
         
         <div className="flex items-center space-x-4">
            {isAnalyzing && (
              <div className="flex items-center space-x-3 text-[10px] font-black text-orange-500 animate-pulse uppercase tracking-[0.3em] bg-orange-500/5 px-4 py-2 border border-orange-500/20 rounded">
                <Loader2 size={14} className="animate-spin" />
                <span>Forensic_Insight_Stream</span>
              </div>
            )}
            <div className="text-[9px] font-mono text-emerald-900 flex flex-col text-right">
              <span>AUTH_GUID: 0X_BRAHAN_ALPHA_001</span>
              <span>NODE_ID: TERMINAL_MASTER_V2</span>
            </div>
         </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MissionControl;