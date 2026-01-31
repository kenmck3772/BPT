import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useGhostSync } from '../hooks/useGhostSync';
import GhostSyncRemotePanel from './GhostSyncRemotePanel';
import GhostSyncAnomalyList from './GhostSyncAnomalyList';
import GhostSyncCalibration from './GhostSyncCalibration';
import GhostSyncSignalRegistry from './GhostSyncSignalRegistry';
import GhostSyncHeader from './GhostSyncHeader';
import GhostSyncStats from './GhostSyncStats';
import GhostSyncChartContainer from './GhostSyncChartContainer';
// Add missing import for DataIntegrityLegend
import DataIntegrityLegend from './DataIntegrityLegend';
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
import * as htmlToImage from 'html-to-image';
import { searchNDRMetadata } from '../services/ndrService';
import { NDRProject } from '../types';
import { secureAsset } from '../services/vaultService';
import { GHOST_HUNTER_MISSION } from '../constants';

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

  // Added wellId dependency to useGhostSync to support context switching
  const {
    offset, stableOffset, isSyncing, isSweeping, viewMode, setViewMode, validationError,
    showAnomalies, setShowAnomalies, anomalyThreshold, setAnomalyThreshold,
    microSensitivity, setMicroSensitivity, effectiveThreshold, varianceWindow, setVarianceWindow,
    isScanningAnomalies, isAutoAuditing, isAuditingVariance, isExtracting, isElevationLoaded, lastSaved, filteredAnomalies, combinedData, correlationScore,
    signals, driftRiskScore, sigmaScore, handleOffsetChange, detectOptimalShift, 
    runAnomalyScan, runVarianceAudit, handleForensicExtraction, toggleSignalVisibility, updateSignalColor, reorderSignals, 
    addRemoteSignal, addManualSignal, removeSignal, fetchElevationData,
    zoomRange, setZoomRange, activeAnomalyId, setActiveAnomalyId, saveSession,
    // Destructuring missing deep audit props from hook to resolve reference errors
    auditTargetAnomaly, isAuditingDeep, deepAuditReport, runDeepAnomalyAudit, closeDeepAudit
  } = useGhostSync(currentWellData?.projectId);

  const [isRemoteInputVisible, setIsRemoteInputVisible] = useState(false);
  const [remoteFetchUrl, setRemoteFetchUrl] = useState('');
  const [showEthicsBrief, setShowEthicsBrief] = useState(false);
  const [signalSearchQuery, setSignalSearchQuery] = useState('');
  const [isScrapingElevation] = useState(false);
  const [isSecuringAudit, setIsSecuringAudit] = useState(false);
  
  const [localSliderOffset, setLocalSliderOffset] = useState(offset);

  // Added autocomplete state for CLI
  const [suggestions, setSuggestions] = useState<typeof COMMAND_REGISTRY>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  // Detect peak discordance in API units for triggering alerts
  const maxDiscordance = useMemo(() => {
    return Math.max(...combinedData.map(d => d.diff || 0), 0);
  }, [combinedData]);

  const hasDiscordanceAlert = maxDiscordance > 10;

  // Extract active rig site from GHOST_HUNTER_MISSION based on target context
  const activeRigSite = useMemo(() => {
    if (!currentWellData) return null;
    const target = GHOST_HUNTER_MISSION.TARGETS.find(t => 
      currentWellData.name.toUpperCase().includes(t.ASSET.replace('_', ' ').toUpperCase()) ||
      currentWellData.projectId.toUpperCase().includes(t.ASSET.toUpperCase())
    );
    return target?.rig_site || null;
  }, [currentWellData]);

  // CLI Console State
  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState<{msg: string, type: 'PROC' | 'REMOTE' | 'ERR' | 'SUCCESS' | 'INPUT' | 'INFO'}[]>([]);
  const [isCliProcessing, setIsCliProcessing] = useState(false);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const cliScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSignalsList = useMemo(() => {
    const query = String(signalSearchQuery || '').trim().toLowerCase();
    if (!query) return signals || [];
    return (signals || []).filter(s => {
      if (!s) return false;
      const name = String(s.name || '').toLowerCase();
      const id = String(s.id || '').toLowerCase();
      return (name && name.includes(query)) || (id && id.includes(query));
    });
  }, [signals, signalSearchQuery]);

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
        console.error("GHOST_SYNC_ERROR: Failed to fetch NDR well context registry:", err);
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
    setCliLogs(prev => [...prev.slice(-99), { msg: msg || "", type }]);
  };

  const validateUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  const streamLogs = async (lines: {msg: string, type: any}[]) => {
    for (const line of lines) {
      if (!line) continue;
      const msg = line.msg || "";
      addCliLogWithType(msg, line.type);
      const delay = (msg && msg.includes('...')) ? 600 : (Math.random() * 150 + 40);
      await new Promise(r => setTimeout(r, delay));
    }
  };

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = String(cmd || '').trim();
    if (!trimmedCmd) return;

    addCliLogWithType(`brahan@seer:~$ ${trimmedCmd}`, 'INPUT');
    setIsCliProcessing(true);
    setSuggestions([]);

    try {
      if (trimmedCmd.includes('scripts/real_las_audit.py')) {
        const filePath = 'Data/Ninian/NC12/3_03-N12_jwl_JWL_FILE_266223720.las';
        await streamLogs([
          { msg: ">>> INITIATING_FORENSIC_AUDIT_KERNEL...", type: 'INFO' },
          { msg: `>>> TARGET_ARTIFACT: ${filePath.split('/').pop()}`, type: 'PROC' },
          { msg: ">>> DECODING_LAS_V3_VOXELS...", type: 'PROC' },
          { msg: ">>> FILTER_APPLIED: [GR, CALI]", type: 'SUCCESS' }
        ]);
        
        await handleForensicExtraction(filePath, ['GR', 'CALI']);
        
        addCliLogWithType(">>> SUCCESS: CURVES_INGESTED_TO_REGISTRY", 'SUCCESS');
        addCliLogWithType(">>> COMMITTING_FORENSIC_CSV_TO_VAULT...", 'INFO');
      }
      else if (trimmedCmd.startsWith('fetch')) {
        const urlCandidate = trimmedCmd.replace('fetch ', '').trim();
        if (validateUrl(urlCandidate)) {
           await streamLogs([
             { msg: ">>> VALIDATING_REMOTE_URI...", type: 'INFO' },
             { msg: `>>> TARGET_LOCKED: ${new URL(urlCandidate).hostname}`, type: 'SUCCESS' },
             { msg: ">>> INITIALIZING_UPLINK_PANEL...", type: 'PROC' }
           ]);
           setRemoteFetchUrl(urlCandidate);
           setIsRemoteInputVisible(true);
        } else if (!urlCandidate || urlCandidate === 'fetch') {
           setIsRemoteInputVisible(true);
        } else {
           addCliLogWithType("ERR: INVALID_OR_INSECURE_URI (HTTPS_REQUIRED)", 'ERR');
        }
      }
      else if (trimmedCmd.startsWith('search ')) {
        const wellQuery = trimmedCmd.replace('search ', '').trim();
        setIsLoadingWellData(true);
        const results = await searchNDRMetadata(wellQuery);
        if (results && results.length > 0) {
           setCurrentWellData(results[0]);
           addCliLogWithType(`>>> REGISTRY_UPLINK: Switched context to ${results[0].name}.`, 'SUCCESS');
        } else {
           addCliLogWithType(`ERR: NO_REGISTRY_MATCH_FOR '${wellQuery}'`, 'ERR');
        }
        setIsLoadingWellData(false);
      }
      else if (trimmedCmd === 'expand') {
        setIsTerminalExpanded(!isTerminalExpanded);
        addCliLogWithType("CONSOLE_MODE_UPDATED", 'SUCCESS');
      }
      else if (trimmedCmd === 'clear') {
        setCliLogs([]);
      } 
      else if (trimmedCmd === 'help') {
        await streamLogs([
          { msg: ">>> AVAILABLE_FORENSIC_PROCEDURES:", type: 'INFO' },
          ...COMMAND_REGISTRY.map(c => ({ msg: `${c.cmd.padEnd(25)} - ${c.desc}`, type: 'PROC' })),
          { msg: "search [well]               - Re-anchor kernel context to target well", type: 'PROC' }
        ]);
      }
      else if (trimmedCmd === 'save') {
        handleSaveSessionWithLog();
      }
      else if (trimmedCmd.startsWith('audit')) {
         runAnomalyScan();
      }
      else if (trimmedCmd.startsWith('veto')) {
        runVarianceAudit(varianceWindow);
      }
      else {
        addCliLogWithType(`ERR: COMMAND_NOT_RECOGNIZED: '${trimmedCmd}'`, 'ERR');
      }
    } catch (globalErr) {
      addCliLogWithType(`CRITICAL: KERNEL_PANIC_DURING_COMMAND_EXECUTION`, 'ERR');
    } finally {
      setIsCliProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCliInput(val);
    if (val.trim()) {
      const matches = COMMAND_REGISTRY.filter(c => c.cmd.startsWith(val.toLowerCase().trim()));
      setSuggestions(matches);
      setSuggestionIndex(0);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        setCliInput(suggestions[suggestionIndex].cmd);
        setSuggestions([]);
        return;
      }
      if (e.key === 'Escape') {
        setSuggestions([]);
        return;
      }
    }
    if (e.key === 'Enter') {
      executeCommand(cliInput);
      if (cliInput.trim()) {
        setCommandHistory(prev => [cliInput, ...prev.slice(0, 19)]);
      }
      setCliInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < commandHistory.length) {
        setHistoryIndex(nextIndex);
        setCliInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setCliInput(commandHistory[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setCliInput('');
      }
    }
  };

  const handleSaveSessionWithLog = () => {
    saveSession();
    addCliLogWithType("SESSION_COMMIT: State persisted to local vault buffer.", 'SUCCESS');
  };

  const handleSecureDeepAudit = () => {
    if (!deepAuditReport || !auditTargetAnomaly) return;
    setIsSecuringAudit(true);
    setTimeout(() => {
      const mappedStatus: 'VERIFIED' | 'PENDING' | 'CRITICAL' = auditTargetAnomaly.severity === 'CRITICAL' ? 'CRITICAL' : (auditTargetAnomaly.severity === 'WARNING' ? 'PENDING' : 'VERIFIED');
      
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
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
                          <span className="text-[10px] text-emerald-500 font-mono">Auth: Quintin_Milne // SC876023</span>
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
                             <Cpu size={60} className="text-emerald-500 animate-pulse" />
                          </div>
                       </div>
                       <div className="flex flex-col items-center gap-4 text-center">
                          <span className="text-2xl font-black text-emerald-400 uppercase tracking-[0.6em] animate-pulse">Sovereign_Logic_Synthesis</span>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-900 uppercase">
                             <Zap size={14} className="animate-bounce" />
                             <span>Bypassing metadata abyss... accessing author's truth from 1994 archival ink...</span>
                          </div>
                       </div>
                    </div>
                 ) : deepAuditReport ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-bottom-6 duration-700">
                       <div className="lg:col-span-7 space-y-10">
                          <div className="space-y-4">
                             <div className="flex items-center gap-3 text-emerald-500 font-black text-xs uppercase tracking-widest border-b border-emerald-900/30 pb-2">
                                <Activity size={20} /> <span>I. Anomaly_Signature_&_Nature</span>
                             </div>
                             <div className="relative">
                                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-emerald-500/30 rounded-full"></div>
                                <p className="text-[17px] text-emerald-100 leading-relaxed font-mono italic bg-emerald-500/5 p-6 rounded-r-2xl border border-emerald-500/10 shadow-inner">
                                   "{deepAuditReport.nature}"
                                </p>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div className="flex items-center gap-3 text-orange-500 font-black text-xs uppercase tracking-widest border-b border-orange-900/30 pb-2">
                                <AlertTriangle size={20} /> <span>II. Probable_Root_Causes</span>
                             </div>
                             <div className="grid grid-cols-1 gap-4">
                                {deepAuditReport.potentialCauses.map((cause, i) => (
                                   <div key={i} className="p-5 bg-slate-900/80 border border-orange-900/20 rounded-[1.25rem] flex items-center gap-5 group hover:border-orange-500 hover:bg-slate-900 transition-all cursor-default shadow-lg">
                                      <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-xs font-black text-orange-500 group-hover:scale-110 transition-transform">0{i+1}</div>
                                      <span className="text-[13px] text-orange-100 uppercase tracking-tighter leading-tight font-bold">{cause}</span>
                                   </div>
                                ))}
                             </div>
                          </div>

                          <div className="p-6 bg-blue-900/10 border border-blue-900/30 rounded-3xl space-y-3 shadow-2xl">
                             <div className="flex items-center gap-3 text-blue-400 font-black text-xs uppercase tracking-widest">
                                <Scale size={20} /> <span>III. Regulatory_Compliance_Veto</span>
                             </div>
                             <p className="text-[12px] text-blue-100/90 font-mono leading-relaxed bg-black/40 p-4 rounded-xl border border-blue-500/20">
                                {deepAuditReport.regulatoryConstraint}
                             </p>
                          </div>
                       </div>

                       <div className="lg:col-span-5 space-y-10">
                          <div className="p-8 bg-red-600/15 border-l-8 border-red-600 rounded-r-3xl space-y-6 shadow-[0_0_50px_rgba(220,38,38,0.2)] relative overflow-hidden group hover:bg-red-600/20 transition-all">
                             <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-10 pointer-events-none transition-opacity duration-500"><ShieldAlert size={160} /></div>
                             <div className="flex items-center gap-3 text-red-500 font-black text-xs uppercase tracking-[0.4em]">
                                <Scale size={20} /> <span>Sovereign_Remediation</span>
                             </div>
                             <p className="text-[19px] font-black text-red-500 leading-tight uppercase tracking-tighter drop-shadow-sm">
                                {deepAuditReport.remediation}
                             </p>
                             <div className="pt-4 border-t border-red-600/20">
                                <span className="text-[9px] font-black text-red-900 uppercase tracking-widest block mb-1">Fiscal_Risk_Exposure</span>
                                <span className="text-2xl font-black text-white tracking-tighter">£8.5M - £12.0M UNMANAGED</span>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div className="flex items-center gap-3 text-blue-400 font-black text-xs uppercase tracking-widest border-b border-blue-900/30 pb-2">
                                <Database size={20} /> <span>IV. Final_Deduction_Briefing</span>
                             </div>
                             <div className="p-6 bg-blue-900/5 border border-blue-900/20 rounded-3xl shadow-inner">
                                <p className="text-[13px] text-blue-100/80 leading-relaxed font-mono italic">
                                   "{deepAuditReport.technicalDeduction}"
                                </p>
                             </div>
                          </div>

                          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl space-y-3 shadow-xl hover:shadow-emerald-500/10 transition-shadow">
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">MER_UK_STAF_IMPACT</span>
                                <TrendingUp size={16} className="text-emerald-500" />
                             </div>
                             <p className="text-[14px] font-black text-emerald-400 uppercase tracking-tight leading-tight">{deepAuditReport.merUkImpact}</p>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center space-y-6 opacity-10 h-full py-40">
                       <Skull size={180} />
                       <span className="text-2xl font-black uppercase tracking-[1em]">Registry_Void</span>
                    </div>
                 )}
              </div>

              <div className="p-8 border-t border-emerald-500/20 bg-slate-950 flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-10">
                    <div className="flex flex-col gap-1">
                       <span className="text-[8px] font-black text-emerald-900 uppercase tracking-widest">Audit_Status</span>
                       <div className="flex items-center gap-2 text-[10px] font-black text-emerald-100 uppercase">
                          <Target size={14} className="text-emerald-500 animate-pulse" /> Authors_Truth_Enabled
                       </div>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[8px] font-black text-emerald-900 uppercase tracking-widest">Compliance_Enforcement</span>
                       <div className="flex items-center gap-2 text-[10px] font-black text-emerald-100 uppercase">
                          <ShieldCheck size={14} className="text-emerald-500" /> Art_14_HITL_Verified
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-5">
                    <button onClick={closeDeepAudit} className="px-8 py-3.5 rounded-2xl border border-emerald-900/60 text-emerald-700 font-black uppercase text-xs tracking-widest hover:text-emerald-400 hover:border-emerald-500 transition-all active:scale-95">Dismiss_Audit</button>
                    <button 
                      onClick={handleSecureDeepAudit}
                      disabled={!deepAuditReport || isSecuringAudit}
                      className={`px-12 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black uppercase text-xs tracking-[0.4em] shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-4 ${isSecuringAudit ? 'opacity-50 cursor-wait' : 'hover:bg-emerald-400 hover:scale-105 active:scale-95'}`}
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
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-500">
               <Building size={24} className="text-emerald-400" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter leading-none">
                   {isLoadingWellData ? 'LOCATING_WELL_ARTIFACT...' : currentWellData?.name || 'SYSTEM_INITIALIZING'}
                 </h2>
                 {!isLoadingWellData && currentWellData && (
                   <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_#00FF41]">
                     <Lock size={10} /> Registry_Locked
                   </div>
                 )}
              </div>
              <div className="flex items-center gap-4 mt-1">
                 <span className="text-[10px] font-black text-emerald-900 uppercase tracking-[0.3em]">
                   {isLoadingWellData ? 'Crawling National Data Repository...' : `UWI: ${currentWellData?.projectId || 'PENDING_RESOLVE'}`}
                 </span>
                 <div className="h-3 w-px bg-emerald-900/20"></div>
                 <span className="text-[10px] font-mono text-emerald-100/60 uppercase">
                   {currentWellData?.quadrant || '---'} // {currentWellData?.status || '---'}
                 </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={() => setIsWellInfoExpanded(!isWellInfoExpanded)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border ${isWellInfoExpanded ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xl' : 'bg-slate-800 text-emerald-500 border-emerald-900/50 hover:bg-emerald-500/10 hover:border-emerald-500'}`}
            >
              <Info size={16} />
              <span>{isWellInfoExpanded ? 'Close Registry' : 'Well Information'}</span>
              {isWellInfoExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <div className="h-10 w-px bg-emerald-900/20 mx-2"></div>
            <button onClick={() => setIsTerminalExpanded(true)} aria-label="Open Command Console" className="p-3 bg-slate-800 border border-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl"><TerminalIcon size={20} /></button>
            {onToggleFocus && (
              <button onClick={onToggleFocus} aria-label="Toggle Focus Mode" className="p-3 text-emerald-900 hover:text-[#00FF41] transition-all bg-slate-800 border border-emerald-500/10 rounded-xl">
                {isFocused ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            )}
          </div>
        </div>

        {isWellInfoExpanded && (
          <div className="animate-in slide-in-from-top-4 duration-500 overflow-hidden">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                 <Building size={160} className="text-emerald-500" />
              </div>

              {isLoadingWellData ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                   <Loader2 size={40} className="text-emerald-500 animate-spin" />
                   <span className="text-emerald-400 font-black uppercase tracking-[0.5em] animate-pulse">Establishing_Secure_NDR_Uplink...</span>
                </div>
              ) : currentWellData ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                   <div className="space-y-6 md:col-span-1">
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest block mb-1">Project_Context</span>
                         <h4 className="text-lg font-black text-emerald-100 uppercase leading-tight">{currentWellData.name}</h4>
                      </div>
                      <div className="space-y-3">
                         <div className="p-4 bg-black/40 border border-emerald-900/20 rounded-xl space-y-2">
                            <span className="text-[8px] font-black text-emerald-900 uppercase">Registry_Status</span>
                            <div className="flex items-center gap-2">
                               <ShieldCheck size={14} className="text-emerald-500" />
                               <span className="text-xs font-black text-emerald-100 uppercase">{currentWellData.status}</span>
                            </div>
                         </div>
                         <div className="p-4 bg-black/40 border border-emerald-900/20 rounded-xl space-y-2">
                            <span className="text-[8px] font-black text-emerald-900 uppercase">Archive_Volume</span>
                            <div className="flex items-center gap-2">
                               <Database size={14} className="text-emerald-500" />
                               <span className="text-xs font-black text-emerald-100 uppercase">{currentWellData.sizeGb} GB Encrypted</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-5 bg-black/40 border border-emerald-900/20 rounded-2xl flex flex-col justify-between group/card hover:border-emerald-500/40 transition-colors">
                         <span className="text-[9px] font-black text-emerald-900 uppercase mb-4 block group-hover/card:text-emerald-500 transition-colors">Wellbore_Identity</span>
                         <div className="space-y-1">
                            <span className="text-sm font-black text-emerald-100 uppercase block">{currentWellData.wellboreType}</span>
                            <span className="text-[10px] font-mono text-emerald-800">CLASS: FORENSIC_GHOST</span>
                         </div>
                         <div className="mt-6 flex items-center gap-2">
                            <MapPin size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-100 uppercase">{currentWellData.quadrant}</span>
                         </div>
                      </div>

                      <div className="p-5 bg-black/40 border border-emerald-900/20 rounded-2xl flex flex-col justify-between group/card hover:border-emerald-500/40 transition-colors">
                         <span className="text-[9px] font-black text-emerald-900 uppercase mb-4 block group-hover/card:text-emerald-500 transition-colors">Chronological_Anchor</span>
                         <div className="space-y-1">
                            <span className="text-sm font-black text-emerald-100 uppercase block">{currentWellData.releaseDate}</span>
                            <span className="text-[10px] font-mono text-emerald-800">DATUM_STAMP: RELEASED</span>
                         </div>
                         <div className="mt-6 flex items-center gap-2">
                            <Calendar size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-100 uppercase">Legacy Trace Found</span>
                         </div>
                      </div>

                      <div className="p-5 bg-black/40 border border-emerald-900/20 rounded-2xl flex flex-col justify-between group/card hover:border-emerald-500/40 transition-colors">
                         <span className="text-[9px] font-black text-emerald-900 uppercase mb-4 block group-hover/card:text-emerald-500 transition-colors">Forensic_Integrity</span>
                         <div className="space-y-1">
                            <span className={`text-sm font-black uppercase block ${currentWellData.hasDatumShiftIssues ? 'text-red-500' : 'text-emerald-500'}`}>
                              {currentWellData.hasDatumShiftIssues ? 'DATUM_SHIFT_DETECTED' : 'DATUM_SYNCED'}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-800">VETO_PROBABILITY: 88%</span>
                         </div>
                         <div className="mt-6 flex items-center gap-2">
                            <AlertOctagon size={12} className={currentWellData.hasDatumShiftIssues ? 'text-red-500' : 'text-emerald-500'} />
                            <span className="text-[10px] font-black text-emerald-100 uppercase">{currentWellData.hasDatumShiftIssues ? 'AUDIT_REQUIRED' : 'NOMINAL'}</span>
                         </div>
                      </div>

                      <div className="col-span-full pt-6 mt-2 border-t border-emerald-900/20 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-emerald-900 uppercase">SHA512_Ledger_Proof</span>
                            <div className="px-4 py-1.5 bg-black rounded border border-emerald-900/40 font-mono text-[9px] text-emerald-600 truncate max-w-lg">
                               {currentWellData.sha512}
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <button className="flex items-center gap-2 text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">
                               <ExternalLink size={14} /> Open_Portal
                            </button>
                            <button className="flex items-center gap-2 text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">
                               <Download size={14} /> Fetch_Artifacts
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 opacity-20 space-y-4">
                   <AlertCircle size={64} />
                   <span className="text-xl font-black uppercase tracking-widest">Wellbore_Registry_Void</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-row gap-4 min-h-0 overflow-hidden relative">
        <div className="flex-1 flex flex-col space-y-4">
           <GhostSyncChartContainer 
             viewMode={viewMode} combinedData={combinedData} signals={signals || []} ghostLabel={Math.abs(stableOffset) > 0.05 ? "CALIBRATED_LOG" : "GHOST_LOG"} 
             validationError={validationError} offset={stableOffset} showAnomalies={showAnomalies} detectedAnomalies={filteredAnomalies} anomalyThreshold={anomalyThreshold} 
             activeAnomalyId={activeAnomalyId} varianceWindow={varianceWindow} isAuditingVariance={isAuditingVariance} zoomRange={zoomRange} onZoomRangeChange={setZoomRange} hasDiscordanceAlert={hasDiscordanceAlert}
           />
           <GhostSyncStats sigmaScore={sigmaScore} driftRiskScore={driftRiskScore} correlationScore={correlationScore} anomaliesCount={filteredAnomalies.length} />
        </div>

        <div className="w-full xl:w-[400px] flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-1">
          <div className="bg-slate-950/90 border border-emerald-500/20 rounded-2xl flex flex-col h-[420px] shadow-2xl relative overflow-hidden group">
             <div className="p-3 border-b border-emerald-500/10 flex items-center justify-between bg-emerald-500/5">
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest"><TerminalIcon size={14} className="animate-pulse" /> <span>Seer_Forensic_Console</span></div>
                <button onClick={() => setIsTerminalExpanded(true)} aria-label="Maximize Console" className="p-1 hover:bg-emerald-500/20 text-emerald-500 rounded transition-colors"><Maximize2 size={12} /></button>
             </div>
             <div ref={cliScrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1.5 custom-scrollbar bg-black/40">
                {cliLogs.length === 0 && <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-4"><Database size={32} /><div className="text-center italic leading-tight">Awaiting forensic kernel...</div></div>}
                {cliLogs.map((log, i) => <div key={i} className={`animate-in fade-in slide-in-from-left-1 leading-relaxed ${log?.type === 'ERR' ? 'text-red-500 font-black border-l-2 border-red-500 pl-2 bg-red-500/5' : log?.type === 'SUCCESS' ? 'text-emerald-400 font-black' : 'text-emerald-600/80'}`}>{log?.msg || ""}</div>)}
             </div>
             <div className="p-3 bg-slate-900/60 border-t border-emerald-500/10 flex items-center gap-2 relative">
                <span className="text-[10px] font-black text-blue-500">$</span>
                <input ref={inputRef} type="text" value={cliInput} aria-label="Forensic Command Prompt" onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Invoke_Forensic_Procedure..." className="flex-1 bg-transparent border-none text-[10px] text-emerald-100 font-mono outline-none" />
             </div>
          </div>
          <DataIntegrityLegend />
          <GhostSyncCalibration offset={localSliderOffset} onOffsetChange={setLocalSliderOffset} validationError={validationError} anomalyThreshold={anomalyThreshold} effectiveThreshold={effectiveThreshold} onThresholdChange={setAnomalyThreshold} isAuditingVariance={isAuditingVariance} onRunVarianceAudit={() => runVarianceAudit(varianceWindow)} varianceWindow={varianceWindow} />
          <GhostSyncAnomalyList anomalies={filteredAnomalies} isVisible={showAnomalies} onToggle={() => setShowAnomalies(!showAnomalies)} isScanning={isScanningAnomalies || isAutoAuditing} activeAnomalyId={activeAnomalyId} onHoverAnomaly={setActiveAnomalyId} onInspectAnomaly={runDeepAnomalyAudit} />
        </div>
      </div>
    </div>
  );
};

export default GhostSync;
