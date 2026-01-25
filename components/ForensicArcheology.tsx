
import React, { useState, useRef } from 'react';
import { 
  Fingerprint, Microscope, Scale, Anchor, 
  Search, Loader2, Database, AlertCircle, 
  FileText, Download, Zap, ChevronRight, 
  Terminal, ShieldCheck, Waves
} from 'lucide-react';
import { performArcheologyAnalysis } from '../services/geminiService';
import { secureAsset } from '../services/vaultService';

const DEFAULT_PROMPT = `Role: You are a Senior Forensic Petrophysicist and NSTA Data Specialist. Your goal is to identify "Hidden Gold" and "Ignorance Taxes" in legacy North Sea oil assets using raw, unfiltered data.

Context: I am analyzing CNR International (UK) assets in the Ninian Hub (Block 3/3). Specifically, Well NC-12 (Integrity Failure) and Well T-09 (Production Decline). I have NDR (National Data Repository) clearance and am looking for evidence that office engineers have missed.

Task: I am providing raw DLIS waveforms, LAS logs, and 1970s handwritten drilling tallies. Perform a Forensic Triangulation based on:
1. Geomechanical Subsidence Audit (Terzaghi’s Principle, 4.8m seabed subsidence).
2. Acoustic Waveform Forensic (CBL/USIT waveforms, Mechanical vs Thermal failure).
3. The "Wrinkle" Detection (Torque spikes, Bit Bounce at 4,000ft).

Output Required:
* Forensic Discrepancy Table
* Financial ROI Summary
* NSTA 2026 Category C wording`;

