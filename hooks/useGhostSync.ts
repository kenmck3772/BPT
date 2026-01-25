
import { useState, useMemo, useCallback, useEffect } from 'react';
import { MOCK_BASE_LOG, MOCK_GHOST_LOG, MOCK_ELEVATION_DATA } from '../constants';
import { secureAsset, playLockSound } from '../services/vaultService';

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

const OFFSET_SAFE_LIMIT = 20;
const OFFSET_HARD_LIMIT = 30;

const STORAGE_KEY_OFFSET = 'BRAHAN_GHOST_SYNC_OFFSET';
const STORAGE_KEY_SIGNALS = 'BRAHAN_GHOST_SYNC_SIGNALS';
const STORAGE_KEY_VIEW_MODE = 'BRAHAN_GHOST_SYNC_VIEW_MODE';
const STORAGE_KEY_AUTO_DETECT = 'BRAHAN_GHOST_SYNC_AUTO_DETECT';
const STORAGE_KEY_ANOMALIES = 'BRAHAN_GHOST_SYNC_ANOMALIES';
const STORAGE_KEY_DRIFT_RISK = 'BRAHAN_GHOST_SYNC_DRIFT_RISK';
const STORAGE_KEY_VARIANCE_WINDOW = 'BRAHAN_GHOST_SYNC_VAR_WINDOW';

