
import React, { useState, useEffect, useCallback } from 'react';
import GhostSync from './components/GhostSync';
import TraumaNode from './components/TraumaNode';
import PulseAnalyzer from './components/PulseAnalyzer';
import ReportsScanner from './components/ReportsScanner';
import Vault from './components/Vault';
import LegacyRecovery from './components/LegacyRecovery';
import NorwaySovereign from './components/NorwaySovereign';
import MissionControl from './components/MissionControl';
import ChanonryProtocol from './components/ChanonryProtocol';
import ProtocolManual from './components/ProtocolManual';
import { ActiveModule, NDRProject, TraumaEvent, MissionTarget } from './types';
import { getForensicInsight, getSovereignVeto } from './services/geminiService';
import { searchNDRMetadata, harvestNDRProject } from './services/ndrService';
import { generateSovereignAudit } from './reporting/pdfEngine';
import { calculateLinearRegression, diagnoseSawtooth } from './forensic_logic/math';
import { MOCK_PRESSURE_DATA, MOCK_INTERVENTION_REPORTS, MOCK_TUBING_TALLY } from './constants';
import { 
  Terminal, Activity, Database, Download, AlertCircle, 
  Search, Loader2, Box, Ghost, FileText, 
  Cpu, Wifi, Zap, Settings2, 
  Fingerprint, Power, Maximize2, Minimize2,
  X, ShieldAlert, Sparkles, FileSearch, 
  RotateCw, ShieldCheck, Radar, Target, Menu, Globe, Filter,
  Skull, BookOpen, Coins
} from 'lucide-react';