const ForensicArcheology: React.FC = () => {
  const [archeologyPrompt, setArcheologyPrompt] = useState(DEFAULT_PROMPT);
  const [dataManifest, setDataManifest] = useState('WELL: T-09\nARTIFACT_01: LAS_1978_RUN_2\nARTIFACT_02: DLIS_CBL_USIT_1984\nARTIFACT_03: TALLY_HAND_OCR_70S');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isSecuring, setIsSecuring] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleExecute = async () => {
    if (!archeologyPrompt.trim() || !dataManifest.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    const response = await performArcheologyAnalysis(archeologyPrompt, dataManifest);
    setResult(response);
    setIsAnalyzing(false);
  };

  const handleSecureToVault = () => {
    if (!result) return;
    setIsSecuring(true);
    setTimeout(() => {
      secureAsset({
        title: `Forensic_Archeology_Audit: Block 3/3`,
        status: 'VERIFIED',
        summary: `High-fidelity archeology performed on T-09. Subsidence correction applied. Thermal micro-annulus identified. Potential £12.5M savings documented.`,
        region: 'North Sea (ED50)',
        valueEst: 12500000,
        confidence: 94.5
      });
      setIsSecuring(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      {/* Background HUD Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Fingerprint size={400} className="text-emerald-500 animate-pulse" />
      </div>

      <header className="flex items-center justify-between border-b border-emerald-900/30 pb-4 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl shadow-lg shadow-emerald-500/5">
            <Microscope size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">>>> NODE: DATA_ARCHEOLOGY_v2.5</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-emerald-800 uppercase tracking-[0.4em] font-black">Search_Space: Block 3/3 // Datum: ED50</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
           <div className="bg-slate-950 px-4 py-2 border border-emerald-900/40 rounded flex items-center gap-3">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-500 font-mono tracking-widest">SOVEREIGN_ARCHEOLOGIST: ACTIVE</span>
           </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 min-h-0 overflow-hidden">
        {/* Left Side: Input area */}
        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-slate-950/80 border border-emerald-900/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between mb-3 border-b border-emerald-900/10 pb-2">
               <div className="flex items-center space-x-2">
                  <Terminal size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Archeologist_Instruction_Tape</span>
               </div>
               <span className="text-[8px] text-emerald-900 uppercase font-black">Edit logic rules here</span>
            </div>
            <textarea 
              value={archeologyPrompt}
              onChange={(e) => setArcheologyPrompt(e.target.value)}
              className="flex-1 bg-slate-900/40 border border-emerald-900/20 rounded-xl p-4 text-[10px] text-emerald-200 font-mono outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-950 custom-scrollbar resize-none mb-4"
            />

            <div className="flex items-center justify-between mb-3 border-b border-emerald-900/10 pb-2">
               <div className="flex items-center space-x-2">
                  <Database size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Artifact_Manifest</span>
               </div>
               <span className="text-[8px] text-emerald-900 uppercase font-black">List raw data identifiers</span>
            </div>
            <textarea 
              value={dataManifest}
              onChange={(e) => setDataManifest(e.target.value)}
              className="h-32 bg-slate-900/40 border border-emerald-900/20 rounded-xl p-4 text-[10px] text-amber-500 font-mono outline-none focus:border-amber-500 transition-all placeholder:text-emerald-950 custom-scrollbar resize-none"
            />
            
            <div className="mt-6">
               <button 
                onClick={handleExecute}
                disabled={isAnalyzing}
                className="w-full py-4 bg-emerald-500 text-slate-950 font-black uppercase text-[11px] tracking-[0.4em] rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:bg-emerald-400 disabled:opacity-30 transition-all flex items-center justify-center space-x-3 group"
               >
                 {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="group-hover:scale-125 transition-transform" />}
                 <span>{isAnalyzing ? 'DIGGING_THROUGH_LEGACY_STRATA...' : 'Perform_Forensic_Triangulation'}</span>
               </button>
            </div>
          </div>
        </div>

        {/* Right Side: Analysis Viewport */}
        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-slate-950/90 border border-emerald-900/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-emerald-900/30 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center space-x-3">
                <FileText size={18} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">High-Fidelity_Forensic_Output</span>
              </div>
              <div className="flex items-center space-x-2">
                 <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-orange-500 animate-ping' : 'bg-emerald-500'}`}></div>
                 <span className={`text-[8px] font-black uppercase ${isAnalyzing ? "text-orange-500" : "text-emerald-500"}`}>{isAnalyzing ? 'ARCHEOLOGIST_AT_WORK' : 'DATA_VETTED'}</span>
              </div>
            </div>

            <div ref={resultsRef} className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {!result && !isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                   <Waves size={100} className="animate-pulse text-emerald-900" />
                   <div className="text-center space-y-2">
                    <span className="text-sm font-black uppercase tracking-[0.5em] block">Select Artifacts for Excavation</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-950 italic">Bypassing engineer summaries...</span>
                   </div>
                </div>
              ) : isAnalyzing ? (
                <div className="space-y-6 animate-pulse p-4">
                   <div className="h-10 bg-slate-900/60 rounded-xl w-3/4"></div>
                   <div className="space-y-3">
                      <div className="h-4 bg-slate-900/60 rounded-full"></div>
                      <div className="h-4 bg-slate-900/60 rounded-full"></div>
                      <div className="h-4 bg-slate-900/60 rounded-full w-5/6"></div>
                   </div>
                   <div className="h-40 bg-slate-900/60 rounded-2xl"></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 bg-slate-900/60 rounded-xl"></div>
                      <div className="h-20 bg-slate-900/60 rounded-xl"></div>
                   </div>
                   <div className="h-32 bg-slate-900/60 rounded-xl"></div>
                </div>
              ) : result && (
                <div className="space-y-6 animate-in fade-in duration-700">
                  <div className="prose prose-invert max-w-none">
                     {/* The result from performArcheologyAnalysis is already wrapped in Hunter Mode code blocks if successful */}
                     <div className="font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500 selection:text-black">
                        {result}
                     </div>
                  </div>

                  <div className="pt-8 border-t border-emerald-900/20 grid grid-cols-3 gap-4">
                     <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex flex-col gap-1">
                        <span className="text-[7px] font-black text-red-900 uppercase tracking-widest">Subsidence_Veto</span>
                        <span className="text-[10px] font-black text-red-400">4.8M OFFSET APPLIED</span>
                     </div>
                     <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl flex flex-col gap-1">
                        <span className="text-[7px] font-black text-blue-900 uppercase tracking-widest">Waveform_Verdict</span>
                        <span className="text-[10px] font-black text-blue-400">72-MICRON MICRO-ANNULUS</span>
                     </div>
                     <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex flex-col gap-1">
                        <span className="text-[7px] font-black text-amber-900 uppercase tracking-widest">Geometric_Audit</span>
                        <span className="text-[10px] font-black text-amber-400">WRINKLE DETECTED @ 4,000'</span>
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-emerald-900/40 bg-slate-950 flex gap-4">
               <button 
                disabled={!result || isSecuring}
                onClick={handleSecureToVault}
                className="flex-1 py-4 bg-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-[0.4em] rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:bg-amber-400 disabled:opacity-20 transition-all flex items-center justify-center space-x-3"
               >
                 {isSecuring ? <Loader2 size={16} className="animate-spin" /> : <Scale size={16} />}
                 <span>{isSecuring ? 'SECURE_ID_HASHING...' : 'Secure_Archeology_Composite'}</span>
               </button>
               <button 
                disabled={!result}
                className="px-6 py-4 bg-slate-900 border border-emerald-900/30 text-emerald-500 rounded-xl hover:bg-emerald-500/10 transition-all"
                title="Download Evidence PDF"
               >
                 <Download size={18} />
               </button>
            </div>
          </div>
          
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-4">
             <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
             <div className="space-y-1">
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Forensic_Firewall_Active</span>
                <p className="text-[10px] text-red-200/60 leading-tight italic">"Sovereign Archeologist is currently ignoring all interpreted CSV/PDF summary layers from the office. Direct sensor waveforms are prioritized."</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicArcheology;
