
import React from 'react';
import { Shield, AlertCircle, TrendingUp, Target } from 'lucide-react';

interface GhostSyncStatsProps {
  sigmaScore: number;
  driftRiskScore: number;
  correlationScore: number;
  anomaliesCount: number;
}

const GhostSyncStats: React.FC<GhostSyncStatsProps> = ({ 
  sigmaScore, driftRiskScore, correlationScore, anomaliesCount 
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 bg-black/60 border border-[#00FF41]/30 rounded-xl flex flex-col space-y-2 shadow-lg backdrop-blur-md">
         <span className="text-[8px] font-black text-[#003b0f] uppercase tracking-widest">Brahan_Sigma_Protocol</span>
         <div className="flex items-center justify-between">
            <span className={`text-xl font-black ${sigmaScore > 4.5 ? 'text-[#00FF41]' : 'text-orange-500'}`}>{sigmaScore.toFixed(2)}σ</span>
            <Shield size={16} className={sigmaScore > 4.5 ? 'text-[#00FF41]' : 'text-orange-500'} />
         </div>
      </div>
      <div className="p-4 bg-black/60 border border-[#00FF41]/30 rounded-xl flex flex-col space-y-2 shadow-lg backdrop-blur-md">
         <span className="text-[8px] font-black text-[#003b0f] uppercase tracking-widest">Datum_Drift_Risk</span>
         <div className="flex items-center justify-between">
            <span className={`text-xl font-black ${driftRiskScore > 50 ? 'text-red-500' : driftRiskScore > 20 ? 'text-orange-400' : 'text-[#00FF41]'}`}>{driftRiskScore.toFixed(1)}%</span>
            <AlertCircle size={16} className={driftRiskScore > 50 ? 'text-red-500 animate-pulse' : 'text-[#00FF41]'} />
         </div>
      </div>
      <div className="p-4 bg-black/60 border border-[#00FF41]/30 rounded-xl flex flex-col space-y-2 shadow-lg backdrop-blur-md">
         <span className="text-[8px] font-black text-[#003b0f] uppercase tracking-widest">Statistical_Concordance</span>
         <div className="flex items-center justify-between">
            <span className="text-xl font-black text-emerald-100">{(correlationScore * 100).toFixed(1)}%</span>
            <TrendingUp size={16} className="text-[#00FF41]" />
         </div>
      </div>
      <div className="p-4 bg-black/60 border border-[#00FF41]/30 rounded-xl flex flex-col space-y-2 shadow-lg backdrop-blur-md">
         <span className="text-[8px] font-black text-[#003b0f] uppercase tracking-widest">Detection_State</span>
         <div className="flex items-center justify-between">
            <span className={`text-xl font-black ${anomaliesCount > 0 ? 'text-red-500 animate-pulse' : 'text-[#00FF41]'}`}>{anomaliesCount > 0 ? (sigmaScore < 3.0 ? 'BACKGROUND' : 'SIGMA_TARGET') : 'TIE_LOCKED'}</span>
            <Target size={16} className={anomaliesCount > 0 ? 'text-red-500' : 'text-[#00FF41]'} />
         </div>
      </div>
    </div>
  );
};

export default GhostSyncStats;