const DataStream: React.FC = () => {
  const [streams, setStreams] = useState<string[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      setStreams(prev => {
        const next = [...prev, Math.random().toString(16).substring(2, 10).toUpperCase()];
        return next.slice(-20);
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 right-4 bottom-0 w-12 md:w-24 overflow-hidden pointer-events-none opacity-5 font-terminal text-[8px] md:text-[10px] flex flex-col items-end pt-20 z-0">
      {streams.map((s, i) => <div key={i} className="mb-1">{s}</div>)}
    </div>
  );
};

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>(ActiveModule.MISSION_CONTROL);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1280);
  const [insight, setInsight] = useState<string>("SYSTEM_READY. WAITING FOR MISSION DEPLOYMENT.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExportingAudit, setIsExportingAudit] = useState(false);
  const [uptime, setUptime] = useState("00:00:00");
  
  // NDR States
  const [ndrSearchQuery, setNdrSearchQuery] = useState("");
  const [isNdrSearching, setIsNdrSearching] = useState(false);
  const [ndrResults, setNdrResults] = useState<NDRProject[]>([]);
  const [harvestingId, setHarvestingId] = useState<string | null>(null);
  const [harvestProgress, setHarvestProgress] = useState(0);
  const [isGhostOnly, setIsGhostOnly] = useState(false);
  const [wellboreFilter, setWellboreFilter] = useState<'ALL' | 'VERTICAL' | 'HORIZONTAL' | 'DIRECTIONAL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const diff = Date.now() - start;
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    }, 1000);

    const handleResize = () => {
      if (window.innerWidth < 1280 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen]);

  const handleNdrSearch = useCallback(async () => {
    setIsNdrSearching(true);
    try {
      const results = await searchNDRMetadata(ndrSearchQuery, statusFilter, wellboreFilter, projectTypeFilter, isGhostOnly);
      setNdrResults(results);
    } catch (err) {
      setInsight("NDR_ERROR: SECURE HANDSHAKE FAILED.");
    } finally {
      setIsNdrSearching(false);
    }
  }, [ndrSearchQuery, statusFilter, wellboreFilter, projectTypeFilter, isGhostOnly]);

  useEffect(() => {
    handleNdrSearch();
  }, [handleNdrSearch]);

  const fetchInsight = async (context?: string) => {
    setIsAnalyzing(true);
    setInsight("ARCHITECT ANALYZING DATA VECTORS...");
    const result = await getForensicInsight(activeModule, context || "Switching forensic module.");
    setInsight(result);
    setIsAnalyzing(false);
  };

  const handleMissionSelect = (target: MissionTarget) => {
    fetchInsight(`GLOBAL_MISSION: Investigating ${target.ASSET} in ${target.REGION}. Anomaly: ${target.ANOMALY_TYPE}. Data Portal: ${target.DATA_PORTAL}. Priority: ${target.PRIORITY}.`);
    
    if (target.REGION === 'NORWAY_SOVEREIGN') {
      setActiveModule(ActiveModule.NORWAY_SOVEREIGN);
    } else if (target.ANOMALY_TYPE.includes("SHIFT")) {
       setActiveModule(ActiveModule.GHOST_SYNC);
    } else if (target.ANOMALY_TYPE.includes("VELOCITY") || target.ANOMALY_TYPE.includes("RECOVERY")) {
       setActiveModule(ActiveModule.LEGACY_RECOVERY);
    }
  };

  const handleHarvest = async (project: NDRProject) => {
    if (harvestingId) return;
    setHarvestingId(project.projectId);
    setHarvestProgress(0);
    try {
      const success = await harvestNDRProject(project.projectId, setHarvestProgress);
      if (success) {
        fetchInsight(`Harvested project ${project.projectId}`);
      }
    } finally {
      setHarvestingId(null);
    }
  };

  const handleSovereignVeto = async () => {
    setIsExportingAudit(true);
    setInsight("INITIATING SOVEREIGN VETO PROTOCOL (v.92)...");
    
    try {
      // 1. Gather Telemetry Packets
      const pressures = MOCK_PRESSURE_DATA.slice(0, 4).map(d => d.pressure);
      const { rSquared, slope } = calculateLinearRegression(pressures);
      
      const traumaLogRaw = localStorage.getItem('BRAHAN_BLACK_BOX_LOGS');
      const traumaLog = traumaLogRaw ? JSON.parse(traumaLogRaw) : [];
      
      // Build a comprehensive data packet for Gemini
      const packet = `
        GHOST-SYNC_LOGS: Depth Offset identified at 14.5m for Thistle A7.
        PULSE_ANALYZER_STREAMS: Sawtooth signature detected. Slope: ${slope.toFixed(4)}, R2: ${rSquared.toFixed(4)}.
        CHANONRY_CII_RATINGS: Current SARA-based instability estimate is CII=1.22.
        REPORTS_SCANNER_AUDIT: Discrepancy of 0.85m found between DDR joint tally and reported EOD depth.
        TRAUMA_LOGS: ${traumaLog.length} critical casing events archived, including metal loss at 1245.5m.
      `;

      // 2. Call the Sovereign Veto Forensic Engine
      const vetoInsight = await getSovereignVeto(packet);
      setInsight(vetoInsight);

      // 3. Generate the Audit PDF with the notarized response
      await generateSovereignAudit({
        uwi: "THISTLE_A7_PROTOTYPE",
        projectName: "Thistle A7 Legacy",
        projectId: "THISTLE1978well0001",
        sha512: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        offset: 14.5,
        pulseDiagnosis: {
          status: "VETO_ANALYZED",
          slope: slope,
          rSquared: rSquared,
          diagnosis: vetoInsight.split('\n')[0] // Use the first part as summary
        },
        traumaLog: traumaLog,
        tallyAudit: {
          reportId: "DDR-2024-001",
          discordance: 0.85,
          totalTally: MOCK_TUBING_TALLY.reduce((acc, curr) => acc + curr.length_m, 0),
          reportedDepth: 1200.0
        },
        timestamp: new Date().toISOString(),
        forensicInsight: vetoInsight
      });
      
    } catch (err) {
      setInsight("SOVEREIGN_VETO_FAILED: ENGINE OVERLOAD.");
    } finally {
      setIsExportingAudit(false);
    }
  };

  const navItems = [
    { id: ActiveModule.MISSION_CONTROL, icon: <Radar size={14} />, label: 'MISSION' },
    { id: ActiveModule.CHANONRY_PROTOCOL, icon: <Skull size={14} />, label: 'CHANONRY' },
    { id: ActiveModule.NORWAY_SOVEREIGN, icon: <Globe size={14} />, label: 'NORWAY' },
    { id: ActiveModule.GHOST_SYNC, icon: <Ghost size={14} />, label: 'SYNC' },
    { id: ActiveModule.LEGACY_RECOVERY, icon: <Coins size={14} />, label: 'RECOVERY' },
    { id: ActiveModule.TRAUMA_NODE, icon: <Box size={14} />, label: 'TRAUMA' },
    { id: ActiveModule.PULSE_ANALYZER, icon: <Activity size={14} />, label: 'PULSE' },
    { id: ActiveModule.REPORTS_SCANNER, icon: <FileSearch size={14} />, label: 'AUDIT' },
    { id: ActiveModule.VAULT, icon: <Database size={14} />, label: 'VAULT' },
    { id: ActiveModule.PROTOCOL_MANUAL, icon: <BookOpen size={14} />, label: 'MANUAL' },
  ];

  return (
    <div className="flex flex-col h-screen text-emerald-500 font-terminal overflow-hidden transition-all duration-700 bg-[#010409]">
      <DataStream />
      
      {/* Enhanced Responsive Header */}
      <header className="flex items-center justify-between px-3 md:px-6 py-2 border-b border-emerald-500/20 glass-panel z-[100] relative min-h-[56px] md:min-h-[64px]">
        <div className="flex items-center space-x-3 md:space-x-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-emerald-500/10 rounded transition-colors flex items-center justify-center border border-emerald-500/10"
            title="Toggle NDR Crawler"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center space-x-3 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/30 rounded-md">
             <Fingerprint size={18} className="text-emerald-400 hidden xs:block" />
             <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-emerald-400 whitespace-nowrap">Brahan_Terminal_v2.5</span>
          </div>

          <div className="hidden xl:flex items-center space-x-4 text-[10px] font-bold text-emerald-800 uppercase tracking-tighter border-l border-emerald-500/10 pl-6">
            <span className="flex items-center whitespace-nowrap"><Cpu size={12} className="mr-1.5" /> Uptime: {uptime}</span>
            <span className="flex items-center text-emerald-600 whitespace-nowrap"><Wifi size={12} className="mr-1.5" /> Uplink: Stable</span>
          </div>
        </div>

        {/* Desktop Main Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-2xl px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex items-center space-x-2 px-2.5 py-2 rounded transition-all duration-300 border ${
                activeModule === item.id 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                  : 'text-emerald-800 border-transparent hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20'
              }`}
              title={item.label}
            >
              {item.icon}
              <span className="text-[9px] font-black uppercase tracking-widest hidden xl:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-2 text-emerald-900 hover:text-emerald-400 transition-colors hidden sm:block">
            <Settings2 size={18} />
          </button>
          <button className="p-2 text-red-900 hover:text-red-500 transition-colors border border-red-900/10 rounded">
            <Power size={18} />
          </button>
        </div>
      </header>

      {/* Optimized Tablet/Mobile Navigation Bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-b border-emerald-900/30 glass-panel no-scrollbar space-x-2 z-[90] sticky top-0 bg-slate-950/80">
        {navItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveModule(item.id)}
            className={`flex flex-col items-center justify-center min-w-[72px] py-1.5 px-2 rounded border transition-all duration-300 flex-shrink-0 ${
              activeModule === item.id 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                : 'bg-slate-900/50 text-emerald-800 border-emerald-900/20 hover:border-emerald-500/40'
            }`}
          >
            {item.icon}
            <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Optimized Collapsible Sidebar (Aside) */}
        <aside 
          className={`
            fixed lg:relative z-[150] lg:z-40 h-[calc(100vh-120px)] lg:h-full
            bg-[#010409]/98 lg:bg-transparent border-r border-emerald-500/10 
            transition-all duration-500 ease-in-out flex flex-col backdrop-blur-xl lg:backdrop-blur-none
            ${sidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:w-0'}
          `}
        >
          <div className={`flex flex-col h-full ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none lg:hidden'}`}>
            <div className="p-5 border-b border-emerald-900/30 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center space-x-3">
                <Database size={18} className="text-emerald-500" />
                <span className="font-black uppercase tracking-[0.25em] text-emerald-400 text-xs">NDR Crawler</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 text-emerald-900 hover:text-emerald-400 border border-emerald-900/30 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search NDR Meta..."
                  value={ndrSearchQuery}
                  onChange={(e) => setNdrSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-900/40 rounded-md px-4 py-2.5 text-xs outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-900"
                  onKeyDown={(e) => e.key === 'Enter' && handleNdrSearch()}
                />
                <button 
                  onClick={handleNdrSearch} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-900 hover:text-emerald-400"
                >
                  <Search size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setWellboreFilter('ALL')}
                  className={`py-2 text-[9px] font-black uppercase rounded border transition-all ${wellboreFilter === 'ALL' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-emerald-900 border-emerald-900/20 hover:border-emerald-500/40'}`}
                >
                  ALL_TYPES
                </button>
                <button 
                  onClick={() => setIsGhostOnly(!isGhostOnly)}
                  className={`py-2 text-[9px] font-black uppercase rounded border transition-all ${isGhostOnly ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'bg-slate-900 text-emerald-900 border-emerald-900/20 hover:border-orange-500/40'}`}
                >
                  GHOST_SCAN
                </button>
              </div>

              <div className="flex flex-col space-y-2.5 pt-2">
                <div className="flex items-center space-x-2 text-[8px] text-emerald-900 font-black uppercase tracking-[0.2em]">
                  <Filter size={10} />
                  <span>Refine_Results</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-emerald-900/40 rounded px-2 py-2 text-[9px] font-black uppercase outline-none text-emerald-500 cursor-pointer hover:border-emerald-500/40 transition-colors"
                  >
                    <option value="ALL">ALL STATUS</option>
                    <option value="RELEASED">RELEASED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                  <select 
                    value={projectTypeFilter} 
                    onChange={(e) => setProjectTypeFilter(e.target.value)}
                    className="bg-slate-950 border border-emerald-900/40 rounded px-2 py-2 text-[9px] font-black uppercase outline-none text-emerald-500 cursor-pointer hover:border-emerald-500/40 transition-colors"
                  >
                    <option value="ALL">ALL TYPES</option>
                    <option value="well">WELL</option>
                    <option value="seismic">SEISMIC</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar bg-slate-950/20">
              {isNdrSearching ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-4 opacity-50">
                  <Loader2 size={32} className="animate-spin text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">Crawling Metadata...</span>
                </div>
              ) : ndrResults.length > 0 ? ndrResults.map((project) => (
                <div key={project.projectId} className="p-4 bg-slate-900/30 border border-emerald-900/20 rounded-lg hover:border-emerald-500/40 transition-all cursor-default group backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-100 transition-opacity">
                    {project.hasDatumShiftIssues && <AlertCircle size={12} className="text-orange-500 animate-pulse" />}
                  </div>
                  <div className="flex flex-col mb-2">
                    <span className="text-[8px] font-mono text-emerald-900 tracking-tighter">{project.projectId}</span>
                    <div className="font-bold text-emerald-100 text-xs truncate mt-0.5">{project.name}</div>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-emerald-800 uppercase font-black">{project.type} // {project.quadrant}</span>
                      <span className="text-[7px] text-emerald-950 uppercase font-black mt-0.5">{project.status}</span>
                    </div>
                    <button 
                      onClick={() => handleHarvest(project)} 
                      className={`p-2 transition-all rounded-md bg-emerald-950/40 border border-emerald-900/30 ${harvestingId === project.projectId ? 'text-emerald-400 animate-spin border-emerald-400' : 'text-emerald-800 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10'}`}
                      title="Harvest Data"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-48 opacity-20 italic text-[10px] text-center px-6">
                  <Database size={24} className="mb-2" />
                  <span>NO_RECORDS_MATCHING_FILTER</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[140] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Area Container */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950/10 min-w-0">
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar px-3 md:px-6 py-4">
              <div className="min-h-full pb-20">
                {activeModule === ActiveModule.MISSION_CONTROL && <MissionControl onSelectTarget={handleMissionSelect} isAnalyzing={isAnalyzing} />}
                {activeModule === ActiveModule.GHOST_SYNC && <GhostSync />}
                {activeModule === ActiveModule.TRAUMA_NODE && <TraumaNode />}
                {activeModule === ActiveModule.PULSE_ANALYZER && <PulseAnalyzer />}
                {activeModule === ActiveModule.REPORTS_SCANNER && <ReportsScanner />}
                {activeModule === ActiveModule.VAULT && <Vault />}
                {activeModule === ActiveModule.LEGACY_RECOVERY && <LegacyRecovery />}
                {activeModule === ActiveModule.NORWAY_SOVEREIGN && <NorwaySovereign />}
                {activeModule === ActiveModule.CHANONRY_PROTOCOL && <ChanonryProtocol />}
                {activeModule === ActiveModule.PROTOCOL_MANUAL && <ProtocolManual />}
              </div>
            </div>
          </div>

          {/* Optimized Forensic Intel Bar (Bottom Panel) */}
          <div className="flex flex-col border-t border-emerald-500/20 glass-panel relative z-50 bg-slate-950/90 backdrop-blur-2xl">
            <div className="p-4 md:p-6 flex flex-col space-y-4 max-w-full lg:max-w-7xl lg:mx-auto w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Terminal size={18} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Forensic_Architect_Insight</span>
                </div>
                <button 
                  onClick={handleSovereignVeto}
                  disabled={isExportingAudit}
                  className="flex items-center justify-center space-x-3 px-5 py-2.5 bg-emerald-500 text-slate-950 rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-50 group"
                >
                  {isExportingAudit ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} className="group-hover:scale-110 transition-transform" />}
                  <span>Execute Sovereign Veto</span>
                </button>
              </div>
              <div className="h-20 md:h-28 bg-slate-900/60 p-4 rounded-lg border border-emerald-900/30 overflow-y-auto custom-scrollbar relative shadow-inner group">
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-10 space-y-2">
                    <Loader2 size={24} className="animate-spin text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-700">Penetrating Data Abyss...</span>
                  </div>
                )}
                <div className="text-[11px] md:text-xs text-emerald-100/90 leading-relaxed font-mono italic pr-4 border-l-2 border-emerald-500/20 pl-4 whitespace-pre-wrap">
                  {insight}
                </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-20 transition-opacity">
                   <Sparkles size={16} className="text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Status Footer */}
      <footer className="px-4 py-2 border-t border-emerald-500/10 glass-panel flex flex-col sm:flex-row items-center justify-between text-[8px] font-black tracking-[0.25em] text-emerald-900 z-[100] gap-3 bg-slate-950/40">
        <div className="flex items-center space-x-6">
          <span className="flex items-center"><Activity size={10} className="mr-2 text-emerald-800/40" /> BUS_LATENCY: 0.12ms</span>
          <span className="flex items-center"><Radar size={10} className="mr-2 text-emerald-800/40" /> VETOS_LOGGED: 12</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden xs:flex items-center space-x-4">
            <span className="text-emerald-800">ENCRYPTION: AES-256</span>
            <div className="h-3 w-px bg-emerald-900/20"></div>
          </div>
          <span className="text-emerald-700 font-mono tracking-tighter text-[10px]">{new Date().toLocaleTimeString()}</span>
        </div>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .glass-panel {
          backdrop-filter: blur(12px);
          background-color: rgba(2, 6, 23, 0.7);
        }
        @media (max-width: 1024px) {
          .glass-panel {
            backdrop-filter: blur(8px);
          }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

export default App;
