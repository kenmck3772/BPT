
import React, { useState } from 'react';
import SyncMonitorChart from './SyncMonitorChart';
import GhostSyncWaveform from './GhostSyncWaveform';
import GhostSyncElevationPlot from './GhostSyncElevationPlot';
import { SignalMetadata, SyncAnomaly } from '../hooks/useGhostSync';

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
}

const GhostSyncChartContainer: React.FC<GhostSyncChartContainerProps> = ({
  viewMode, combinedData, signals, ghostLabel, validationError, offset,
  showAnomalies, detectedAnomalies, anomalyThreshold, activeAnomalyId,
  varianceWindow, isAuditingVariance
}) => {
  const [syncedDepth, setSyncedDepth] = useState<number | null>(null);

  const isElevationVisible = signals.find(s => s.id === 'SIG-ELEV')?.visible ?? false;

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="flex-1 min-h-0 flex flex-col">
        {viewMode === 'WAVEFORM' ? (
          <GhostSyncWaveform 
            combinedData={combinedData} 
            signals={signals} 
            ghostLabel={ghostLabel} 
            activeAnomalyId={activeAnomalyId}
            anomalies={detectedAnomalies}
            varianceWindow={varianceWindow}
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
          />
        )}
      </div>

      {/* Forensic Elevation Profile - Synchronized with Main Chart Crosshair */}
      {isElevationVisible && viewMode !== 'WAVEFORM' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <GhostSyncElevationPlot 
            combinedData={combinedData} 
            activeDepth={syncedDepth} 
          />
        </div>
      )}
    </div>
  );
};

export default GhostSyncChartContainer;
