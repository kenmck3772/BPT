
import React, { useState, useEffect } from 'react';
import { 
  Globe, ShieldCheck, Target, Activity, 
  Database, Zap, TrendingUp, Coins, 
  Anchor, Waves, ArrowRight, ShieldAlert,
  Loader2, Scan, Info, Binary, Radar,
  History, Download, FileCheck, Layers,
  ChevronRight, Search, Filter, Ghost, ExternalLink, MapPin
} from 'lucide-react';
import { NDRProject } from '../types';
import { searchNDRMetadata, harvestNDRProject } from '../services/ndrService';
import { GHOST_HUNTER_MISSION } from '../constants';

const PORTAL_URL_MAP: Record<string, string> = {
  "NSTA_NDR": "https://ndr.nstauthority.co.uk/",
  "NPD_FACTPAGES": "https://factpages.sodir.no/",
  "NOPIMS_FED": "https://nopims.industry.gov.au/",
  "PEPS_SA": "https://peps.sarig.sa.gov.au/",
};

const NorwaySovereign: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState<string | null>(null);
  const [harvestProgress, setHarvestProgress] = useState(0);
  const [results, setResults] = useState<NDRProject[]>([]);
  const [fiscalReclaim, setFiscalReclaim] = useState(0);
  
  // Search State
  const [query, setQuery] = useState('');
  const [wellboreType, setWellboreType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [ghostOnly, setGhostOnly] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsScanning(true);
    setResults([]);
    
    // Simulate complex crawling
    const projects = await searchNDRMetadata(query, status, wellboreType, 'ALL', ghostOnly);
    
    setTimeout(() => {
      setResults(projects);
      setIsScanning(false);
      if (projects.length > 0) {
        setFiscalReclaim(projects.length * 4.15); // Simulated reclaim logic
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
    // Initial fetch
    handleSearch();
  }, []);

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      {/* Background HUD Decorations */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Globe size={400} className="text-blue-500 animate-spin-slow" />
      </div>

      <div className="flex flex-col space-y-6 max-w-6xl mx-auto w-full relative z-10 h-full">
        {/* Module Header */}
        <div className="flex items-center justify-between border-b border-blue-900/30 pb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/40 rounded shadow-lg shadow-blue-500/5">
              <Globe size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-blue-400 uppercase tracking-tighter">>>> NODE_LOAD: METADATA_SOVEREIGN (NDR/Sodir)</h2>
              <p className="text-xs text-blue-800 font-black uppercase tracking-[0.4em]">Auth: UNIVERSAL_CRAWLER // Fiscal_Hook: CROSS_BORDER_RECLAIM</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-right">
             <div className="flex flex-col">
                <span className="text-[8px] text-blue-900 uppercase font-black">Fiscal_Reclaim_Potential</span>
                <span className="text-xl font-black text-blue-500">{fiscalReclaim.toFixed(2)}M EUR</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] text-blue-900 uppercase font-black">Node_Status</span>
                <span className="text-xl font-black text-blue-500">AUTHORIZED</span>
             </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 border border-blue-900/30 rounded-xl shadow-2xl backdrop-blur-md">
          <div className="flex flex-col space-y-1">
            <label className="text-[8px] font-black text-blue-800 uppercase tracking-widest">Search_Query</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-900" />
              <input 
                type="text" 
                data-testid="ndr-search-input"
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
              data-testid="ghost-scan-toggle"
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
              data-testid="ndr-search-submit"
              disabled={isScanning}
              className="px-6 py-2 bg-blue-500 text-slate-950 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-400 transition-all shadow-lg flex items-center space-x-2"
            >
              {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Radar size={14} />}
              <span>Crawl</span>
            </button>
          </div>
        </form>

        {/* Main Interface Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0 overflow-hidden">
          
          {/* Middle Column: Results Visualization */}
          <div className="lg:col-span-3 glass-panel rounded-lg bg-slate-950 border border-blue-900/40 relative overflow-hidden flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-blue-900/20 pb-2">
              <div className="flex items-center space-x-2">
                 <Binary size={14} className="text-blue-500" />
                 <span className={`text-[10px] font-black uppercase text-blue-400 tracking-widest`}>NDR_Metadata_Artifacts</span>
              </div>
              <span className="text-[8px] text-blue-950 font-mono">Found: {results.length} Entities</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {isScanning ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Radar size={48} className="text-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black text-blue-900 uppercase tracking-[0.5em]">Scanning Grid Quadrants...</span>
                </div>
              ) : results.length > 0 ? (
                results.map((project) => (
                  <div key={project.projectId} className="group p-4 bg-slate-900/40 border border-blue-900/20 rounded-xl hover:border-blue-500 transition-all relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                         <div className="p-1.5 bg-blue-500/10 rounded">
                           <FileCheck size={16} className="text-blue-400" />
                         </div>
                         <div className="flex flex-col">
                           <span className="text-[11px] font-black text-blue-100 uppercase">{project.name}</span>
                           <span className="text-[8px] font-mono text-blue-800">{project.projectId}</span>
                         </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {project.hasDatumShiftIssues && (
                          <div className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/40 rounded text-[7px] font-black text-orange-400 uppercase">GHOST_DETECTED</div>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black ${project.status === 'RELEASED' ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-slate-950'}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-[9px] font-black uppercase tracking-widest text-blue-900">
                      <div>QUAD: <span className="text-blue-500">{project.quadrant}</span></div>
                      <div>TYPE: <span className="text-blue-500">{project.wellboreType}</span></div>
                      <div>SIZE: <span className="text-blue-500">{project.sizeGb}GB</span></div>
                      <div>RELEASE: <span className="text-blue-500">{project.releaseDate}</span></div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-blue-900/10">
                      <div className="flex items-center space-x-4">
                        <span className="text-[8px] font-mono text-blue-950">SHA512: {project.sha512.substring(0, 16)}...</span>
                      </div>
                      <button 
                        onClick={() => handleHarvest(project.projectId)}
                        data-testid={`harvest-btn-${project.projectId}`}
                        disabled={!!isHarvesting}
                        className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${
                          isHarvesting === project.projectId 
                          ? 'bg-blue-500/20 text-blue-500 cursor-wait' 
                          : 'bg-blue-500 text-slate-950 hover:bg-blue-400'
                        }`}
                      >
                        {isHarvesting === project.projectId ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        <span>{isHarvesting === project.projectId ? 'Harvesting...' : 'Harvest_Project'}</span>
                      </button>
                    </div>

                    {isHarvesting === project.projectId && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                        <div className="h-full bg-blue-400 transition-all duration-300" style={{ width: `${harvestProgress}%` }}></div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                   <Radar size={100} />
                   <span className="text-xs font-black uppercase tracking-[0.5em]">No_Results_Found_In_Registry</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Targets & Stats */}
          <div className="lg:col-span-1 flex flex-col space-y-4">
            {/* Active Mission Briefing */}
            <div className="glass-panel p-5 rounded-lg border border-blue-900/40 bg-slate-900/80 flex flex-col shadow-xl">
              <h3 className="text-[10px] font-black text-blue-400 mb-4 uppercase tracking-widest flex items-center">
                <Target size={16} className="mr-2" /> Active_Mission_Briefing
              </h3>
              <div className="space-y-3">
                {GHOST_HUNTER_MISSION.TARGETS.slice(0, 3).map((target, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 rounded border border-blue-900/20 space-y-1.5">
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-black text-blue-100 uppercase">{target.ASSET}</span>
                       <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${target.PRIORITY === 'CRITICAL' ? 'bg-red-500 text-slate-950' : 'bg-orange-500 text-slate-950'}`}>
                         {target.PRIORITY}
                       </span>
                    </div>
                    <div className="flex items-center text-[7px] text-blue-800 uppercase font-black">
                       <MapPin size={8} className="mr-1" /> {target.REGION.replace('_', ' ')}
                    </div>
                    <button 
                      onClick={() => navigateToPortal(target.DATA_PORTAL)}
                      className="w-full flex items-center justify-between px-2 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded hover:bg-blue-500/20 transition-all group"
                    >
                       <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Portal: {target.DATA_PORTAL}</span>
                       <ExternalLink size={10} className="text-blue-600 group-hover:text-blue-400 transition-colors" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-5 rounded-lg border border-blue-900/40 bg-slate-900/80 flex flex-col flex-1 shadow-xl">
              <h3 className="text-[10px] font-black text-blue-400 mb-4 uppercase tracking-widest flex items-center">
                <History size={16} className="mr-2" /> Forensic_Archive
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                <div className="p-3 bg-slate-950 rounded border border-blue-900/40 hover:border-blue-500 transition-all group">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black text-blue-100 uppercase">Thistle_A7_Legacy</span>
                      <ChevronRight size={12} className="text-blue-900 group-hover:text-blue-400" />
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[7px] text-emerald-500 uppercase font-black">STATUS: HARVESTED</span>
                      <span className="text-[7px] font-mono text-blue-900">1.2GB</span>
                   </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-900/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-blue-900 uppercase">Vault_Storage</span>
                  <span className="text-[9px] font-black text-blue-500">82%</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden mb-4">
                   <div className="h-full bg-blue-500" style={{ width: '82%' }}></div>
                </div>
                <button className="w-full py-3 bg-blue-500/10 border border-blue-500/40 text-blue-400 rounded font-black text-[9px] uppercase tracking-widest hover:bg-blue-500 hover:text-slate-950 flex items-center justify-center space-x-2 group">
                   <Layers size={12} className="group-hover:animate-pulse" />
                   <span>View_All_Artifacts</span>
                </button>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-lg border border-blue-900/40 bg-slate-950/90 text-[8px] space-y-2 opacity-60">
               <div className="flex items-center space-x-2 text-blue-500 font-black mb-1">
                 <ShieldAlert size={12} />
                 <span>METADATA_UPLINK_LOG</span>
               </div>
               <p className="font-mono text-blue-700 leading-tight">
                > TARGETING_GRID_X88...<br/>
                > CRAWLER_STATE: SCANNING<br/>
                > WELLBORE_FILTER: {wellboreType}<br/>
                > NODE_ID: NDR_SOVEREIGN_V2
               </p>
            </div>
          </div>
        </div>

        {/* Global Module Footer */}
        <div className="pt-4 border-t border-blue-900/20 flex items-center justify-between text-[8px] font-black text-blue-900 uppercase tracking-[0.2em] mt-auto">
           <div className="flex items-center space-x-6">
              <span className="flex items-center space-x-2">
                <Database size={12} />
                <span>NDR_REGISTRY_SECURE</span>
              </span>
              <span className="flex items-center space-x-2">
                <Target size={12} />
                <span>DATUM_SYNC: GLOBAL_GRID</span>
              </span>
           </div>
           <div className="flex items-center space-x-4">
              <span className="text-blue-950">UNIVERSAL_CRAWLER_SYSTEM_ACTIVE</span>
              <div className="flex items-center space-x-1">
                 <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
                 <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NorwaySovereign;
