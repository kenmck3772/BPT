
import React, { useState, useEffect } from 'react';
import { 
  Cpu, Activity, Ghost, Box, FileSearch, Lock, 
  Database, Globe, SearchCode, Briefcase, Shield, 
  Microscope, Waves, Beaker, BookOpen, Menu, X, 
  Settings, Fingerprint, FlaskConical, HeartPulse, 
  Target, MapPin, Newspaper, BarChart3, Binary, 
  ShieldCheck, Maximize2, Minimize2, LogOut, Cloud, 
  Loader2, Home, ClipboardList, Zap, Info, 
  AlertOctagon, Scan, Thermometer, Terminal as TerminalIcon,
  CircleDot, Camera, Hammer, Table
} from 'lucide-react';

import MissionControl from './components/MissionControl';
import GhostSync from './GhostSync'; 
import TraumaNode from './components/TraumaNode';
import PulseAnalyzer from './components/PulseAnalyzer';
import ReportsScanner from './components/ReportsScanner';
import Vault from './components/Vault';
import NorwaySovereign from './components/NorwaySovereign';
import LogRouter from './components/LogRouter';
import Prospector from './components/Prospector';
import GatekeeperConsole from './components/GatekeeperConsole';
import Vanguard from './components/Vanguard';
import LegacyRecovery from './components/LegacyRecovery';
import ChanonryProtocol from './components/ChanonryProtocol';
import ProtocolManual from './components/ProtocolManual';
import ForensicArcheology from './components/ForensicArcheology';
import ChemistryForensics from './components/ChemistryForensics';
import CardioForensics from './components/CardioForensics';
import NewsHub from './components/NewsHub';
import BasinAudit from './components/BasinAudit';
import ForensicHarvester from './components/ForensicHarvester';
import CerberusSimulator from './components/CerberusSimulator';
import SovereignAuth from './components/SovereignAuth';
import ForensicAuditor from './components/ForensicAuditor';
import ForensicLab from './components/ForensicLab';
import SovereignManifesto from './components/SovereignManifesto';
import BallochAudit from './components/BallochAudit';
import ForensicVision from './components/ForensicVision';
import NinianNorthTally from './components/NinianNorthTally';
import { SovereignLedger } from './components/SovereignLedger';

