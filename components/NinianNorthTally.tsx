
import React, { useState, useMemo } from 'react';
import { 
  Table, Target, Zap, ShieldAlert, Database, Search, 
  Loader2, Download, Scale, Maximize2, Minimize2, 
  Binary, ShieldCheck, Skull, Hammer
} from 'lucide-react';
import { MOCK_NINIAN_TALLY } from '../constants';
import { NinianTallyEntry } from '../types';
import { secureAsset } from '../services/vaultService';

const NinianNorthTally: React.FC<{isFocused?: boolean; onToggleFocus?: () => void}> = ({ isFocused, onToggleFocus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const filteredTally = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return MOCK_NINIAN_TALLY.filter(entry => 
      entry.slot.toLowerCase().includes(q) || 
      entry.casingGrade.toLowerCase().includes(q) ||
      entry.ndrRefId.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const getScoreInfo = (score: number) => {
    if (score >= 10) return { label: 'EXTREME', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/40', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]' };
    if (score >= 8) return { label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-500/40', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.2)]' };
    if (score >= 5) return { label: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/40', glow: '' };
    return { label: 'LOW', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', glow: '' };
  };

  const handleSecureWell = (well: NinianTallyEntry) => {
    const info = getScoreInfo(well.apexScore);
    secureAsset({
      title: `Forensic_Tally_Audit: Well ${well.slot}`,
      status: well.apexScore >= 9 ? 'CRITICAL' : 'VERIFIED',
      summary: `Master Population Ledger verification complete for ${well.slot}. Casing: ${well.casingGrade} (${well.weight} lb/ft). Apex Score: ${well.apexScore}/10 (${info.label}). Forensic discordance identified in liner grade ${well.linerGrade}. Jackpot potential: ${well.apexScore === 10 ? 'MAXIMAL' : 'NOMINAL'}.`,
      region: 'Ninian North (Block 3/3)',
      valueEst: well.apexScore === 10 ? 15000000 : well.apexScore >= 8 ? 7500000 : 2500000,
      confidence: 94.2 + (well.apexScore * 0.5)
    });
  };

  const renderVoxelMeter = (score: number) => {
    const info = getScoreInfo(score);
    return (
      <div className="flex gap-0.5">
        {[...Array(10)].map((_, i) => {
          const isActive = i < score;
          return (
            <div 
              key={i} 
              className={`w-2 h-4 border ${isActive ? info.bg + ' ' + info.border : 'bg-black/40 border-emerald-950/20'}`}
              style={{ opacity: isActive ? 1 : 0.2 }}
            ></div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <Skull size={600} className="text-emerald-500" />
      </div>

      <header className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-emerald-900/30 pb-4 relative z-10 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl shadow-lg">
            <Hammer size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter leading-none">>>> NINIAN_MASTER_STEEL_POP</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[9px] text-emerald-800 uppercase tracking-[0.4em] font-black">Registry: NDR_MASTER_v2 // Author: Sovereign_Data_Architect</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Master Tally..."
              className="bg-black/60 border border-emerald-900/40 rounded-lg pl-9 pr-4 py-2 text-[10px] text-emerald-100 font-mono outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-950 shadow-inner"
            />
          </div>
          <button 
            disabled={isExporting}
            onClick={() => { setIsExporting(true); setTimeout(() => setIsExporting(false), 1000); }}
            className="p-2.5 bg-slate-900 border border-emerald-900/40 text-emerald-500 rounded-lg hover:bg-emerald-500/10 transition-all shadow-xl"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </button>
          {onToggleFocus && (
            <button onClick={onToggleFocus} aria-label="Toggle Focus Mode" className="p-2 text-emerald-900 hover:text-emerald-400 transition-all ml-2">
              {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        <div className="flex-1 bg-slate-950/80 border border-emerald-900/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
          <div className="p-4 border-b border-emerald-900/20 bg-black/40 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center space-x-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              <Table size={16} /> <span>Steel_Inventory_Audit (Ninian_Master)</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse"></div>
                <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Jackpot_Veto: N24 [10/10]</span>
              </div>
              <span className="text-[8px] font-black text-emerald-900 uppercase">Registry_Samples: {filteredTally.length}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left font-terminal border-collapse">
              <thead className="sticky top-0 bg-[#0a0a0a] z-20">
                <tr className="border-b border-emerald-900/40 text-[9px] text-emerald-900 font-black uppercase tracking-widest">
                  <th className="p-4">Well_Slot</th>
                  <th className="p-4">Operational_Type</th>
                  <th className="p-4">Casing_Grade</th>
                  <th className="p-4">Weight</th>
                  <th className="p-4">Liner_Grade</th>
                  <th className="p-4">NDR_Ref_ID</th>
                  <th className="p-4 text-right">Apex_Score_Meter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/10">
                {filteredTally.map((well) => {
                  const info = getScoreInfo(well.apexScore);
                  return (
                    <tr 
                      key={well.slot} 
                      onMouseEnter={() => setHoveredSlot(well.slot)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      className={`group transition-all cursor-crosshair hover:bg-emerald-500/5 ${well.apexScore === 10 ? 'bg-red-500/[0.03]' : ''}`}
                    >
                      <td className="p-4 relative">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded border transition-all ${well.apexScore === 10 ? 'border-red-500/50 bg-red-500/10 text-red-500 animate-pulse' : 'border-emerald-900/40 text-emerald-900'}`}>
                            <Target size={14} />
                          </div>
                          <span className={`text-sm font-black uppercase ${well.apexScore === 10 ? 'text-red-500' : 'text-emerald-100 group-hover:text-emerald-400'}`}>
                            {well.slot}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-bold text-emerald-800 uppercase">{well.type}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${well.casingGrade === 'Q-125' ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-emerald-900 text-emerald-900'}`}>
                          {well.casingGrade}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-emerald-100">{well.weight.toFixed(1)}</td>
                      <td className="p-4 text-xs font-bold text-emerald-700 uppercase">{well.linerGrade}</td>
                      <td className="p-4 text-[10px] font-mono text-emerald-900 group-hover:text-emerald-700 transition-colors">{well.ndrRefId}</td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                           <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-black ${info.color}`}>{info.label}</span>
                              <button 
                                onClick={() => handleSecureWell(well)}
                                className={`px-4 py-1 rounded text-[9px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${info.color} ${info.border} ${info.bg} ${info.glow}`}
                              >
                                {well.apexScore}/10
                              </button>
                           </div>
                           {renderVoxelMeter(well.apexScore)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="p-6 bg-slate-900/60 border border-emerald-900/30 rounded-2xl space-y-4 shadow-xl">
           <div className="flex items-center gap-3">
              <Scale size={20} className="text-emerald-500" />
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Master_Steel_Verification</h4>
           </div>
           <p className="text-[10px] leading-relaxed text-emerald-100/60 font-mono italic">
             "Quantitative score mapping applied to Ninian Master Population. Jackpot-Veto logic triggered for scores > 8."
           </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-red-500/20 rounded-2xl space-y-3 shadow-xl group hover:border-red-500/40 transition-all">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Critical_Audit_Target</span>
              <ShieldAlert size={14} className="text-red-500" />
           </div>
           <div className="flex items-end justify-between">
              <div className="flex flex-col">
                 <span className="text-2xl font-black text-red-500 tracking-tighter uppercase">N24_SUSPENDED</span>
                 <span className="text-[8px] font-mono text-red-900 uppercase">Score: 10/10 [JACKPOT_MAX]</span>
              </div>
           </div>
        </div>

        <div className="p-6 bg-slate-900/60 border border-emerald-900/30 rounded-2xl flex flex-col justify-center items-center gap-4 shadow-xl">
           <div className="flex items-center gap-4 text-emerald-400 font-black uppercase text-[10px] tracking-widest">
              <Zap size={14} className="animate-pulse" /> Voxel_Audit_Kernel: Active
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 0.1; height: 10px; }
          50% { opacity: 0.8; height: 16px; }
        }
      `}} />
    </div>
  );
};

export default NinianNorthTally;
