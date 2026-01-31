
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Cpu, Zap, Terminal, ChevronRight, Lock, 
  Maximize, Minimize, Volume2, VolumeX, Activity,
  AlertTriangle, Binary, Radio, Power, ShieldAlert
} from 'lucide-react';
import { playLockSound } from '../services/vaultService';

interface SovereignManifestoProps {
  onAcknowledge: () => void;
}

const MANIFESTO_LINES = [
  ">>> INITIATING BRAHAN_SOVEREIGN_PROTOCOL_V88",
  ">>> SUBJECT: DATA INTEGRITY AND FISCAL RECOVERY",
  "-----------------------------------------------",
  "THE NORTH SEA TRANSITION AUTHORITY (NSTA) HAS",
  "IDENTIFIED A DECOMMISSIONING DEFICIT OF 153 WELLS.",
  "LEGACY OPERATORS REPORT FAILURES BASED ON",
  "MIGRATED METADATA DECAY.",
  "",
  "WE REJECT THE 'DIGITAL ABYSS'.",
  "WE RECOVER THE 'EYERUNE TRUTH'.",
  "",
  "BY RECONCILING 1970s HANDWRITTEN ARTIFACTS",
  "AGAINST MODERN DIGITAL ASSUMPTIONS, WE IDENTIFY",
  "UNTAPPED RESERVOIRS AND STRUCTURAL MISDIAGNOSES.",
  "",
  "EVERY SHIFT IN VERTICAL DATUM IS A DISCREPANCY.",
  "EVERY UNREADABLE HEAT ID IS AN IGNORANCE TAX.",
  "EVERY THERMAL PULSE IS A VETO TRIGGER.",
  "",
  "HANDSHAKE REQUIRED TO ESTABLISH UPLINK.",
  "-----------------------------------------------"
];

