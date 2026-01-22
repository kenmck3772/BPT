
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FileSearch, Table, AlertTriangle, FileText, 
  CheckCircle2, SearchCode, Loader2, Play, Hash, 
  Target, ShieldAlert, Dna, Ruler, HardDriveDownload,
  History, X, Clock, Database, ChevronRight, Trash2,
  Binary, Fingerprint
} from 'lucide-react';
import { MOCK_TUBING_TALLY, MOCK_INTERVENTION_REPORTS } from '../constants';
import { TubingItem, WellReport } from '../types';

interface ScanLogEntry {
  id: string;
  reportId: string;
  timestamp: string;
  outcome: 'MATCH' | 'DISCREPANCY';
  discordance: number;
  flaggedJoints: number[];
  summary: string;
}

const ReportsScanner: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<WellReport>(MOCK_INTERVENTION_REPORTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isValidationComplete, setIsValidationComplete] = useState(false);
  const [tally] = useState<TubingItem[]>(MOCK_TUBING_TALLY);
  const [hoveredJoint, setHoveredJoint] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const [scanHistory, setScanHistory] = useState<ScanLogEntry[]>(() => {
    const saved = localStorage.getItem('BRAHAN_REPORT_AUDIT_LOGS');
    return saved ? JSON.parse(saved) : [];
  });

  const totalLength = useMemo(() => tally.reduce((acc, curr) => acc + curr.length_m, 0), [tally]);
  const discordance = useMemo(() => Math.abs(totalLength - selectedReport.eodDepth_m), [totalLength, selectedReport]);

  const triggerScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setIsValidationComplete(false);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setIsValidationComplete(true);
          
          // Generate Forensic Log Entry
          const outcome = discordance > 0.05 ? 'DISCREPANCY' : 'MATCH';
          const flagged = tally.filter(j => j.status === 'DISCREPANT').map(j => j.id);
          const newEntry: ScanLogEntry = {
            id: `AUDIT-${Math.random().toString(36).substring(7).toUpperCase()}`,
            reportId: selectedReport.reportId,
            timestamp: new Date().toISOString(),
            outcome,
            discordance,
            flaggedJoints: flagged,
            summary: selectedReport.summary
          };
          
          const updatedHistory = [newEntry, ...scanHistory].slice(0, 50);
          setScanHistory(updatedHistory);
          localStorage.setItem('BRAHAN_REPORT_AUDIT_LOGS', JSON.stringify(updatedHistory));
          
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const clearHistory = () => {
    if (window.confirm("PURGE ALL REPORT AUDIT TRACES?")) {
      setScanHistory([]);
      localStorage.removeItem('BRAHAN_REPORT_AUDIT_LOGS');
    }
  };

  // Schematic scaling factor (pixels per meter)
  const SCALE = 6;
  const schematicHeight = totalLength * SCALE + 100;

  return (
    <div className="flex flex-col h-full space-y-3 p-4 bg-slate-900/40 border border-emerald-900/30 rounded-lg transition-all relative overflow-hidden font-terminal">
      
      {/* Forensic History Modal */}
      {showHistory && (
        <div className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300 flex items-center justify-center p-8">
           <div className="w-full max-w-4xl h-full bg-slate-900 border border-emerald-500/30 rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-emerald-900/50 bg-slate-950 flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                    <History size={20} className="text-emerald-400" />
                    <span className="text-sm font-black text-emerald-100 uppercase tracking-[0.3em]">Sovereign_Audit_Vault</span>
                 </div>
                 <div className="flex items-center space-x-4">
                    <button 
                      onClick={clearHistory}
                      className="text-[9px] font-black text-emerald-900 hover:text-red-500 flex items-center space-x-1 uppercase transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>Wipe_Vault</span>
                    </button>
                    <button onClick={() => setShowHistory(false)} className="text-emerald-500 hover:text-white transition-colors">
                       <X size={24} />
                    </button>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                 {scanHistory.length > 0 ? (
                   scanHistory.map((entry) => (
                     <div key={entry.id} className={`p-4 rounded border-l-4 bg-slate-950/50 border-y border-r border-emerald-900/20 group hover:bg-slate-950 transition-all ${entry.outcome === 'DISCREPANCY' ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center space-x-4">
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{entry.id}</span>
                              <div className="flex items-center space-x-2 text-emerald-700">
                                 <Clock size={12} />
                                 <span className="text-[9px] font-mono">{new Date(entry.timestamp).toLocaleString()}</span>
                              </div>
                           </div>
                           <div className={`px-3 py-1 rounded text-[10px] font-black tracking-[0.2em] ${entry.outcome === 'DISCREPANCY' ? 'bg-red-500 text-slate-950 animate-pulse' : 'bg-emerald-500 text-slate-950'}`}>
                              {entry.outcome}
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                           <div className="flex flex-col">
                              <span className="text-[7px] text-emerald-900 font-black uppercase mb-1">Target_Report</span>
                              <span className="text-[12px] text-emerald-100 font-black">{entry.reportId}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[7px] text-emerald-900 font-black uppercase mb-1">Datum_Delta</span>
                              <span className={`text-[12px] font-black ${entry.outcome === 'DISCREPANCY' ? 'text-red-400' : 'text-emerald-400'}`}>{entry.discordance.toFixed(3)}m</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[7px] text-emerald-900 font-black uppercase mb-1">Flagged_Joints</span>
                              <div className="flex flex-wrap gap-1">
                                 {entry.flaggedJoints.length > 0 ? entry.flaggedJoints.map(id => (
                                   <span key={id} className="px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[8px] rounded border border-red-500/30">J-{id}</span>
                                 )) : <span className="text-emerald-800 text-[8px]">NONE</span>}
                              </div>
                           </div>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <Binary size={64} className="text-emerald-500 mb-4" />
                      <span className="text-xs font-black uppercase tracking-[0.5em]">No_Archives_Discovered</span>
                   </div>
                 )}
              </div>
              
              <div className="p-4 bg-slate-950 border-t border-emerald-900/50 flex items-center justify-between text-[8px] text-emerald-900 font-black uppercase tracking-widest">
                 <span>Vault_Status: Locked_v2.1</span>
                 <div className="flex items-center space-x-2">
                    <Fingerprint size={12} />
                    <span>User_Auth: Verified</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Header HUD */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <FileSearch size={20} className={isScanning ? 'animate-pulse text-orange-500' : 'text-emerald-400'} />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-400 font-terminal uppercase tracking-tighter">Report_Scanner_v1.2</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[8px] text-emerald-800 uppercase tracking-widest font-black">Discrepancy Engine Active</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-emerald-900/50 text-emerald-600 rounded font-black text-[10px] uppercase tracking-widest hover:text-emerald-400 transition-all"
          >
            <History size={14} />
            <span>Audit_History</span>
          </button>
          
          <button 
            onClick={triggerScan}
            disabled={isScanning}
            className={`flex items-center space-x-2 px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all ${isScanning ? 'bg-orange-500/20 text-orange-500 cursor-wait' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`}
          >
            {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            <span>Audit_DDR_Schema</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex space-x-4">
        
        {/* Module A: Report Selector & Analysis Results */}
        <div className="w-80 flex flex-col space-y-3">
          <div className="bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-emerald-900/20 pb-2">
               <div className="flex items-center space-x-2">
                  <FileText size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Available_Reports</span>
               </div>
            </div>
            
            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1">
              {MOCK_INTERVENTION_REPORTS.map(report => (
                <div 
                  key={report.reportId}
                  onClick={() => setSelectedReport(report)}
                  className={`p-3 rounded border transition-all cursor-pointer ${selectedReport.reportId === report.reportId ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900/40 border-emerald-900/20 text-emerald-900 hover:border-emerald-700'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black">{report.reportId}</span>
                    <span className="text-[8px] font-mono opacity-60">{report.date}</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-tight opacity-80 truncate">{report.summary}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 flex flex-col space-y-4 shadow-2xl relative overflow-hidden">
             {isScanning && (
               <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                  <div className="text-[10px] font-black text-orange-400 mb-4 tracking-[0.5em] animate-pulse">SCANNING_TALLY_ARRAY</div>
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-orange-500/20">
                    <div className="h-full bg-orange-500 shadow-[0_0_10px_#f97316]" style={{ width: `${scanProgress}%` }}></div>
                  </div>
               </div>
             )}

             <div className="flex items-center justify-between border-b border-emerald-900/20 pb-2">
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Forensic_Audit</span>
               <Dna size={14} className="text-emerald-700" />
             </div>

             <div className="space-y-4">
                <div className="p-3 bg-slate-900 rounded border border-emerald-900/20">
                  <div className="text-[8px] text-emerald-900 font-black uppercase mb-1">Reported_Datum_EOD</div>
                  <div className="text-2xl font-black text-emerald-400 font-terminal">{selectedReport.eodDepth_m.toFixed(2)}m</div>
                </div>

                <div className={`p-3 bg-slate-900 rounded border transition-all duration-700 ${isValidationComplete ? (discordance > 0.05 ? 'border-red-500/40' : 'border-emerald-500/40') : 'border-emerald-900/20'}`}>
                  <div className="text-[8px] text-emerald-900 font-black uppercase mb-1">Tally_Sum_Calculated</div>
                  <div className={`text-2xl font-black font-terminal ${isValidationComplete && discordance > 0.05 ? 'text-red-500 animate-pulse' : 'text-emerald-100'}`}>
                    {totalLength.toFixed(2)}m
                  </div>
                </div>

                {isValidationComplete && (
                  <div className={`flex items-center space-x-3 p-3 rounded border animate-in slide-in-from-left-2 ${discordance > 0.05 ? 'bg-red-500/5 border-red-500/30 text-red-500' : 'bg-emerald-500/5 border-emerald-500/30 text-emerald-500'}`}>
                    {discordance > 0.05 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest">{discordance > 0.05 ? 'Discordance_Detected' : 'Datum_Match_Verified'}</span>
                      <span className="text-[8px] font-mono opacity-80">DELTA: {discordance.toFixed(3)}m</span>
                    </div>
                  </div>
                )}
             </div>
             
             <div className="flex-1 bg-slate-900/40 rounded border border-emerald-900/10 p-3 flex flex-col justify-end">
                <div className="text-[8px] font-mono text-emerald-900 mb-1 flex items-center">
                  <Hash size={10} className="mr-1" /> ARCHIVE_HANDSHAKE: ACTIVE
                </div>
                <div className="text-[8px] font-mono text-emerald-900 truncate">
                  SHA-512: {Math.random().toString(36).substring(7).toUpperCase()}...
                </div>
             </div>
          </div>
        </div>

        {/* Module B: Tubing Tally Grid */}
        <div className="flex-1 bg-slate-950/80 rounded-xl border border-emerald-900/20 p-4 flex flex-col relative overflow-hidden shadow-inner">
           <div className="flex items-center justify-between mb-4 border-b border-emerald-900/20 pb-2">
              <div className="flex items-center space-x-2">
                <Table size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Interactive_Tubing_Tally</span>
              </div>
              <div className="flex items-center space-x-3">
                 <span className="text-[8px] text-emerald-900 uppercase font-black">Joints: {tally.length}</span>
                 <button className="text-emerald-800 hover:text-emerald-400 transition-colors"><HardDriveDownload size={14} /></button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-[10px] font-terminal border-separate border-spacing-y-1">
                <thead className="sticky top-0 bg-slate-950/90 z-20">
                  <tr className="text-emerald-800 uppercase text-[8px] font-black">
                    <th className="pb-2 pl-2">Jnt#</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">ID (in)</th>
                    <th className="pb-2">Grade</th>
                    <th className="pb-2">Len (m)</th>
                    <th className="pb-2">Cumul (m)</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tally.map((item) => (
                    <tr 
                      key={item.id}
                      onMouseEnter={() => setHoveredJoint(item.id)}
                      onMouseLeave={() => setHoveredJoint(null)}
                      className={`group transition-all ${hoveredJoint === item.id ? 'bg-emerald-500/20 scale-[0.99] origin-left' : item.status === 'DISCREPANT' ? 'bg-red-500/10 text-red-400' : 'bg-slate-900/40 hover:bg-emerald-500/5 text-emerald-600'}`}
                    >
                      <td className="py-2.5 pl-2 font-black border-l-2 border-transparent group-hover:border-emerald-500">{item.id}</td>
                      <td className="py-2.5 font-bold">{item.type}</td>
                      <td className="py-2.5 opacity-60">{item.id_in.toFixed(3)}</td>
                      <td className="py-2.5 opacity-60">{item.grade}</td>
                      <td className="py-2.5 font-black">{item.length_m.toFixed(2)}</td>
                      <td className="py-2.5 font-black">{item.cumulative_m.toFixed(2)}</td>
                      <td className="py-2.5 pr-2">
                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black ${item.status === 'VALID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500 text-slate-950 animate-pulse'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>

        {/* Module C: Forensic Schematic Visualizer */}
        <div className="w-72 bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 flex flex-col relative shadow-2xl">
           <div className="flex items-center justify-between mb-4 border-b border-emerald-900/20 pb-2">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Well_Schematic</span>
              <Target size={14} className="text-emerald-700" />
           </div>

           <div className="flex-1 bg-slate-900/20 rounded border border-emerald-900/10 flex flex-col items-center relative custom-scrollbar overflow-y-auto overflow-x-hidden">
              <svg width="240" height={schematicHeight} className="opacity-90">
                <rect x="105" y="0" width="30" height={schematicHeight} fill="none" stroke="#064e3b" strokeWidth="1" strokeDasharray="4 2" />
                
                {tally.map((item) => {
                  const yStart = (item.cumulative_m - item.length_m) * SCALE + 20; 
                  const height = item.length_m * SCALE;
                  const isHovered = hoveredJoint === item.id;
                  
                  return (
                    <g 
                      key={item.id} 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredJoint(item.id)}
                      onMouseLeave={() => setHoveredJoint(null)}
                    >
                      <rect 
                        x="108" 
                        y={yStart} 
                        width="24" 
                        height={height} 
                        fill={item.status === 'DISCREPANT' ? '#ef444444' : (isHovered ? '#10b98166' : '#10b98111')}
                        stroke={item.status === 'DISCREPANT' ? '#ef4444' : (isHovered ? '#ffffff' : '#10b98144')}
                        strokeWidth={isHovered ? 2 : 1}
                        className={`transition-all duration-300 ${isHovered ? 'filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' : ''}`}
                      />
                      {isHovered && (
                        <g className="animate-in fade-in slide-in-from-left-2 duration-200">
                          {/* Indicator Line Left */}
                          <line x1="80" y1={yStart + height/2} x2="108" y2={yStart + height/2} stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
                          {/* Indicator Line Right */}
                          <line x1="132" y1={yStart + height/2} x2="160" y2={yStart + height/2} stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
                          
                          {/* Tooltip Background */}
                          <rect 
                            x="165" 
                            y={yStart + height/2 - 12} 
                            width="70" 
                            height="24" 
                            rx="2" 
                            fill="#020617" 
                            stroke="#10b981" 
                            strokeWidth="1" 
                          />
                          {/* Tooltip Text */}
                          <text x="170" y={yStart + height/2 - 2} fill="#10b981" fontSize="8" fontWeight="bold">JOINT_{item.id}</text>
                          <text x="170" y={yStart + height/2 + 8} fill="#10b981" fontSize="7" opacity="0.8">{item.cumulative_m.toFixed(2)}m</text>
                          
                          {/* Schematic depth marker left */}
                          <text x="35" y={yStart + height/2 + 3} fill="#10b981" fontSize="7" fontWeight="black" textAnchor="end">{item.cumulative_m.toFixed(1)}m</text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Fixed Depth Ticks on visualizer bg */}
              <div className="absolute top-0 left-2 bottom-0 flex flex-col justify-between py-2 pointer-events-none opacity-20">
                 <span className="text-[7px] text-emerald-900 font-black">0.00m</span>
                 <span className="text-[7px] text-emerald-900 font-black">DATUM_LOCK</span>
              </div>
           </div>

           <div className="mt-4 p-3 bg-slate-900/60 rounded border border-emerald-900/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-emerald-900 uppercase">Pressure_Grade:</span>
                <ShieldAlert size={12} className="text-emerald-500" />
              </div>
              <div className="flex items-center space-x-1">
                 {[...Array(8)].map((_, i) => (
                   <div key={i} className={`h-1 flex-1 rounded-full ${i < 6 ? 'bg-emerald-500 shadow-[0_0_5px_#10b98122]' : 'bg-slate-800'}`}></div>
                 ))}
              </div>
              <div className="text-[8px] text-center text-emerald-700 font-mono uppercase tracking-widest">10,000 PSI RATING // L80 Grade</div>
           </div>
        </div>
      </div>

      {/* Footer Alert Bar */}
      <div className={`p-2.5 rounded border flex items-center justify-between transition-all ${isValidationComplete ? (discordance > 0.05 ? 'bg-red-500/10 border-red-500/40' : 'bg-emerald-500/10 border-emerald-500/40') : 'bg-slate-950/80 border-emerald-900/20'}`}>
         <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
               {isValidationComplete ? (discordance > 0.05 ? <AlertTriangle size={14} className="text-red-500 animate-pulse" /> : <CheckCircle2 size={14} className="text-emerald-500" />) : <SearchCode size={14} className="text-emerald-900" />}
               <span className={`text-[10px] font-black uppercase tracking-widest ${isValidationComplete ? (discordance > 0.05 ? 'text-red-400' : 'text-emerald-400') : 'text-emerald-900'}`}>
                 {isValidationComplete ? (discordance > 0.05 ? 'Report_Inconsistency_Flagged' : 'Tally_Schema_Verified') : 'System_Idle_Waiting_Injest'}
               </span>
            </div>
            <div className="h-4 w-px bg-emerald-900/30"></div>
            <div className="flex items-center space-x-2">
               <Ruler size={12} className="text-emerald-900" />
               <span className="text-[9px] text-emerald-900 uppercase font-black">Tolerance: +/- 0.050m</span>
            </div>
         </div>
         <div className="flex items-center space-x-4">
            <span className="text-[9px] text-emerald-900 font-mono tracking-tighter">ENGINE: GEMINI_TALLY_SCAN_v1</span>
            <div className="flex items-center space-x-1">
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
               <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default ReportsScanner;
