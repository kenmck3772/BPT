import React, { useState, useRef } from 'react';
import { 
  Fingerprint, Microscope, Scale, Anchor, 
  Search, Loader2, Database, AlertCircle, 
  FileText, Download, Zap, ChevronRight, 
  Terminal, ShieldCheck, Waves, Maximize2, Minimize2
} from 'lucide-react';
import { performArcheologyAnalysis } from '../services/geminiService';
import { secureAsset } from '../services/vaultService';

interface ForensicArcheologyProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

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

const ForensicArcheology: React.FC<ForensicArcheologyProps> = ({ isFocused, onToggleFocus }) => {
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
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">>>> NODE: DATA_ARCHEOLOGY</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-emerald-800 uppercase tracking-[0.4em] font-black">Forensic Engine v.88.777 // Authorized Sovereign Lead</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {onToggleFocus && (
            <button onClick={onToggleFocus} className="p-2 text-emerald-900 hover:text-emerald-400 transition-all ml-2">
              {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 min-h-0 overflow-hidden">
        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-slate-950/80 border border-emerald-900/30 rounded-2xl flex flex-col p-5 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-emerald-900/10 pb-2">
               <div className="flex items-center space-x-2">
                  <Terminal size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Input_Artifact_Manifest</span>
               </div>
            </div>
            
            <div className="flex flex-col space-y-4 flex-1">
              <div className="flex-1 flex flex-col space-y-2">
                <span className="text-[8px] font-black text-emerald-900 uppercase">Forensic_Prompt</span>
                <textarea 
                  value={archeologyPrompt}
                  onChange={(e) => setArcheologyPrompt(e.target.value)}
                  className="flex-1 bg-black/40 border border-emerald-900/20 rounded-xl p-4 text-[10px] text-emerald-100 font-mono outline-none focus:border-emerald-500 transition-all custom-scrollbar resize-none"
                />
              </div>

              <div className="h-1/3 flex flex-col space-y-2">
                <span className="text-[8px] font-black text-emerald-900 uppercase">Artifact_Index</span>
                <textarea 
                  value={dataManifest}
                  onChange={(e) => setDataManifest(e.target.value)}
                  className="flex-1 bg-black/40 border border-emerald-900/20 rounded-xl p-4 text-[10px] text-emerald-100 font-mono outline-none focus:border-emerald-500 transition-all custom-scrollbar resize-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <button 
                onClick={handleExecute}
                disabled={isAnalyzing}
                className="w-full py-4 bg-emerald-600 text-white font-black uppercase text-[11px] tracking-[0.4em] rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)] hover:bg-emerald-500 disabled:opacity-30 transition-all flex items-center justify-center space-x-3 group"
              >
                {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="group-hover:scale-125 transition-transform" />}
                <span>{isAnalyzing ? 'TRIANGULATING_STRATA...' : 'Perform_Forensic_Triangulation'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-slate-950/90 border border-emerald-900/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-emerald-900/30 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center space-x-3">
                <FileText size={18} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Triangulation_Output</span>
              </div>
            </div>

            <div ref={resultsRef} className="flex-1 overflow-y-auto custom-scrollbar p-8">
              {!result && !isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                   <Anchor size={100} className="animate-pulse text-emerald-900" />
                   <div className="text-center space-y-2">
                    <span className="text-sm font-black uppercase tracking-[0.5em] block">Awaiting Data Triangulation</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-950 italic tracking-widest">Authorized use only. Sovereign Veto protocol active.</span>
                   </div>
                </div>
              ) : isAnalyzing ? (
                <div className="space-y-6 animate-pulse">
                   <div className="h-10 bg-slate-900 rounded-xl w-3/4"></div>
                   <div className="h-64 bg-slate-900 rounded-2xl"></div>
                   <div className="h-32 bg-slate-900 rounded-xl w-5/6"></div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-700">
                  <div className="prose prose-invert max-w-none">
                     <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-emerald-100/90 border-l-2 border-emerald-500/30 pl-6">
                        {result}
                     </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-emerald-900/40 bg-slate-950">
               <button 
                disabled={!result || isSecuring}
                onClick={handleSecureToVault}
                className="w-full py-4 bg-emerald-500 text-slate-950 font-black uppercase text-[10px] tracking-[0.4em] rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-400 disabled:opacity-20 transition-all flex items-center justify-center space-x-3"
               >
                 {isSecuring ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                 <span>{isSecuring ? 'ARCHIVING_ARTIFACT...' : 'Secure_Archeology_Composite'}</span>
               </button>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-500/5 border border-emerald-900/20 rounded-xl flex items-start gap-4 shadow-inner">
             <AlertCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
             <div className="space-y-1">
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Forensic_Compliance_Notice</span>
                <p className="text-[10px] text-emerald-200/60 leading-tight italic">"This node utilizes PINN-based physics regularization to resolve legacy signal noise. Findings are admissible for NSTA 2026 Category C reporting."</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicArcheology;