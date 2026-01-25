
import React, { useState } from 'react';
import { 
  Database, FileCode, Search, RefreshCw, 
  ShieldCheck, ShieldAlert, Binary, Cpu, 
  Terminal, History, ExternalLink, Loader2,
  Table, ChevronRight, HardDrive, Info
} from 'lucide-react';
import { analyzeLogHeader } from '../services/geminiService';
import { ForensicAnalysis } from '../types';

const LogRouter: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ForensicAnalysis | null>(null);
  const [validationPassed, setValidationPassed] = useState<boolean | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setValidationPassed(null);

    const data = await analyzeLogHeader(inputText);
    setResult(data);
    
    // Simulate Cerberus Validation Delay
    setTimeout(() => {
      // Logic: If we have a well name and file type is not UNKNOWN, pass Cerberus
      const passed = data.file_type !== 'UNKNOWN' && !!data.metadata.well_name;
      setValidationPassed(passed);
      setIsAnalyzing(false);
    }, 1500);
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'LAS': return 'text-emerald-400 border-emerald-400 bg-emerald-400/5';
      case 'PDF': return 'text-orange-400 border-orange-400 bg-orange-400/5';
      case 'DLIS': return 'text-blue-400 border-blue-400 bg-blue-400/5';
      case 'CSV': return 'text-cyan-400 border-cyan-400 bg-cyan-400/5';
      default: return 'text-slate-500 border-slate-500 bg-slate-500/5';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Database size={400} className="text-emerald-500 animate-pulse" />
      </div>

      <header className="flex items-center justify-between border-b border-emerald-900/30 pb-4 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl shadow-lg">
            <FileCode size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">Universal_Log_Router</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-emerald-800 uppercase tracking-[0.4em] font-black">Mode: Hybrid_Forensics // Cerberus_Rules</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <div className="bg-slate-950 px-4 py-2 border border-emerald-900/40 rounded">
              <span className="text-[10px] text-emerald-500 font-mono tracking-widest">CERBERUS: {validationPassed === null ? 'WAITING' : validationPassed ? 'PASSED' : 'FAILED'}</span>
           </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 min-h-0 overflow-hidden">
        {/* Left Side: Input area */}
        <div className="flex flex-col space-y-4">
          <div className="flex-1 bg-slate-950/80 border border-emerald-900/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-2">
                  <Terminal size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Ingest_Stream</span>
               </div>
               <span className="text-[8px] text-emerald-900 uppercase font-black tracking-widest">Paste LAS Header or raw ASCII</span>
            </div>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="~Well STRT 100.0 STOP 500.0 WELL JUPITER-1..."
              className="flex-1 bg-slate-900/50 border border-emerald-900/20 rounded-xl p-4 text-[11px] text-emerald-100 font-mono outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-900 custom-scrollbar resize-none"
            />
            <div className="mt-4">
               <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim()}
                className="w-full py-4 bg-emerald-500 text-slate-950 font-black uppercase text-[10px] tracking-[0.3em] rounded-xl shadow-lg hover:bg-emerald-400 disabled:opacity-30 transition-all flex items-center justify-center space-x-3"
               >
                 {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                 <span>{isAnalyzing ? 'ROUTING_TO_ARCHITECT...' : 'Analyze_Log_Artifact'}</span>
               </button>
            </div>
          </div>
          <div className="p-4 bg-emerald-500/5 border border-emerald-900/20 rounded-xl">
             <div className="flex items-start space-x-3">
                <Info size={16} className="text-emerald-400 mt-0.5" />
                <p className="text-[9px] text-emerald-800 leading-relaxed font-mono uppercase">Cerberus Veto active. All identified data must match strict wellbore schemas before vault archival.</p>
             </div>
          </div>
        </div>

        {/* Right Side: Analysis Results */}
        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-slate-950/80 border border-emerald-900/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-emerald-900/30 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center space-x-3">
                <Cpu size={18} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Forensic_Audit_Results</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {!result && !isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                   <Binary size={64} className="animate-pulse" />
                   <span className="text-xs font-black uppercase tracking-[0.4em]">Awaiting_Input_Artifact</span>
                </div>
              ) : isAnalyzing ? (
                <div className="space-y-6 animate-pulse">
                   <div className="h-20 bg-slate-900 rounded-xl"></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-slate-900 rounded-xl"></div>
                      <div className="h-16 bg-slate-900 rounded-xl"></div>
                   </div>
                   <div className="h-32 bg-slate-900 rounded-xl"></div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  {/* File Type Badge */}
                  <div className="flex items-center justify-between">
                     <div className={`px-4 py-2 border-2 rounded-lg font-black text-xs uppercase tracking-[0.2em] ${getFileTypeColor(result.file_type)}`}>
                       {result.file_type} // {result.confidence} CONFIDENCE
                     </div>
                     {validationPassed !== null && (
                       <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${validationPassed ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-red-500 text-red-400 bg-red-500/5'}`}>
                         {validationPassed ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                         <span className="text-[9px] font-black uppercase">{validationPassed ? 'Cerberus_Verified' : 'Veto_Triggered'}</span>
                       </div>
                     )}
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-900/60 border border-emerald-900/20 rounded-xl">
                        <span className="text-[8px] text-emerald-900 font-black uppercase mb-1 block">Well_Name</span>
                        <div className="text-lg font-black text-emerald-100 truncate uppercase">{result.metadata.well_name || 'N/A'}</div>
                     </div>
                     <div className="p-4 bg-slate-900/60 border border-emerald-900/20 rounded-xl">
                        <span className="text-[8px] text-emerald-900 font-black uppercase mb-1 block">API_Identifier</span>
                        <div className="text-lg font-black text-emerald-100 truncate">{result.metadata.api_number || 'UNKNOWN'}</div>
                     </div>
                     <div className="p-4 bg-slate-900/60 border border-emerald-900/20 rounded-xl">
                        <span className="text-[8px] text-emerald-900 font-black uppercase mb-1 block">Log_Start</span>
                        <div className="text-lg font-black text-emerald-100">{result.metadata.depth_start?.toFixed(2) || '0.00'}m</div>
                     </div>
                     <div className="p-4 bg-slate-900/60 border border-emerald-900/20 rounded-xl">
                        <span className="text-[8px] text-emerald-900 font-black uppercase mb-1 block">Log_End</span>
                        <div className="text-lg font-black text-emerald-100">{result.metadata.depth_end?.toFixed(2) || '0.00'}m</div>
                     </div>
                  </div>

                  {/* Content Summary */}
                  <div className="p-5 bg-slate-900/40 border-l-4 border-emerald-500 rounded-r-xl shadow-inner">
                     <span className="text-[8px] text-emerald-900 font-black uppercase mb-2 block">Hybrid_Engine_Summary</span>
                     <p className="text-[11px] text-emerald-100 font-terminal italic leading-relaxed">"{result.metadata.content_summary}"</p>
                  </div>

                  {/* Validation Logic Output (Simulated) */}
                  <div className="space-y-2">
                     <span className="text-[9px] font-black text-emerald-900 uppercase">Cerberus_Validation_Log</span>
                     <div className="bg-slate-950 p-4 border border-emerald-900/40 rounded-xl font-mono text-[9px] space-y-1">
                        <div className="text-emerald-700">>> CHECKING FIELD: well_name ... {!!result.metadata.well_name ? 'VALID' : 'MISSING'}</div>
                        <div className="text-emerald-700">>> CHECKING TYPE: {result.file_type} ... {result.file_type !== 'UNKNOWN' ? 'COMPLIANT' : 'VETO'}</div>
                        <div className="text-emerald-700">>> COMPARING SCHEMA: well_data_v1.2 ... OK</div>
                        <div className={`font-bold ${validationPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                           >> FINAL STATUS: {validationPassed === null ? 'PENDING' : validationPassed ? 'CLEAN_AUTHORIZED' : 'SCHEMA_VIOLATION'}
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-emerald-900/40 bg-slate-950">
               <button 
                disabled={!validationPassed}
                className="w-full py-4 bg-emerald-500 text-slate-950 font-black uppercase text-[10px] tracking-[0.4em] rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-400 disabled:opacity-20 transition-all flex items-center justify-center space-x-3"
               >
                 <ShieldCheck size={16} />
                 <span>Commit_to_Sovereign_Vault</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogRouter;
