
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Binary, Ghost, Loader2, Camera, Zap, 
  Play, RotateCw, CheckCircle2, 
  AlertTriangle, Activity, ScanLine, Target, 
  Cpu, Globe, Link as LinkIcon, Download, Globe2, Send,
  ShieldAlert, Info, AlertOctagon, Search,
  Eye, Filter
} from 'lucide-react';
import { MOCK_BASE_LOG, MOCK_GHOST_LOG } from '../constants';
import SyncMonitorChart from './SyncMonitorChart';

/**
 * Interface exported for use in SyncMonitorChart and other components.
 */
export interface SignalMetadata {
  id: string;
  name: string;
  color: string;
  visible: boolean;
}

export interface SyncAnomaly {
  id: string;
  startDepth: number;
  endDepth: number;
  avgDiff: number;
  severity: 'CRITICAL' | 'WARNING';
}

const OFFSET_SAFE_LIMIT = 20;
const OFFSET_HARD_LIMIT = 30;
const AUTO_SYNC_TARGET = 14.5;

/**
 * GhostSync component handles datum synchronization and alignment of legacy logs.
 */
const GhostSync: React.FC = () => {
  const [offset, setOffset] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'OVERLAY' | 'DIFFERENTIAL'>('OVERLAY');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Remote Data Fetching State
  const [showFetchInput, setShowFetchInput] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // Anomaly Detection State
  const [anomalyThreshold, setAnomalyThreshold] = useState(25);
  const [isScanningAnomalies, setIsScanningAnomalies] = useState(false);
  const [detectedAnomalies, setDetectedAnomalies] = useState<SyncAnomaly[]>([]);

  // Dynamic Signals State
  const [signals, setSignals] = useState<SignalMetadata[]>([
    { id: 'SIG-001', name: 'BASE_LOG', color: '#10b981', visible: true },
    { id: 'SIG-002', name: 'GHOST_LOG', color: '#FF5F1F', visible: true }
  ]);

  // Stores remote signal values mapped by signalId and depth
  const [remoteLogs, setRemoteLogs] = useState<Record<string, Record<number, number>>>({});

  const combinedData = useMemo(() => {
    return MOCK_BASE_LOG.map((base) => {
      const ghost = MOCK_GHOST_LOG.find(g => Math.abs(g.depth - (base.depth + offset)) < 0.1);
      
      const row: any = {
        depth: base.depth,
        baseGR: base.gr,
        ghostGR: ghost ? ghost.gr : null,
        diff: ghost ? Math.abs(base.gr - ghost.gr) : 0
      };

      // Merge dynamic remote signals into the chart data row
      Object.keys(remoteLogs).forEach(sigId => {
        if (remoteLogs[sigId][base.depth] !== undefined) {
          row[sigId] = remoteLogs[sigId][base.depth];
        }
      });

      return row;
    });
  }, [offset, remoteLogs]);

  const handleOffsetChange = (val: number) => {
    let newVal = val;
    let error: string | null = null;

    if (Math.abs(newVal) > OFFSET_HARD_LIMIT) {
      newVal = Math.sign(newVal) * OFFSET_HARD_LIMIT;
      error = `CRITICAL: DATUM_SHIFT EXCEEDS MAX ENVELOPE (±${OFFSET_HARD_LIMIT}m)`;
    } else if (Math.abs(newVal) > OFFSET_SAFE_LIMIT) {
      error = `WARNING: EXTREME OFFSET MAY CAUSE VISUAL DE-SYNC`;
    }

    setOffset(newVal);
    setValidationError(error);
  };

  const animateSync = useCallback(() => {
    setIsSyncing(true);
    setValidationError(null);
    const startOffset = offset;
    const startTime = performance.now();
    const duration = 2000; // 2 seconds animation

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic function
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentOffset = startOffset + (AUTO_SYNC_TARGET - startOffset) * easeProgress;
      
      setOffset(currentOffset);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsSyncing(false);
      }
    };

    requestAnimationFrame(step);
  }, [offset]);

  const autoLineup = useCallback(() => {
    setIsSyncing(true);
    setValidationError(null);
    setTimeout(() => {
      setOffset(AUTO_SYNC_TARGET);
      setIsSyncing(false);
    }, 1500);
  }, []);

  const runAnomalyScan = useCallback(() => {
    setIsScanningAnomalies(true);
    setDetectedAnomalies([]);
    
    // Simulate complex forensic compute time
    setTimeout(() => {
      const anomalies: SyncAnomaly[] = [];
      let currentAnomaly: { start: number, sum: number, count: number } | null = null;

      combinedData.forEach((row, idx) => {
        if (row.ghostGR !== null && row.diff > anomalyThreshold) {
          if (!currentAnomaly) {
            currentAnomaly = { start: row.depth, sum: row.diff, count: 1 };
          } else {
            currentAnomaly.sum += row.diff;
            currentAnomaly.count += 1;
          }
        } else if (currentAnomaly) {
          const avgDiff = currentAnomaly.sum / currentAnomaly.count;
          anomalies.push({
            id: `ANOM-${Math.random().toString(36).substring(7).toUpperCase()}`,
            startDepth: currentAnomaly.start,
            endDepth: combinedData[idx - 1].depth,
            avgDiff,
            severity: avgDiff > anomalyThreshold * 1.5 ? 'CRITICAL' : 'WARNING'
          });
          currentAnomaly = null;
        }
      });

      setDetectedAnomalies(anomalies);
      setIsScanningAnomalies(false);
    }, 1200);
  }, [combinedData, anomalyThreshold]);

  const handleFetchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remoteUrl) return;
    
    setIsFetching(true);
    // Simulate remote fetch and parse of LAS/CSV artifacts
    setTimeout(() => {
      const fileName = remoteUrl.split('/').pop() || 'REMOTE_LOG';
      const newSigId = `SIG-REMOTE-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      // Simulate forensic data extraction from the "fetched" file
      const newLogData: Record<number, number> = {};
      MOCK_BASE_LOG.forEach(base => {
        // Create a variation of the base log for visual distinction
        newLogData[base.depth] = base.gr + (Math.random() - 0.5) * 35;
      });

      setRemoteLogs(prev => ({ ...prev, [newSigId]: newLogData }));
      setSignals(prev => [
        ...prev, 
        { 
          id: newSigId, 
          name: fileName.toUpperCase().replace('.LAS', '').replace('.CSV', ''), 
          color: `hsl(${Math.random() * 360}, 70%, 50%)`, 
          visible: true 
        }
      ]);

      setIsFetching(false);
      setShowFetchInput(false);
      setRemoteUrl('');
    }, 1800);
  };

  const toggleSignalVisibility = (id: string) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const ghostLabel = Math.abs(offset) > 0.05 ? "OFFSET_LOG" : "GHOST_LOG";
  
  const offsetSeverity = Math.abs(offset) > OFFSET_SAFE_LIMIT ? 'red' : Math.abs(offset) > 10 ? 'orange' : 'emerald';

  return (
    <div className="flex flex-col h-full p-4 space-y-4 font-terminal bg-slate-950/20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded">
            <Ghost size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-400 uppercase tracking-tighter">Ghost_Sync_Engine</h2>
            <div className="flex items-center space-x-2 text-[8px] text-emerald-800 font-black uppercase tracking-widest">
              <ScanLine size={10} />
              <span>Datum_Correlation_Array</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={runAnomalyScan}
            disabled={isScanningAnomalies || isSyncing}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-[10px] font-black uppercase transition-all border ${isScanningAnomalies ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-slate-900 border-orange-900/40 text-orange-400 hover:border-orange-400'}`}
          >
            {isScanningAnomalies ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            <span>Forensic_Scan</span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowFetchInput(!showFetchInput)}
              className={`flex items-center space-x-2 px-4 py-2 rounded text-[10px] font-black uppercase transition-all border ${showFetchInput ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-emerald-900/40 text-emerald-400 hover:border-emerald-500'}`}
            >
              <Globe2 size={14} />
              <span className="hidden sm:inline">Fetch_Remote_Data</span>
            </button>

            {showFetchInput && (
              <form 
                onSubmit={handleFetchSubmit}
                className="absolute right-0 top-full mt-2 w-80 p-4 bg-slate-950/95 border border-emerald-500/50 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[200] animate-in slide-in-from-top-2 backdrop-blur-xl"
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
                      <LinkIcon size={10} className="mr-1.5" /> Injest_Remote_Artifact
                    </span>
                    <span className="text-[7px] text-emerald-900 font-mono">LAS / CSV Supported</span>
                  </div>
                  <div className="flex space-x-2">
                    <input 
                      autoFocus
                      type="url"
                      placeholder="https://ndr.archive/well_trace.las"
                      value={remoteUrl}
                      onChange={(e) => setRemoteUrl(e.target.value)}
                      className="flex-1 bg-slate-900 border border-emerald-900/50 rounded px-3 py-2 text-[10px] text-emerald-400 focus:border-emerald-400 outline-none transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={isFetching || !remoteUrl}
                      className="px-3 bg-emerald-500 text-slate-950 rounded hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      {isFetching ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <button 
            onClick={() => setViewMode(prev => prev === 'OVERLAY' ? 'DIFFERENTIAL' : 'OVERLAY')}
            className={`px-4 py-2 border rounded text-[10px] font-black uppercase transition-all ${viewMode === 'DIFFERENTIAL' ? 'bg-orange-500 border-orange-400 text-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-900 border-emerald-900/40 text-emerald-400'}`}
          >
            {viewMode}
          </button>
          <button 
            onClick={autoLineup}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-6 py-2 bg-emerald-500 text-slate-950 rounded font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RotateCw size={14} />}
            <span>Auto_Lineup</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row gap-4 min-h-0">
        <SyncMonitorChart 
          combinedData={combinedData} 
          signals={signals} 
          viewMode={viewMode} 
          ghostLabel={ghostLabel} 
          validationError={validationError}
          offset={offset}
          anomalies={detectedAnomalies}
        />

        <div className="w-full xl:w-80 flex flex-col space-y-4">
          {/* Detected Anomalies Panel */}
          <div className="glass-panel p-5 rounded-lg border border-orange-900/30 bg-slate-900/60 flex flex-col space-y-3 shadow-xl max-h-[300px] overflow-hidden">
            <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center justify-between border-b border-orange-900/20 pb-2">
              <span>Detected_Anomalies</span>
              <AlertTriangle size={12} className={detectedAnomalies.length > 0 ? "animate-pulse" : "text-emerald-900"} />
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {detectedAnomalies.length > 0 ? detectedAnomalies.map(anomaly => (
                <div key={anomaly.id} className={`p-3 bg-slate-950/80 border rounded transition-all hover:bg-slate-900 cursor-default ${anomaly.severity === 'CRITICAL' ? 'border-red-500/40' : 'border-orange-500/30'}`}>
                   <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-black ${anomaly.severity === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`}>{anomaly.severity}</span>
                      <span className="text-[8px] font-mono text-emerald-900">{anomaly.id}</span>
                   </div>
                   <div className="text-[11px] font-terminal text-emerald-100">{anomaly.startDepth.toFixed(1)}m - {anomaly.endDepth.toFixed(1)}m</div>
                   <div className="flex justify-between items-end mt-2">
                      <div className="text-[8px] text-emerald-800 uppercase font-black">AVG_DELTA: {anomaly.avgDiff.toFixed(2)} API</div>
                      <div className="p-1 text-emerald-900 hover:text-emerald-400"><Eye size={12} /></div>
                   </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-[10px] py-8 text-center px-4">
                  {isScanningAnomalies ? (
                    <span className="animate-pulse">Scanning depth intervals...</span>
                  ) : (
                    <span>No active anomalies flagged. Run scan to identify discordance.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-lg border border-emerald-900/30 bg-slate-900/60 flex flex-col space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-900/20 pb-2">
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center">
                <span>Forensic_Controls</span>
                <Target size={12} className="ml-2 text-emerald-900" />
              </h3>
              <button 
                onClick={animateSync}
                disabled={isSyncing}
                className={`p-1.5 rounded transition-all group ${isSyncing ? 'text-orange-500 bg-orange-500/10' : 'text-emerald-500 hover:bg-emerald-500/20'}`}
                title="Smooth Sync Animation"
              >
                {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} className="group-hover:scale-110" fill="currentColor" />}
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-3 rounded border bg-slate-950/90 transition-all ${validationError ? (Math.abs(offset) > OFFSET_SAFE_LIMIT ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-orange-500') : 'border-emerald-900/40'}`}>
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center space-x-2">
                      <ShieldAlert size={14} className={validationError ? (Math.abs(offset) > OFFSET_SAFE_LIMIT ? 'text-red-500 animate-pulse' : 'text-orange-500') : 'text-emerald-900'} />
                      <span className="text-[8px] font-black text-emerald-900 uppercase">Input_Offset</span>
                   </div>
                   <span className={`text-[12px] font-black font-terminal ${validationError ? (Math.abs(offset) > OFFSET_SAFE_LIMIT ? 'text-red-400' : 'text-orange-400') : 'text-emerald-400'}`}>
                     {offset.toFixed(3)}m
                   </span>
                </div>
                
                <div className="flex space-x-2">
                  <input 
                    type="number"
                    step="0.1"
                    value={offset.toFixed(3)}
                    onChange={(e) => handleOffsetChange(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-slate-900 border border-emerald-900/30 rounded px-2 py-1 text-[11px] text-emerald-100 font-terminal outline-none focus:border-emerald-500"
                  />
                  <button 
                    onClick={() => handleOffsetChange(0)}
                    className="px-2 bg-slate-800 text-emerald-900 hover:text-emerald-400 rounded transition-colors"
                    title="Reset to 0"
                  >
                    <RotateCw size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 px-1">
                <div className="flex justify-between text-[8px] font-black text-emerald-900 uppercase">
                  <span>Shift_Voxel</span>
                  <span>±{OFFSET_HARD_LIMIT}m LIMIT</span>
                </div>
                <input 
                  type="range" min={-OFFSET_HARD_LIMIT} max={OFFSET_HARD_LIMIT} step="0.1" 
                  value={offset} 
                  onChange={e => handleOffsetChange(parseFloat(e.target.value))}
                  className={`w-full h-1.5 bg-slate-800 appearance-none rounded-full cursor-pointer transition-all`} 
                />
              </div>

              <div className="space-y-1.5 px-1 pt-2 border-t border-emerald-900/10">
                <div className="flex justify-between text-[8px] font-black text-emerald-900 uppercase tracking-widest">
                  <span className="flex items-center"><Filter size={10} className="mr-1" /> Sensitivity</span>
                  <span className="text-orange-400">{anomalyThreshold} API</span>
                </div>
                <input 
                  type="range" min="5" max="100" step="1" 
                  value={anomalyThreshold} 
                  onChange={e => setAnomalyThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 appearance-none rounded-full cursor-pointer accent-orange-500 transition-all" 
                />
              </div>

              {validationError && (
                <div className={`p-2.5 rounded border animate-in slide-in-from-top-1 flex items-start space-x-2 ${Math.abs(offset) > OFFSET_SAFE_LIMIT ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-orange-500/10 border-orange-500/40 text-orange-400'}`}>
                  {Math.abs(offset) > OFFSET_SAFE_LIMIT ? <AlertOctagon size={14} className="flex-shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />}
                  <span className="text-[8px] font-black uppercase leading-tight">{validationError}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 glass-panel p-5 rounded-lg border border-emerald-900/30 bg-slate-900/60 overflow-y-auto custom-scrollbar shadow-xl">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center">
               <ScanLine size={12} className="mr-2" /> Signal_Stack
            </h3>
            <div className="space-y-2">
              {signals.map(sig => (
                <div 
                  key={sig.id} 
                  onClick={() => toggleSignalVisibility(sig.id)}
                  className={`flex items-center justify-between p-2.5 bg-slate-950/80 border rounded hover:border-emerald-500/30 transition-all cursor-pointer group ${sig.visible ? 'border-emerald-900/40 shadow-sm' : 'border-red-950/20 opacity-40 grayscale'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: sig.color, color: sig.color }}></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-emerald-100 uppercase truncate max-w-[140px]">{sig.id === 'SIG-002' ? ghostLabel : sig.name}</span>
                      {sig.id.includes('REMOTE') && <span className="text-[6px] text-emerald-900 font-mono tracking-tighter">ARTIFACT_ORIGIN: REMOTE</span>}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {sig.visible ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertTriangle size={12} className="text-red-900" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="flex items-center justify-center space-x-3 w-full py-3.5 bg-slate-950/90 border border-emerald-500/20 rounded-lg text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-400 transition-all group shadow-xl">
             <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Export_Audit_PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GhostSync;
