import React, { useState, useMemo } from 'react';
import { 
  BarChart3, ChevronDown, ChevronRight, AlertTriangle, 
  Globe, Target, FileWarning, Loader2, Ghost,
  AlertOctagon, Maximize2, Minimize2, Anchor,
  Skull, PieChart as PieChartIcon, Layout, Zap
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { MOCK_BASIN_AUDIT_DATA } from './constants';
import { performSovereignAudit } from './services/geminiService';
import { SovereignVetoReport } from './types';

const BasinAudit: React.FC<{isFocused?: boolean; onToggleFocus?: () => void}> = ({ isFocused, onToggleFocus }) => {
  const [expandedRegion, setExpandedRegion] = useState<string | null>("Northern North Sea");
  const [expandedRiskProfile, setExpandedRiskProfile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'EXPLORER' | 'ANALYTICS'>('EXPLORER');
  
  const [selectedWellUwi, setSelectedWellUwi] = useState<string | null>(null);
  const [isVetoInProgress, setIsVetoInProgress] = useState(false);
  const [vetoStep, setVetoStep] = useState<string>('');
  const [vetoReport, setVetoReport] = useState<SovereignVetoReport | null>(null);

  const stats = useMemo(() => {
    const assetCounts: Record<string, number> = {};
    const riskCounts: Record<string, number> = {};

    MOCK_BASIN_AUDIT_DATA.forEach(region => {
      region.assets.forEach(assetGroup => {
        const assetType = assetGroup.type;
        if (!assetCounts[assetType]) assetCounts[assetType] = 0;

        assetGroup.riskProfiles.forEach(profileGroup => {
          const profileName = profileGroup.profile;
          const wellCount = profileGroup.wells.length;
          riskCounts[profileName] = (riskCounts[profileName] || 0) + wellCount;
          assetCounts[assetType] = assetCounts[assetType] + wellCount;
        });
      });
    });

    const assetData = Object.entries(assetCounts).map(([name, value]) => ({ name: name, value: value }));
    const riskData = Object.entries(riskCounts).map(([name, value]) => ({ 
      name: name.replace(/_/g, ' '), 
      value: value 
    }));

    return { assetStats: assetData, riskStats: riskData };
  }, []);

  const ghostRecords = useMemo(() => {
    const region = MOCK_BASIN_AUDIT_DATA.find(r => r.region === expandedRegion);
    if (!region) return [];
    
    const records: any[] = [];
    region.assets.forEach(asset => {
      const profile = asset.riskProfiles.find(p => p.profile === expandedRiskProfile);
      if (profile) {
        profile.wells.forEach(well => {
          records.push(well);
        });
      }
    });
    return records;
  }, [expandedRegion, expandedRiskProfile]);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7'];
  const RISK_COLORS: Record<string, string> = {
    'ARREARS_CRITICAL': '#ef4444',
    'SUSPENDED_EXTENDED': '#f59e0b',
    'ORPHAN_ASSET': '#3b82f6'
  };

  const activeWell = useMemo(() => {
    for (const region of MOCK_BASIN_AUDIT_DATA) {
      for (const asset of region.assets) {
        for (const profile of asset.riskProfiles) {
          const found = profile.wells.find(w => w.uwi === selectedWellUwi);
          if (found) return found;
        }
      }
    }
    return null;
  }, [selectedWellUwi]);

  const executeSovereignVeto = async () => {
    if (!activeWell) return;
    setIsVetoInProgress(true);
    setVetoReport(null);
    const steps = [
      { msg: "NDR_DEEP_DIVE: SCANNING_LEGACY_OCR...", delay: 800 },
      { msg: "SCAVENGER_PROTOCOL: CROSS-REFERENCING_OSPAR_FILINGS...", delay: 1000 },
      { msg: "SATELLITE_GIS: VERIFYING_SEA-FLOOR_SUBSIDENCE...", delay: 1000 },
      { msg: "METALLURGY_SWITCH: ARL_LATENCY_TEST_0.11ms...", delay: 500 },
      { msg: "BRAHAN_KERNEL: CONSTRUCTING_SOVEREIGN_TRUTH...", delay: 1200 },
      { msg: "NOTARIZING_FINDINGS_ART_14...", delay: 800 }
    ];
    for (const step of steps) {
      setVetoStep(step.msg);
      await new Promise(r => setTimeout(r, step.delay));
    }
    try {
      const data = await performSovereignAudit(activeWell.uwi);
      if (data) setVetoReport(data);
    } catch (err) {
      console.error("VETO_ENGINE_CRASH:", err);
    } finally {
      setIsVetoInProgress(false);
      setVetoStep('');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-emerald-900/30 pb-4 relative z-10 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl shadow-lg">
            <BarChart3 size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">>>> SOVEREIGN_BASIN_AUDIT</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[9px] text-emerald-800 uppercase tracking-[0.4em] font-black">Brahan Team // Asset Lifecycle Veto Protocol</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#121212] p-1 border border-emerald-900/40 rounded-lg flex mr-4">
            <button onClick={() => setViewMode('EXPLORER')} className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'EXPLORER' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-900 hover:text-emerald-400'}`}>
              <Layout size={12} /> Explorer
            </button>
            <button onClick={() => setViewMode('ANALYTICS')} className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'ANALYTICS' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-900 hover:text-emerald-400'}`}>
              <PieChartIcon size={12} /> Analytics
            </button>
          </div>
          {onToggleFocus && (
            <button onClick={onToggleFocus} aria-label="Toggle Focus Mode" className="p-2 text-emerald-900 hover:text-[#00FF41] transition-all">
              {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10 min-h-0 overflow-hidden">
        <div className="lg:col-span-1 flex flex-col space-y-4 overflow-hidden">
           <div className="bg-slate-900/80 border border-emerald-900/30 rounded-2xl flex flex-col flex-1 shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-emerald-900/20 bg-black/40 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Globe size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Target_Matrix</span>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                 {MOCK_BASIN_AUDIT_DATA.map((region) => (
                    <div key={region.region} className="space-y-1">
                       <button onClick={() => setExpandedRegion(expandedRegion === region.region ? null : region.region)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${expandedRegion === region.region ? 'bg-emerald-500/10 text-emerald-100 border border-emerald-500/30' : 'text-emerald-800 hover:text-emerald-400'}`}>
                          <div className="flex items-center gap-2">
                             {expandedRegion === region.region ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                             <span className="text-[10px] font-black uppercase truncate">{region.region}</span>
                          </div>
                       </button>
                       {expandedRegion === region.region && region.assets.map(asset => (
                         <div key={asset.type} className="pl-4 space-y-1 mt-1">
                            <span className="text-[8px] font-black text-emerald-900 uppercase block px-3 mb-1">{asset.type}</span>
                            {asset.riskProfiles.map(prof => (
                              <button key={prof.profile} onClick={() => setExpandedRiskProfile(expandedRiskProfile === prof.profile ? null : prof.profile)} className={`w-full text-left px-3 py-1.5 rounded text-[9px] font-bold uppercase transition-all ${expandedRiskProfile === prof.profile ? 'text-orange-400 bg-orange-400/5' : 'text-emerald-700 hover:text-emerald-500'}`}>
                                {prof.profile.replace(/_/g, ' ')} ({prof.wells.length})
                              </button>
                            ))}
                         </div>
                       ))}
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {viewMode === 'EXPLORER' ? (
          <>
            <div className="lg:col-span-1 flex flex-col space-y-4 overflow-hidden">
               <div className="bg-slate-950/90 border border-emerald-900/30 rounded-2xl flex flex-col flex-1 shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-emerald-900/20 bg-black/40 text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                     <Ghost size={14} /> Ghost_Records
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                     {ghostRecords.map((well) => (
                        <button 
                          key={well.uwi} 
                          onClick={() => setSelectedWellUwi(well.uwi)} 
                          className={`w-full p-4 rounded-xl border transition-all text-left relative overflow-hidden ${selectedWellUwi === well.uwi ? 'bg-red-500/10 border-red-500/40 shadow-xl' : 'bg-slate-900 border-emerald-900/20 hover:border-emerald-500/40'}`}
                        >
                           <div className="flex justify-between items-start mb-2">
                              <span className={`text-[11px] font-black uppercase ${selectedWellUwi === well.uwi ? 'text-red-400' : 'text-emerald-100'}`}>{well.uwi}</span>
                              <span className="text-[7px] font-black px-1.5 py-0.5 bg-red-600 text-white rounded">VETO_READY</span>
                           </div>
                           <div className="text-[8px] font-black uppercase text-emerald-900 truncate">Op: {well.operator}</div>
                           <div className="text-[8px] font-black text-emerald-500 uppercase mt-1">{well.status}</div>
                        </button>
                      ))}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
               <div className="bg-slate-950/90 border border-emerald-900/30 rounded-2xl flex-1 flex flex-col shadow-2xl overflow-hidden relative">
                  {!activeWell ? (
                     <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
                        <FileWarning size={120} className="animate-pulse" />
                        <span className="text-lg font-black uppercase tracking-[0.5em] block text-emerald-500">Awaiting_Sovereign_Target</span>
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="p-4 border-b flex items-center justify-between border-red-900/30 bg-red-900/5">
                           <div className="flex items-center space-x-3">
                              <AlertOctagon size={18} className="text-red-500" />
                              <span className="text-[11px] font-black uppercase tracking-widest text-red-400">VETO_PROTOCOL_ACTIVE: {activeWell.uwi}</span>
                           </div>
                           <button onClick={executeSovereignVeto} disabled={isVetoInProgress} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase flex items-center gap-3 shadow-2xl transition-all relative overflow-hidden group ${isVetoInProgress ? 'bg-slate-800 text-emerald-500 border-emerald-500/20' : 'bg-red-600 text-white hover:bg-red-500 animate-pulse'}`}>
                              {isVetoInProgress ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                              <span>{isVetoInProgress ? 'AUDITING...' : 'ISSUE_SOVEREIGN_VETO'}</span>
                           </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                           {isVetoInProgress ? (
                             <div className="flex flex-col items-center justify-center space-y-8 py-12 h-full">
                                <Loader2 size={120} className="text-red-500 animate-spin opacity-20" />
                                <span className="text-xl font-black text-red-400 uppercase tracking-[0.2em] block animate-pulse">{vetoStep}</span>
                             </div>
                           ) : vetoReport ? (
                             <div className="space-y-10 animate-in fade-in zoom-in-98 duration-500">
                                <div className="border-4 border-red-600 p-6 bg-red-600/5 relative overflow-hidden">
                                   <h1 className="text-4xl font-black text-red-600 tracking-tighter uppercase leading-none mb-4">Sovereign_Veto_Issued</h1>
                                   <p className="text-lg font-black text-red-100 uppercase tracking-tighter leading-tight border-l-4 border-red-600 pl-6 py-2">{vetoReport.vetoSummary}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                   <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-4">
                                      <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest"><Anchor size={18} /> Author_Truth</div>
                                      <p className="text-[12px] font-mono text-emerald-100 leading-relaxed italic">{vetoReport.authorTruth}</p>
                                   </div>
                                   <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-4">
                                      <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest"><Skull size={18} /> Digital_Claim</div>
                                      <p className="text-[12px] font-mono text-red-100 leading-relaxed italic">{vetoReport.digitalClaim}</p>
                                   </div>
                                </div>
                             </div>
                           ) : (
                             <div className="space-y-8">
                                <div className="p-6 bg-slate-900/80 border border-red-500/30 rounded-xl relative overflow-hidden">
                                   <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-4">Registry_Findings: Digital_Abyss_Verified</span>
                                   <p className="text-[13px] font-mono leading-relaxed text-red-100 italic border-l-2 border-red-500 pl-4">
                                     "Target {activeWell.uwi} identified with {activeWell.arrearsDays} days of regulatory arrears. Source: {activeWell.scrapedSource}. Baseline Veto probability 88%."
                                   </p>
                                </div>
                             </div>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-3 flex flex-col space-y-6 overflow-y-auto custom-scrollbar pr-4 pb-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl flex flex-col h-[400px] min-h-[300px]">
                   <h3 className="text-xl font-black text-emerald-400 uppercase tracking-tighter mb-6 border-b border-emerald-900/20 pb-3 flex items-center gap-3">
                      <PieChartIcon size={24} /> Asset_Distribution
                   </h3>
                   <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie data={stats.assetStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                               {stats.assetStats.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                               ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #064e3b', fontSize: '10px' }} />
                            <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase' }} />
                         </PieChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl flex flex-col h-[400px] min-h-[300px]">
                   <h3 className="text-xl font-black text-emerald-400 uppercase tracking-tighter mb-6 border-b border-emerald-900/20 pb-3 flex items-center gap-3">
                      <AlertTriangle size={24} /> Risk_Exposure_Matrix
                   </h3>
                   <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={stats.riskStats}>
                            <CartesianGrid strokeDasharray="1 5" stroke="#10b981" opacity={0.1} vertical={false} />
                            <XAxis dataKey="name" stroke="#10b981" fontSize={8} />
                            <YAxis stroke="#10b981" fontSize={8} />
                            <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #064e3b', fontSize: '10px' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                               {stats.riskStats.map((entry, index) => (
                                  <Cell key={`cell-risk-${index}`} fill={RISK_COLORS[Object.keys(RISK_COLORS)[index % 3]] || '#ef4444'} />
                                ))}
                            </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      <footer className="p-4 border-t border-emerald-900/30 bg-black/40 rounded-2xl flex items-center justify-between relative z-10">
         <div className="flex items-center space-x-12 text-[10px] font-black text-emerald-900 uppercase">
            <span className="flex items-center gap-3"><Globe size={16} /> Registry_Node: UKCS_Basin_Hub</span>
            <span className="flex items-center gap-3"><Target size={16} /> Precision_Lock: Author_Truth_Kernel_v88</span>
         </div>
      </footer>
    </div>
  );
};

export default BasinAudit;