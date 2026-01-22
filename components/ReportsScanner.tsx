
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileSearch, Table, AlertTriangle, FileText, 
  ChevronDown, ChevronUp, CheckCircle2, 
  SearchCode, Loader2, Play, Hash, 
  Target, Thermometer, ShieldAlert,
  Dna, Ruler, HardDriveDownload
} from 'lucide-react';
import { MOCK_TUBING_TALLY, MOCK_INTERVENTION_REPORTS } from '../constants';
import { TubingItem, WellReport } from '../types';

const ReportsScanner: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<WellReport>(MOCK_INTERVENTION_REPORTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isValidationComplete, setIsValidationComplete] = useState(false);
  const [tally, setTally] = useState<TubingItem[]>(MOCK_TUBING_TALLY);
  const [hoveredJoint, setHoveredJoint] = useState<number | null>(null);

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
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="flex flex-col h-full space-y-3 p-4 bg-slate-900/40 border border-emerald-900/30 rounded-lg transition-all relative overflow-hidden font-terminal">
      
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

        <button 
          onClick={triggerScan}
          disabled={isScanning}
          className={`flex items-center space-x-2 px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all ${isScanning ? 'bg-orange-500/20 text-orange-500 cursor-wait' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`}
        >
          {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          <span>Audit_DDR_Schema</span>
        </button>
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
                <thead className="sticky top-0 bg-slate-950/90 z-10">
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
                      className={`group transition-all ${item.status === 'DISCREPANT' ? 'bg-red-500/10 text-red-400' : 'bg-slate-900/40 hover:bg-emerald-500/5 text-emerald-600'}`}
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
        <div className="w-64 bg-slate-950/90 border border-emerald-900/30 rounded-xl p-4 flex flex-col relative shadow-2xl">
           <div className="flex items-center justify-between mb-4 border-b border-emerald-900/20 pb-2">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Well_Schematic</span>
              <Target size={14} className="text-emerald-700" />
           </div>

           <div className="flex-1 bg-slate-900/20 rounded border border-emerald-900/10 flex flex-col items-center relative py-6">
              {/* Vertical Schematic SVG */}
              <svg width="60" height="100%" className="opacity-80">
                <rect x="15" y="0" width="30" height="100%" fill="none" stroke="#064e3b" strokeWidth="1" strokeDasharray="4 2" />
                
                {tally.map((item, idx) => {
                  const yStart = (item.cumulative_m - item.length_m) * 5; 
                  const height = item.length_m * 5;
                  const isHovered = hoveredJoint === item.id;
                  
                  return (
                    <g key={item.id} className="transition-all duration-300">
                      <rect 
                        x="18" 
                        y={yStart} 
                        width="24" 
                        height={height} 
                        fill={item.status === 'DISCREPANT' ? '#ef444433' : (isHovered ? '#10b98144' : '#10b98111')}
                        stroke={item.status === 'DISCREPANT' ? '#ef4444' : (isHovered ? '#ffffff' : '#10b98144')}
                        strokeWidth={isHovered ? 2 : 1}
                      />
                      {isHovered && (
                        <line x1="45" y1={yStart + height/2} x2="55" y2={yStart + height/2} stroke="#ffffff" strokeWidth="1" />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Dynamic Overlay HUD on Schematic */}
              <div className="absolute top-0 right-2 bottom-0 flex flex-col justify-between py-2 pointer-events-none">
                 <span className="text-[7px] text-emerald-900 font-black">0.00m</span>
                 <span className="text-[7px] text-emerald-900 font-black">50.00m</span>
              </div>
           </div>

           <div className="mt-4 p-3 bg-slate-900/60 rounded border border-emerald-900/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-emerald-900">Pressure_Grade:</span>
                <ShieldAlert size={12} className="text-emerald-500" />
              </div>
              <div className="flex items-center space-x-1">
                 {[...Array(8)].map((_, i) => (
                   <div key={i} className={`h-1 flex-1 rounded-full ${i < 6 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                 ))}
              </div>
              <div className="text-[8px] text-center text-emerald-700 font-mono">10,000 PSI RATING</div>
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
               <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
               <div className="w-1 h-1 bg-emerald-500 rounded-full opacity-50"></div>
               <div className="w-1 h-1 bg-emerald-500 rounded-full opacity-20"></div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default ReportsScanner;
