
import React from 'react';
import { Ghost, ScanLine, Info, CloudDownload, X, FileSpreadsheet, Loader2, Search, RotateCw, Camera, Layers, Activity, Split, Fingerprint } from 'lucide-react';

interface GhostSyncHeaderProps {
  isSweeping: boolean;
  showEthicsBrief: boolean;
  onToggleEthics: () => void;
  isRemoteInputVisible: boolean;
  onToggleRemote: () => void;
  onExport: () => void;
  onExportPNG: () => void;
  isScanningAnomalies: boolean;
  isAuditingVariance?: boolean;
  isSyncing: boolean;
  onRunAnomalyScan: () => void;
  onRunVarianceAudit?: () => void;
  onDetectOptimalShift: () => void;
  viewMode: 'OVERLAY' | 'DIFFERENTIAL' | 'WAVEFORM';
  onViewModeChange: (mode: 'OVERLAY' | 'DIFFERENTIAL' | 'WAVEFORM') => void;
}

const GhostSyncHeader: React.FC<GhostSyncHeaderProps> = ({
  isSweeping, showEthicsBrief, onToggleEthics, isRemoteInputVisible, onToggleRemote,
  onExport, onExportPNG, isScanningAnomalies, isAuditingVariance, isSyncing, onRunAnomalyScan, onRunVarianceAudit, onDetectOptimalShift,
  viewMode, onViewModeChange
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded">
          <Ghost size={24} className={isSweeping ? "text-orange-500 animate-pulse" : "text-[#00FF41]"} />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#00FF41] uppercase tracking-tighter">Ghost_Sync_Engine</h2>
          <div className="flex items-center space-x-2 text-[8px] text-[#003b0f] font-black uppercase tracking-widest">
            <ScanLine size={10} className={isSweeping ? "animate-spin" : ""} />
            <span>{isSweeping ? 'CROSS_CORRELATION_SWEEP_IN_PROGRESS' : 'Brahan_Sigma_Protocol_Active'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* View Mode Selector */}
        <div className="flex bg-slate-900 border border-emerald-900/40 p-1 rounded-md mr-2">
          <button
            onClick={() => onViewModeChange('OVERLAY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${viewMode === 'OVERLAY' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800 hover:text-emerald-400'}`}
          >
            <Layers size={12} />
            <span className="hidden sm:inline">Overlay</span>
          </button>
          <button
            onClick={() => onViewModeChange('DIFFERENTIAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${viewMode === 'DIFFERENTIAL' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800 hover:text-emerald-400'}`}
          >
            <Split size={12} />
            <span className="hidden sm:inline">Diff</span>
          </button>
          <button
            onClick={() => onViewModeChange('WAVEFORM')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${viewMode === 'WAVEFORM' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800 hover:text-emerald-400'}`}
          >
            <Activity size={12} />
            <span className="hidden sm:inline">Wave</span>
          </button>
        </div>

        <button 
          onClick={onToggleEthics}
          className={`flex items-center space-x-2 px-3 py-2 rounded text-[10px] font-black uppercase transition-all border ${showEthicsBrief ? 'bg-red-500 text-slate-950 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-red-900/40 text-red-500'}`}
        >
          <Info size={14} />
          <span>Sigma Rationale</span>
        </button>
        
        <button 
          onClick={onToggleRemote}
          className={`flex items-center space-x-2 px-4 py-2 rounded text-[10px] font-black uppercase transition-all border ${isRemoteInputVisible ? 'bg-blue-500 text-slate-950 border-blue-400' : 'bg-slate-900 border-blue-900/40 text-blue-400 hover:border-blue-400'}`}
        >
          {isRemoteInputVisible ? <X size={14} /> : <CloudDownload size={14} />}
          <span>Remote Data</span>
        </button>

        <button 
          onClick={onExportPNG}
          title="Capture Forensic Snapshot (PNG)"
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-[#00FF41]/40 text-[#00FF41] rounded text-[10px] font-black uppercase hover:bg-[#00FF41]/10 transition-all"
        >
          <Camera size={14} />
          <span className="hidden xl:inline">Capture_PNG</span>
        </button>

        <button 
          onClick={onExport}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-[#00FF41]/40 text-[#00FF41] rounded text-[10px] font-black uppercase hover:bg-[#00FF41]/10 transition-all"
        >
          <FileSpreadsheet size={14} />
          <span className="hidden xl:inline">Export_CSV</span>
        </button>
        
        <button onClick={onRunAnomalyScan} disabled={isScanningAnomalies || isSyncing} className={`flex items-center space-x-2 px-4 py-2 rounded text-[10px] font-black uppercase border ${isScanningAnomalies ? 'bg-orange-500/20 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-slate-900 border-orange-900/40 text-orange-400'}`}>
          {isScanningAnomalies ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          <span>{isScanningAnomalies ? 'Grading...' : 'Forensic_Scan'}</span>
        </button>
        
        <div className="flex items-center bg-slate-900/40 p-1 rounded-lg border border-emerald-900/20 gap-1">
          <button 
            onClick={onDetectOptimalShift} 
            disabled={isSyncing} 
            title="Automated least-squares cross-correlation"
            className="flex items-center space-x-2 px-6 py-2 bg-[#00FF41] text-slate-950 rounded font-black text-[10px] uppercase hover:bg-[#00FF41]/80 shadow-[0_0_15px_rgba(0,255,65,0.4)] disabled:opacity-50 transition-all"
          >
            <RotateCw size={14} />
            <span>Auto_Tie</span>
          </button>

          <button 
            onClick={onRunVarianceAudit} 
            disabled={isSyncing || isAuditingVariance} 
            title="Analyze signal texture variance discordance"
            className={`flex items-center space-x-2 px-4 py-2 rounded font-black text-[10px] uppercase transition-all ${isAuditingVariance ? 'bg-purple-500/20 text-purple-400 animate-pulse' : 'bg-slate-900 border border-purple-900/40 text-purple-400 hover:bg-purple-500 hover:text-slate-950 shadow-[0_0_15px_rgba(168,85,247,0.1)]'}`}
          >
            {isAuditingVariance ? <Loader2 size={14} className="animate-spin" /> : <Fingerprint size={14} />}
            <span className="hidden sm:inline">Variance_Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GhostSyncHeader;
