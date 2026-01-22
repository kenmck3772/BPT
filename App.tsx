
import React, { useState, useEffect, useCallback } from 'react';
import GhostSync from './components/GhostSync';
import TraumaNode from './components/TraumaNode';
import PulseAnalyzer from './components/PulseAnalyzer';
import ReportsScanner from './components/ReportsScanner';
import Vault from './components/Vault';
import CerberusSimulator from './components/CerberusSimulator';
import { ActiveModule, NDRProject, TraumaEvent } from './types';
import { getForensicInsight } from './services/geminiService';
import { searchNDRMetadata, harvestNDRProject } from './services/ndrService';
import { generateSovereignAudit } from './reporting/pdfEngine';
import { calculateLinearRegression, diagnoseSawtooth } from './forensic_logic/math';
import { MOCK_PRESSURE_DATA, MOCK_INTERVENTION_REPORTS, MOCK_TUBING_TALLY } from './constants';
import { 
  Terminal, Activity, Database, Download, AlertCircle, 
  Search, Loader2, Box, Ghost, FileText, 
  Cpu, Wifi, Zap, CornerDownRight, Radio, Settings2, 
  Fingerprint, Power, LayoutGrid, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, X, ShieldAlert, Sparkles,
  FileSearch, Compass, MoveDown, RotateCw, ShieldCheck
} from 'lucide-react';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>(ActiveModule.GHOST_SYNC);
  const [focusedModule, setFocusedModule] = useState<'CRAWLER' | 'WORKSPACE' | 'INTEL' | null>(null);
  const [insight, setInsight] = useState<string>("SYSTEM_READY. WAITING FOR DATA INJECTION.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExportingAudit, setIsExportingAudit] = useState(false);
  const [uptime, setUptime] = useState("00:00:00");
  
  // NDR States
  const [ndrSearchQuery, setNdrSearchQuery] = useState("");
  const [isNdrSearching, setIsNdrSearching] = useState(false);
  const [ndrResults, setNdrResults] = useState<NDRProject[]>([]);
  const [harvestingId, setHarvestingId] = useState<string | null>(null);
  const [harvestProgress, setHarvestProgress] = useState(0);
  const [allowanceUsed, setAllowanceUsed] = useState(14.2); 
  const [isGhostOnly, setIsGhostOnly] = useState(false);
  const [wellboreFilter, setWellboreFilter] = useState<'ALL' | 'VERTICAL' | 'HORIZONTAL' | 'DIRECTIONAL'>('ALL');

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const diff = Date.now() - start;
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNdrSearch = useCallback(async () => {
    setIsNdrSearching(true);
    try {
      const results = await searchNDRMetadata(ndrSearchQuery, 'ALL', wellboreFilter, isGhostOnly);
      setNdrResults(results);
    } catch (err) {
      setInsight("NDR_ERROR: SECURE HANDSHAKE FAILED.");
    } finally {
      setIsNdrSearching(false);
    }
  }, [ndrSearchQuery, wellboreFilter, isGhostOnly]);

  useEffect(() => {
    handleNdrSearch();
  }, [isGhostOnly, wellboreFilter, handleNdrSearch]);

  const fetchInsight = async (context?: string) => {
    setIsAnalyzing(true);
    setInsight("ARCHITECT ANALYZING DATA VECTORS...");
    const result = await getForensicInsight(activeModule, context || "Switching forensic module.");
    setInsight(result);
    setIsAnalyzing(false);
  };

  const handleHarvest = async (project: NDRProject) => {
    if (harvestingId) return;
    setHarvestingId(project.projectId);
    setHarvestProgress(0);
    try {
      const success = await harvestNDRProject(project.projectId, setHarvestProgress);
      if (success) {
        setAllowanceUsed(prev => prev + project.sizeGb);
        fetchInsight(`Harvested project ${project.projectId}`);
      }
    } finally {
      setHarvestingId(null);
    }
  };

  const handleExportAudit = async () => {
    setIsExportingAudit(true);
    try {
      const traumaLogRaw = localStorage.getItem('BRAHAN_BLACK_BOX_LOGS');
      const traumaLog: TraumaEvent[] = traumaLogRaw ? JSON.parse(traumaLogRaw) : [];
      
      const pressures = MOCK_PRESSURE_DATA.slice(0, 4).map(d => d.pressure);
      const { rSquared, slope } = calculateLinearRegression(pressures);
      const pulseDiag = diagnoseSawtooth(rSquared, slope);

      // Detail Tally working
      const totalTally = MOCK_TUBING_TALLY.reduce((acc, curr) => acc + curr.length_m, 0);
      const report = MOCK_INTERVENTION_REPORTS[0];
      const discordance = Math.abs(totalTally - report.eodDepth_m);

      await generateSovereignAudit({
        uwi: "THISTLE_A7_PROTOTYPE",
        projectName: "Thistle A7 Legacy",
        projectId: "THISTLE1978well0001",
        sha512: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        offset: 14.5,
        pulseDiagnosis: {
          status: pulseDiag.status,
          slope: slope,
          rSquared: rSquared,
          diagnosis: pulseDiag.diagnosis
        },
        traumaLog: traumaLog,
        tallyAudit: {
          reportId: report.reportId,
          discordance: discordance,
          totalTally: totalTally,
          reportedDepth: report.eodDepth_m
        },
        timestamp: new Date().toISOString(),
        forensicInsight: insight
      });
    } finally {
      setIsExportingAudit(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [activeModule]);

  const toggleFocus = (target: 'CRAWLER' | 'WORKSPACE' | 'INTEL' | null) => {
    setFocusedModule(prev => prev === target ? null : target);
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-emerald-500 p-2 font-terminal overflow-hidden transition-all duration-700">
      
      {focusedModule && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 transition-opacity duration-500 pointer-events-none"
          style={{ opacity: 1 }}
        ></div>
      )}

      <header className={`flex items-center justify-between mb-2 glass-panel p-2 rounded-t-lg border-b transition-all duration-500 z-50 ${
        focusedModule ? 'bg-slate-950/95 border-emerald-400/60 backdrop-blur-3xl py-3 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'bg-slate-950/40 border-emerald-500/20'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded cursor-pointer group hover:bg-emerald-500/20 transition-all" onClick={() => setFocusedModule(null)}>
             <Fingerprint size={16} className={`text-emerald-400 group-hover:animate-pulse ${focusedModule ? 'animate-bounce text-emerald-300' : ''}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Brahan_Terminal_v2.5</span>
          </div>
          <div className="h-4 w-px bg-emerald-900/50"></div>
          <div className="flex items-center space-x-3 text-[9px] font-bold text-emerald-800 uppercase tracking-tighter">
            <span className="flex items-center"><Cpu size={10} className="mr-1" /> Uptime: {uptime}</span>
            <span className={`flex items-center ${focusedModule ? 'text-emerald-400' : ''}`}><Wifi size={10} className="mr-1 text-emerald-600" /> Uplink: Stable</span>
          </div>
        </div>

        <nav className={`flex space-x-1 transition-all duration-500 ${focusedModule && focusedModule !== 'WORKSPACE' ? 'opacity-20 scale-95 blur-sm' : 'opacity-100'}`} data-testid="module-navigation">
          {[
            { id: ActiveModule.GHOST_SYNC, icon: <Ghost size={14} />, label: 'GHOST_SYNC', desc: 'Alignment Engine' },
            { id: ActiveModule.TRAUMA_NODE, icon: <Box size={14} />, label: 'TRAUMA_NODE', desc: 'Structural Forensics' },
            { id: ActiveModule.PULSE_ANALYZER, icon: <Activity size={14} />, label: 'PULSE_ANALYZER', desc: 'Leak Diagnostic' },
            { id: ActiveModule.CERBERUS, icon: <ShieldCheck size={14} />, label: 'CERBERUS', desc: 'Survival Simulator' },
            { id: ActiveModule.REPORTS_SCANNER, icon: <FileSearch size={14} />, label: 'REPORTS_SCANNER', desc: 'Report Audit' },
            { id: ActiveModule.VAULT, icon: <Database size={14} />, label: 'VAULT_CACHE', desc: 'Secure Archive' },
          ].map((item) => (
            <div key={item.id} className="relative group">
              <button
                onClick={() => { setActiveModule(item.id); if(focusedModule === 'WORKSPACE') setFocusedModule(null); }}
                data-testid={`nav-${item.id.toLowerCase()}`}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-sm transition-all border ${
                  activeModule === item.id 
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                    : 'text-emerald-800 border-transparent hover:text-emerald-400 hover:bg-emerald-950/20'
                }`}
              >
                {item.icon}
                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 bg-slate-950 border border-emerald-500/50 rounded shadow-[0_0_15px_rgba(16,185,129,0.2)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[100] transform translate-y-2 group-hover:translate-y-0">
                <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">{item.label}</div>
                <div className="text-[7px] font-mono text-emerald-700 uppercase whitespace-nowrap">{item.desc}</div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-t border-l border-emerald-500/50 rotate-45"></div>
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {focusedModule && (
            <button 
              onClick={() => setFocusedModule(null)}
              className="px-4 py-1.5 bg-red-500/10 border border-red-500/40 text-red-500 text-[9px] font-black uppercase rounded flex items-center space-x-2 hover:bg-red-500 hover:text-slate-950 transition-all animate-in fade-in slide-in-from-top-2"
            >
              <Minimize2 size={12} />
              <span>Exit Focus</span>
            </button>
          )}
          <button className="p-1.5 text-emerald-900 hover:text-emerald-400 transition-colors">
            <Settings2 size={16} />
          </button>
          <button className="p-1.5 text-red-900 hover:text-red-500 transition-colors">
            <Power size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex space-x-2 overflow-hidden relative">
        <aside className={`flex flex-col space-y-2 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          focusedModule === 'CRAWLER' ? 'w-full translate-x-0' : 
          focusedModule ? 'w-0 -translate-x-full opacity-0 blur-xl pointer-events-none' : 'w-72'
        }`} data-testid="crawler-sidebar">
          <div className="flex-1 glass-panel rounded-lg flex flex-col overflow-hidden relative border border-emerald-900/30">
            <div className={`p-3 border-b border-emerald-900/30 flex justify-between items-center bg-slate-950/40 transition-all duration-500 ${focusedModule === 'CRAWLER' ? 'py-5 px-6' : ''}`}>
              <div className="flex items-center space-x-3" onClick={() => toggleFocus('CRAWLER')} style={{ cursor: 'pointer' }}>
                <Database size={focusedModule === 'CRAWLER' ? 20 : 16} className="text-emerald-500" />
                <span className={`font-black uppercase tracking-[0.3em] text-emerald-400 ${focusedModule === 'CRAWLER' ? 'text-lg' : 'text-[10px]'}`}>NDR Crawler</span>
              </div>
              <button onClick={() => toggleFocus('CRAWLER')} className="p-1.5 text-emerald-800 hover:text-emerald-400 transition-colors bg-emerald-950/20 rounded">
                {focusedModule === 'CRAWLER' ? <Minimize2 size={18} /> : <Maximize2 size={14} />}
              </button>
            </div>
            
            <div className={`p-4 space-y-4 transition-all duration-500 ${focusedModule === 'CRAWLER' ? 'max-w-4xl mx-auto w-full px-10' : ''}`}>
              <div className="relative group">
                <input 
                  type="text" 
                  data-testid="ndr-search-input"
                  placeholder="Query NDR Metadata Graph..."
                  value={ndrSearchQuery}
                  onChange={(e) => setNdrSearchQuery(e.target.value)}
                  className={`w-full bg-slate-950/80 border border-emerald-900/40 rounded px-4 py-3 text-xs outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-950 group-hover:border-emerald-600 ${focusedModule === 'CRAWLER' ? 'text-lg py-4' : ''}`}
                  onKeyDown={(e) => e.key === 'Enter' && handleNdrSearch()}
                />
                <button 
                  onClick={handleNdrSearch}
                  data-testid="ndr-search-submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-900 hover:text-emerald-400 transition-colors"
                >
                  <Search size={focusedModule === 'CRAWLER' ? 20 : 16} />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest">Wellbore_Schema</span>
                  <Compass size={10} className="text-emerald-900" />
                </div>
                <div className="grid grid-cols-4 gap-1 bg-slate-950/80 p-1 border border-emerald-900/20 rounded">
                  {(['ALL', 'VERTICAL', 'HORIZONTAL', 'DIRECTIONAL'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setWellboreFilter(type)}
                      className={`py-1.5 text-[8px] font-black uppercase tracking-tighter rounded transition-all ${
                        wellboreFilter === type 
                          ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                          : 'text-emerald-900 hover:text-emerald-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setIsGhostOnly(!isGhostOnly)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded border transition-all duration-300 ${
                  isGhostOnly 
                    ? 'bg-orange-950/30 border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(255,95,31,0.2)]' 
                    : 'bg-slate-900/50 border-emerald-900/40 text-emerald-800 hover:border-emerald-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Ghost size={16} className={isGhostOnly ? 'animate-pulse' : 'opacity-40'} />
                  <span className={`font-black uppercase tracking-widest ${focusedModule === 'CRAWLER' ? 'text-sm' : 'text-[10px]'}`}>Datum shift filter (GHOST_SCAN)</span>
                </div>
                <div className={`px-3 py-1 rounded text-[10px] font-black ${isGhostOnly ? 'bg-orange-500 text-slate-950' : 'bg-slate-800 text-emerald-900'}`}>
                  {isGhostOnly ? 'TRACE_ACTIVE' : 'OFFLINE'}
                </div>
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar transition-all duration-500 ${focusedModule === 'CRAWLER' ? 'grid grid-cols-2 lg:grid-cols-4 gap-4 space-y-0 px-10 pb-10' : ''}`} data-testid="ndr-results">
              {ndrResults.map((project) => (
                <div key={project.projectId} data-testid={`project-${project.projectId}`} className="p-4 bg-slate-900/40 border border-emerald-900/20 rounded hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all cursor-default group relative overflow-hidden h-fit">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-mono text-emerald-600 truncate">{project.projectId}</span>
                    <div className="flex space-x-1">
                      {project.wellboreType === 'VERTICAL' && <MoveDown size={10} className="text-blue-500" title="Vertical Well" />}
                      {project.wellboreType === 'HORIZONTAL' && <ChevronRight size={10} className="text-purple-500" title="Horizontal Well" />}
                      {project.wellboreType === 'DIRECTIONAL' && <RotateCw size={10} className="text-yellow-500" title="Directional Well" />}
                      {project.hasDatumShiftIssues && <AlertCircle size={12} className="text-orange-500 animate-pulse" title="High Discordance Risk" />}
                    </div>
                  </div>
                  <div className={`font-bold text-emerald-100 truncate ${focusedModule === 'CRAWLER' ? 'text-sm' : 'text-[11px]'}`}>{project.name}</div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[9px] text-emerald-800 uppercase tracking-tighter">{project.type} // {project.quadrant}</span>
                    <button 
                      onClick={() => handleHarvest(project)} 
                      data-testid={`harvest-btn-${project.projectId}`}
                      className={`p-2 transition-all rounded bg-emerald-900/20 ${harvestingId === project.projectId ? 'text-emerald-400 animate-spin' : 'text-emerald-700 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                  {harvestingId === project.projectId && (
                    <div className="mt-3 h-1 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${harvestProgress}%` }}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className={`flex-1 glass-panel rounded-lg flex flex-col overflow-hidden relative border transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          focusedModule === 'WORKSPACE' ? 'z-[60] border-emerald-400 shadow-[0_0_80px_rgba(16,185,129,0.4)] ring-2 ring-emerald-500/30 scale-[1.01]' : 
          focusedModule ? 'opacity-20 blur-xl scale-95 pointer-events-none' : 'border-emerald-900/30'
        }`} data-testid="main-workspace">
          
          <div className="flex-1 relative h-full">
            <div className={`absolute inset-0 pointer-events-none border-[1px] border-emerald-500/10 z-20 ${focusedModule === 'WORKSPACE' ? 'opacity-100' : 'opacity-0'}`}></div>
            {activeModule === ActiveModule.GHOST_SYNC && <GhostSync />}
            {activeModule === ActiveModule.TRAUMA_NODE && (
              <TraumaNode 
                isFocused={focusedModule === 'WORKSPACE'} 
                onToggleFocus={() => toggleFocus('WORKSPACE')} 
              />
            )}
            {activeModule === ActiveModule.PULSE_ANALYZER && <PulseAnalyzer />}
            {activeModule === ActiveModule.CERBERUS && <CerberusSimulator />}
            {activeModule === ActiveModule.REPORTS_SCANNER && <ReportsScanner />}
            {activeModule === ActiveModule.VAULT && <Vault />}
          </div>
        </div>

        <aside className={`flex flex-col space-y-2 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          focusedModule === 'INTEL' ? 'w-full translate-x-0' : 
          focusedModule ? 'w-0 translate-x-full opacity-0 blur-xl pointer-events-none' : 'w-80'
        }`} data-testid="intel-sidebar">
          <div className="flex-1 glass-panel rounded-lg flex flex-col overflow-hidden relative border border-emerald-900/30">
            <div className={`p-3 border-b border-emerald-900/30 flex justify-between items-center bg-slate-950/40 transition-all duration-500 ${focusedModule === 'INTEL' ? 'py-5 px-6' : ''}`} onClick={() => toggleFocus('INTEL')} style={{ cursor: 'pointer' }}>
              <div className="flex items-center space-x-3">
                <Terminal size={focusedModule === 'INTEL' ? 20 : 16} className="text-emerald-500" />
                <span className={`font-black uppercase tracking-[0.3em] text-emerald-400 ${focusedModule === 'INTEL' ? 'text-lg' : 'text-[10px]'}`}>Forensic Intel</span>
              </div>
              <button className="p-1.5 text-emerald-800 hover:text-emerald-400 transition-colors bg-emerald-950/20 rounded">
                {focusedModule === 'INTEL' ? <Minimize2 size={18} /> : <Maximize2 size={14} />}
              </button>
            </div>
            
            <div className={`flex-1 overflow-y-auto p-6 font-terminal text-xs leading-relaxed relative ${isAnalyzing ? 'opacity-50' : ''} custom-scrollbar transition-all duration-500 ${focusedModule === 'INTEL' ? 'max-w-4xl mx-auto text-base py-10' : ''}`}>
              <div className={`flex items-start space-x-3 mb-6 opacity-40 ${focusedModule === 'INTEL' ? 'mb-10' : ''}`}>
                <CornerDownRight size={focusedModule === 'INTEL' ? 20 : 14} className="mt-1" />
                <span className="italic tracking-tighter">Secure Uplink established. Analyzing petrophysical data streams...</span>
              </div>
              
              <div className={`bg-slate-900/40 border border-emerald-500/10 p-6 rounded-lg shadow-inner ${focusedModule === 'INTEL' ? 'p-10 text-lg leading-loose' : ''}`}>
                <span className="text-emerald-100 drop-shadow-[0_0_2px_rgba(16,185,129,0.3)]" data-testid="gemini-insight-text">{insight}</span>
              </div>

              {focusedModule === 'INTEL' && (
                <div className="mt-20 grid grid-cols-3 gap-10 opacity-80">
                   <div className="p-8 border border-emerald-900/30 rounded-xl bg-slate-950/50">
                      <div className="text-emerald-900 text-[10px] font-black uppercase mb-2">Confidence_Rating</div>
                      <div className="text-4xl font-black text-emerald-400 tracking-tighter">98.42%</div>
                   </div>
                   <div className="p-8 border border-emerald-900/30 rounded-xl bg-slate-950/50">
                      <div className="text-emerald-900 text-[10px] font-black uppercase mb-2">Anomaly_Weight</div>
                      <div className="text-4xl font-black text-orange-500 tracking-tighter">HIGH</div>
                   </div>
                   <div className="p-8 border border-emerald-900/30 rounded-xl bg-slate-950/50">
                      <div className="text-emerald-900 text-[10px] font-black uppercase mb-2">Datum_Verified</div>
                      <div className="text-4xl font-black text-emerald-600 tracking-tighter">YES</div>
                   </div>
                </div>
              )}
            </div>

            <div className={`p-4 bg-slate-950/80 border-t border-emerald-900/30 transition-all ${focusedModule === 'INTEL' ? 'py-10' : ''}`}>
              <button 
                onClick={handleExportAudit}
                disabled={isExportingAudit}
                data-testid="sovereign-veto-btn"
                className={`w-full py-4 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 rounded font-black uppercase transition-all tracking-[0.4em] flex items-center justify-center space-x-4 group relative overflow-hidden ${focusedModule === 'INTEL' ? 'max-w-md mx-auto py-6 text-sm' : 'text-[10px]'}`}
              >
                <div className="absolute inset-0 bg-emerald-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {isExportingAudit ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} className="group-hover:animate-pulse" />}
                <span>{isExportingAudit ? 'COMPILING_VETO...' : 'EXECUTE SOVEREIGN VETO'}</span>
              </button>
            </div>
          </div>
        </aside>

      </main>

      <footer className={`mt-2 glass-panel p-2 rounded-b-lg flex items-center justify-between border-t border-emerald-500/20 text-[8px] font-terminal font-black tracking-widest text-emerald-900 z-50 transition-all duration-500 ${focusedModule ? 'bg-slate-950/90 py-3 shadow-[0_-20px_40px_rgba(1,4,9,0.8)]' : 'bg-slate-950/40'}`}>
        <div className="flex items-center space-x-8 px-2">
          <span className="flex items-center"><Activity size={10} className="mr-2 text-emerald-700" /> IO_BUS: 4.8 GB/S</span>
          <span className="flex items-center"><LayoutGrid size={10} className="mr-2 text-emerald-700" /> VIRTUAL_GRIDS: 128_CORE</span>
          {focusedModule && (
            <span className="flex items-center text-emerald-500 animate-pulse bg-emerald-500/10 px-3 py-1 rounded-sm border border-emerald-500/20">
              <ShieldAlert size={10} className="mr-2" /> MODULE_FOCUS_ACTIVE: {focusedModule}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-6 px-2">
          <span className="text-emerald-800">ENCRYPTION: AES-256_RSA_VALIDATED</span>
          <div className="h-3 w-px bg-emerald-900/30"></div>
          <span className="text-emerald-700 font-mono tracking-tighter">SYSTEM_CLOCK: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
