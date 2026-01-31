
import React from 'react';
import { AlertTriangle, Eye, EyeOff, Target, SearchCode, ChevronRight } from 'lucide-react';
import { SyncAnomaly } from '../hooks/useGhostSync';

interface GhostSyncAnomalyListProps {
  anomalies: SyncAnomaly[];
  isVisible: boolean;
  onToggle: () => void;
  isScanning: boolean;
  activeAnomalyId?: string | null;
  onHoverAnomaly?: (id: string | null) => void;
  onInspectAnomaly?: (anomaly: SyncAnomaly) => void;
}

const GhostSyncAnomalyList: React.FC<GhostSyncAnomalyListProps> = ({ 
  anomalies, isVisible, onToggle, isScanning, activeAnomalyId, onHoverAnomaly, onInspectAnomaly 
}) => {
  return (
    <div className="glass-panel p-5 rounded-lg border border-orange-900/30 bg-slate-900/60 flex flex-col space-y-3 shadow-xl max-h-[300px] overflow-hidden">
      <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center justify-between border-b border-orange-900/20 pb-2">
        <span>Shift_Discrepancies</span>
        <div className="flex items-center space-x-2">
          <button onClick={onToggle} className="text-emerald-900 hover:text-emerald-400 transition-colors">
            {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <AlertTriangle size={12} className={anomalies.length > 0 ? "animate-pulse text-orange-500" : "text-emerald-900"} />
        </div>
      </h3>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {anomalies.length > 0 ? anomalies.map(anomaly => (
          <div 
            key={anomaly.id} 
            onMouseEnter={() => onHoverAnomaly?.(anomaly.id)}
            onMouseLeave={() => onHoverAnomaly?.(null)}
            className={`p-3 bg-slate-950/80 border rounded transition-all group ${
              activeAnomalyId === anomaly.id 
                ? 'border-emerald-500 bg-slate-900 ring-1 ring-emerald-500/20' 
                : anomaly.severity === 'CRITICAL' ? 'border-red-500/40' : 'border-orange-500/30'
            }`}
          >
             <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] font-black ${
                  activeAnomalyId === anomaly.id ? 'text-emerald-400' : (anomaly.severity === 'CRITICAL' ? 'text-red-400' : 'text-orange-400')
                }`}>
                  {anomaly.severity} DISCORDANCE
                </span>
                <span className="text-[8px] font-mono text-emerald-900">{anomaly.id}</span>
             </div>
             <div className={`text-[11px] font-terminal transition-colors ${activeAnomalyId === anomaly.id ? 'text-emerald-100' : 'text-emerald-100/60'}`}>
               {anomaly.startDepth.toFixed(1)}m - {anomaly.endDepth.toFixed(1)}m
             </div>
             <div className="flex justify-between items-center mt-3">
                <div className={`text-[8px] uppercase font-black transition-colors ${activeAnomalyId === anomaly.id ? 'text-emerald-400' : 'text-emerald-800'}`}>
                  DELTA: {anomaly.avgDiff.toFixed(2)} API
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onInspectAnomaly?.(anomaly); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500 text-black text-[9px] font-black uppercase transition-all hover:bg-emerald-400 shadow-lg active:scale-95"
                >
                   <span>Deep Audit</span>
                   <SearchCode size={12} />
                </button>
             </div>
          </div>
        )) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-[10px] py-8 text-center px-4">
            {isScanning ? <span className="animate-pulse">Analyzing depth discordance...</span> : <span>No active discrepancies flagged. Run forensic scan.</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default GhostSyncAnomalyList;
