
import React, { useState, useEffect } from 'react';
import { 
  Cpu, Terminal, Ghost, Box, Activity, 
  FileSearch, Lock, Database, Globe, 
  SearchCode, Briefcase, Shield, Microscope, 
  Waves, Beaker, BookOpen, Menu, X, Settings, 
  Fingerprint, FlaskConical
} from 'lucide-react';

// Import all forensic modules
import MissionControl from './components/MissionControl';
import GhostSync from './components/GhostSync';
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

import { ActiveModule } from './types';

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>(ActiveModule.MISSION_CONTROL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [status, setStatus] = useState('offline');

  useEffect(() => {
    const checkEngine = async () => {
      try {
        const res = await fetch('http://localhost:8000/');
        if (res.ok) setStatus('idle');
      } catch (e) { setStatus('offline'); }
    };
    checkEngine();
  }, []);

  const navItems = [
    { id: ActiveModule.MISSION_CONTROL, label: 'Mission_Control', icon: <Terminal size={18} />, category: 'Core' },
    { id: ActiveModule.NORWAY_SOVEREIGN, label: 'Metadata_Crawl', icon: <Globe size={18} />, category: 'Core' },
    { id: ActiveModule.FORENSIC_ARCHEOLOGY, label: 'Data_Archeology', icon: <Fingerprint size={18} />, category: 'Forensics' },
    { id: ActiveModule.CHEMISTRY_FORENSICS, label: 'Chem_Autopsy', icon: <FlaskConical size={18} />, category: 'Forensics' },
    { id: ActiveModule.GHOST_SYNC, label: 'Ghost_Sync', icon: <Ghost size={18} />, category: 'Forensics' },
    { id: ActiveModule.TRAUMA_NODE, label: 'Trauma_Node_3D', icon: <Box size={18} />, category: 'Forensics' },
    { id: ActiveModule.PULSE_ANALYZER, label: 'Pulse_Analyzer', icon: <Activity size={18} />, category: 'Forensics' },
    { id: ActiveModule.LEGACY_RECOVERY, label: 'Pay_Recovery', icon: <Waves size={18} />, category: 'Forensics' },
    { id: ActiveModule.REPORTS_SCANNER, label: 'Reports_Scanner', icon: <FileSearch size={18} />, category: 'Audit' },
    { id: ActiveModule.LOG_ROUTER, label: 'Log_Router', icon: <SearchCode size={18} />, category: 'Audit' },
    { id: ActiveModule.GATEKEEPER, label: 'Gatekeeper', icon: <Shield size={18} />, category: 'Integrity' },
    { id: ActiveModule.CHANONRY_PROTOCOL, label: 'Chanonry_Logic', icon: <Beaker size={18} />, category: 'Integrity' },
    { id: ActiveModule.PROSPECTOR, label: 'Prospector', icon: <Briefcase size={18} />, category: 'Intel' },
    { id: ActiveModule.VANGUARD, label: 'Vanguard_R&D', icon: <Microscope size={18} />, category: 'Intel' },
    { id: ActiveModule.VAULT, label: 'Sovereign_Vault', icon: <Lock size={18} />, category: 'System' },
    { id: ActiveModule.PROTOCOL_MANUAL, label: 'User_Manual', icon: <BookOpen size={18} />, category: 'System' },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case ActiveModule.MISSION_CONTROL: return <MissionControl />;
      case ActiveModule.GHOST_SYNC: return <GhostSync />;
      case ActiveModule.TRAUMA_NODE: return <TraumaNode onToggleFocus={() => {}} />;
      case ActiveModule.PULSE_ANALYZER: return <PulseAnalyzer />;
      case ActiveModule.REPORTS_SCANNER: return <ReportsScanner />;
      case ActiveModule.VAULT: return <Vault />;
      case ActiveModule.NORWAY_SOVEREIGN: return <NorwaySovereign />;
      case ActiveModule.LOG_ROUTER: return <LogRouter />;
      case ActiveModule.PROSPECTOR: return <Prospector />;
      case ActiveModule.GATEKEEPER: return <GatekeeperConsole />;
      case ActiveModule.VANGUARD: return <Vanguard />;
      case ActiveModule.LEGACY_RECOVERY: return <LegacyRecovery />;
      case ActiveModule.CHANONRY_PROTOCOL: return <ChanonryProtocol />;
      case ActiveModule.PROTOCOL_MANUAL: return <ProtocolManual />;
      case ActiveModule.FORENSIC_ARCHEOLOGY: return <ForensicArcheology />;
      case ActiveModule.CHEMISTRY_FORENSICS: return <ChemistryForensics />;
      default: return <MissionControl />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-[#00FF41] font-mono overflow-hidden selection:bg-[#00FF41] selection:text-black">
      {/* Dynamic Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} border-r border-[#00FF41]/20 bg-slate-950/80 backdrop-blur-md flex flex-col transition-all duration-300 z-50`}
      >
        <div className="p-6 border-b border-[#00FF41]/20 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
            <Cpu size={24} className={status === 'offline' ? 'text-red-900' : 'animate-pulse text-[#00FF41]'} />
            <h1 className="text-xl font-black tracking-tighter">BRAHAN_v88</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-[#00FF41]/10 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
          {['Core', 'Forensics', 'Audit', 'Integrity', 'Intel', 'System'].map(cat => (
            <div key={cat} className="space-y-1">
              {isSidebarOpen && <span className="text-[10px] font-black uppercase text-[#003b0f] px-3 tracking-[0.2em]">{cat}</span>}
              {navItems.filter(i => i.category === cat).map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                    activeModule === item.id 
                    ? 'bg-[#00FF41] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]' 
                    : 'text-[#003b0f] hover:text-[#00FF41] hover:bg-[#00FF41]/5'
                  }`}
                >
                  <div className={`${activeModule === item.id ? 'text-black' : 'text-[#00FF41] group-hover:scale-110 transition-transform'}`}>
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <span className="text-[11px] font-black uppercase tracking-widest truncate">
                      {item.label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#00FF41]/20 bg-black/40">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-[#003b0f]">
            {isSidebarOpen && <span>Engine_Status:</span>}
            <span className={status === 'offline' ? 'text-red-600' : 'text-[#00FF41]'}>{status}</span>
          </div>
          <div className="mt-2 h-1 bg-slate-900 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${status === 'offline' ? 'bg-red-900' : 'bg-[#00FF41] w-full animate-pulse'}`}></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col min-w-0">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#00FF41 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
           <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#00FF41] rounded-full blur-[150px]"></div>
        </div>

        <div className="flex-1 relative z-10 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {renderModule()}
          </div>
        </div>

        <footer className="h-8 bg-black border-t border-[#00FF41]/20 px-4 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-[#003b0f] z-20">
           <div className="flex items-center gap-6">
              <span className="flex items-center gap-2"><Settings size={10} /> Kernel: V.88.777_SOVEREIGN</span>
              <span className="flex items-center gap-2"><Database size={10} /> Vault_Buffer: Encrypted</span>
           </div>
           <div className="flex items-center gap-4">
              <span>Auth_Token: LEVEL_7_ROOT</span>
              <div className="flex items-center gap-1">
                 <div className="w-1 h-1 bg-[#00FF41] rounded-full animate-ping"></div>
                 <div className="w-1 h-1 bg-[#00FF41] rounded-full"></div>
              </div>
           </div>
        </footer>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 255, 65, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 65, 0.3); }
      `}} />
    </div>
  );
}
