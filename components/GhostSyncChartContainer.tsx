
import React, { useState } from 'react';
import SyncMonitorChart from './SyncMonitorChart';
import GhostSyncWaveform from './GhostSyncWaveform';
import GhostSyncElevationPlot from './GhostSyncElevationPlot';
import { SignalMetadata, SyncAnomaly } from '../hooks/useGhostSync';
import { AlertTriangle } from 'lucide-react';

interface GhostSyncChartContainerProps {
  viewMode: 'OVERLAY' | 'DIFFERENTIAL' | 'WAVEFORM';
  combinedData: any[];
  signals: SignalMetadata[];
  ghostLabel: string;
  validationError: string | null;
  offset: number;
  showAnomalies: boolean;
  detectedAnomalies: SyncAnomaly[];
  anomalyThreshold: number;
  activeAnomalyId: string | null;
  varianceWindow?: number;
  isAuditingVariance?: boolean;
  zoomRange: { left: number | string; right: number | string };
  onZoomRangeChange: (range: { left: number | string; right: number | string }) => void;
  hasDiscordanceAlert?: boolean;
  onInspectAnomaly?: (anomaly: SyncAnomaly) => void;
}

const GhostSyncChartContainer: React.FC<GhostSyncChartContainerProps> = ({
  viewMode, combinedData, signals, ghostLabel, validationError, offset,
  showAnomalies, detectedAnomalies, anomalyThreshold, activeAnomalyId,
  varianceWindow = 5, isAuditingVariance, zoomRange, onZoomRangeChange,
  hasDiscordanceAlert = false, onInspectAnomaly
}) => {
  const [syncedDepth, setSyncedDepth] = useState<number | null>(null);

  const isElevationVisible = (signals || []).find(s => s && s.id === 'SIG-ELEV')?.visible ?? false;

  return (
    <div className={`flex-1 flex flex-col space-y-4 relative transition-all duration-1000 rounded-2xl ${
      hasDiscordanceAlert 
        ? 'ring-2 ring-red-500/60 shadow-[0_0_80px_rgba(239,68,68,0.3)] bg-red-600/[0.04] animate-alert-pulse' 
        : 'ring-0 shadow-none bg-transparent'
    }`}>
      <div className="flex-1 min-h-0 flex flex-col relative">
        {hasDiscordanceAlert && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-600 border-2 border-red-400 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.6)] backdrop-blur-md">
               <AlertTriangle size={14} className="text-white animate-pulse" />
               <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Discordance_Threshold_Exceeded_>_10_API</span>
            </div>
          </div>
        )}

        {viewMode === 'WAVEFORM' ? (
          <GhostSyncWaveform 
            combinedData={combinedData} 
            signals={signals} 
            ghostLabel={ghostLabel} 
            activeAnomalyId={activeAnomalyId}
            anomalies={detectedAnomalies}
            varianceWindow={varianceWindow}
            zoomRange={zoomRange}
            onZoomRangeChange={onZoomRangeChange}
          />
        ) : (
          <SyncMonitorChart 
            combinedData={combinedData} 
            signals={signals} 
            viewMode={viewMode as 'OVERLAY' | 'DIFFERENTIAL'} 
            ghostLabel={ghostLabel} 
            validationError={validationError} 
            offset={offset}
            anomalies={showAnomalies ? detectedAnomalies : []} 
            anomalyThreshold={anomalyThreshold}
            activeAnomalyId={activeAnomalyId}
            onDepthChange={setSyncedDepth}
            varianceWindow={varianceWindow}
            isAuditingVariance={isAuditingVariance}
            onInspectAnomaly={onInspectAnomaly}
          />
        )}
      </div>

      {/* Forensic Elevation Profile - Synchronized with Main Chart Crosshair & Aperture */}
      {isElevationVisible && viewMode !== 'WAVEFORM' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <GhostSyncElevationPlot 
            combinedData={combinedData} 
            activeDepth={syncedDepth}
            varianceWindow={varianceWindow}
          />
        </div>
      )}
    </div>
  );
};

export default GhostSyncChartContainer;
