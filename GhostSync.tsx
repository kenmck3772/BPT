import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGhostSync } from './hooks/useGhostSync';
import GhostSyncRemotePanel from './components/GhostSyncRemotePanel';
import GhostSyncAnomalyList from './components/GhostSyncAnomalyList';
import GhostSyncCalibration from './components/GhostSyncCalibration';
import GhostSyncSignalRegistry from './components/GhostSyncSignalRegistry';
import GhostSyncHeader from './components/GhostSyncHeader';
import GhostSyncStats from './components/GhostSyncStats';
import GhostSyncChartContainer from './components/GhostSyncChartContainer';
import DataIntegrityLegend from './components/DataIntegrityLegend';
import { 
  Shield, MoveVertical, ChevronUp, ChevronDown, Target, Zap, 
  Activity, SlidersHorizontal, Fingerprint, Filter, Search, 
  Loader2, Microscope, Layers, Globe, RotateCw, Lock, 
  CloudDownload, Link as LinkIcon, Database, Info,
  Command, ChevronRight, Ruler, Mountain, Eye as FocusEye, EyeOff, Play,
  FileSearch, Cpu, ToggleLeft, ToggleRight, Radio, CloudUpload,
  Map, FileCode, CheckCircle2, ShieldCheck, Building, ClipboardList,
  Save, RotateCcw, Clock, HardDrive, X, Crosshair, AlertCircle,
  Maximize2, Minimize2, Trash2, Terminal as TerminalIcon,
  MapPin, Calendar, FileType, AlertOctagon, Hash, Layout,
  ExternalLink, Download, SearchCode, Skull, Scale, ShieldAlert, AlertTriangle, TrendingUp
} from 'lucide-react';
import { searchNDRMetadata } from './services/ndrService';
import { NDRProject } from './types';
import { secureAsset } from './services/vaultService';

interface GhostSyncProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const COMMAND_REGISTRY = [
  { cmd: 'audit', desc: 'Execute depth discordance scan' },
  { cmd: 'fetch', desc: 'Establish remote NDR artifact link' },
  { cmd: 'clear', desc: 'Purge console log buffer' },
  { cmd: 'expand', desc: 'Toggle full-screen console mode' },
  { cmd: 'help', desc: 'Display available forensic procedures' },
  { cmd: 'save', desc: 'Commit session state to vault' },
  { cmd: 'veto', desc: 'Run variance-based decommissioning audit' },
  { cmd: 'scripts/real_las_audit.py', desc: 'Invoke LAS voxel extraction kernel' }
];

