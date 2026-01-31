import React, { useState, useMemo, useEffect } from 'react';
import { 
  HeartPulse, Activity, Zap, ShieldAlert, 
  Search, Loader2, Database, AlertCircle,
  FileText, ArrowRight, Skull, Terminal,
  Dna, Microscope, TrendingUp, Info, 
  CheckCircle2, AlertOctagon, Heart, Save,
  Maximize2, Minimize2,
  FileQuestion
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_NDR_PROJECTS } from '../constants';
import { secureAsset } from '../services/vaultService';

interface CardioAudit {
  uwi: string;
  projectName: string;
  status: 'STABLE' | 'WEAK_PULSE' | 'ARRHYTHMIA';
  score: number;
  anchors: {
    LOG_WIRE: boolean;
    WELL_ENG: boolean;
    SCAL_FILE: boolean;
    LOG_MUD: boolean;
  };
}

interface CardioForensicsProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const NoDataPanel = ({ title, message, icon: Icon = FileQuestion }: { title: string, message: string, icon?: any }) => (
  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-red-900/20 rounded-[2rem] p-12 text-center space-y-6 bg-red-500/[0.02]">
    <div className="p-5 bg-red-950/20 rounded-full border border-red-900/30 animate-pulse">
      <Icon size={48} className="text-red-900/40" />
    </div>
    <div className="space-y-2 max-w-xs">
      <h3 className="text-sm font-black text-red-800 uppercase tracking-[0.3em]">{title}</h3>
      <p className="text-[10px] font-mono text-red-900/60 uppercase leading-relaxed">{message}</p>
    </div>
    <div className="text-[8px] font-black text-red-950 uppercase tracking-widest border border-red-900/20 px-3 py-1 rounded">
      Status: Ingest_Required // CORE: 0x_NULL
    </div>
  </div>
);

