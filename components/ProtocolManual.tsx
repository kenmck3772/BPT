import React, { useState } from 'react';
import { 
  BookOpen, ChevronRight, Zap, Target, Activity, 
  Database, Ghost, Box, Terminal,
  Compass, Beaker, FileText, Info, AlertTriangle,
  Fingerprint, Cpu, Search, HardDrive, ShieldCheck,
  Microscope, Globe, Layers, Binary, Waves, SearchCode,
  Scale, Radiation, Thermometer, Anchor, Coins,
  ShieldAlert, Scan, Link as LinkIcon, Download,
  Maximize2, Minimize2, Flame,
  // Added missing Lock icon import from lucide-react
  Lock
} from 'lucide-react';

const ProtocolManual: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState('SYSTEM_OVERVIEW');

  const topics = [
    { 
      id: 'SYSTEM_OVERVIEW', 
      label: '00: Kernel_Overview', 
      icon: <Cpu size={16} />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-emerald-900/20 pb-4">
             <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <ShieldCheck size={24} className="text-emerald-400" />
             </div>
             <div>
                <h3 className="text-xl font-black text-emerald-400 uppercase tracking-tighter">Sovereign_Kernel_v88.7</h3>
                <span className="text-[9px] font-mono text-emerald-800 uppercase tracking-widest">Directive: FP-000_CORE_LOGIC</span>
             </div>
          </div>
          <p className="text-emerald-100/80 leading-relaxed font-mono">
            The Brahan Personal Terminal is a specialized cyber-forensic diagnostic engine designed to reconcile the "Digital Abyss" (modern metadata decay) against the "Iron Truth" (original rig-site artifacts).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-5 bg-emerald-500/5 border border-emerald-900/40 rounded-2xl space-y-3">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block border-b border-emerald-900/20 pb-2">The Author's Truth</span>
                <p className="text-[11px] text-emerald-100/60 leading-relaxed">
                  Every well is born with a rig-floor signature. Modern digital summaries often "smooth" or misplace these anchors. The Seer bypasses the summary to find the original ink.
                </p>
             </div>
             <div className="p-5 bg-red-500/5 border border-red-900/40 rounded-2xl space-y-3">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block border-b border-red-900/20 pb-2">The Digital Abyss</span>
                <p className="text-[11px] text-red-100/60 leading-relaxed">
                  Compounded errors in MSL vs KB datums create "Data Ghosts"—wellbores that exist in digital space but mismatch physical reality.
                </p>
             </div>
          </div>
        </div>
      )
    },
    { 
      id: 'GHOST_SYNC', 
      label: '01: Ghost_Sync_Protocol', 
      icon: <Ghost size={16} />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-emerald-900/20 pb-4">
             <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30">
                <Ghost size={24} className="text-orange-400" />
             </div>
             <div>
                <h3 className="text-xl font-black text-orange-400 uppercase tracking-tighter">Datum_Discordance_Logic</h3>
                <span className="text-[9px] font-mono text-orange-800 uppercase tracking-widest">Directive: FP-001_VERTICAL_LOCK</span>
             </div>
          </div>
          <p className="text-[11px] text-emerald-100/70 leading-relaxed">
            Ghost_Sync utilizes a sliding-window cross-correlation algorithm to identify vertical offsets between legacy surveys and modern NDR exports.
          </p>
          <div className="p-6 bg-black/40 border border-emerald-900/20 rounded-2xl space-y-4">
             <div className="flex items-center gap-2">
                <Target size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-emerald-100">Operational Procedure:</span>
             </div>
             <ul className="space-y-3 text-[10px] font-mono text-emerald-100/40">
                <li className="flex gap-3"><span className="text-emerald-500 shrink-0">01.</span> <span>Initialize 'Initialize_Registry_Uplink' to establish the baseline trace.</span></li>
                <li className="flex gap-3"><span className="text-emerald-500 shrink-0">02.</span> <span>Invoke 'Auto_Tie' to perform Least-Squares Residual Minimization.</span></li>
                <li className="flex gap-3"><span className="text-emerald-500 shrink-0">03.</span> <span>Identify Bypassed Pay zones by mapping GR peaks against the corrected datum.</span></li>
             </ul>
          </div>
        </div>
      )
    },
    { 
      id: 'THERMAL_SYNC', 
      label: '02: Thermal_Slave_Forensics', 
      icon: <Waves size={16} />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-emerald-900/20 pb-4">
             <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <Waves size={24} className="text-blue-400" />
             </div>
             <div>
                <h3 className="text-xl font-black text-blue-400 uppercase tracking-tighter">B-Annulus_Correlation</h3>
                <span className="text-[9px] font-mono text-blue-800 uppercase tracking-widest">Directive: FP-002_PHASE_LOCK</span>
             </div>
          </div>
          <p className="text-[11px] text-emerald-100/70 leading-relaxed">
            Specifically engineered for the Balloch B2 and Harding H1 cases. This module proves that B-annulus pressure variance is often "slave" to diurnal thermal cycles rather than indicative of a mechanical breach.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 bg-slate-900 border border-blue-900/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-blue-400 font-black text-[9px] uppercase">
                   <LinkIcon size={12} /> Pearson R Threshold
                </div>
                <p className="text-[10px] text-emerald-100/40">Correlation R > 0.98 signifies thermal phase-lock. This triggers a Sovereign Veto against 'Leak' classification.</p>
             </div>
             <div className="p-4 bg-slate-900 border border-amber-900/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-amber-400 font-black text-[9px] uppercase">
                   <Radiation size={12} /> Elasticity Index
                </div>
                <p className="text-[10px] text-emerald-100/40">Pressure/Temp coefficients (PSI/°C) reveal the specific fluid bulk modulus in the annulus.</p>
             </div>
          </div>
        </div>
      )
    },
    { 
      id: 'METALLURGY_AUDIT', 
      label: '03: Metallurgy_Registry', 
      icon: <Radiation size={16} />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-emerald-900/20 pb-4">
             <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                <Radiation size={24} className="text-amber-400" />
             </div>
             <div>
                <h3 className="text-xl font-black text-amber-400 uppercase tracking-tighter">13Cr_Integrity_Audit</h3>
                <span className="text-[9px] font-mono text-amber-800 uppercase tracking-widest">Directive: FP-003_ALPHA_CHROME</span>
             </div>
          </div>
          <p className="text-[11px] text-emerald-100/70 leading-relaxed">
            Audits casing material grade by cross-referencing Apex Job tallies against original mill certificates. Detects carbon-crossover contamination in super-duplex strings.
          </p>
          <div className="p-5 border-l-4 border-amber-500 bg-amber-500/5 rounded-r-xl space-y-3">
             <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Chrome-Integrity Alpha:</span>
             <p className="text-[11px] font-mono text-emerald-100/60 leading-relaxed italic">
                A statistical confidence score (0.0 to 1.0) derived from Heat Number legibility and chemical assay records. Scores < 0.85 indicate "Decommissioning Ghost" risk where low-spec carbon joints are hidden in high-spec records.
             </p>
          </div>
        </div>
      )
    },
    { 
      id: 'TRAUMA_NODE', 
      label: '04: Trauma_Reconstruction', 
      icon: <Box size={16} />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-emerald-900/20 pb-4">
             <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                <Box size={24} className="text-red-400" />
             </div>
             <div>
                <h3 className="text-xl font-black text-red-400 uppercase tracking-tighter">3D_Cylindrical_Autopsy</h3>
                <span className="text-[9px] font-mono text-red-800 uppercase tracking-widest">Directive: FP-004_STRUCTURAL_MAP</span>
             </div>
          </div>
          <p className="text-[11px] text-emerald-100/70 leading-relaxed">
            Reconstructs internal wellbore geometry from multi-finger caliper (MFC) telemetry. Identifies localized metal loss, ovality, and bending stress vectors.
          </p>
          <div className="bg-slate-900 p-4 rounded-xl border border-emerald-900/20 flex items-start gap-4 shadow-inner">
             <Target size={20} className="text-orange-500 shrink-0 mt-1" />
             <div className="space-y-1">
                <span className="text-[9px] font-black text-emerald-100 uppercase tracking-widest">Voxel Locking Instructions:</span>
                <p className="text-[10px] text-emerald-100/40 font-mono leading-tight">
                   Click any anomaly in the Trace Matrix to auto-zoom the 3D viewport. Red voxels indicate the 'Fracture Horizon' where integrity is non-recoverable.
                </p>
             </div>
          </div>
        </div>
      )
    },
    { 
      id: 'FISCAL_VETO', 
      label: '05: Commercial_Veto_Logic', 
      icon: <Coins size={16} />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-emerald-900/20 pb-4">
             <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                <Coins size={24} className="text-yellow-400" />
             </div>
             <div>
                <h3 className="text-xl font-black text-yellow-400 uppercase tracking-tighter">The_Ignorance_Tax</h3>
                <span className="text-[9px] font-mono text-yellow-800 uppercase tracking-widest">Directive: FP-005_FISCAL_RECLAIM</span>
             </div>
          </div>
          <p className="text-[11px] text-emerald-100/70 leading-relaxed">
            Quantifies the fiscal exposure of "Option A" (Heavy Vessel Intervention) versus "Option B" (Forensic Remediation). 
          </p>
          <div className="p-6 bg-yellow-500/5 border-2 border-yellow-500/30 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><Scale size={64} /></div>
             <h4 className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-4">Board_Directive_Logic:</h4>
             <p className="text-[12px] font-terminal italic text-white leading-relaxed">
               "If Scale Choking (Ratchet Effect) is identified via pressure waveform autopsy, then approving vessel mobilization constitutes financial negligence. Net savings for D-03: £7,145,000."
             </p>
          </div>
        </div>
      )
    },
    { 
      id: 'SOVEREIGN_VAULT', 
      label: '06: Secured_Asset_Ledger', 
      // Added fix for Lock icon error: using Lock from lucide-react
      icon: <Lock size={16} />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-emerald-900/20 pb-4">
             <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                {/* Added fix for Lock icon error: using Lock from lucide-react */}
                <Lock size={24} className="text-emerald-400" />
             </div>
             <div>
                <h3 className="text-xl font-black text-emerald-400 uppercase tracking-tighter">Sovereign_Vault_Archival</h3>
                <span className="text-[9px] font-mono text-emerald-800 uppercase tracking-widest">Directive: FP-006_VAULT_COMMIT</span>
             </div>
          </div>
          <p className="text-[11px] text-emerald-100/70 leading-relaxed">
            Every verified forensic finding is cryptographically hashed (SHA-512) and committed to the Sovereign Vault. 
          </p>
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <ShieldCheck size={14} /> Art_14_HITL Compliance
             </div>
             <div className="p-4 bg-black/40 border border-emerald-900/20 rounded-xl font-mono text-[9px] text-emerald-100/40 leading-relaxed">
                Vault items require human notary signature (HITL) before being authorized for NSTA submission. The 'Iron Truth' signature chain prevents automated decommissioning triggers without forensic review.
             </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950/40 border border-emerald-900/20 rounded-lg overflow-hidden relative font-terminal">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
         <BookOpen size={600} className="text-emerald-500" />
      </div>

      <header className="p-6 border-b border-emerald-900/30 flex items-center justify-between bg-slate-950/60 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <BookOpen size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">Forensic_Protocol_Manual</h2>
            <div className="flex items-center space-x-2">
               <span className="text-[9px] text-emerald-800 uppercase tracking-[0.4em] font-black">Authorized_Instructions // v88.7.stable</span>
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-black/40 px-4 py-2 border border-emerald-900/40 rounded-lg text-[10px] font-black text-emerald-900 uppercase">
              Auth_Level: SOVEREIGN_VETO
           </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative z-10">
        <div className="w-72 border-r border-emerald-900/20 flex flex-col bg-slate-950/40">
           <div className="p-4 border-b border-emerald-900/20 bg-black/20">
              <div className="flex items-center space-x-2 text-[9px] font-black text-emerald-900 uppercase tracking-widest">
                 <Search size={12} />
                 <span>Index_Directory</span>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {topics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all group ${activeTopic === topic.id ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-emerald-800 hover:text-emerald-400 hover:bg-emerald-500/5'}`}
                >
                  <div className="flex items-center space-x-3">
                     <span className={`${activeTopic === topic.id ? 'text-slate-950' : 'text-emerald-900 group-hover:text-emerald-400'}`}>
                        {topic.icon}
                     </span>
                     <span className="text-[10px] font-black uppercase tracking-widest truncate">{topic.label}</span>
                  </div>
                  <ChevronRight size={14} className={`transition-transform duration-300 ${activeTopic === topic.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
           </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-slate-900/20 overflow-hidden">
           <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-1 bg-emerald-500/40 rounded-full"></div>
                    <span className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.5em]">{activeTopic.replace(/_/g, ' ')}</span>
                 </div>
                 
                 <div className="bg-slate-950/60 border-2 border-emerald-500/20 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                       {topics.find(t => t.id === activeTopic)?.icon}
                    </div>
                    {topics.find(topic => topic.id === activeTopic)?.content}
                 </div>

                 <div className="mt-12 pt-8 border-t border-emerald-900/20 flex items-center justify-between text-[10px] font-black text-emerald-900 uppercase">
                    <div className="flex items-center gap-6">
                       <span className="flex items-center space-x-2"><Cpu size={14} /> <span>Logic: Brahan_Core_v88</span></span>
                       <span className="flex items-center space-x-2"><Binary size={14} /> <span>Registry: AUTHOR_TRUTH</span></span>
                    </div>
                    <button className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition-colors">
                       <Download size={14} /> Export_Protocol
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolManual;