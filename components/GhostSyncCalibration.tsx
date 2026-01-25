
import React from 'react';
import { Target, ShieldAlert, RotateCw, Filter, AlertOctagon, Zap } from 'lucide-react';

interface GhostSyncCalibrationProps {
  offset: number;
  onOffsetChange: (val: number) => void;
  validationError: string | null;
  anomalyThreshold: number;
  onThresholdChange: (val: number) => void;
  microSensitivity?: boolean;
  onMicroToggle?: () => void;
}

const OFFSET_HARD_LIMIT = 30;

const GhostSyncCalibration: React.FC<GhostSyncCalibrationProps> = ({
  offset, onOffsetChange, validationError, anomalyThreshold, onThresholdChange,
  microSensitivity, onMicroToggle
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
                <span className="text-[8px] font-black text-emerald-900 uppercase">Voxel_Offset</span>
             </div>
             <span className={`text-[12px] font-black font-terminal ${validationError ? 'text-orange-400' : 'text-emerald-400'}`}>
               {offset.toFixed(3)}m
             </span>
          </div>
          <div className="flex space-x-2">
            <input 
              type="number" step="0.1" value={offset.toFixed(3)}
              onChange={(e) => onOffsetChange(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-slate-900 border border-emerald-900/30 rounded px-2 py-1 text-[11px] text-emerald-100 font-terminal outline-none focus:border-emerald-500"
            />
            <button onClick={() => onOffsetChange(0)} className="px-2 bg-slate-800 text-emerald-900 hover:text-emerald-400 rounded"><RotateCw size={12} /></button>
          </div>
        </div>
        
        <div className="space-y-1.5 px-1">
          <button 
            onClick={onMicroToggle}
            className={`w-full py-2 rounded text-[8px] font-black uppercase transition-all border flex items-center justify-center gap-2 ${microSensitivity ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 text-emerald-800 border-emerald-900/30'}`}
          >
            <Zap size={10} className={microSensitivity ? 'animate-pulse' : ''} />
            <span>{microSensitivity ? 'Micro_Sensitivity: ENABLED' : 'Enable Micro-Sensitivity'}</span>
          </button>
        </div>

        <div className="space-y-1.5 px-1">
          <div className="flex justify-between text-[8px] font-black text-emerald-900 uppercase">
            <span>Shift_Control</span>
            <span>±{OFFSET_HARD_LIMIT}m</span>
          </div>
          <input 
            type="range" min={-OFFSET_HARD_LIMIT} max={OFFSET_HARD_LIMIT} step="0.1" 
            value={offset} onChange={e => onOffsetChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 appearance-none rounded-full accent-emerald-500 cursor-pointer" 
          />
        </div>
        <div className="space-y-1.5 px-1 pt-2 border-t border-emerald-900/10">
          <div className="flex justify-between text-[8px] font-black text-emerald-900 uppercase tracking-widest">
            <span className="flex items-center"><Filter size={10} className="mr-1" /> Flag_Threshold</span>
            <span className="text-orange-400">{anomalyThreshold} API</span>
          </div>
          <input 
            type="range" min="5" max="100" step="1" 
            value={anomalyThreshold} onChange={e => onThresholdChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 appearance-none rounded-full accent-orange-500 cursor-pointer" 
          />
        </div>
        {validationError && (
          <div className={`p-2.5 rounded border flex items-start space-x-2 ${validationError.includes('CRITICAL') ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-orange-500/10 border-orange-500/40 text-orange-400'}`}>
            <AlertOctagon size={14} className="flex-shrink-0 mt-0.5" />
            <span className="text-[8px] font-black uppercase leading-tight">{validationError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GhostSyncCalibration;
