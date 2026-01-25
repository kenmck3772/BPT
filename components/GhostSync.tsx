
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGhostSync } from '../hooks/useGhostSync';
import GhostSyncRemotePanel from './GhostSyncRemotePanel';
import GhostSyncAnomalyList from './GhostSyncAnomalyList';
import GhostSyncCalibration from './GhostSyncCalibration';
import GhostSyncSignalRegistry from './GhostSyncSignalRegistry';
import GhostSyncHeader from './GhostSyncHeader';
import GhostSyncStats from './GhostSyncStats';
import GhostSyncChartContainer from './GhostSyncChartContainer';
import { Shield, MoveVertical, ChevronUp, ChevronDown, Target, Zap, Activity, SlidersHorizontal, Fingerprint, Filter, Search, Loader2, Microscope, Layers, Globe, RotateCw, Lock } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

const GhostSync: React.FC = () => {
  const {
    offset, isSyncing, isSweeping, viewMode, setViewMode, validationError,
    autoDetectEnabled, setAutoDetectEnabled,
    showAnomalies, setShowAnomalies, anomalyThreshold, setAnomalyThreshold,
    microSensitivity, setMicroSensitivity, varianceWindow, setVarianceWindow,
    isScanningAnomalies, isAutoAuditing, isAuditingVariance, detectedAnomalies, filteredAnomalies, severityFilter, setSeverityFilter, combinedData, correlationScore,
    signals, driftRiskScore, sigmaScore, handleOffsetChange, detectOptimalShift, 
    runAnomalyScan, runVarianceAudit, toggleSignalVisibility, updateSignalColor, reorderSignals, 
    addRemoteSignal, addManualSignal, removeSignal
  } = useGhostSync();

  const [isRemoteInputVisible, setIsRemoteInputVisible] = useState(false);
  const [showEthicsBrief, setShowEthicsBrief] = useState(false);
  const [activeAnomalyId, setActiveAnomalyId] = useState<string | null>(null);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // Local state for smooth slider tracking before debounced propagation
  const [localOffset, setLocalOffset] = useState(offset);

  // Sync local offset with global offset (e.g. after Auto_Tie)
  useEffect(() => {
    setLocalOffset(offset);
  }, [offset]);

  // Debounced propagation of local offset to global state
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localOffset !== offset) {
        handleOffsetChange(localOffset);
      }
    }, 50); // 50ms offers a balance between UI snappiness and calculation throttling
    return () => clearTimeout(handler);
  }, [localOffset, handleOffsetChange, offset]);

  // Generate a unique session ID for the duration of this module's mount
  const sessionId = useMemo(() => {
    return `BRAHAN-SEC-SES-${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;
  }, []);

  // Automatic Trigger: React to data or offset changes for background forensics
  useEffect(() => {
    if (autoDetectEnabled && !isSyncing && !isSweeping) {
      const debounceTimer = setTimeout(() => {
        runAnomalyScan(true);
      }, 400);
      return () => clearTimeout(debounceTimer);
    }
  }, [offset, combinedData, autoDetectEnabled, isSyncing, isSweeping, runAnomalyScan]);

  // Visual success indicator for Auto_Tie
  useEffect(() => {
    if (isSyncing) {
      setShowSyncSuccess(false);
    } else if (Math.abs(offset) > 0 && !isSyncing && !isSweeping) {
       // Only show if it was actually just synced (simplified check)
       setShowSyncSuccess(true);
       const timer = setTimeout(() => setShowSyncSuccess(false), 3000);
       return () => clearTimeout(timer);
    }
  }, [isSyncing, isSweeping]);

  const handleExportCSV = () => {
    const headers = ["Depth(m)", "Base_Log_GR(API)", "Ghost_Log_GR(API)", "Discordance_Delta(API)", "Sigma_Scoring"];
    const csvRows = combinedData.map(row => 
      [row.depth, row.baseGR, row.ghostGR ?? "N/A", row.diff, sigmaScore].join(",")
    );
    
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BRAHAN_SIGMA_${sigmaScore}_OFFSET_${offset.toFixed(3)}M.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPNG = async () => {
    if (!captureRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(captureRef.current, {
        backgroundColor: '#020617',
        quality: 1,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `BRAHAN_FORENSIC_SNAPSHOT_${sigmaScore}SIGMA_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Snapshot failure:', err);
    }
  };

  const ghostLabel = Math.abs(offset) > 0.05 ? (isSweeping ? "SWEEPING..." : "CALIBRATED_LOG") : "GHOST_LOG";

  return (
    <div ref={captureRef} className="flex flex-col h-full p-4 space-y-4 font-terminal bg-slate-950/20 relative">
      
      {/* Auto_Tie Success Overlay */}
      {showSyncSuccess && !isSyncing && !isSweeping && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in zoom-in-95 duration-500 pointer-events-none">
          <div className="bg-emerald-500/90 border-2 border-emerald-400 px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.5)] backdrop-blur-md">
            <Lock size={20} className="text-slate-950 animate-bounce" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-950 uppercase tracking-[0.2em]">Sync_Lock_Acquired</span>
              <span className="text-[10px] font-bold text-slate-900/80 uppercase">Optimal Tie: {offset.toFixed(3)}m</span>
            </div>
          </div>
        </div>
      )}

      <GhostSyncHeader 
        isSweeping={isSweeping}
        showEthicsBrief={showEthicsBrief}
        onToggleEthics={() => setShowEthicsBrief(!showEthicsBrief)}
        isRemoteInputVisible={isRemoteInputVisible}
        onToggleRemote={() => setIsRemoteInputVisible(!isRemoteInputVisible)}
        onExport={handleExportCSV}
        onExportPNG={handleExportPNG}
        isScanningAnomalies={isScanningAnomalies}
        isAuditingVariance={isAuditingVariance}
        isSyncing={isSyncing}
        onRunAnomalyScan={runAnomalyScan}
        onRunVarianceAudit={runVarianceAudit}
        onDetectOptimalShift={detectOptimalShift}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {showEthicsBrief && (
        <div className="bg-red-950/20 border-l-4 border-red-500 p-4 rounded animate-in slide-in-from-left-2 duration-300 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
           <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1 flex items-center gap-2">
             <Shield size={14} /> Brahan Sigma (σ) Calibration
           </h4>
           <p className="text-[11px] text-red-200/70 font-terminal italic leading-relaxed">
             Standard percentages are for public compliance. Forensic hunting requires the Sigma Protocol: 
             [3σ-4σ] Strong Lead; [4σ-5σ] Verified Target; [>5σ] Sovereign Discovery.
           </p>
        </div>
      )}

      {/* Forensic Modal for Remote Data Ingestion */}
      {isRemoteInputVisible && (
        <GhostSyncRemotePanel 
          sessionId={sessionId}
          onClose={() => setIsRemoteInputVisible(false)}
          onDataLoaded={(id, name, data) => {
            addRemoteSignal(id, name, '#3b82f6', data);
            setIsRemoteInputVisible(false);
          }} 
        />
      )}

      <div className="flex-1 flex flex-col xl:flex-row gap-4 min-h-0">
        <div className="flex-1 flex flex-col space-y-4">
           <GhostSyncChartContainer 
             viewMode={viewMode}
             combinedData={combinedData}
             signals={signals}
             ghostLabel={ghostLabel}
             validationError={validationError}
             offset={offset}
             showAnomalies={showAnomalies}
             detectedAnomalies={filteredAnomalies}
             anomalyThreshold={anomalyThreshold}
             activeAnomalyId={activeAnomalyId}
             varianceWindow={varianceWindow}
             isAuditingVariance={isAuditingVariance}
           />
           <GhostSyncStats 
             sigmaScore={sigmaScore}
             driftRiskScore={driftRiskScore}
             correlationScore={correlationScore}
             anomaliesCount={filteredAnomalies.length}
           />
        </div>

        <div className="w-full xl:w-80 flex flex-col space-y-4">
          {/* Tactical Precision Offset Controller */}
          <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-20 transition-opacity">
              <MoveVertical size={120} className="text-emerald-500" />
            </div>
            
            <div className="flex items-center justify-between mb-6 border-b border-emerald-900/20 pb-2">
              <div className="flex items-center space-x-2">
                <Target size={16} className="text-emerald-400" />
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Depth_Vector_Shift</h3>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setAutoDetectEnabled(!autoDetectEnabled)}
                  title={autoDetectEnabled ? "Live_Audit: Active" : "Live_Audit: Inactive"}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all ${autoDetectEnabled ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-slate-900 border-emerald-900/20 text-emerald-900'}`}
                >
                  <Activity size={10} className={autoDetectEnabled ? 'animate-pulse' : ''} />
                  <span className="text-[7px] font-black uppercase">{autoDetectEnabled ? 'AUTO' : 'MANUAL'}</span>
                </button>
                <div className={`w-1.5 h-1.5 rounded-full ${Math.abs(offset) > 0 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              {/* Display Mode Selector */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={12} className="text-emerald-500" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Visual_Mode_Veto</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['OVERLAY', 'DIFFERENTIAL', 'WAVEFORM'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`py-1.5 rounded text-[7px] font-black border transition-all uppercase ${
                        viewMode === mode 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                          : 'bg-slate-950 text-emerald-900 border-emerald-900/30 hover:border-emerald-500/40'
                      }`}
                    >
                      {mode === 'DIFFERENTIAL' ? 'DIFF' : mode === 'WAVEFORM' ? 'WAVE' : 'MAP'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-black/40 border border-emerald-900/10 rounded-xl relative overflow-hidden shadow-inner">
                <div className="absolute top-1 left-1 opacity-10"><Zap size={10} className="text-emerald-500" /></div>
                <span className="text-[8px] text-emerald-900 font-black uppercase tracking-[0.3em] mb-1">Current_Discordance</span>
                <div className="text-3xl font-black font-terminal text-emerald-400 tracking-tighter tabular-nums text-center">
                  {localOffset > 0 ? '+' : ''}{localOffset.toFixed(3)}<span className="text-xs ml-1 text-emerald-900">m</span>
                  {(isAutoAuditing || isAuditingVariance) && (
                    <div className="flex flex-col items-center mt-1 animate-pulse">
                      <div className={`text-[7px] font-black tracking-widest uppercase ${isAuditingVariance ? 'text-purple-400' : 'text-orange-500'}`}>
                        {isAuditingVariance ? 'Deep_Variance_Scan' : 'Background_Audit_Active'}
                      </div>
                      {isAuditingVariance && <Fingerprint size={10} className="text-purple-500 mt-0.5" />}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setIsRemoteInputVisible(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                >
                  <Globe size={14} />
                  <span>Remote_Forensic_Acquisition</span>
                </button>
              </div>

              {/* Forensic Filter Logic Gate */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter size={12} className="text-emerald-500" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Severity_Veto</span>
                  </div>
                  <span className="text-[7px] font-black uppercase text-emerald-900 tracking-widest">Active: {severityFilter}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(['ALL', 'CRITICAL', 'WARNING', 'MICRO'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`py-1.5 rounded text-[7px] font-black border transition-all uppercase ${
                        severityFilter === sev 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                          : 'bg-slate-950 text-emerald-900 border-emerald-900/30 hover:border-emerald-500/40'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forensic Res and Variance Control */}
              <div className="p-3 bg-slate-900/40 rounded-xl border border-emerald-500/20 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={12} className="text-emerald-600" />
                      <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Forensic_Res</span>
                    </div>
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${microSensitivity ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-emerald-800'}`}>
                      {microSensitivity ? 'Micro_Scan: On' : 'Standard'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setMicroSensitivity(!microSensitivity)}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border transition-all text-[9px] font-black uppercase tracking-[0.2em] ${microSensitivity ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-950 border-emerald-900/30 text-emerald-900 hover:text-emerald-400'}`}
                  >
                    <Zap size={12} className={microSensitivity ? 'animate-pulse' : ''} />
                    <span>Micro_Sensitivity</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-emerald-900/10 space-y-2">
                  <div className="flex justify-between items-center text-[8px] font-black text-emerald-800 uppercase tracking-widest">
                    <span>Variance_Window</span>
                    <span className="text-emerald-500">{varianceWindow}m</span>
                  </div>
                  <input 
                    type="range" min="2" max="20" step="1" 
                    value={varianceWindow} onChange={e => setVarianceWindow(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-950 appearance-none rounded-full accent-purple-500 cursor-pointer" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black text-emerald-900 uppercase">
                  <span>-30.0m</span>
                  <span className="text-emerald-500">Manual_Override</span>
                  <span>+30.0m</span>
                </div>
                <input 
                  type="range" 
                  min="-30" 
                  max="30" 
                  step="0.01" 
                  value={localOffset} 
                  onChange={(e) => setLocalOffset(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-900 appearance-none rounded-full cursor-pointer accent-emerald-500 border border-emerald-900/20 hover:accent-emerald-400 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setLocalOffset(localOffset + 0.05)}
                  className="flex items-center justify-center space-x-2 py-3 bg-slate-900/60 border border-emerald-900/30 rounded-lg text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all group"
                >
                  <ChevronUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                  <span className="text-[9px] font-black uppercase">+0.05m</span>
                </button>
                <button 
                  onClick={() => setLocalOffset(localOffset - 0.05)}
                  className="flex items-center justify-center space-x-2 py-3 bg-slate-900/60 border border-emerald-900/30 rounded-lg text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all group"
                >
                  <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                  <span className="text-[9px] font-black uppercase">-0.05m</span>
                </button>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button 
                  onClick={() => runAnomalyScan(false)}
                  disabled={isScanningAnomalies || isAuditingVariance}
                  className="w-full py-3 bg-emerald-500 text-slate-950 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  {isScanningAnomalies ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Initiate_Datum_Audit
                </button>
                
                {/* Enhanced Action Row: Auto_Tie & Variance_Audit */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => detectOptimalShift()}
                    disabled={isSyncing || isSweeping}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${isSyncing ? 'bg-emerald-900/20 text-emerald-900' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'}`}
                  >
                    {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RotateCw size={12} />}
                    Auto_Tie
                  </button>
                  <button 
                    onClick={() => runVarianceAudit()}
                    disabled={isAuditingVariance || isScanningAnomalies}
                    className="flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-purple-500 shadow-md transition-all"
                  >
                    {isAuditingVariance ? <Loader2 size={12} className="animate-spin" /> : <Fingerprint size={12} />}
                    Var_Audit
                  </button>
                </div>

                <button 
                  onClick={() => setLocalOffset(0)}
                  className="w-full py-2 bg-slate-950 border border-emerald-900/20 rounded-md text-[8px] font-black text-emerald-900 uppercase tracking-widest hover:text-emerald-400 hover:border-emerald-400 transition-all"
                >
                  Reset_Datum_Lock
                </button>
              </div>
            </div>

            {validationError && (
              <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start space-x-2 animate-in fade-in zoom-in duration-300">
                <Shield size={14} className="text-orange-500 shrink-0 mt-0.5" />
                <span className="text-[8px] font-black text-orange-400 uppercase leading-tight">{validationError}</span>
              </div>
            )}
          </div>

          <GhostSyncAnomalyList 
            anomalies={filteredAnomalies} 
            isVisible={showAnomalies} 
            onToggle={() => setShowAnomalies(!showAnomalies)} 
            isScanning={isScanningAnomalies || isAutoAuditing || isAuditingVariance} 
            activeAnomalyId={activeAnomalyId}
            onHoverAnomaly={setActiveAnomalyId}
          />
          
          <GhostSyncSignalRegistry 
            signals={signals} 
            onToggle={toggleSignalVisibility} 
            onUpdateColor={updateSignalColor}
            onReorder={reorderSignals}
            onAddSignal={addManualSignal}
            onRemoveSignal={removeSignal}
          />
        </div>
      </div>
    </div>
  );
};

export default GhostSync;
