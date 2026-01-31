
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, ShieldCheck, Target, Activity, 
  Database, Zap, TrendingUp,
  Anchor, Waves,
  Loader2, Scan, Info, Binary, Radar,
  Download, FileCheck,
  ChevronRight, Search, Ghost, ExternalLink, MapPin,
  Maximize2, Minimize2,
  FileQuestion
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { NDRProject } from '../types';
import { searchNDRMetadata, harvestNDRProject } from '../services/ndrService';

const PORTAL_URL_MAP: Record<string, string> = {
  "NSTA_NDR": "https://ndr.nstauthority.co.uk/",
  "NPD_FACTPAGES": "https://factpages.sodir.no/",
  "NOPIMS_FED": "https://nopims.industry.gov.au/",
  "PEPS_SA": "https://peps.sarig.sa.gov.au/"
};

interface NorwaySovereignProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const NoDataPanel = ({ title, message, icon: Icon = FileQuestion }: { title: string, message: string, icon?: any }) => (
  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-blue-900/20 rounded-[2rem] p-12 text-center space-y-6 bg-blue-500/[0.02]">
    <div className="p-5 bg-blue-950/20 rounded-full border border-blue-900/30 animate-pulse">
      <Icon size={48} className="text-blue-900/40" />
    </div>
    <div className="space-y-2 max-w-xs">
      <h3 className="text-sm font-black text-blue-800 uppercase tracking-[0.3em]">{title}</h3>
      <p className="text-[10px] font-mono text-blue-900/60 uppercase leading-relaxed">{message}</p>
    </div>
    <div className="text-[8px] font-black text-blue-950 uppercase tracking-widest border border-blue-900/20 px-3 py-1 rounded">
      Status: Uplink_Empty // ERR_CODE: 0x00_VOID
    </div>
  </div>
);

const GENERATE_SETTLEMENT_DATA = () => {
  const data = [];
  for (let year = 1980; year <= 2025; year++) {
    const t = year - 1980;
    const settlement = 215 * (1 - Math.exp(-t / 8)) + (Math.random() * 2);
    data.push({ year, settlement: parseFloat(settlement.toFixed(2)) });
  }
  return data;
};

const NorwaySovereign: React.FC<NorwaySovereignProps> = ({ isFocused, onToggleFocus }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState<string | null>(null);
  const [harvestProgress, setHarvestProgress] = useState(0);
  const [results, setResults] = useState<NDRProject[]>([]);
  const [fiscalReclaim, setFiscalReclaim] = useState(0);
  const [inspectedArtifact, setInspectedArtifact] = useState<string | null>(null);
  
  const [query, setQuery] = useState('');
  const [wellboreType, setWellboreType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [ghostOnly, setGhostOnly] = useState(false);

  const settlementData = useMemo(() => GENERATE_SETTLEMENT_DATA(), []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsScanning(true);
    setResults([]);
    setInspectedArtifact(null);
    
    const projects = await searchNDRMetadata(query, status, wellboreType, 'ALL', ghostOnly);
    
    setTimeout(() => {
      setResults(projects);
      setIsScanning(false);
      if (projects.length > 0) {
        setFiscalReclaim(projects.length * 4.15);
      }
    }, 1200);
  };

  const handleHarvest = async (projectId: string) => {
    setIsHarvesting(projectId);
    setHarvestProgress(0);
    const success = await harvestNDRProject(projectId, (p) => setHarvestProgress(p));
    if (success) {
      setTimeout(() => {
        setIsHarvesting(null);
        setHarvestProgress(0);
        if (projectId === 'NINIAN_SETTLE_AUDIT') setInspectedArtifact(projectId);
      }, 500);
    }
  };

  const navigateToPortal = (portalKey: string) => {
    const url = PORTAL_URL_MAP[portalKey];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Globe size={400} className="text-blue-500 animate-spin-slow" />
      </div>

      <div className="flex flex-col space-y-6 max-w-6xl mx-auto w-full relative z-10 h-full">
        <div className="flex items-center justify-between border-b border-blue-900/30 pb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/40 rounded shadow-lg shadow-blue-500/5">
              <Globe size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-blue-400 uppercase tracking-tighter">>>> NODE_LOAD: METADATA_SOVEREIGN</h2>
              <p className="text-xs text-blue-800 font-black uppercase tracking-[0.4em]">Auth: UNIVERSAL_CRAWLER // Fiscal_Hook: CROSS_BORDER_RECLAIM</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-right">
             <div className="flex flex-col">
                <span className="text-[8px] text-blue-900 uppercase font-black">Fiscal_Reclaim_Potential</span>
                <span className="text-xl font-black text-blue-500">{fiscalReclaim.toFixed(2)}M EUR</span>
             </div>
             {onToggleFocus && (
                <button onClick={onToggleFocus} aria-label="Toggle Focus Mode" className="p-2 text-blue-900 hover:text-blue-400 transition-all">
                  {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                </button>
             )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 border border-blue-900/30 rounded-xl shadow-2xl backdrop-blur-md">
          <div className="flex flex-col space-y-1">
            <label className="text-[8px] font-black text-blue-800 uppercase tracking-widest">Search_Query</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-900" />
              <input 
                type="text" 
                placeholder="Well_Name / Quadrant / ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-950 border border-blue-900/30 rounded-lg pl-9 pr-4 py-2 text-[11px] text-blue-100 font-mono outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[8px] font-black text-blue-800 uppercase tracking-widest">Wellbore_Type</label>
            <select 
              value={wellboreType}
              onChange={(e) => setWellboreType(e.target.value)}
              className="w-full bg-slate-950 border border-blue-900/30 rounded-lg px-3 py-2 text-[11px] text-blue-400 outline-none focus:border-blue-500 font-mono"
            >
              <option value="ALL">ALL_TYPES</option>
              <option value="VERTICAL">VERTICAL</option>
              <option value="DIRECTIONAL">DIRECTIONAL</option>
              <option value="HORIZONTAL">HORIZONTAL</option>
              <option value="GBS_FIXED">GBS_FIXED</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[8px] font-black text-blue-800 uppercase tracking-widest">Project_Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-blue-900/30 rounded-lg px-3 py-2 text-[11px] text-blue-400 outline-none focus:border-blue-500 font-mono"
            >
              <option value="ALL">ALL_STATUS</option>
              <option value="RELEASED">RELEASED</option>
              <option value="RESTRICTED">RESTRICTED</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button 
              type="button"
              onClick={() => setGhostOnly(!ghostOnly)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                ghostOnly ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-900 border-blue-900/30 text-blue-900 hover:text-blue-400'
              }`}
            >
              <Ghost size={14} />
              <span>Ghost_Scan</span>
            </button>
            <button 
              type="submit"
              disabled={isScanning}
              className="px-6 py-2 bg-blue-500 text-slate-950 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-400 transition-all flex items-center justify-center gap-2"
            >
               {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Radar size={14} />}
               <span>Scan</span>
            </button>
          </div>
        </form>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-hidden">
           <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
              <div className="flex-1 bg-slate-900/80 border border-blue-900/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                 <div className="p-4 border-b border-blue-900/20 bg-black/40 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                       <Database size={14} /> <span>Archive_Results ({results.length})</span>
                    </div>
                    <div className="flex items-center gap-4">
                       {Object.keys(PORTAL_URL_MAP).map(portal => (
                         <button key={portal} onClick={() => navigateToPortal(portal)} className="text-[8px] font-black text-blue-900 hover:text-blue-400 uppercase flex items-center gap-1">
                            <ExternalLink size={10} /> {portal}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {isScanning ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30">
                         <Scan size={64} className="text-blue-500 animate-pulse" />
                         <span className="text-sm font-black uppercase tracking-[0.5em]">Harvesting_NDR_Metadata...</span>
                      </div>
                    ) : results.length > 0 ? (
                      results.map((project) => (
                        <div key={project.projectId} className="p-4 bg-slate-950/90 border border-blue-900/20 rounded-xl hover:border-blue-500 transition-all group flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                 <FileCheck size={20} className="text-blue-400" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-black text-blue-100 uppercase tracking-tighter">{project.name}</span>
                                 <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[8px] font-mono text-blue-900">ID: {project.projectId}</span>
                                    <div className="w-1 h-1 rounded-full bg-blue-900/40"></div>
                                    <span className="text-[8px] font-black text-emerald-900 uppercase">Released: {project.releaseDate}</span>
                                 </div>
                              </div>
                           </div>
                           <button 
                             onClick={() => handleHarvest(project.projectId)}
                             disabled={isHarvesting === project.projectId}
                             className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center gap-2 ${
                               isHarvesting === project.projectId 
                               ? 'bg-orange-500/20 text-orange-400' 
                               : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg'
                             }`}
                           >
                              {isHarvesting === project.projectId ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                              <span>{isHarvesting === project.projectId ? `${Math.round(harvestProgress)}%` : 'Harvest'}</span>
                           </button>
                        </div>
                      ))
                    ) : (
                      <NoDataPanel 
                        title="Archive_Registry_Standby" 
                        message="No artifacts identified in the National Data Repository based on active filters." 
                        icon={Database}
                      />
                    )}
                 </div>
              </div>
           </div>

           <div className="flex flex-col space-y-4 overflow-hidden">
              <div className="bg-slate-900/80 border border-blue-900/30 rounded-2xl p-5 shadow-2xl flex flex-col h-[300px] min-h-[250px]">
                 <div className="flex items-center justify-between mb-4 border-b border-blue-900/10 pb-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                       <TrendingUp size={14} /> <span>Subsidence_Regression</span>
                    </div>
                 </div>
                 <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={settlementData}>
                          <defs>
                             <linearGradient id="settleGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="1 5" stroke="#1e293b" opacity={0.3} vertical={false} />
                          <XAxis dataKey="year" hide />
                          <YAxis hide domain={[0, 250]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e40af', fontSize: '9px', fontFamily: 'JetBrains Mono' }}
                          />
                          <Area type="monotone" dataKey="settlement" stroke="#3b82f6" fill="url(#settleGradient)" strokeWidth={2} isAnimationActive={false} />
                          <ReferenceLine y={215} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'VETO_LIMIT', position: 'top', fill: '#ef4444', fontSize: 7, fontWeight: 'black' }} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="flex-1 bg-slate-950/90 border border-blue-900/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden relative">
                 <div className="p-4 border-b border-blue-900/20 bg-black/40 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                       <Binary size={14} /> <span>Forensic_Dossier</span>
                    </div>
                 </div>
                 <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                    {inspectedArtifact ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                         <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                            <ShieldCheck size={14} /> <span>Integrity_Verified</span>
                         </div>
                         <p className="text-[11px] font-mono text-blue-100/70 leading-relaxed italic">
                            "Artifact {inspectedArtifact} reconciled against primary rig-floor signature. Discovered 4.8m sea-floor settlement shift."
                         </p>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-8">
                         <Info size={48} />
                         <span className="text-[9px] font-black uppercase text-center">Harvest artifact for deep audit</span>
                      </div>
                    )}
                 </div>
                 <div className="p-4 border-t border-blue-900/30 bg-black/40">
                    <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 shadow-xl transition-all flex items-center justify-center gap-2">
                       <ExternalLink size={14} /> <span>Authorize_Legal_Reclaim</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NorwaySovereign;