export function useGhostSync() {
  // Initialize offset from localStorage
  const [offset, setOffset] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OFFSET);
    return saved ? parseFloat(saved) : 0;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  
  // Initialize view mode from localStorage
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
  const [anomalyThreshold, setAnomalyThreshold] = useState(25);
  const [microSensitivity, setMicroSensitivity] = useState(false);
  const [isScanningAnomalies, setIsScanningAnomalies] = useState(false);
  const [isAutoAuditing, setIsAutoAuditing] = useState(false);
  const [isAuditingVariance, setIsAuditingVariance] = useState(false);
  const [varianceWindow, setVarianceWindow] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VARIANCE_WINDOW);
    return saved ? parseInt(saved) : 5;
  });
  
  const [detectedAnomalies, setDetectedAnomalies] = useState<SyncAnomaly[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ANOMALIES);
    return saved ? JSON.parse(saved) : [];
  });

  const [driftRiskScore, setDriftRiskScore] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DRIFT_RISK);
    return saved ? parseFloat(saved) : 0;
  });

  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | 'ALL'>('ALL');
  const [isSecuring, setIsSecuring] = useState(false);

  // Signal Inventory Management
  const [remoteLogs, setRemoteLogs] = useState<Record<string, Record<number, number>>>({});
  
  // Initialize signals from localStorage
  const [signals, setSignals] = useState<SignalMetadata[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SIGNALS);
    return saved ? JSON.parse(saved) : [
      { id: 'SIG-001', name: 'BASE_LOG', color: '#10b981', visible: true },
      { id: 'SIG-002', name: 'GHOST_LOG', color: '#FF5F1F', visible: true },
      { id: 'SIG-ELEV', name: 'ELEVATION', color: '#8b5e3c', visible: true }
    ];
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OFFSET, offset.toString());
  }, [offset]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SIGNALS, JSON.stringify(signals));
  }, [signals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTO_DETECT, autoDetectEnabled.toString());
  }, [autoDetectEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ANOMALIES, JSON.stringify(detectedAnomalies));
  }, [detectedAnomalies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DRIFT_RISK, driftRiskScore.toString());
  }, [driftRiskScore]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VARIANCE_WINDOW, varianceWindow.toString());
  }, [varianceWindow]);

  const toggleSignalVisibility = useCallback((id: string) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  }, []);

  const updateSignalColor = useCallback((id: string, color: string) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, color } : s));
  }, []);

  const reorderSignals = useCallback((fromIndex: number, toIndex: number) => {
    const next = [...signals];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setSignals(next);
  }, [signals]);

  const addRemoteSignal = useCallback((id: string, name: string, color: string, data: Record<number, number>) => {
    setRemoteLogs(prev => ({ ...prev, [id]: data }));
    setSignals(prev => {
      // Avoid duplicates if reloading
      if (prev.find(s => s.id === id)) return prev;
      return [...prev, { id, name, color, visible: true }];
    });
  }, []);

  const addManualSignal = useCallback((name: string, color: string) => {
    const id = `MAN-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const mockData: Record<number, number> = {};
    MOCK_BASE_LOG.forEach(base => {
        mockData[base.depth] = 60 + Math.cos(base.depth * 0.08) * 15 + (Math.random() * 8);
    });
    setRemoteLogs(prev => ({ ...prev, [id]: mockData }));
    setSignals(prev => [...prev, { id, name, color, visible: true }]);
  }, []);

  const removeSignal = useCallback((id: string) => {
    if (id === 'SIG-001' || id === 'SIG-002' || id === 'SIG-ELEV') return;
    setSignals(prev => prev.filter(s => s.id !== id));
    setRemoteLogs(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const combinedData = useMemo(() => {
    return MOCK_BASE_LOG.map((base) => {
      const ghost = MOCK_GHOST_LOG.find(g => Math.abs(g.depth - (base.depth + offset)) < 0.1);
      const elevData = MOCK_ELEVATION_DATA.find(e => Math.abs(e.depth - base.depth) < 0.1);
      
      const row: any = {
        depth: base.depth,
        baseGR: base.gr,
        ghostGR: ghost ? ghost.gr : null,
        elevation: elevData ? elevData.elevation : null,
        diff: ghost ? Math.abs(base.gr - ghost.gr) : 0
      };
      Object.keys(remoteLogs).forEach(sigId => {
        if (remoteLogs[sigId][base.depth] !== undefined) {
          row[sigId] = remoteLogs[sigId][base.depth];
        }
      });
      return row;
    });
  }, [offset, remoteLogs]);

  const correlationScore = useMemo(() => {
    const pairs = combinedData.filter(d => d.ghostGR !== null);
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

  const sigmaScore = useMemo(() => {
    return Number((correlationScore * 6).toFixed(2));
  }, [correlationScore]);

  const handleOffsetChange = useCallback((val: number) => {
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
  }, []);

  const runAnomalyScan = useCallback((isAutomatic = false) => {
    if (!isAutomatic) {
      setIsScanningAnomalies(true);
    } else {
      setIsAutoAuditing(true);
    }
    
    const executeScan = () => {
      const anomalies: SyncAnomaly[] = [];
      let currentGroup: { start: number; end: number; diffs: number[] } | null = null;
      const effectiveThreshold = microSensitivity ? anomalyThreshold * 0.5 : anomalyThreshold;

      combinedData.forEach((row) => {
        if (row.ghostGR !== null && row.diff > effectiveThreshold) {
          if (!currentGroup) {
            currentGroup = { start: row.depth, end: row.depth, diffs: [row.diff] };
          } else {
            currentGroup.end = row.depth;
            currentGroup.diffs.push(row.diff);
          }
        } else if (currentGroup) {
          const avgDiff = currentGroup.diffs.reduce((a, b) => a + b, 0) / currentGroup.diffs.length;
          const localSigma = Number((Math.max(0, 1 - (avgDiff / 100)) * 6).toFixed(2));
          anomalies.push({
            id: `SHIFT-${Math.random().toString(36).substring(7).toUpperCase()}`,
            startDepth: currentGroup.start,
            endDepth: currentGroup.end,
            avgDiff,
            sigmaScore: localSigma,
            severity: avgDiff > 40 ? 'CRITICAL' : avgDiff > 15 ? 'WARNING' : 'MICRO',
            type: 'DATUM_SHIFT',
            description: avgDiff > 40 ? "Major lithological discordance detected." : "Localized datum variance."
          });
          currentGroup = null;
        }
      });

      if (currentGroup) {
        const avgDiff = currentGroup.diffs.reduce((a, b) => a + b, 0) / currentGroup.diffs.length;
        const localSigma = Number((Math.max(0, 1 - (avgDiff / 100)) * 6).toFixed(2));
        anomalies.push({
          id: `SHIFT-${Math.random().toString(36).substring(7).toUpperCase()}`,
          startDepth: currentGroup.start,
          endDepth: currentGroup.end,
          avgDiff,
          sigmaScore: localSigma,
          severity: avgDiff > 40 ? 'CRITICAL' : avgDiff > 15 ? 'WARNING' : 'MICRO',
          type: 'DATUM_SHIFT',
          description: avgDiff > 40 ? "Major lithological discordance detected." : "Localized datum variance."
        });
      }

      const risk = Math.min(100, (anomalies.length * 15) + (100 - correlationScore * 100));
      setDriftRiskScore(risk);
      setDetectedAnomalies(anomalies);
      
      if (!isAutomatic) {
        setIsScanningAnomalies(false);
      } else {
        setTimeout(() => setIsAutoAuditing(false), 300);
      }
      setShowAnomalies(true);
    };

    if (isAutomatic) {
      executeScan();
    } else {
      setTimeout(executeScan, 1200);
    }
  }, [combinedData, anomalyThreshold, correlationScore, microSensitivity]);

  const detectOptimalShift = useCallback(() => {
    setIsSyncing(true);
    setIsSweeping(true);
    setValidationError(null);
    setDetectedAnomalies([]);
    
    let sweepFrame = 0;
    const sweepRange = [-25, 25];
    const sweepStep = 1.0;
    const totalSteps = (sweepRange[1] - sweepRange[0]) / sweepStep;
    
    const sweepInterval = setInterval(() => {
      setOffset(sweepRange[0] + sweepFrame * sweepStep);
      sweepFrame++;
      
      if (sweepFrame >= totalSteps) {
        clearInterval(sweepInterval);
        
        // Final precise calculation
        let bestOffset = 0;
        let maxCorr = -1;
        
        // Precise search with correlation coefficient maximization
        for (let test = -25; test <= 25; test += 0.05) {
          let n = 0;
          let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
          
          MOCK_BASE_LOG.forEach(base => {
            const ghost = MOCK_GHOST_LOG.find(g => Math.abs(g.depth - (base.depth + test)) < 0.15);
            if (ghost) {
              n++;
              sumX += base.gr;
              sumY += ghost.gr;
              sumXY += base.gr * ghost.gr;
              sumX2 += base.gr * base.gr;
              sumY2 += ghost.gr * ghost.gr;
            }
          });
          
          if (n > 5) {
            const num = (n * sumXY) - (sumX * sumY);
            const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
            const corr = den === 0 ? 0 : num / den;
            
            if (corr > maxCorr) {
              maxCorr = corr;
              bestOffset = test;
            }
          }
        }
        
        setOffset(bestOffset);
        setIsSweeping(false);
        setIsSyncing(false);
        playLockSound();
        
        // Trigger forensic scan automatically to highlight any remaining discrepancies
        setTimeout(() => runAnomalyScan(true), 150);
      }
    }, 20);
  }, [runAnomalyScan]);

  const runVarianceAudit = useCallback(() => {
    setIsAuditingVariance(true);
    
    setTimeout(() => {
      const windowSize = varianceWindow;
      const variances: SyncAnomaly[] = [];
      
      const calcStats = (data: number[]) => {
        const n = data.length;
        if (n < 2) return { mean: 0, variance: 0 };
        const mean = data.reduce((a, b) => a + b, 0) / n;
        const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
        return { mean, variance };
      };

      for (let i = windowSize; i < combinedData.length - windowSize; i++) {
        const window = combinedData.slice(i - windowSize, i + windowSize);
        const baseVals = window.map(d => d.baseGR);
        const ghostVals = window.filter(d => d.ghostGR !== null).map(d => d.ghostGR);

        if (ghostVals.length === baseVals.length && baseVals.length > 0) {
          const statsBase = calcStats(baseVals);
          const statsGhost = calcStats(ghostVals);
          
          // Compare normalized variance (Coefficient of Variation)
          const cvBase = Math.sqrt(statsBase.variance) / (statsBase.mean || 1);
          const cvGhost = Math.sqrt(statsGhost.variance) / (statsGhost.mean || 1);
          const cvDelta = Math.abs(cvBase - cvGhost);

          if (cvDelta > 0.15) { // Threshold for variance mismatch
            variances.push({
              id: `VAR-${Math.random().toString(36).substring(7).toUpperCase()}`,
              startDepth: window[0].depth,
              endDepth: window[window.length - 1].depth,
              avgDiff: cvDelta * 100, // Normalized scale
              sigmaScore: 4.1,
              severity: cvDelta > 0.35 ? 'CRITICAL' : 'WARNING',
              type: 'DATUM_SHIFT',
              description: "High variance discordance detected. Core signal character mismatch suggests localized vertical datum shift."
            });
            i += windowSize;
          }
        }
      }

      setDetectedAnomalies(prev => [...variances, ...prev].slice(0, 50));
      setIsAuditingVariance(false);
      setShowAnomalies(true);
    }, 2200);
  }, [combinedData, varianceWindow]);

  const filteredAnomalies = useMemo(() => {
    if (severityFilter === 'ALL') return detectedAnomalies;
    return detectedAnomalies.filter(a => a.severity === severityFilter);
  }, [detectedAnomalies, severityFilter]);

  const handleSecureAsset = useCallback(() => {
    setIsSecuring(true);
    setTimeout(() => {
      secureAsset({
        title: `Sovereign Tie: ${sigmaScore}σ`,
        status: sigmaScore >= 5.0 ? 'VERIFIED' : 'PENDING',
        summary: `Datum discordance resolution identifies an optimal vertical tie at ${offset.toFixed(3)}m. ${detectedAnomalies.length} local discrepancies flagged.`,
        region: 'North Sea',
        valueEst: sigmaScore >= 5.0 ? 7200000 : 2100000,
        sigmaScore: sigmaScore,
        confidence: correlationScore * 100
      });
      setIsSecuring(false);
    }, 1000);
  }, [correlationScore, offset, sigmaScore, detectedAnomalies]);

  return {
    offset, isSyncing, isSweeping, viewMode, setViewMode, validationError,
    autoDetectEnabled, setAutoDetectEnabled,
    showAnomalies, setShowAnomalies, anomalyThreshold, setAnomalyThreshold,
    microSensitivity, setMicroSensitivity, varianceWindow, setVarianceWindow,
    isScanningAnomalies, isAutoAuditing, isAuditingVariance, detectedAnomalies, filteredAnomalies, severityFilter, setSeverityFilter, isSecuring, combinedData, correlationScore,
    signals, driftRiskScore, sigmaScore, handleOffsetChange, detectOptimalShift, 
    runAnomalyScan, runVarianceAudit, handleSecureAsset, toggleSignalVisibility, updateSignalColor, 
    reorderSignals, addRemoteSignal, addManualSignal, removeSignal
  };
}
