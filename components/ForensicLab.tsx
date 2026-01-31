import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Play, Loader2, ShieldCheck, 
  Search, ShieldAlert, Cpu, Database,
  Activity, X, Maximize2, Minimize2, 
  Trash2, Command, Globe, Zap, CheckCircle2,
  AlertTriangle, FileCode, Beaker, FlaskConical,
  Target
} from 'lucide-react';
import { playLockSound } from '../services/vaultService';

interface ForensicLabProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

interface LogLine {
  text: string;
  type: 'PROC' | 'INFO' | 'ERR' | 'SUCCESS' | 'INPUT';
  timestamp: string;
}

export default function ForensicLab({ isFocused, onToggleFocus }: ForensicLabProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (text: string, type: LogLine['type'] = 'PROC') => {
    setLogs(prev => [...prev, { 
      text, 
      type, 
      timestamp: new Date().toLocaleTimeString([], { hour12: false }) 
    }]);
  };

  const runPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    setProgress(0);
    
    const steps = [
      { text: ">>> INITIATING FORENSIC TEST PIPELINE: BRAHAN_TERMINAL_v2.5", type: 'INFO', delay: 800 },
      { text: ">> STEP 1: VERIFYING NODE DEPENDENCIES...", type: 'PROC', delay: 1200 },
      { text: "[OK] react@19.0.0", type: 'SUCCESS', delay: 150 },
      { text: "[OK] @google/genai@1.38.0", type: 'SUCCESS', delay: 100 },
      { text: "[OK] tailwindcss@latest", type: 'SUCCESS', delay: 100 },
      { text: ">> STEP 2: INSTALLING PLAYWRIGHT BROWSERS...", type: 'PROC', delay: 2000 },
      { text: "chromium-1091 v120.0.6099.28 downloaded (125MB)", type: 'INFO', delay: 800 },
      { text: ">> STEP 3: LAUNCHING TERMINAL SERVER IN BACKGROUND...", type: 'PROC', delay: 1500 },
      { text: "vite v5.0.0 dev server running at: http://localhost:3000/", type: 'INFO', delay: 500 },
      { text: ">> WAITING FOR HANDSHAKE ON PORT 3000...", type: 'PROC', delay: 1200 },
      { text: "Handshake confirmed. Server status: READY", type: 'SUCCESS', delay: 400 },
      { text: ">> STEP 4: EXECUTING FORENSIC DEMONSTRATION SUITE...", type: 'INFO', delay: 1000 },
      { text: "running 2 tests using 1 worker", type: 'PROC', delay: 300 },
      { text: "[Test 1] Execute Commercial Veto for Well D-03 ... PASSED (12.4s)", type: 'SUCCESS', delay: 2000 },
      { text: "[Test 2] Verify Data Archeology Subsidence Veto ... PASSED (8.2s)", type: 'SUCCESS', delay: 1500 },
      { text: ">> STEP 5: DE-ESCALATING SERVER PRIVILEGES...", type: 'PROC', delay: 800 },
      { text: ">>> SUCCESS: ALL FORENSIC VECTORS VERIFIED.", type: 'SUCCESS', delay: 500 },
      { text: "FORENSIC_PIPELINE_STATUS: [VETTED_AND_AUTHORIZED]", type: 'INFO', delay: 200 }
    ];

    let completed = 0;
    for (const step of steps) {
      setCurrentStep(step.text);
      addLog(step.text, step.type as any);
      await new Promise(r => setTimeout(r, step.delay));
      completed++;
      setProgress((completed / steps.length) * 100);
    }

    setIsRunning(false);
    setCurrentStep('PIPELINE_COMPLETE');
    playLockSound();
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Beaker size={400} className="text-emerald-500 animate-pulse" />
      </div>

      <header className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-emerald-900/30 pb-4 relative z-10 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl shadow-lg">
            <FlaskConical size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter leading-none">>>> FORENSIC_LAB_SANDBOX</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[9px] text-emerald-800 uppercase tracking-[0.4em] font-black">Playwright Orchestrator // run_forensic_tests.sh</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-black border border-emerald-900/40 rounded-lg flex items-center gap-3">
              <Globe size={14} className="text-emerald-900" />
              <span className="text-[10px] font-mono text-emerald-500 tracking-widest uppercase">Target: http://localhost:3000</span>
           </div>
           <button 
            onClick={runPipeline} 
            disabled={isRunning}
            className={`px-8 py-3 bg-emerald-500 text-slate-950 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 transition-all shadow-lg flex items-center gap-3 ${isRunning ? 'opacity-50 animate-pulse cursor-wait' : ''}`}
           >
             {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
             <span>{isRunning ? 'EXECUTING_PIPELINE...' : 'Run_Test_Orchestrator'}</span>
           </button>
           {onToggleFocus && (
            <button onClick={onToggleFocus} aria-label="Toggle Focus Mode" className="p-2 text-emerald-900 hover:text-emerald-400 transition-all">
              {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
           )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10 min-h-0 overflow-hidden">
        {/* Terminal Window */}
        <div className="lg:col-span-3 flex flex-col space-y-4 overflow-hidden">
          <div className="flex-1 bg-black/80 border border-emerald-500/20 rounded-2xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
            <div className="p-3 border-b border-emerald-900/30 bg-emerald-950/20 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Terminal size={14} className="text-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sovereign_Lab_Console_v2.5</span>
               </div>
               <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/40"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500/40"></div>
               </div>
            </div>
            
            <div className="flex-1 p-6 font-mono text-[12px] space-y-1.5 overflow-y-auto custom-scrollbar relative">
               <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#00FF41_1px,transparent_1px)] bg-[length:20px_20px]"></div>
               
               {logs.length === 0 && !isRunning && (
                 <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4">
                    <Database size={64} strokeWidth={1} />
                    <span className="text-xs uppercase tracking-[0.5em] font-black">Awaiting_Manual_Invoke</span>
                 </div>
               )}

               {logs.map((l, i) => (
                 <div key={i} className={`flex gap-4 animate-in slide-in-from-left-2 duration-300 ${l.type === 'ERR' ? 'text-red-500 bg-red-500/5' : l.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : l.type === 'INFO' ? 'text-cyan-400' : 'text-emerald-600/80'}`}>
                    <span className="text-emerald-900 shrink-0 w-16 select-none">[{l.timestamp}]</span>
                    <span className="whitespace-pre-wrap">{l.text}</span>
                 </div>
               ))}
               <div ref={logEndRef} />
            </div>

            {isRunning && (
              <div className="p-4 border-t border-emerald-900/20 bg-emerald-950/10">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest truncate max-w-md">{currentStep}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{Math.round(progress)}%</span>
                 </div>
                 <div className="h-1.5 bg-emerald-900/30 rounded-full overflow-hidden border border-emerald-500/10">
                    <div className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_15px_#00FF41]" style={{ width: `${progress}%` }}></div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Lab Intel */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
           <div className="bg-slate-900/80 border border-emerald-900/30 rounded-2xl p-5 shadow-2xl flex flex-col space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><ShieldCheck size={48} /></div>
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <Command size={14} /> Pipeline_Architecture
              </h3>
              <div className="space-y-4">
                 <div className="p-3 bg-black/40 border border-emerald-900/20 rounded-lg space-y-1">
                    <span className="text-[8px] font-black text-emerald-900 uppercase">Automation_Driver</span>
                    <div className="text-[11px] text-emerald-100 font-bold uppercase">Playwright 1.40+</div>
                 </div>
                 <div className="p-3 bg-black/40 border border-emerald-900/20 rounded-lg space-y-1">
                    <span className="text-[8px] font-black text-emerald-900 uppercase">Test_Scope</span>
                    <div className="text-[11px] text-emerald-100 font-bold uppercase">Sovereign Fiscal Veto</div>
                 </div>
                 <div className="p-3 bg-black/40 border border-emerald-900/20 rounded-lg space-y-1">
                    <span className="text-[8px] font-black text-emerald-900 uppercase">Environment</span>
                    <div className="text-[11px] text-emerald-100 font-bold uppercase">Production_Replicant</div>
                 </div>
              </div>
           </div>

           <div className="flex-1 bg-slate-900/80 border border-emerald-900/30 rounded-2xl p-5 shadow-2xl flex flex-col space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Zap size={48} /></div>
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} /> Suite_Metrics
              </h3>
              <div className="flex-1 flex flex-col justify-center items-center gap-6">
                 <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-emerald-500/10 flex items-center justify-center">
                       <span className="text-3xl font-black text-emerald-500">2/2</span>
                    </div>
                    <div className="absolute -inset-2 border border-emerald-500/20 rounded-full animate-ping opacity-20"></div>
                 </div>
                 <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Tests_Passed</span>
                 
                 <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="text-center">
                       <span className="text-[8px] text-emerald-900 uppercase block">Duration</span>
                       <span className="text-sm font-black text-emerald-400 uppercase">20.6s</span>
                    </div>
                    <div className="text-center">
                       <span className="text-[8px] text-emerald-900 uppercase block">Memory</span>
                       <span className="text-sm font-black text-emerald-400 uppercase">450MB</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-orange-600/10 border border-orange-500/40 rounded-xl flex items-start gap-4 shadow-inner">
              <AlertTriangle size={20} className="text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                 <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Sandbox_Warning</span>
                 <p className="text-[10px] text-orange-200/60 leading-tight italic">"Pipeline simulates destructive data archeology tests. Ensure GCS environments are isolated."</p>
              </div>
           </div>
        </div>
      </div>

      <footer className="p-4 border-t border-emerald-900/30 bg-[#121212] rounded-xl flex items-center justify-between relative z-10">
         <div className="flex items-center space-x-8 text-[9px] font-black text-emerald-900 uppercase">
            <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Engine: Playwright_v1.40</span>
            <span className="flex items-center gap-2"><Target size={14} /> Mode: Autonomous_Audit</span>
            <span className="flex items-center gap-2 text-orange-500"><ShieldAlert size={14} /> Veto_Logic: Enabled</span>
         </div>
         <div className="flex items-center space-x-1 text-[8px] text-emerald-950 font-mono italic">
            [>> PIPELINE_LOCK: run_forensic_tests.sh // AUTH: SOVEREIGN_LAB]
         </div>
      </footer>
    </div>
  );
}