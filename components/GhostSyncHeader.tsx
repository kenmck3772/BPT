import React, { useState } from 'react';
import { 
  Ghost, ScanLine, Info, CloudDownload, X, FileSpreadsheet, 
  Loader2, Search, RotateCw, Camera, Layers, Activity, 
  Split, Fingerprint, Save, Check, Target, Filter, 
  Terminal, ChevronUp, ChevronDown, AlertTriangle, Mountain, Ship,
  SearchCode
} from 'lucide-react';

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
  onSaveSession: () => void;
  offset: number;
  onOffsetChange: (val: number) => void;
  anomalyThreshold: number;
  onThresholdChange: (val: number) => void;
  varianceWindow: number;
  onVarianceWindowChange: (val: number) => void;
  hasDiscordanceAlert?: boolean;
  maxDiscordance?: number;
  isElevationLoaded?: boolean;
  onFetchElevation?: () => void;
  isScrapingElevation?: boolean;
  rigSite?: string | null;
  onInspectTopAnomaly?: () => void;
  hasAnomalies?: boolean;
}

const GhostSyncHeader: React.FC<GhostSyncHeaderProps> = ({
  isSweeping, showEthicsBrief, onToggleEthics, isRemoteInputVisible, onToggleRemote,
  onExport, onExportPNG, isScanningAnomalies, isAuditingVariance, isSyncing, onRunAnomalyScan, onRunVarianceAudit, onDetectOptimalShift,
  viewMode, onViewModeChange, onSaveSession,
  offset, onOffsetChange, anomalyThreshold, onThresholdChange,
  varianceWindow, onVarianceWindowChange,
  hasDiscordanceAlert = false,
  maxDiscordance = 0,
  isElevationLoaded = false,
  onFetchElevation,
  isScrapingElevation = false,
  rigSite,
  onInspectTopAnomaly,
  hasAnomalies = false
}) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const handleSave = () => {
    onSaveSession();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded">
            <Ghost size={24} className={isSweeping ? "text-orange-500 animate-pulse" : "text-emerald-400"} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-emerald-400 uppercase tracking-tighter">Ghost_Sync_Engine</h2>
              {rigSite && (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/30 border border-emerald-500/40 rounded-lg shadow-lg animate-in fade-in slide-in-from-left-2">
                   <Ship size={12} className="text-emerald-400" />
                   <div className="flex flex-col">
                      <span className="text-[7px] font-black text-emerald-700 uppercase leading-none mb-0.5 tracking-widest">Target_Rig_Site</span>
                      <span className="text-[10px] font-black text-emerald-100 uppercase leading-none tracking-tighter">{rigSite}</span>
                   </div>
                </div>
              )}
              {hasDiscordanceAlert && (
                <button 
                  onClick={onInspectTopAnomaly}
                  className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/40 rounded-lg animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-600/40 transition-all active:scale-95"
                >
                  <AlertTriangle size={14} className="text-white animate-pulse" />
                  <div className="flex flex-col text-left">
                    <span className="text-[8px] font-black text-red-400 uppercase leading-none mb-0.5 tracking-widest">DISCORDANCE_ALERT</span>
                    <span className="text-[10px] font-black text-white uppercase leading-none tracking-tighter">PEAK_DELTA: {maxDiscordance.toFixed(1)} API</span>
                  </div>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[8px] text-[#003b0f] font-black uppercase tracking-widest">
              <span className="flex items-center gap-1"><ScanLine size={10} className={isSweeping ? "animate-spin" : ""} /> {isSweeping ? "CROSS_CORRELATION_SWEEP_IN_PROGRESS" : "Brahan_Sigma_Protocol_Active"}</span>
              {isElevationLoaded && <span className="flex items-center gap-1 text-amber-600"><Mountain size={10} /> Topography_Voxel_Link: Active</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-900 border border-emerald-900/40 p-1 rounded-md mr-2">
            <button onClick={() => onViewModeChange("OVERLAY")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${viewMode === 'OVERLAY' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800 hover:text-emerald-400'}`}><Layers size={12} /><span className="hidden sm:inline">Overlay</span></button>
            <button onClick={() => onViewModeChange("DIFFERENTIAL")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${viewMode === 'DIFFERENTIAL' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800 hover:text-emerald-400'}`}><Split size={12} /><span className="hidden sm:inline">Diff</span></button>
            <button onClick={() => onViewModeChange("WAVEFORM")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${viewMode === 'WAVEFORM' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800 hover:text-emerald-400'}`}><Activity size={12} /><span className="hidden sm:inline">Wave</span></button>
          </div>

          <button onClick={handleSave} className={`flex items-center space-x-2 px-3 py-2 rounded text-[10px] font-black uppercase transition-all border ${saveStatus === 'saved' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-amber-900/40 text-amber-500 hover:bg-amber-500/10'}`}>
            {saveStatus === 'saved' ? <Check size={14} /> : <Save size={14} />}
            <span>{saveStatus === 'saved' ? "Session_Saved" : "Save_Session"}</span>
          </button>

          {hasAnomalies && onInspectTopAnomaly && (
            <button 
              onClick={onInspectTopAnomaly}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-slate-950 rounded text-[10px] font-black uppercase hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all animate-in zoom-in-95"
            >
              <SearchCode size={14} />
              <span>Deep_Audit</span>
            </button>
          )}

          {!isElevationLoaded && onFetchElevation && (
            <button onClick={onFetchElevation} disabled={isScrapingElevation} className={`flex items-center space-x-2 px-3 py-2 rounded text-[10px] font-black uppercase transition-all border ${isScrapingElevation ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 animate-pulse' : 'bg-slate-900 border-amber-900/40 text-amber-600 hover:border-amber-400'}`}>
              {isScrapingElevation ? <Loader2 size={14} className="animate-spin" /> : <Mountain size={14} />}
              <span>{isScrapingElevation ? 'Scraping...' : 'Load Topography'}</span>
            </button>
          )}

          <button onClick={onToggleEthics} className={`flex items-center space-x-2 px-3 py-2 rounded text-[10px] font-black uppercase transition-all border ${showEthicsBrief ? 'bg-red-500 text-slate-950 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-red-900/40 text-red-500'}`}><Info size={14} /><span>Sigma Rationale</span></button>
          <button onClick={onToggleRemote} className={`flex items-center space-x-2 px-4 py-2 rounded text-[10px] font-black uppercase transition-all border ${isRemoteInputVisible ? 'bg-blue-500 text-slate-950 border-blue-400' : 'bg-slate-900 border-amber-900/40 text-blue-400 hover:border-blue-400'}`}>{isRemoteInputVisible ? <X size={14} /> : <CloudDownload size={14} />}<span>Remote Data</span></button>
          <button onClick={onExportPNG} className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-emerald-400/40 text-emerald-400 rounded text-[10px] font-black uppercase hover:bg-emerald-400/10 transition-all"><Camera size={14} /><span className="hidden xl:inline">Capture_PNG</span></button>
          <button onClick={onExport} className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-emerald-400/40 text-emerald-400 rounded text-[10px] font-black uppercase hover:bg-emerald-400/10 transition-all"><FileSpreadsheet size={14} /><span className="hidden xl:inline">Export_CSV</span></button>
          
          <button onClick={onRunAnomalyScan} disabled={isScanningAnomalies || isSyncing} className={`flex items-center space-x-2 px-4 py-2 rounded text-[10px] font-black uppercase border ${isScanningAnomalies ? 'bg-orange-500/20 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-slate-900 border-orange-900/40 text-orange-400'}`}>{isScanningAnomalies ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}<span>{isScanningAnomalies ? "Grading..." : "Forensic_Scan"}</span></button>
          
          <div className="flex items-center bg-slate-900/40 p-1 rounded-lg border border-emerald-900/20 gap-1">
            <button onClick={onDetectOptimalShift} disabled={isSyncing} className="flex items-center space-x-2 px-6 py-2 bg-emerald-400 text-slate-950 rounded font-black text-[10px] uppercase hover:bg-emerald-300 shadow-[0_0_15px_rgba(0,255,65,0.4)] disabled:opacity-50 transition-all"><RotateCw size={14} /><span>Auto_Tie</span></button>
            <button onClick={onRunVarianceAudit} disabled={isSyncing || isAuditingVariance} className={`flex items-center space-x-2 px-4 py-2 rounded font-black text-[10px] uppercase transition-all ${isAuditingVariance ? 'bg-purple-500/20 text-purple-400 animate-pulse' : 'bg-slate-900 border border-purple-900/40 text-purple-400 hover:bg-purple-500 hover:text-slate-950 shadow-[0_0_15px_rgba(168,85,247,0.1)]'}`}><Fingerprint size={14} /><span className="hidden sm:inline">Variance_Audit</span></button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 py-3 bg-slate-950/60 border border-emerald-900/20 rounded-xl animate-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2 px-3 border-r border-emerald-900/20"><Terminal size={14} className="text-emerald-500" /><span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Forensic_Overrides</span></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2"><Target size={12} className="text-emerald-900" /><span className="text-[8px] font-black text-emerald-900 uppercase">Shift:</span>
            <div className="flex items-center bg-black border border-emerald-900/40 rounded-md overflow-hidden focus-within:border-emerald-500 transition-all group">
              <input type="number" step="0.001" value={offset} onChange={(e) => onOffsetChange(parseFloat(e.target.value) || 0)} className="w-20 bg-transparent py-1 px-2 text-[11px] text-emerald-100 font-terminal outline-none text-center" />
              <div className="flex flex-col border-l border-emerald-900/40">
                 <button onClick={() => onOffsetChange(offset + 0.1)} className="p-0.5 hover:bg-emerald-500/10 text-emerald-900 hover:text-emerald-400"><ChevronUp size={8} /></button>
                 <button onClick={() => onOffsetChange(offset - 0.1)} className="p-0.5 hover:bg-emerald-500/10 text-emerald-900 hover:text-emerald-400 border-t border-emerald-900/20"><ChevronDown size={8} /></button>
              </div>
              <span className="px-2 text-[8px] font-black text-emerald-900 border-l border-emerald-900/40 bg-emerald-950/30">M</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4"><Filter size={12} className="text-orange-900" /><span className="text-[8px] font-black text-orange-900 uppercase">Logic:</span>
            <div className="flex items-center bg-black border border-orange-900/40 rounded-md overflow-hidden focus-within:border-orange-500 transition-all">
              <input type="number" step="0.1" min="0" max="100" value={anomalyThreshold} onChange={(e) => onThresholdChange(parseFloat(e.target.value) || 0)} className="w-16 bg-transparent py-1 px-2 text-[11px] text-orange-400 font-terminal outline-none text-center" />
              <div className="flex flex-col border-l border-orange-900/40">
                 <button onClick={() => onThresholdChange(anomalyThreshold + 0.5)} className="p-0.5 hover:bg-orange-500/10 text-orange-900 hover:text-orange-400"><ChevronUp size={8} /></button>
                 <button onClick={() => onThresholdChange(Math.max(0, anomalyThreshold - 0.5))} className="p-0.5 hover:bg-orange-500/10 text-orange-900 hover:text-orange-400 border-t border-orange-900/20"><ChevronDown size={8} /></button>
              </div>
              <span className="px-2 text-[8px] font-black text-orange-900 border-l border-orange-900/40 bg-orange-950/30 uppercase">API</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4"><Fingerprint size={12} className="text-purple-900" /><span className="text-[8px] font-black text-purple-900 uppercase">Aperture:</span>
            <div className="flex items-center bg-black border border-purple-900/40 rounded-md overflow-hidden focus-within:border-purple-500 transition-all">
              <input type="number" min="1" max="50" value={varianceWindow} onChange={(e) => onVarianceWindowChange(parseInt(e.target.value) || 1)} className="w-14 bg-transparent py-1 px-2 text-[11px] text-purple-400 font-terminal outline-none text-center" />
              <div className="flex flex-col border-l border-purple-900/40">
                 <button onClick={() => onVarianceWindowChange(varianceWindow + 1)} className="p-0.5 hover:bg-purple-500/10 text-purple-900 hover:text-purple-400"><ChevronUp size={8} /></button>
                 <button onClick={() => onVarianceWindowChange(Math.max(1, varianceWindow - 1))} className="p-0.5 hover:bg-purple-500/10 text-purple-900 hover:text-purple-400 border-t border-purple-900/20"><ChevronDown size={8} /></button>
              </div>
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4 text-[8px] font-black text-emerald-900 uppercase tracking-tighter italic"><span className="flex items-center gap-1"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div> Real_Time_Sync: Nominal</span><span className="opacity-40">Brahan_Terminal_Precision_Suite_v2.5</span></div>
      </div>
    </div>
  );
};

export default GhostSyncHeader;