const CardioForensics: React.FC<CardioForensicsProps> = ({ isFocused, onToggleFocus }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<CardioAudit[]>([]);
  const [selectedWell, setSelectedWell] = useState<CardioAudit | null>(null);
  const [isSecuring, setIsSecuring] = useState(false);

  // Simulated ECG Waveform Data
  const ecgData = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      // Normal ECG-ish pattern with P, QRS, and T waves
      const t = i % 20;
      let val = 10; // Baseline
      if (t === 2) val = 12; // P-wave
      if (t === 4) val = 8;  // Q
      if (t === 5) val = 25; // R (spike)
      if (t === 6) val = 5;  // S
      if (t === 9) val = 14; // T-wave
      
      // Add noise
      val += (Math.random() - 0.5) * 1.5;
      
      return { time: i, pulse: val };
    });
  }, []);

  const runCardioAudit = () => {
    setIsScanning(true);
    setResults([]);
    setSelectedWell(null);

    setTimeout(() => {
      const audits: CardioAudit[] = MOCK_NDR_PROJECTS.map(p => {
        // Map constants into the anchors logic from the python script
        const anchors = {
          LOG_WIRE: p.hasIntegrityRecords,
          WELL_ENG: Math.random() > 0.3,
          SCAL_FILE: Math.random() > 0.5,
          LOG_MUD: Math.random() > 0.4
        };
        const score = Object.values(anchors).filter(v => v).length;
        const status = score < 2 ? 'WEAK_PULSE' : score < 3 ? 'ARRHYTHMIA' : 'STABLE';
        
        return {
          uwi: p.projectId.substring(0, 12).toUpperCase(),
          projectName: p.name,
          status,
          score,
          anchors
        };
      });

      setResults(audits);
      setIsScanning(false);
    }, 2000);
  };

  const handleSecureToVault = () => {
    if (!selectedWell) return;
    setIsSecuring(true);
    setTimeout(() => {
      secureAsset({
        title: `Cardio_Pulse_Audit: ${selectedWell.uwi}`,
        status: selectedWell.status === 'STABLE' ? 'VERIFIED' : 'CRITICAL',
        summary: `Metadata vitality audit completed. Pulse Score: ${selectedWell.score}/4. ${selectedWell.status === 'STABLE' ? 'Full data compliance for WIOS 2026.' : 'Critical data arrhythmia detected. Missing ' + Object.entries(selectedWell.anchors).filter(([_,v]) => !v).map(([k]) => k).join(', ') + ' anchors.'}`,
        region: 'North Sea',
        valueEst: selectedWell.status === 'STABLE' ? 500000 : 8500000,
        confidence: 98.4
      });
      setIsSecuring(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      {/* Background HUD Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <HeartPulse size={400} className="text-red-500 animate-pulse" />
      </div>

      <header className="flex items-center justify-between border-b border-red-900/30 pb-4 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl shadow-lg shadow-red-500/5">
            <HeartPulse size={24} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-red-400 uppercase tracking-tighter">>>> NODE: CARDIO_FORENSICS_v.88</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-red-800 uppercase tracking-[0.4em] font-black">Audit_Scope: Metadata_Vitality // Compliance: WIOS_2026</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={runCardioAudit}
            disabled={isScanning}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center space-x-3"
          >
            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
            <span>{isScanning ? 'PULSING_REGISTRY...' : 'Run_Cardio_Sweep'}</span>
          </button>
          {onToggleFocus && (
            <button onClick={onToggleFocus} className="p-2 text-red-900 hover:text-red-400 transition-all ml-2">
              {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10 min-h-0 overflow-hidden">
        
        {/* Left Column: Well Registry Cardio Health */}
        <div className="lg:col-span-1 flex flex-col space-y-4 overflow-hidden">
          <div className="flex-1 bg-slate-950/80 border border-red-900/30 rounded-2xl flex flex-col p-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-red-900/10 pb-2">
               <div className="flex items-center space-x-2">
                  <Database size={16} className="text-red-500" />
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Metadata_Heartbeat_Log</span>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {isScanning ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                   <Activity size={48} className="text-red-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase">Sampling_Registry_Pulse...</span>
                </div>
              ) : results.length > 0 ? (
                results.map((audit, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedWell(audit)}
                    className={`w-full p-3 rounded-xl border transition-all text-left group relative overflow-hidden ${
                      selectedWell?.uwi === audit.uwi 
                        ? 'bg-red-500/20 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                        : 'bg-slate-900 border-red-900/20 hover:border-red-500/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 relative z-10">
                       <span className="text-[10px] font-black text-red-100 uppercase">{audit.uwi}</span>
                       <div className={`w-2 h-2 rounded-full ${audit.status === 'STABLE' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                    </div>
                    <div className="text-[8px] font-black text-red-900 uppercase tracking-widest mb-2 truncate">{audit.projectName}</div>
                    <div className="flex items-center justify-between">
                       <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${audit.status === 'STABLE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                         {audit.status}
                       </span>
                       <span className="text-[10px] font-black text-red-500">{audit.score}/4</span>
                    </div>
                    {selectedWell?.uwi === audit.uwi && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-red-500 shadow-[0_0_10px_#ef4444]"></div>
                    )}
                  </button>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 py-10">
                   <Heart size={48} />
                   <span className="text-[10px] font-black uppercase mt-4">Registry_Idle</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Analysis Viewport */}
        <div className="lg:col-span-3 flex flex-col space-y-4 min-h-0 overflow-hidden">
          {/* Detailed Diagnosis */}
          <div className="flex-1 bg-slate-950/90 border border-red-900/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
            {!selectedWell ? (
              <NoDataPanel 
                title="Cardio_Telemetry_Standby" 
                message="Metadata vitality buffer is empty. Initiate a cardio registry sweep to identify data ghosts and arrhythmia in NDR artifacts."
                icon={HeartPulse}
              />
            ) : (
              <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-4 border-b border-red-900/30 flex items-center justify-between bg-slate-900/60">
                  <div className="flex items-center space-x-3">
                    <Microscope size={18} className="text-red-500" />
                    <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">Cardio_Diagnostic_Report</span>
                  </div>
                  <span className="text-[10px] font-black text-red-100 uppercase tracking-tighter">{selectedWell.projectName}</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                  <div className="space-y-10">
                    {/* ECG Waveform Visualization */}
                    <div className="h-32 bg-black border border-red-900/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col">
                       <div className="absolute top-2 left-4 flex items-center space-x-2 z-20">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                          <span className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em]">Real-Time_Metadata_ECG_Stream</span>
                       </div>
                       <div className="flex-1 min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ecgData}>
                              <CartesianGrid strokeDasharray="1 5" stroke="#450a0a" vertical={false} />
                              <XAxis dataKey="time" hide />
                              <YAxis hide domain={[0, 30]} />
                              <Line 
                                type="monotone" 
                                dataKey="pulse" 
                                stroke="#ef4444" 
                                strokeWidth={2.5} 
                                dot={false} 
                                isAnimationActive={false} 
                                style={{ filter: 'drop-shadow(0 0 8px #ef4444)' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    {/* Pulse Matrix */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(selectedWell.anchors).map(([key, value]) => (
                        <div key={key} className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-3 transition-all ${value ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)] animate-pulse'}`}>
                           {value ? <CheckCircle2 size={24} /> : <AlertOctagon size={24} />}
                           <span className="text-[10px] font-black uppercase tracking-widest">{key}</span>
                           <span className="text-[8px] font-black uppercase opacity-60">{value ? 'LOCKED' : 'VOID'}</span>
                        </div>
                      ))}
                    </div>

                    {/* Narrative Insight */}
                    <div className={`p-6 border-l-4 rounded-r-xl shadow-xl relative overflow-hidden flex flex-col space-y-4 ${selectedWell.status === 'STABLE' ? 'bg-emerald-500/5 border-emerald-500' : 'bg-red-500/5 border-red-500'}`}>
                       <div className="flex items-center space-x-2">
                          <Terminal size={14} className={selectedWell.status === 'STABLE' ? 'text-emerald-500' : 'text-red-500'} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${selectedWell.status === 'STABLE' ? 'text-emerald-500' : 'text-red-500'}`}>Sovereign_Kernel_Diagnosis</span>
                       </div>
                       <p className={`text-[13px] font-terminal italic leading-relaxed ${selectedWell.status === 'STABLE' ? 'text-emerald-100' : 'text-red-100'}`}>
                          {selectedWell.status === 'STABLE' 
                            ? ">>> FULL_PULSE_VERIFIED. Registry artifacts are in high-fidelity compliance. All required anchors for WIOS 2026 detected. Low operational risk for forensic re-entry." 
                            : ">>> CRITICAL_DATA_ARRHYTHMIA. Weak metadata pulse suggests this well is a 'Data Ghost'. Missing critical structural logs creates catastrophic uncertainty for WIOS 2026 mandates. Intervention is physically impossible without anchor restoration."}
                       </p>
                    </div>

                    {/* Score Visualization */}
                    <div className="space-y-3">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-red-900 uppercase tracking-widest">Metadata_Vitality_Index</span>
                          <span className="text-[12px] font-black text-red-400">{selectedWell.score * 25}% Vital</span>
                       </div>
                       <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-red-900/20 shadow-inner">
                          <div className={`h-full transition-all duration-1000 ${selectedWell.score >= 3 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${selectedWell.score * 25}%` }}></div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-red-900/40 bg-slate-950 flex gap-4">
                   <button 
                    disabled={isSecuring}
                    onClick={handleSecureToVault}
                    className="flex-1 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:bg-red-500 disabled:opacity-20 transition-all flex items-center justify-center space-x-3"
                   >
                     {isSecuring ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                     <span>{isSecuring ? 'ARCHIVING_DIAGNOSIS...' : 'Secure_Cardio_Veto'}</span>
                   </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
             <Skull size={20} className="text-red-500 shrink-0 mt-0.5" />
             <div className="space-y-1">
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Legal_Attribution (Clause 18)</span>
                <p className="text-[10px] text-red-200/60 leading-tight italic">"Contains information provided by the North Sea Transition Authority and/or other third parties. Forensic analysis conducted under Brahan Sovereign Rights v88."</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardioForensics;