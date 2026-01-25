
import React, { useState } from 'react';
import { 
  Shield, Skull, Activity, Wind, Scale, 
  Thermometer, AlertTriangle, Zap, History,
  Beaker, Gauge, Hammer, Search, Lock, Unlock,
  ChevronRight, ArrowRight, Loader2, Info, Droplets,
  Terminal, ShieldCheck
} from 'lucide-react';

const GatekeeperConsole: React.FC = () => {
  const [activeWell, setActiveWell] = useState('NINIAN-42');
  const [isAuditing, setIsAuditing] = useState(false);
  const isHunter = !document.body.classList.contains('light-theme');

  const handleAudit = () => {
    setIsAuditing(true);
    setTimeout(() => setIsAuditing(false), 2000);
  };

  const sections = [
    {
      title: "[1] CHEMISTRY & ATMOSPHERE (THE TOXIC HISTORY)",
      icon: <Beaker size={14} />,
      items: [
        { label: "H2S MAX RECORDED", val: "45 ppm (2019)", alert: true },
        { label: "SEAL COMPATIBILITY", val: "VITON (WARNING: H2S DEGRADATION RISK)", alert: true },
        { label: "HYDRATE HISTORY", val: "3 EVENTS in past 5 years.", alert: false },
        { label: "CHOKE RISK", val: "HIGH. Critical Temp Drop at 40% open.", alert: true },
        { label: "DIRECTIVE", val: "GLYCOL INJECTION MANDATORY ON STARTUP.", alert: false },
      ]
    },
    {
      title: "[2] ARTIFICIAL LIFT AUDIT (GAS LIFT MANDRELS)",
      icon: <Activity size={14} />,
      items: [
        { label: "GLM TYPE", val: "1.5\" RETRIEVABLE", alert: false },
        { label: "VALVE #3 (DEPTH: 4,500ft)", val: "DOME CHARGE (Nitrogen): 950 psi (Design)", alert: false },
        { label: "OPENING PRESSURE", val: "880 psi (Surface)", alert: false },
        { label: "CLOSING PRESSURE", val: "840 psi (Surface)", alert: false },
        { label: "DIAGNOSIS", val: "**BELLOWS FATIGUE DETECTED**", alert: true },
        { label: "STATUS", val: "VALVE IS \"MULTIPODING\" (Chattering)", alert: true },
      ]
    },
    {
      title: "[3] SUBSURFACE SAFETY (STORM CHOKES/SSCSV)",
      icon: <Shield size={14} />,
      items: [
        { label: "TYPE", val: "VELOCITY TYPE (J-STORM)", alert: false },
        { label: "BEAN SIZE", val: "12/64\"", alert: false },
        { label: "SETTING DEPTH", val: "2,000 ft", alert: false },
        { label: "CLOSURE LOGIC", val: "CLOSES IF DP > 150 psi", alert: false },
        { label: "WARNING", val: "SPRING TENSION DATA IS 8 YEARS OLD.", alert: true },
        { label: "RISK", val: "MAY NOT CLOSE ON RUPTURE.", alert: true },
      ]
    },
    {
      title: "[4] SURFACE HARDWARE & HANGER",
      icon: <Hammer size={14} />,
      items: [
        { label: "TUBING HANGER", val: "7\" x 5-1/2\"", alert: false },
        { label: "VOID TEST HISTORY", val: "PASSED (2022)", alert: false },
        { label: "PARKER/SBT LINES", val: "**CORROSION FLAGGED** ON CONTROL LINE.", alert: true },
        { label: "LEAK PATH", val: "FITTING 42-B (Hydraulic Panel).", alert: true },
        { label: "ACTION", val: "REPLACE FITTING BEFORE PRESSURE TEST.", alert: false },
      ]
    }
  ];

  const forensicExtras = [
    { label: "Scale Profile History", status: "Barium build-up at 1,200m. Kick-Over Tool latch risk.", icon: <Droplets size={12} /> },
    { label: "Annulus MAASP Check", status: "Bleed-down rate > 20 psi/hr. Tubing leak suspected.", icon: <Gauge size={12} /> },
    { label: "Sliding Side Door", status: "Seized. 1,450 days since last cycle. Shifting risk.", icon: <Scale size={12} /> },
    { label: "Control Line Delay", status: "Hysteresis curve trending +15s. Seal degradation.", icon: <History size={12} /> }
  ];

  return (
    <div className={`flex flex-col h-full space-y-4 p-6 relative overflow-hidden transition-all duration-700 ${isHunter ? 'bg-[#010409]/60 font-terminal' : 'bg-white font-sans'}`}>
      
      {/* HUD Background Decorations */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
         <Shield size={800} className={isHunter ? "text-emerald-500" : "text-blue-500"} />
      </div>

      <header className={`flex flex-col md:flex-row md:items-center justify-between border-b pb-4 relative z-10 gap-4 ${isHunter ? 'border-emerald-900/30' : 'border-slate-100'}`}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl shadow-lg transition-all ${isHunter ? 'bg-emerald-500/10 border border-emerald-500/40' : 'bg-blue-50 border border-blue-100'}`}>
            <Shield size={24} className={isHunter ? "text-emerald-400" : "text-blue-500"} />
          </div>
          <div>
            <h2 className={`text-2xl font-black uppercase tracking-tighter ${isHunter ? 'text-emerald-400' : 'text-slate-900'}`}>
              {isHunter ? '██ BRAHAN_INTEGRITY_CONSOLE [GATEKEEPER v.2] ██' : 'Well Integrity Maintenance Portal'}
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`text-[9px] uppercase tracking-[0.4em] font-black ${isHunter ? 'text-emerald-800' : 'text-slate-400'}`}>
                {isHunter ? `Target_Well: ${activeWell} // Forensic_Intervention_History` : `Selected Asset: ${activeWell} // Compliance Audit`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
           <button 
             onClick={handleAudit}
             disabled={isAuditing}
             className={`px-6 py-2.5 rounded font-black text-[10px] uppercase tracking-widest transition-all flex items-center space-x-2 ${
               isHunter 
               ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
               : 'bg-blue-600 text-white hover:bg-blue-700'
             }`}
           >
             {isAuditing ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
             <span>{isAuditing ? 'Auditing...' : 'Execute_Full_Audit'}</span>
           </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 relative z-10 min-h-0 overflow-hidden">
        
        {/* Main Terminal Output (Hunter Style) */}
        <div className="lg:col-span-3 flex flex-col space-y-4 min-h-0">
          <div className={`flex-1 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative transition-all ${isHunter ? 'bg-slate-950/90 border border-emerald-900/40' : 'bg-slate-50 border border-slate-200'}`}>
            <div className={`p-3 border-b flex items-center justify-between ${isHunter ? 'border-emerald-900/30 bg-slate-900/60' : 'bg-slate-100/50'}`}>
              <div className="flex items-center space-x-3">
                <Terminal size={14} className={isHunter ? "text-emerald-500" : "text-slate-500"} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isHunter ? "text-emerald-400" : "text-slate-600"}`}>Intervention_Autopsy_Stream</span>
              </div>
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 <span className={`text-[8px] font-black uppercase ${isHunter ? "text-red-500" : "text-red-600"}`}>Anomalies Detected</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {sections.map((section, idx) => (
                <div key={idx} className="space-y-3 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className={`flex items-center space-x-2 border-b pb-1 ${isHunter ? 'border-emerald-900/20' : 'border-slate-200'}`}>
                     {section.icon}
                     <span className={`text-[11px] font-black uppercase tracking-wider ${isHunter ? 'text-emerald-500' : 'text-slate-900'}`}>{section.title}</span>
                  </div>
                  <div className="space-y-1.5 pl-4">
                     {section.items.map((item, i) => (
                       <div key={i} className="flex flex-col sm:flex-row sm:items-start group">
                          <span className={`w-40 text-[9px] font-bold uppercase shrink-0 ${isHunter ? 'text-emerald-800 group-hover:text-emerald-600' : 'text-slate-400'}`}>&gt; {item.label}:</span>
                          <span className={`text-[10px] ${item.alert ? (isHunter ? 'text-red-500 font-black' : 'text-red-600 font-bold') : (isHunter ? 'text-emerald-100' : 'text-slate-700')}`}>
                            {item.val}
                          </span>
                       </div>
                     ))}
                  </div>
                </div>
              ))}
              
              {/* Recommendation Box */}
              <div className={`mt-8 p-5 border-2 rounded-xl transition-all duration-500 ${isHunter ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <div className="flex items-center space-x-3 mb-2">
                   <Skull size={18} className={isHunter ? "animate-pulse" : ""} />
                   <span className="text-[12px] font-black uppercase tracking-[0.2em]">[PREDICTION_MATRIX]</span>
                </div>
                <div className="text-[14px] font-black font-terminal tracking-tight">
                  85% CHANCE OF WIRELINE GETTING STUCK AT GLM #3.
                </div>
                <div className="mt-2 text-[10px] uppercase font-black tracking-widest opacity-80">
                  RECOMMENDATION: RUN DUMMY VALVE FIRST. EXECUTE ACID PRE-FLUSH TO CLEAR SCALE.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Specialized Audits */}
        <div className="flex flex-col space-y-4">
           <div className={`p-5 rounded-2xl border flex flex-col space-y-4 shadow-xl ${isHunter ? 'bg-slate-950/80 border-emerald-900/30' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center ${isHunter ? 'text-emerald-400' : 'text-slate-900'}`}>
                <Activity size={14} className="mr-2" /> Mechanical_Traces
              </h3>
              <div className="space-y-3">
                 {forensicExtras.map((extra, i) => (
                   <div key={i} className={`p-3 rounded border transition-all ${isHunter ? 'bg-slate-900/40 border-emerald-900/20 hover:border-emerald-500/40' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {extra.icon}
                        <span className={`text-[8px] font-black uppercase ${isHunter ? 'text-emerald-600' : 'text-slate-400'}`}>{extra.label}</span>
                      </div>
                      <p className={`text-[9px] leading-tight ${isHunter ? 'text-emerald-100/70 italic' : 'text-slate-600 italic'}`}>"{extra.status}"</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className={`flex-1 p-5 rounded-2xl border flex flex-col space-y-4 shadow-xl overflow-hidden relative ${isHunter ? 'bg-slate-950/80 border-emerald-900/30' : 'bg-slate-50 border-slate-200'}`}>
              <div className="absolute top-0 right-0 p-3 opacity-10">
                 <Wind size={48} className={isHunter ? "text-emerald-500" : "text-blue-500"} />
              </div>
              <h3 className={`text-[10px] font-black uppercase tracking-widest ${isHunter ? 'text-emerald-400' : 'text-slate-900'}`}>Valve_Hysteresis</h3>
              <div className="flex-1 border border-emerald-900/10 rounded bg-black/20 relative">
                 <svg width="100%" height="100%" viewBox="0 0 200 100" className="opacity-60">
                    <path d="M 10 90 L 40 70 L 80 85 L 120 40 L 160 10 L 190 5" fill="none" stroke={isHunter ? "#10b981" : "#3b82f6"} strokeWidth="2" strokeDasharray="4 2" />
                    <circle cx="160" cy="10" r="3" fill="#ef4444" />
                 </svg>
                 <div className="absolute bottom-2 left-2 text-[7px] text-emerald-900 font-mono">TRENDING_POSITIVE_LAG</div>
              </div>
              <button className={`w-full py-2 rounded text-[8px] font-black uppercase tracking-widest ${isHunter ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                Recalibrate Closure Curve
              </button>
           </div>
        </div>
      </div>

      {/* Persistent HUD Footer */}
      <div className={`p-2.5 rounded border flex items-center justify-between transition-all ${isHunter ? 'bg-[#010409] border-emerald-900/40' : 'bg-slate-50 border-slate-200'}`}>
         <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
               <ShieldCheck size={14} className={isHunter ? "text-emerald-500" : "text-blue-500"} />
               <span className={`text-[10px] font-black uppercase tracking-widest ${isHunter ? 'text-emerald-400' : 'text-slate-700'}`}>Gatekeeper_Active</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-emerald-900/30"></div>
            <span className={`text-[8px] font-black uppercase tracking-tighter ${isHunter ? 'text-emerald-900' : 'text-slate-400'}`}>Cerberus Ruleset v2.5.1 Applied</span>
         </div>
         <div className="flex items-center space-x-4">
            <span className={`text-[9px] font-mono tracking-tighter ${isHunter ? 'text-emerald-900' : 'text-slate-400'}`}>UWI: 100/N42/032-X</span>
            <div className="flex items-center space-x-1">
               <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
               <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GatekeeperConsole;