import { ActiveModule } from './types';
import { searchNDRMetadata } from './services/ndrService';
import { onSovereignStateChange, logoutSovereignNode } from './services/authService';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeModule, setActiveModule] = useState<ActiveModule>(ActiveModule.MISSION_CONTROL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModuleFocused, setIsModuleFocused] = useState(false);
  const [wellName, setWellName] = useState<string>('SYSTEM_READY');
  const [manifestoAcl, setManifestoAcl] = useState(false);

  useEffect(() => {
    const unsubscribe = onSovereignStateChange((currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthenticated = (authenticatedUser: any) => {
    setUser(authenticatedUser);
  };

  const handleLogout = async () => {
    await logoutSovereignNode();
  };

  const goHome = () => {
    setActiveModule(ActiveModule.MISSION_CONTROL);
    setIsModuleFocused(false);
  };

  const toggleModuleFocus = () => {
    setIsModuleFocused(!isModuleFocused);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
      setIsModuleFocused(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsModuleFocused(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleModuleFocus();
      }
      if (e.key === 'Escape' && isModuleFocused) {
        setIsModuleFocused(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isModuleFocused]);

  useEffect(() => {
    if (activeModule === ActiveModule.GHOST_SYNC) {
      const fetchContext = async () => {
        try {
          const results = await searchNDRMetadata('Ninian');
          if (results && results.length > 0) {
            setWellName(results[0]?.name?.toUpperCase() || "NINIAN_HUB");
          }
        } catch (err) {
          setWellName("FETCH_ERROR");
        }
      };
      fetchContext();
    } else {
      switch(activeModule) {
        case ActiveModule.MISSION_CONTROL: setWellName("GLOBAL_MISSION_HUB"); break;
        case ActiveModule.TRAUMA_NODE: setWellName("NINIAN_CENTRAL_N-42"); break;
        case ActiveModule.LEGACY_RECOVERY: setWellName("RANKIN-12"); break;
        case ActiveModule.NEWS_HUB: setWellName("INTEL_SURFACE_V4"); break;
        case ActiveModule.BASIN_AUDIT: setWellName("UKCS_ENFORCEMENT_HUB"); break;
        case ActiveModule.FORENSIC_HARVESTER: setWellName("NINIAN_N42_RECON"); break;
        case ActiveModule.CERBERUS: setWellName("SUBSURFACE_SIM_K9"); break;
        case ActiveModule.FORENSIC_AUDITOR: setWellName("HARRIS/HEATHER_AUDIT"); break;
        case ActiveModule.FORENSIC_LAB: setWellName("PLAYWRIGHT_SANDBOX"); break;
        case ActiveModule.BALLOCH_AUDIT: setWellName("BALLOCH_SPECIAL_AUDIT"); break;
        case ActiveModule.SOVEREIGN_LEDGER: setWellName("MATERIAL_PROVENANCE"); break;
        case ActiveModule.FORENSIC_VISION: setWellName("VISUAL_AUTOPSY_LAB"); break;
        case ActiveModule.NINIAN_TALLY: setWellName("NINIAN_NORTH_TALLY"); break;
        default: setWellName("ACTIVE_INVESTIGATION");
      }
    }
  }, [activeModule]);

  if (!manifestoAcl) {
    return <SovereignManifesto onAcknowledge={() => setManifestoAcl(true)} />;
  }

  if (isAuthChecking) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center space-y-6 font-terminal">
        <Loader2 size={48} className="text-emerald-500 animate-spin" />
        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.5em] animate-pulse">Establishing_Sovereign_Uplink</span>
      </div>
    );
  }

  if (!user) {
    return <SovereignAuth onAuthenticated={handleAuthenticated} />;
  }

  const commonProps = {
    isFocused: isModuleFocused,
    onToggleFocus: toggleModuleFocus
  };

  const renderModule = () => {
    switch (activeModule) {
      case ActiveModule.MISSION_CONTROL: return <MissionControl setGlobalWellName={setWellName} />;
      case ActiveModule.GHOST_SYNC: return <GhostSync {...commonProps} />;
      case ActiveModule.TRAUMA_NODE: return <TraumaNode {...commonProps} />;
      case ActiveModule.PULSE_ANALYZER: return <PulseAnalyzer {...commonProps} />;
      case ActiveModule.REPORTS_SCANNER: return <ReportsScanner {...commonProps} />;
      case ActiveModule.VAULT: return <Vault />;
      case ActiveModule.NORWAY_SOVEREIGN: return <NorwaySovereign {...commonProps} />;
      case ActiveModule.LOG_ROUTER: return <LogRouter {...commonProps} />;
      case ActiveModule.PROSPECTOR: return <Prospector />;
      case ActiveModule.GATEKEEPER: return <GatekeeperConsole />;
      case ActiveModule.VANGUARD: return <Vanguard />;
      case ActiveModule.LEGACY_RECOVERY: return <LegacyRecovery />;
      case ActiveModule.CHANONRY_PROTOCOL: return <ChanonryProtocol />;
      case ActiveModule.PROTOCOL_MANUAL: return <ProtocolManual />;
      case ActiveModule.FORENSIC_ARCHEOLOGY: return <ForensicArcheology {...commonProps} />;
      case ActiveModule.CHEMISTRY_FORENSICS: return <ChemistryForensics {...commonProps} />;
      case ActiveModule.CARDIO_FORENSICS: return <CardioForensics {...commonProps} />;
      case ActiveModule.NEWS_HUB: return <NewsHub />;
      case ActiveModule.BASIN_AUDIT: return <BasinAudit {...commonProps} />;
      case ActiveModule.FORENSIC_HARVESTER: return <ForensicHarvester {...commonProps} />;
      case ActiveModule.CERBERUS: return <CerberusSimulator {...commonProps} />;
      case ActiveModule.FORENSIC_AUDITOR: return <ForensicAuditor {...commonProps} />;
      case ActiveModule.FORENSIC_LAB: return <ForensicLab {...commonProps} />;
      case ActiveModule.BALLOCH_AUDIT: return <BallochAudit {...commonProps} />;
      case ActiveModule.SOVEREIGN_LEDGER: return <SovereignLedger />;
      case ActiveModule.FORENSIC_VISION: return <ForensicVision {...commonProps} />;
      case ActiveModule.NINIAN_TALLY: return <NinianNorthTally {...commonProps} />;
      default: return <MissionControl setGlobalWellName={setWellName} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black text-[#E0E0E0] font-mono overflow-hidden selection:bg-[#00FF41] selection:text-black transition-all duration-700">
      {isModuleFocused && (
        <div className="fixed bottom-8 left-8 z-[1000] animate-in slide-in-from-left-8 duration-500">
          <button 
            onClick={goHome}
            className="flex items-center gap-3 p-4 bg-black border-2 border-emerald-500 rounded-full text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] group active:scale-90"
            title="Return to Mission Control"
          >
            <Home size={24} />
          </button>
        </div>
      )}

      {!isModuleFocused && (
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} border-r border-[#00FF41]/20 bg-slate-950/90 backdrop-blur-xl flex flex-col transition-all duration-500 z-[200] overflow-hidden`}>
          <div className="p-4 border-b border-[#00FF41]/20 flex items-center justify-between bg-black/40 h-16 shrink-0">
            <button onClick={goHome} className={`flex items-center gap-3 ${!isSidebarOpen && 'mx-auto'} hover:opacity-80 transition-all`}>
              <CircleDot size={24} className="text-[#00FF41] animate-pulse shadow-[0_0_10px_#00FF41]" />
              {isSidebarOpen && <h1 className="text-xl font-black tracking-tighter text-[#00FF41]">BRAHAN</h1>}
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
             <button onClick={() => setActiveModule(ActiveModule.MISSION_CONTROL)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${activeModule === ActiveModule.MISSION_CONTROL ? 'bg-emerald-500 text-black' : 'hover:bg-emerald-500/10 text-emerald-500'}`}>
                <Home size={18} /> {isSidebarOpen && "Home"}
             </button>
             <button onClick={() => setActiveModule(ActiveModule.NINIAN_TALLY)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${activeModule === ActiveModule.NINIAN_TALLY ? 'bg-emerald-500 text-black' : 'hover:bg-emerald-500/10 text-emerald-500'}`}>
                <Table size={18} /> {isSidebarOpen && "Steel Ledger"}
             </button>
             <button onClick={() => setActiveModule(ActiveModule.FORENSIC_VISION)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${activeModule === ActiveModule.FORENSIC_VISION ? 'bg-emerald-500 text-black' : 'hover:bg-emerald-500/10 text-emerald-500'}`}>
                <Camera size={18} /> {isSidebarOpen && "Vision Lab"}
             </button>
             <button onClick={() => setActiveModule(ActiveModule.BASIN_AUDIT)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${activeModule === ActiveModule.BASIN_AUDIT ? 'bg-emerald-500 text-black' : 'hover:bg-emerald-500/10 text-emerald-500'}`}>
                <BarChart3 size={18} /> {isSidebarOpen && "Basin Audit"}
             </button>
             <button onClick={() => setActiveModule(ActiveModule.VAULT)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${activeModule === ActiveModule.VAULT ? 'bg-amber-500 text-black' : 'hover:bg-amber-500/10 text-amber-500'}`}>
                <Lock size={18} /> {isSidebarOpen && "Vault"}
             </button>
          </nav>
          
          <div className="p-4 border-t border-[#00FF41]/20">
             <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 text-red-500">
                <LogOut size={18} /> {isSidebarOpen && "De-Auth Node"}
             </button>
          </div>
        </aside>
      )}

      <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden bg-[#020202]">
        <div className={`flex-1 relative z-10 overflow-hidden flex flex-col ${isModuleFocused ? 'p-0' : 'p-4'}`}>
          <div className="flex-1 overflow-hidden bg-slate-950/20 rounded-xl border border-[#00FF41]/5">
            {renderModule()}
          </div>
        </div>
      </main>
    </div>
  );
}