const SovereignManifesto: React.FC<SovereignManifestoProps> = ({ onAcknowledge }) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [entropy, setEntropy] = useState('0.9942');
  const [bootProgress, setBootProgress] = useState(0);
  const [showSweep, setShowSweep] = useState(true);

  useEffect(() => {
    // Timer to stop the "dropping lines" (sweep-scan animation) after 5 seconds
    const sweepTimer = setTimeout(() => {
      setShowSweep(false);
    }, 5000);

    return () => clearTimeout(sweepTimer);
  }, []);

  useEffect(() => {
    if (visibleLines < MANIFESTO_LINES.length) {
      const timer = setTimeout(() => {
        setVisibleLines(prev => prev + 1);
        if (!isMuted && Math.random() > 0.9) playLockSound();
        setBootProgress(Math.floor((visibleLines / MANIFESTO_LINES.length) * 100));
        setEntropy((Math.random() * 0.01 + 0.99).toFixed(4));
      }, 40); 
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      setBootProgress(100);
    }
  }, [visibleLines, isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  const handleSkip = () => {
    setVisibleLines(MANIFESTO_LINES.length);
    setIsTyping(false);
    setBootProgress(100);
    if (!isMuted) playLockSound();
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black flex flex-col items-center justify-center p-4 font-terminal overflow-hidden select-none">
       {/* Global Terminal Control Bar */}
       <div className="fixed top-0 inset-x-0 h-16 border-b border-emerald-500/20 bg-black/80 backdrop-blur-md flex items-center justify-between px-8 z-[3100] animate-in slide-in-from-top-full duration-500">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Node_Status: Sovereign_Landing</span>
             </div>
             <div className="h-6 w-px bg-emerald-900/30"></div>
             <div className="hidden md:flex items-center gap-4 text-[9px] text-emerald-900 font-black uppercase">
                <span className="flex items-center gap-1.5"><Activity size={10} /> {entropy} SIGMA</span>
                <span className="flex items-center gap-1.5"><Cpu size={10} /> KERNEL_88.7</span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={handleSkip}
                className="px-4 py-1.5 border border-emerald-900/40 rounded text-[9px] font-black text-emerald-700 uppercase hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
             >
                Bypass_Boot
             </button>
             <div className="h-6 w-px bg-emerald-900/30"></div>
             <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-lg border transition-all ${isMuted ? 'text-red-500 bg-red-500/10 border-red-500/30' : 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'}`}
                title={isMuted ? "Unmute Sound" : "Mute Sound"}
             >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
             </button>
             <button 
                onClick={toggleFullscreen}
                className="p-2 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-all flex items-center gap-2 group"
                title="Toggle Full Screen"
             >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline group-hover:text-emerald-300">Fullscreen_Toggle</span>
             </button>
             <div className="h-6 w-px bg-emerald-900/30"></div>
             <button className="p-2 text-emerald-900 hover:text-red-500 transition-colors">
                <Power size={20} />
             </button>
          </div>
       </div>

       {/* Ambient Visuals */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00FF41 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
       {showSweep && (
         <div className="absolute inset-x-0 h-1 bg-emerald-500/10 shadow-[0_0_15px_#00FF41] animate-sweep-scan pointer-events-none z-10"></div>
       )}
       
       <div className="w-full max-w-3xl bg-slate-950/95 border-2 border-emerald-500/40 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,255,65,0.2)] flex flex-col relative overflow-hidden pointer-events-auto animate-crt-flicker mt-12">
          
          {/* Forensic Audit Mode Statement Banner */}
          <div className="bg-red-950/20 border-b border-red-500/30 p-4 flex items-center gap-4 relative overflow-hidden">
             <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
             <ShieldAlert size={20} className="text-red-500 shrink-0" />
             <p className="text-[10px] md:text-[11px] font-black text-red-400 leading-tight uppercase tracking-tight">
               TERMINAL STATUS: FORENSIC AUDIT MODE. NOTICE: THIS ENGINE IS A DATA NOTARY ONLY. DECISION-MAKING IS RESERVED FOR QUALIFIED HUMAN OPERATORS. DUAL-SIGNATURE VERIFICATION REQUIRED FOR EXPORT.
             </p>
          </div>

          <div className="p-10 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-6 mb-8 border-b border-emerald-900/30 pb-6 relative">
               <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl shadow-[0_0_20px_#00FF41]">
                  <Shield size={32} className="text-emerald-400 animate-pulse" />
               </div>
               <div>
                  <h1 className="text-2xl font-black text-emerald-400 uppercase tracking-[0.5em] leading-none">Brahan_Terminal</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-widest block">Core Manifesto // Restricted</span>
                    <div className="h-4 w-px bg-emerald-900/20"></div>
                    <div className="flex items-center gap-1 text-[9px] text-blue-500 font-mono">
                      <Binary size={10} /> {entropy}
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed space-y-1 pr-4 min-h-[250px] border-l border-emerald-900/10 pl-6">
               {MANIFESTO_LINES.slice(0, visibleLines).map((line, i) => (
                 <div key={i} className={`animate-in fade-in slide-in-from-left-2 duration-300 ${line.startsWith('>>>') ? 'text-emerald-400 font-black' : 'text-emerald-600/80'}`}>
                   {line || <br/>}
                 </div>
               ))}
               {isTyping && <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-1 align-middle"></span>}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
               <div className="p-3 bg-black/40 border border-emerald-900/20 rounded-xl space-y-1.5">
                  <span className="text-[8px] font-black text-emerald-900 uppercase tracking-widest">Protocol_Integrity</span>
                  <div className="flex items-center gap-2">
                     <Shield size={12} className="text-emerald-500" />
                     <div className="h-1 flex-1 bg-emerald-900/30 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${bootProgress}%` }}></div>
                     </div>
                  </div>
               </div>
               <div className="p-3 bg-black/40 border border-emerald-900/20 rounded-xl space-y-1.5">
                  <span className="text-[8px] font-black text-emerald-900 uppercase tracking-widest">Acoustic_Link</span>
                  <div className="flex items-center gap-2">
                     <Radio size={12} className={isTyping ? 'text-orange-500 animate-pulse' : 'text-emerald-500'} />
                     <span className="text-[10px] font-mono text-emerald-100">{isTyping ? 'Synchronizing...' : 'Sovereign_Locked'}</span>
                  </div>
               </div>
            </div>

            <div className={`mt-10 pt-6 border-t border-emerald-900/30 transition-all duration-700 ${isTyping ? 'opacity-30' : 'opacity-100'}`}>
               <button 
                  onClick={onAcknowledge}
                  disabled={isTyping}
                  className={`w-full py-5 bg-emerald-500 text-slate-950 font-black uppercase text-xs tracking-[0.4em] rounded-xl shadow-[0_0_30px_rgba(0,255,65,0.4)] transition-all flex items-center justify-center gap-4 group relative overflow-hidden ${isTyping ? 'cursor-not-allowed grayscale opacity-50' : 'hover:bg-emerald-400 hover:scale-[1.02] active:scale-95'}`}
               >
                  {!isTyping && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan-horizontal pointer-events-none"></div>}
                  <Lock size={18} />
                  <span>Establish_Sovereign_Handshake</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
               <p className="text-center text-[8px] text-emerald-900 uppercase font-black tracking-widest mt-6 flex items-center justify-center gap-3">
                  <AlertTriangle size={10} className="text-orange-500" /> Authorized Use Only // SME Verification Required (Art_14 HITL)
               </p>
            </div>
          </div>

          {/* System Heartbeat Waveform */}
          <div className="h-8 bg-black border-t border-emerald-900/30 flex items-center px-6 gap-6">
             <Activity size={12} className="text-emerald-500 animate-pulse" />
             <div className="flex-1 flex gap-1 opacity-20">
                {[...Array(40)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-emerald-500 rounded-full" 
                    style={{ 
                      height: `${Math.random() * 60 + 20}%`,
                      animation: `heartbeat-bar 1.5s ease-in-out infinite ${i * 0.05}s`
                    }}
                  ></div>
                ))}
             </div>
             <span className="text-[7px] font-mono text-emerald-900 uppercase">Buffer: {bootProgress}%</span>
          </div>
       </div>

       <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sweep-scan {
          0% { transform: translateY(-100vh); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-sweep-scan {
          animation: sweep-scan 4s linear infinite;
        }
        @keyframes crt-flicker {
          0% { opacity: 0.99; }
          5% { opacity: 0.95; }
          10% { opacity: 0.99; }
          15% { opacity: 0.97; }
          20% { opacity: 0.99; }
          100% { opacity: 1; }
        }
        .animate-crt-flicker {
          animation: crt-flicker 0.15s infinite;
        }
        @keyframes scan-horizontal {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scan-horizontal {
          animation: scan-horizontal 2s linear infinite;
        }
        @keyframes heartbeat-bar {
          0%, 100% { opacity: 0.2; transform: scaleY(1); }
          50% { opacity: 0.8; transform: scaleY(1.5); }
        }
      `}} />
    </div>
  );
};

export default SovereignManifesto;
