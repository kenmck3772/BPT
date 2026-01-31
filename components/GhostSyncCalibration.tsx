import React from 'react';
import { Target, ShieldAlert, RotateCw, Filter, AlertOctagon, Zap, Fingerprint, Loader2 } from 'lucide-react';

interface GhostSyncCalibrationProps {
  offset: number;
  onOffsetChange: (val: number) => void;
  validationError: string | null;
  anomalyThreshold: number;
  effectiveThreshold: number;
  onThresholdChange: (val: number) => void;
  microSensitivity?: boolean;
  onMicroToggle?: () => void;
  isAuditingVariance?: boolean;
  onRunVarianceAudit?: () => void;
  varianceWindow?: number;
}

const OFFSET_HARD_LIMIT = 30;

const GhostSyncCalibration: React.FC<GhostSyncCalibrationProps> = ({
  offset, onOffsetChange, validationError, anomalyThreshold, effectiveThreshold, onThresholdChange,
  microSensitivity, onMicroToggle, isAuditingVariance, onRunVarianceAudit, varianceWindow
}) => {
  return (
    <div className="glass-panel p-5 rounded-lg border border-emerald-900/30 bg-slate-900/60 flex flex-col space-y-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-emerald-900/20 pb-2">
        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center">
          <span>Manual_Calibration</span>
          <Target size={12} className="ml-2 text-emerald-900" />
        </h3>
      </div>
      <div className="space-y-4">
        <div className={`p-3 rounded border bg-slate-950/90 ${validationError ? 'border-orange-500' : 'border-emerald-900/40'}`}>
          <div className="flex justify-between items-center mb-2">
             <div className="flex items-center space-x-2">
                <ShieldAlert size={14} className={validationError ? 'text-orange-500' : 'text-emerald-900'} />
                <span className="text-[8px] font-black text-emerald-900 uppercase">Voxel_Offset (m)</span>
             </div>
             <span className={`text-[12px] font-black font-terminal ${validationError ? 'text-orange-400' : 'text-emerald-400'}`}>
               {offset.toFixed(3)}
             </span>
          </div>
          <div className="flex space-x-2">
            <input 
              type="number" 
              step="0.001" 
              value={offset}
              onChange={(e) => onOffsetChange(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-slate-900 border border-emerald-900/30 rounded px-2 py-1.5 text-[11px] text-emerald-100 font-terminal outline-none focus:border-emerald-500 transition-all"
            />
            <button 
              onClick={() => onOffsetChange(0)} 
              title="Reset Datum Lock"
              className="px-2.5 bg-slate-800 text-emerald-900 hover:text-emerald-400 rounded border border-emerald-900/10 transition-colors"
            >
              <RotateCw size={12} />
            </button>
          </div>
          <div className="mt-2">
            <input 
              type="range" 
              min={-OFFSET_HARD_LIMIT} 
              max={OFFSET_HARD_LIMIT} 
              step="0.01" 
              value={offset} 
              onChange={(e) => onOffsetChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 appearance-none rounded-full cursor-pointer accent-emerald-500" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={onMicroToggle}
            className={`w-full py-2 rounded text-[8px] font-black uppercase transition-all border flex items-center justify-center gap-2 ${microSensitivity ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-950 text-emerald-800 border-emerald-900/30 hover:border-emerald-500/50'}`}
          >
            <Zap size={10} className={microSensitivity ? 'animate-pulse' : ''} />
            <span>{microSensitivity ? 'MICRO_VETO: ACTIVE' : 'Micro_Sensitivity'}</span>
          </button>

          {onRunVarianceAudit && (
            <button 
              onClick={onRunVarianceAudit}
              disabled={isAuditingVariance}
              className={`w-full py-2 rounded text-[8px] font-black uppercase transition-all border flex items-center justify-center gap-2 ${isAuditingVariance ? 'bg-purple-600/20 text-purple-400 border-purple-500/40 animate-pulse cursor-wait' : 'bg-purple-600 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:bg-purple-500'}`}
            >
              {isAuditingVariance ? <Loader2 size={10} className="animate-spin" /> : <Fingerprint size={10} />}
              <span>{isAuditingVariance ? 'Variance_Active...' : `Variance_Veto (${varianceWindow}m)`}</span>
            </button>
          )}
        </div>

        <div className="space-y-3 px-1 pt-2 border-t border-emerald-900/10">
          <div className="flex justify-between items-center text-[8px] font-black text-emerald-900 uppercase tracking-widest">
            <span className="flex items-center"><Filter size={10} className="mr-1" /> Logic_Threshold</span>
            <span className="text-orange-400 font-terminal">{anomalyThreshold?.toFixed(1)} API</span>
          </div>
          
          <div className="flex gap-2 items-center">
            <input 
              type="range" min="0" max="100" step="0.1" 
              value={anomalyThreshold} onChange={e => onThresholdChange(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 appearance-none rounded-full accent-orange-500 cursor-pointer hover:accent-orange-400 transition-all" 
            />
            <input 
              type="number" 
              step="0.1"
              min="0" 
              max="100" 
              value={anomalyThreshold}
              onChange={(e) => onThresholdChange(parseFloat(e.target.value) || 0)}
              className="w-12 bg-slate-950 border border-orange-900/30 rounded py-1 px-1 text-[10px] text-orange-400 font-terminal text-center outline-none focus:border-orange-500 shadow-inner"
            />
          </div>
          
          {microSensitivity && (
            <div className="flex justify-between text-[7px] font-black text-emerald-600 uppercase mt-1 animate-in fade-in">
              <span>Effective_Audit_Res</span>
              <span>{effectiveThreshold.toFixed(2)} API</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GhostSyncCalibration;