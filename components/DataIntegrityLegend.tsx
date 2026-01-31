
import React from 'react';
import { 
  ShieldAlert, AlertOctagon, HelpCircle, FileWarning, 
  EyeOff, Scale, BookOpen, Fingerprint, 
  FileSignature, Terminal, ShieldCheck, CircleDot 
} from 'lucide-react';

const DataIntegrityLegend: React.FC = () => {
  const definitions = [
    {
      label: '[DATA_MISSING]',
      protocol: 'FP-V01',
      desc: 'CRITICAL NULL VETO. Required information is entirely absent from the primary source (e.g. End of Well Report). This constitutes a broken evidence chain. Under Sovereign Protocol, this triggers an automatic veto against any decommissioning assumptions.',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: <FileWarning size={16} className="animate-pulse" />
    },
    {
      label: '[DATA_UNREADABLE]',
      protocol: 'FP-V02',
      desc: 'DEGRADED ARTIFACT VETO. Analog log scans or handwritten rig tallies are physically illegible. Forensic integrity prohibits interpolation; the data voxel is marked as void to prevent Digital Abyss hallucinations and statistical bias.',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      icon: <EyeOff size={16} />
    },
    {
      label: '[DATA_INCOMPLETE]',
      protocol: 'FP-V03',
      desc: 'ANCHOR RESOLUTION FAILURE. The record exists but lacks the mandatory datum anchors (e.g., missing KB elevation or mill certificates). Extrapolation is strictly forbidden under Art_14 Human-in-the-Loop (HITL) compliance rules.',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      icon: <AlertOctagon size={16} />
    }
  ];

  return (
    <div className="bg-slate-950/95 border-2 border-emerald-500/20 rounded-2xl p-5 shadow-[0_0_60px_rgba(0,0,0,0.8)] space-y-5 font-terminal relative overflow-hidden group">
      {/* Visual Identity Decor - Hag Stone Icon */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-10 transition-opacity duration-1000">
        <CircleDot size={120} className="text-emerald-500" />
      </div>
      
      <div className="flex items-center gap-4 border-b border-emerald-900/30 pb-4 relative z-10">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <CircleDot size={22} className="text-emerald-400 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">Eyerune_Integrity_Protocol</h3>
          <span className="text-[8px] text-emerald-900 font-black uppercase tracking-widest leading-none mt-1.5 flex items-center gap-2">
            <Terminal size={10} /> Directive: Alpha-Eyerune-Veto-001
          </span>
        </div>
      </div>
      
      <div className="space-y-3 relative z-10">
        {definitions.map((def, i) => (
          <div key={i} className={`p-4 rounded-xl border ${def.border} ${def.bg} flex flex-col gap-3 transition-all hover:border-emerald-500/40 cursor-help relative overflow-hidden group/item`}>
            <div className="absolute -top-1 -right-1 p-2 opacity-5 group-hover/item:opacity-20 transition-all">
              <Fingerprint size={48} className={def.color} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-black tracking-[0.1em] ${def.color}`}>{def.label}</span>
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-black/40 text-emerald-900/60 uppercase border border-emerald-900/20">{def.protocol}</span>
              </div>
              <div className={`${def.color} drop-shadow-lg`}>{def.icon}</div>
            </div>
            
            <p className="text-[10px] text-emerald-100/70 leading-relaxed font-mono italic">
              "{def.desc}"
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 relative z-10">
        <div className="flex items-start gap-3 bg-emerald-500/5 p-4 rounded-xl border border-emerald-900/20 shadow-inner">
          <HelpCircle size={18} className="text-emerald-500 mt-0.5 shrink-0 opacity-40" />
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block">Audit_Enforcement_Logic:</span>
            <p className="text-[9px] text-emerald-100/40 font-mono italic leading-tight">
              Adhering to these labels protects the Sovereign Veto by explicitly flagging failures in the National Data Repository (NDR). These markers mandate a Priority-1 re-audit by a human SME (HITL) before published P&A assumptions are accepted.
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
    </div>
  );
};

export default DataIntegrityLegend;
