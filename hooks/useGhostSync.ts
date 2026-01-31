import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  MOCK_BASE_LOG, MOCK_GHOST_LOG, MOCK_ELEVATION_DATA, 
  MOCK_BALLOCH_LOG, MOCK_BALLOCH_GHOST_LOG 
} from '../constants';
import { secureAsset, playLockSound } from '../services/vaultService';
import { getAnomalyDeepAudit, AnomalyDeepAudit } from '../services/geminiService';

export interface SignalMetadata {
  id: string;
  name: string;
  color: string;
  visible: boolean;
}

export type AnomalySeverity = 'CRITICAL' | 'WARNING' | 'MICRO';

export interface SyncAnomaly {
  id: string;
  startDepth: number;
  endDepth: number;
  avgDiff: number;
  sigmaScore: number;
  severity: AnomalySeverity;
  description?: string;
  type: 'DATUM_SHIFT' | 'SIGNAL_VOID' | 'NOISE_SPIKE' | 'VARIANCE_MISMATCH';
}

const OFFSET_HARD_LIMIT = 30;

const STORAGE_KEY_OFFSET = 'BRAHAN_GHOST_SYNC_OFFSET';
const STORAGE_KEY_VIEW_MODE = 'BRAHAN_GHOST_SYNC_VIEW_MODE';
const STORAGE_KEY_AUTO_DETECT = 'BRAHAN_GHOST_SYNC_AUTO_DETECT';

export function useGhostSync(wellId?: string) {
  const [offset, setOffset] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OFFSET);
    return saved ? parseFloat(saved) : 0;
  });

  const [stableOffset, setStableOffset] = useState(offset);
  const [isRealigning, setIsRealigning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  
  const [viewMode, setViewMode] = useState<'OVERLAY' | 'DIFFERENTIAL' | 'WAVEFORM'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VIEW_MODE);
    return (saved as any) || 'OVERLAY';
  });

  const [autoDetectEnabled, setAutoDetectEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTO_DETECT);
    return saved === 'true';
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [anomalyThreshold, setAnomalyThreshold] = useState(25.0);
  const [microSensitivity, setMicroSensitivity] = useState(false);
  const [isScanningAnomalies, setIsScanningAnomalies] = useState(false);
  const [isAutoAuditing, setIsAutoAuditing] = useState(false);
  const [isAuditingVariance, setIsAuditingVariance] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [varianceWindow, setVarianceWindow] = useState(5);
  const [zoomRange, setZoomRange] = useState<{left: number | string, right: number | string}>({ left: 'dataMin', right: 'dataMax' });
  const [activeAnomalyId, setActiveAnomalyId] = useState<string | null>(null);
  const [detectedAnomalies, setDetectedAnomalies] = useState<SyncAnomaly[]>([]);
  const [driftRiskScore, setDriftRiskScore] = useState(0);
  const [isElevationLoaded, setIsElevationLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [auditTargetAnomaly, setAuditTargetAnomaly] = useState<SyncAnomaly | null>(null);
  const [isAuditingDeep, setIsAuditingDeep] = useState(false);
  const [deepAuditReport, setDeepAuditReport] = useState<AnomalyDeepAudit | null>(null);

  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | 'ALL'>('ALL');
  
  const [signals, setSignals] = useState<SignalMetadata[]>(() => [
    { id: 'SIG-001', name: 'BASE_LOG_1994', color: '#10b981', visible: true },
    { id: 'SIG-002', name: 'EOWR_CLAIM_2013', color: '#FF5F1F', visible: true },
    { id: 'SIG-ELEV', name: 'ELEVATION', color: '#8b5e3c', visible: true }
  ]);

  const [remoteSignalsData, setRemoteSignalsData] = useState<Record<string, Record<number, number>>>({});

  const activeBaseLog = useMemo(() => {
    if (wellId?.includes('BALLOCH')) return MOCK_BALLOCH_LOG;
    return MOCK_BASE_LOG;
  }, [wellId]);

  const activeGhostLog = useMemo(() => {
    if (wellId?.includes('BALLOCH')) return MOCK_BALLOCH_GHOST_LOG;
    return MOCK_GHOST_LOG;
  }, [wellId]);

  const effectiveThreshold = useMemo(() => 
    microSensitivity ? anomalyThreshold * 0.9 : anomalyThreshold
  , [microSensitivity, anomalyThreshold]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTO_DETECT, autoDetectEnabled.toString());
  }, [autoDetectEnabled]);

  const saveSession = useCallback(() => {
    const ts = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_OFFSET, stableOffset.toString());
    setLastSaved(ts);
    return ts;
  }, [stableOffset]);

  useEffect(() => {
    if (offset === stableOffset) {
      setIsRealigning(false);
      return;
    }
    setIsRealigning(true);
    const handler = setTimeout(() => {
      setStableOffset(offset);
      setIsRealigning(false);
    }, 200);
    return () => clearTimeout(handler);
  }, [offset, stableOffset]);

  const combinedData = useMemo(() => {
    return activeBaseLog.map((base) => {
      const ghost = activeGhostLog.find(g => Math.abs(g.depth - (base.depth + stableOffset)) < 0.1);
      
      const row: any = {
        depth: base.depth,
        baseGR: base.gr,
        ghostGR: ghost ? ghost.gr : null,
        diff: ghost ? Math.abs(base.gr - ghost.gr) : 0,
      };

      Object.entries(remoteSignalsData).forEach(([sigId, data]) => {
        row[sigId] = data[base.depth] || null;
      });

      return row;
    });
  }, [activeBaseLog, activeGhostLog, stableOffset, remoteSignalsData]);

  const correlationScore = useMemo(() => {
    const pairs = combinedData.filter(d => typeof d.ghostGR === 'number');
    if (pairs.length < 2) return 0;
    const n = pairs.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    pairs.forEach(p => {
      sumX += p.baseGR;
      sumY += p.ghostGR;
      sumXY += p.baseGR * p.ghostGR;
      sumX2 += p.baseGR * p.baseGR;
      sumY2 += p.ghostGR * p.ghostGR;
    });
    const num = (n * sumXY) - (sumX * sumY);
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return den === 0 ? 0 : Math.max(0, num / den);
  }, [combinedData]);

  const sigmaScore = useMemo(() => Number((correlationScore * 6).toFixed(2)), [correlationScore]);

  const addRemoteSignal = useCallback((id: string, name: string, color: string, data: Record<number, number>) => {
    setSignals(prev => [...prev, { id, name, color, visible: true }]);
    setRemoteSignalsData(prev => ({ ...prev, [id]: data }));
    playLockSound();
  }, []);

  const removeSignal = useCallback((id: string) => {
    setSignals(prev => prev.filter(s => s.id !== id));
    setRemoteSignalsData(prev => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
  }, []);

  const toggleSignalVisibility = useCallback((id: string) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  }, []);

  const updateSignalColor = useCallback((id: string, color: string) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, color } : s));
  }, []);

  const reorderSignals = useCallback((fromIndex: number, toIndex: number) => {
    setSignals(prev => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  const addManualSignal = useCallback((name: string, color: string) => {
    const id = `MAN-${Math.random().toString(36).substring(7).toUpperCase()}`;
    setSignals(prev => [...prev, { id, name, color, visible: true }]);
    playLockSound();
  }, []);

  const fetchElevationData = useCallback(async () => {
    setIsElevationLoaded(true);
    playLockSound();
  }, []);

  const detectOptimalShift = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      setOffset(4.05); 
      setIsSyncing(false);
      playLockSound();
    }, 1500);
  }, []);

  const runVarianceAudit = useCallback((window: number) => {
    setIsAuditingVariance(true);
    setTimeout(() => {
      setIsAuditingVariance(false);
      playLockSound();
    }, 1200);
  }, []);

  const handleForensicExtraction = useCallback(async (wellName: string, curves: string[]) => {
    setIsExtracting(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsExtracting(false);
    playLockSound();
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_OFFSET);
    setOffset(0);
    setDetectedAnomalies([]);
    playLockSound();
  }, []);

  const handleOffsetChange = useCallback((val: number) => {
    let newVal = isNaN(val) ? 0 : val;
    if (Math.abs(newVal) > OFFSET_HARD_LIMIT) newVal = Math.sign(newVal) * OFFSET_HARD_LIMIT;
    setOffset(newVal);
  }, []);

  const runAnomalyScan = useCallback(() => {
    setIsScanningAnomalies(true);
    setTimeout(() => {
      const anomalies: SyncAnomaly[] = [];
      let currentGroup: { start: number; end: number; diffs: number[] } | null = null;
      combinedData.forEach((row) => {
        if (typeof row.ghostGR === 'number' && row.diff > effectiveThreshold) {
          if (!currentGroup) currentGroup = { start: row.depth, end: row.depth, diffs: [row.diff] };
          else { currentGroup.end = row.depth; currentGroup.diffs.push(row.diff); }
        } else if (currentGroup) {
          const avgDiff = currentGroup.diffs.reduce((a, b) => a + b, 0) / currentGroup.diffs.length;
          anomalies.push({
            id: `SHIFT-${Math.random().toString(36).substring(7).toUpperCase()}`,
            startDepth: currentGroup.start,
            endDepth: currentGroup.end,
            avgDiff, sigmaScore: 4.0,
            severity: avgDiff > 40.0 ? 'CRITICAL' : avgDiff > 15.0 ? 'WARNING' : 'MICRO',
            type: 'DATUM_SHIFT',
          });
          currentGroup = null;
        }
      });
      setDetectedAnomalies(anomalies);
      setIsScanningAnomalies(false);
      if (anomalies.length > 0) playLockSound();
    }, 800);
  }, [combinedData, effectiveThreshold]);

  const runDeepAnomalyAudit = async (anomaly: SyncAnomaly) => {
    setAuditTargetAnomaly(anomaly);
    // Auto-zoom to anomaly interval with 20m padding for context
    setZoomRange({ 
      left: Math.max(1200, anomaly.startDepth - 20), 
      right: Math.min(2000, anomaly.endDepth + 20) 
    });
    setIsAuditingDeep(true);
    const report = await getAnomalyDeepAudit(anomaly.type, anomaly.startDepth, anomaly.endDepth, anomaly.avgDiff);
    if (report) setDeepAuditReport(report);
    setIsAuditingDeep(false);
  };

  const closeDeepAudit = useCallback(() => {
    setAuditTargetAnomaly(null);
    setDeepAuditReport(null);
    setIsAuditingDeep(false);
  }, []);

  const filteredAnomalies = useMemo(() => {
    if (severityFilter === 'ALL') return detectedAnomalies;
    return detectedAnomalies.filter(a => a.severity === severityFilter);
  }, [detectedAnomalies, severityFilter]);

  const isSovereignVetoActive = useMemo(() => {
    const hasCriticalAnomaly = detectedAnomalies.some(a => a.severity === 'CRITICAL');
    const isSignificantOffset = Math.abs(stableOffset) >= 4.0;
    return hasCriticalAnomaly && isSignificantOffset;
  }, [detectedAnomalies, stableOffset]);

  return {
    offset, stableOffset, isRealigning, isSyncing, isSweeping, viewMode, setViewMode, validationError,
    autoDetectEnabled, setAutoDetectEnabled,
    showAnomalies, setShowAnomalies, anomalyThreshold, setAnomalyThreshold,
    microSensitivity, setMicroSensitivity, effectiveThreshold, varianceWindow, setVarianceWindow,
    isScanningAnomalies, isAutoAuditing, isAuditingVariance, isExtracting, isElevationLoaded, lastSaved, 
    detectedAnomalies, filteredAnomalies, severityFilter, setSeverityFilter, combinedData, correlationScore,
    isSovereignVetoActive,
    signals, driftRiskScore, sigmaScore, handleOffsetChange, 
    detectOptimalShift, 
    runAnomalyScan, 
    runVarianceAudit, 
    handleForensicExtraction, 
    toggleSignalVisibility, 
    updateSignalColor, 
    reorderSignals, 
    addRemoteSignal, 
    addManualSignal, 
    removeSignal, 
    fetchElevationData, 
    zoomRange, setZoomRange, activeAnomalyId, setActiveAnomalyId, saveSession, 
    clearSession,
    auditTargetAnomaly, isAuditingDeep, deepAuditReport, runDeepAnomalyAudit, closeDeepAudit
  };
}