const GhostSync: React.FC<GhostSyncProps> = ({ isFocused, onToggleFocus }) => {
  const [currentWellData, setCurrentWellData] = useState<NDRProject | null>(null);
  const [isWellInfoExpanded, setIsWellInfoExpanded] = useState(false);
  const [isLoadingWellData, setIsLoadingWellData] = useState(false);
  const [signalSearchQuery, setSignalSearchQuery] = useState('');

  const syncState = useGhostSync(currentWellData?.projectId);
  
  const offset = syncState.offset;
  const stableOffset = syncState.stableOffset;
  const isSyncing = syncState.isSyncing;
  const isSweeping = syncState.isSweeping;
  const viewMode = syncState.viewMode;
  const setViewMode = syncState.setViewMode;
  const validationError = syncState.validationError;
  const showAnomalies = syncState.showAnomalies;
  const setShowAnomalies = syncState.setShowAnomalies;
  const anomalyThreshold = syncState.anomalyThreshold;
  const setAnomalyThreshold = syncState.setAnomalyThreshold;
  const effectiveThreshold = syncState.effectiveThreshold;
  const varianceWindow = syncState.varianceWindow;
  const setVarianceWindow = syncState.setVarianceWindow;
  const isScanningAnomalies = syncState.isScanningAnomalies;
  const isAutoAuditing = syncState.isAutoAuditing;
  const isAuditingVariance = syncState.isAuditingVariance;
  const isElevationLoaded = syncState.isElevationLoaded;
  const lastSaved = syncState.lastSaved;
  const filteredAnomalies = syncState.filteredAnomalies;
  const combinedData = syncState.combinedData;
  const correlationScore = syncState.correlationScore;
  const signals = syncState.signals;
  const driftRiskScore = syncState.driftRiskScore;
  const sigmaScore = syncState.sigmaScore;
  const handleOffsetChange = syncState.handleOffsetChange;
  const detectOptimalShift = syncState.detectOptimalShift;
  const runAnomalyScan = syncState.runAnomalyScan;
  const runVarianceAudit = syncState.runVarianceAudit;
  const toggleSignalVisibility = syncState.toggleSignalVisibility;
  const updateSignalColor = syncState.updateSignalColor;
  const reorderSignals = syncState.reorderSignals;
  const addRemoteSignal = syncState.addRemoteSignal;
  const addManualSignal = syncState.addManualSignal;
  const removeSignal = syncState.removeSignal;
  const fetchElevationData = syncState.fetchElevationData;
  const zoomRange = syncState.zoomRange;
  const setZoomRange = syncState.setZoomRange;
  const activeAnomalyId = syncState.activeAnomalyId;
  const setActiveAnomalyId = syncState.setActiveAnomalyId;
  const saveSession = syncState.saveSession;
  const auditTargetAnomaly = syncState.auditTargetAnomaly;
  const isAuditingDeep = syncState.isAuditingDeep;
  const deepAuditReport = syncState.deepAuditReport;
  const runDeepAnomalyAudit = syncState.runDeepAnomalyAudit;
  const closeDeepAudit = syncState.closeDeepAudit;

  const [isSecuringAudit, setIsSecuringAudit] = useState(false);
  const [localSliderOffset, setLocalSliderOffset] = useState(offset);

  const filteredSignalsList = useMemo(() => {
    const q = (signalSearchQuery || '').trim().toLowerCase();
    if (!q) return signals || [];
    return (signals || []).filter(s => {
      if (!s) return false;
      const sName = (s.name || '').toLowerCase();
      const sId = (s.id || '').toLowerCase();
      return sName.indexOf(q) !== -1 || sId.indexOf(q) !== -1;
    });
  }, [signals, signalSearchQuery]);

  const maxDiscordance = useMemo(() => {
    let m = 0;
    if (!combinedData) return 0;
    combinedData.forEach(d => {
      if (d && d.diff > m) m = d.diff;
    });
    return m;
  }, [combinedData]);

  const hasDiscordanceAlert = maxDiscordance > 10;

  const topAnomaly = useMemo(() => {
    if (!filteredAnomalies || filteredAnomalies.length === 0) return null;
    const sortedAnomalies = [...filteredAnomalies].sort((a, b) => b.avgDiff - a.avgDiff);
    return sortedAnomalies[0];
  }, [filteredAnomalies]);

  const handleInspectTopAnomaly = () => {
    if (topAnomaly) {
      runDeepAnomalyAudit(topAnomaly);
    }
  };

  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState<{msg: string, type: 'PROC' | 'REMOTE' | 'ERR' | 'SUCCESS' | 'INPUT' | 'INFO'}[]>([]);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const cliScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchWellContext = async () => {
      setIsLoadingWellData(true);
      try {
        const results = await searchNDRMetadata('Ninian');
        if (results && results.length > 0) {
           setCurrentWellData(results[0]);
           addCliLogWithType(`>>> REGISTRY_UPLINK: Found project ${results[0].projectId}.`, 'SUCCESS');
        }
      } catch (err) {
        addCliLogWithType("ERR: REGISTRY_CRAWL_FAILED", 'ERR');
      } finally {
        setIsLoadingWellData(false);
      }
    };
    fetchWellContext();

    if (lastSaved) {
       addCliLogWithType(`>>> SESSION_RESTORED: Previous kernel state re-anchored. Offset: ${offset.toFixed(3)}m.`, 'SUCCESS');
    }
  }, []);

  useEffect(() => {
    setLocalSliderOffset(offset);
  }, [offset]);

  useEffect(() => {
    if (localSliderOffset === offset) return;
    const debouncedCommit = setTimeout(() => {
      handleOffsetChange(localSliderOffset);
    }, 350);
    return () => clearTimeout(debouncedCommit);
  }, [localSliderOffset, handleOffsetChange, offset]);

  useEffect(() => {
    if (cliScrollRef.current) {
      cliScrollRef.current.scrollTop = cliScrollRef.current.scrollHeight;
    }
  }, [cliLogs]);

  const addCliLogWithType = (msg: string, type: 'PROC' | 'REMOTE' | 'ERR' | 'SUCCESS' | 'INPUT' | 'INFO' = 'PROC') => {
    setCliLogs(prev => {
      const entry = { msg: msg || "", type: type };
      const nextLogs = [...prev, entry];
      if (nextLogs.length > 100) return nextLogs.slice(nextLogs.length - 100);
      return nextLogs;
    });
  };

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = (cmd || '').trim();
    if (!trimmedCmd) return;
    addCliLogWithType(`brahan@seer:~$ ${trimmedCmd}`, 'INPUT');
    try {
       if (trimmedCmd === 'audit') {
         runAnomalyScan();
       } else if (trimmedCmd === 'expand') {
         setIsTerminalExpanded(!isTerminalExpanded);
       } else if (trimmedCmd === 'help') {
         COMMAND_REGISTRY.forEach(c => addCliLogWithType(`${c.cmd}: ${c.desc}`, 'INFO'));
       }
    } catch (e) {
      addCliLogWithType("ERR: COMMAND_EXEC_FAILED", "ERR");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { setCliInput(e.target.value); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { executeCommand(cliInput); setCliInput(''); } };

  const handleSecureDeepAudit = () => {
    if (!deepAuditReport || !auditTargetAnomaly) return;
    setIsSecuringAudit(true);
    setTimeout(() => {
      let mappedStatus: 'VERIFIED' | 'PENDING' | 'CRITICAL' = 'VERIFIED';
      if (auditTargetAnomaly.severity === 'CRITICAL') mappedStatus = 'CRITICAL';
      else if (auditTargetAnomaly.severity === 'WARNING') mappedStatus = 'PENDING';
      
      secureAsset({
        title: `Anomaly_Deep_Audit: ${auditTargetAnomaly.id}`,
        status: mappedStatus,
        summary: deepAuditReport.technicalDeduction,
        region: 'North Sea (Ninian Hub)',
        valueEst: auditTargetAnomaly.severity === 'CRITICAL' ? 12000000 : 850000,
        confidence: auditTargetAnomaly.sigmaScore * 16.6 
      });
      setIsSecuringAudit(false);
      closeDeepAudit();
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 font-terminal bg-slate-950/20 relative overflow-hidden">
      {(auditTargetAnomaly || isAuditingDeep) && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
           
           <div className="w-full max-w-5xl bg-slate-900 border-2 border-emerald-500/40 rounded-[2.5rem] shadow-[0_0_150px_rgba(16,185,129,0.3)] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                 <span className="text-[12rem] font-black uppercase -rotate-12 border-8 border-emerald-500 p-10 leading-none">CONFIDENTIAL_VETO</span>
              </div>

              <div className="p-8 border-b border-emerald-500/20 bg-slate-950/80 flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                       <SearchCode size={32} className="text-emerald-400" />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-emerald-100 uppercase tracking-tighter leading-none">
                         Forensic_Deep_Audit: {auditTargetAnomaly?.id || 'SYNTHESIZING...'}
                       </h2>
                       <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-[0.4em]">Subsurface Discordance Briefing</span>
                          <div className="h-1 w-1 rounded-full bg-emerald-900"></div>
                          <span className="text-[10px] text-emerald-500 font-mono">Auth: Quintin_Milne</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={closeDeepAudit} aria-label="Close Audit Modal" className="p-3 text-emerald-900 hover:text-red-500 transition-all hover:scale-110 active:scale-95">
                    <X size={40} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-black/40 relative z-10">
                 {isAuditingDeep ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-8 py-20">
                       <div className="relative">
                          <Loader2 size={160} className="text-emerald-500 animate-spin opacity-20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <Cpu size={60} className="text-emerald-400 animate-pulse" />
                          </div>
                       </div>
                       <span className="text-2xl font-black text-emerald-400 uppercase tracking-[0.6em] animate-pulse">Sovereign_Logic_Synthesis</span>
                    </div>
                 ) : deepAuditReport ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-bottom-6 duration-700">
                       <div className="lg:col-span-7 space-y-10">
                          <div className="space-y-4">
                             <div className="flex items-center gap-3 text-emerald-500 font-black text-xs uppercase tracking-widest border-b border-emerald-900/30 pb-2">
                                <Activity size={20} /> <span>I. Anomaly_Signature</span>
                             </div>
                             <p className="text-[17px] text-emerald-100 leading-relaxed font-mono italic bg-emerald-500/5 p-6 rounded-r-2xl border border-emerald-500/10">
                                "{deepAuditReport.nature}"
                             </p>
                          </div>
                          <div className="space-y-4">
                             <div className="flex items-center gap-3 text-orange-500 font-black text-xs uppercase tracking-widest border-b border-orange-900/30 pb-2">
                                <AlertTriangle size={20} /> <span>II. Root_Causes</span>
                             </div>
                             <div className="grid grid-cols-1 gap-4">
                                {deepAuditReport.potentialCauses.map((cause, i) => (
                                   <div key={i} className="p-5 bg-slate-900/80 border border-orange-900/20 rounded-[1.25rem] flex items-center gap-5">
                                      <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-xs font-black text-orange-500">0{i+1}</div>
                                      <span className="text-[13px] text-orange-100 uppercase tracking-tighter font-bold">{cause}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                       <div className="lg:col-span-5 space-y-10">
                          <div className="p-8 bg-red-600/15 border-l-8 border-red-600 rounded-r-3xl space-y-6">
                             <p className="text-[19px] font-black text-red-500 leading-tight uppercase tracking-tighter">
                                {deepAuditReport.remediation}
                             </p>
                             <div className="pt-4 border-t border-red-600/20">
                                <span className="text-2xl font-black text-white tracking-tighter">£8.5M - £12.0M UNMANAGED</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 ) : null}
              </div>

              <div className="p-8 border-t border-emerald-500/20 bg-slate-950 flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-5">
                    <button onClick={closeDeepAudit} className="px-8 py-3.5 rounded-2xl border border-emerald-900/60 text-emerald-700 font-black uppercase text-xs tracking-widest hover:text-emerald-400 hover:border-emerald-500 transition-all">Dismiss_Audit</button>
                    <button 
                      onClick={handleSecureDeepAudit} 
                      disabled={!deepAuditReport || isSecuringAudit} 
                      className={`px-12 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black uppercase text-xs tracking-[0.4em] transition-all flex items-center justify-center gap-4 ${isSecuringAudit ? 'opacity-50 cursor-wait' : 'hover:bg-emerald-400 hover:scale-105 active:scale-95'}`}
                    >
                       {isSecuringAudit ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                       <span>{isSecuringAudit ? 'SECURING_VAULT...' : 'Issue_Sovereign_Veto'}</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col space-y-3 z-50">
        <div className="flex items-center justify-between bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl">
               <Building size={24} className="text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter leading-none">{currentWellData?.name || 'SYSTEM_INITIALIZING'}</h2>
                 {!isLoadingWellData && currentWellData && (
                   <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-black uppercase tracking-widest">
                     <Lock size={10} /> Registry_Locked
                   </div>
                 )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button onClick={() => setIsWellInfoExpanded(!isWellInfoExpanded)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border ${isWellInfoExpanded ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-emerald-500 border-emerald-900/50 hover:bg-emerald-500/10'}`}>
              <Info size={16} />
              <span>{isWellInfoExpanded ? 'Close Registry' : 'Well Information'}</span>
              {isWellInfoExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button onClick={() => setIsTerminalExpanded(true)} className="p-3 bg-slate-800 border border-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500 transition-all"><TerminalIcon size={20} /></button>
            {onToggleFocus && (
              <button onClick={onToggleFocus} aria-label="Toggle Focus Mode" className="p-3 text-emerald-900 hover:text-[#00FF41] transition-all bg-slate-800 border border-emerald-500/10 rounded-xl">
                {isFocused ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-row gap-4 min-h-0 overflow-hidden relative">
        <div className="flex-1 flex flex-col space-y-4">
           <GhostSyncChartContainer 
             viewMode={viewMode} combinedData={combinedData} signals={signals || []} ghostLabel={Math.abs(stableOffset) > 0.05 ? "CALIBRATED_LOG" : "GHOST_LOG"} 
             validationError={validationError} offset={stableOffset} showAnomalies={showAnomalies} detectedAnomalies={filteredAnomalies} anomalyThreshold={anomalyThreshold} 
             activeAnomalyId={activeAnomalyId} varianceWindow={varianceWindow} isAuditingVariance={isAuditingVariance} zoomRange={zoomRange} onZoomRangeChange={setZoomRange} hasDiscordanceAlert={hasDiscordanceAlert}
             onInspectAnomaly={runDeepAnomalyAudit}
           />
           <GhostSyncStats 
             sigmaScore={sigmaScore} 
             driftRiskScore={driftRiskScore} 
             correlationScore={correlationScore} 
             anomaliesCount={filteredAnomalies.length} 
             onInspectTopAnomaly={handleInspectTopAnomaly}
           />
        </div>

        <div className="w-full xl:w-[400px] flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-1">
          <div className="bg-slate-950/90 border border-emerald-500/20 rounded-2xl flex flex-col h-[420px] shadow-2xl relative overflow-hidden group">
             <div className="p-3 border-b border-emerald-500/10 flex items-center justify-between bg-emerald-500/5">
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest"><TerminalIcon size={14} className="animate-pulse" /> <span>Seer_Forensic_Console</span></div>
                <button onClick={() => setIsTerminalExpanded(true)} aria-label="Maximize Console" className="p-1 hover:bg-emerald-500/20 text-emerald-500 rounded transition-colors"><Maximize2 size={12} /></button>
             </div>
             <div ref={cliScrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1.5 custom-scrollbar bg-black/40">
                {cliLogs.length === 0 && <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-4"><Database size={32} /><div className="text-center italic leading-tight">Awaiting forensic kernel...</div></div>}
                {cliLogs.map((log, i) => <div key={i} className={`animate-in fade-in slide-in-from-left-1 leading-relaxed ${log && log.type === 'ERR' ? 'text-red-500 font-black border-l-2 border-red-500 pl-2 bg-red-500/5' : log && log.type === 'SUCCESS' ? 'text-emerald-400 font-black' : 'text-emerald-600/80'}`}>{log && log.msg ? log.msg : ""}</div>)}
             </div>
             <div className="p-3 bg-slate-900/60 border-t border-emerald-500/10 flex items-center gap-2 relative">
                <span className="text-[10px] font-black text-blue-500">$</span>
                <input ref={inputRef} type="text" value={cliInput} aria-label="Forensic Command Prompt" onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Invoke_Forensic_Procedure..." className="flex-1 bg-transparent border-none text-[10px] text-emerald-100 font-mono outline-none" />
             </div>
          </div>
          <DataIntegrityLegend />
          
          <div className="flex flex-col space-y-3">
             <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  value={signalSearchQuery}
                  onChange={(e) => setSignalSearchQuery(e.target.value)}
                  placeholder="Filter traces (e.g. GR, Elevation)..."
                  className="w-full bg-black/60 border border-emerald-900/40 rounded-xl pl-10 pr-4 py-2 text-[10px] text-emerald-100 font-mono outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-950 shadow-inner"
                />
             </div>
             <GhostSyncSignalRegistry 
               signals={filteredSignalsList} 
               onToggle={toggleSignalVisibility}
               onUpdateColor={updateSignalColor}
               onReorder={reorderSignals}
               onAddSignal={addManualSignal}
               onRemoveSignal={removeSignal}
             />
          </div>

          <GhostSyncHeader 
             isSweeping={isSweeping}
             showEthicsBrief={false}
             onToggleEthics={() => {}}
             isRemoteInputVisible={false}
             onToggleRemote={() => {}}
             onExport={() => {}}
             onExportPNG={() => {}}
             isScanningAnomalies={isScanningAnomalies}
             isSyncing={isSyncing}
             onRunAnomalyScan={runAnomalyScan}
             onDetectOptimalShift={detectOptimalShift}
             viewMode={viewMode}
             onViewModeChange={setViewMode}
             onSaveSession={saveSession}
             offset={localSliderOffset}
             onOffsetChange={setLocalSliderOffset}
             anomalyThreshold={anomalyThreshold}
             onThresholdChange={setAnomalyThreshold}
             varianceWindow={varianceWindow}
             onVarianceWindowChange={setVarianceWindow}
             hasAnomalies={filteredAnomalies.length > 0}
             onInspectTopAnomaly={handleInspectTopAnomaly}
             maxDiscordance={maxDiscordance}
             hasDiscordanceAlert={hasDiscordanceAlert}
          />
          <GhostSyncCalibration offset={localSliderOffset} onOffsetChange={setLocalSliderOffset} validationError={validationError} anomalyThreshold={anomalyThreshold} effectiveThreshold={effectiveThreshold} onThresholdChange={setAnomalyThreshold} isAuditingVariance={isAuditingVariance} onRunVarianceAudit={() => runVarianceAudit(varianceWindow)} varianceWindow={varianceWindow} />
          <GhostSyncAnomalyList anomalies={filteredAnomalies} isVisible={showAnomalies} onToggle={() => setShowAnomalies(!showAnomalies)} isScanning={isScanningAnomalies} activeAnomalyId={activeAnomalyId} onHoverAnomaly={setActiveAnomalyId} onInspectAnomaly={runDeepAnomalyAudit} />
        </div>
      </div>
    </div>
  );
};

export default GhostSync;