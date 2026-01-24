import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Shield, Target, AlertCircle, 
  Map as MapIcon, ChevronRight, Activity, 
  Cpu, Radar, Compass, CornerDownRight,
  Database, Zap, Loader2, Scan, Globe2,
  Terminal, ShieldCheck, Crosshair, AlertOctagon,
  Wind, MapPin, Search, MousePointer2,
  Lock, History, Info, Wifi
} from 'lucide-react';
import { GHOST_HUNTER_MISSION } from '../constants';
import { MissionTarget } from '../types';
import { generateMissionBriefing } from '../services/geminiService';

interface MissionControlProps {
  onSelectTarget: (target: MissionTarget) => void;
  isAnalyzing?: boolean;
}

const MissionControl: React.FC<MissionControlProps> = ({ onSelectTarget, isAnalyzing: parentAnalyzing }) => {
  const [selectedTarget, setSelectedTarget] = useState<MissionTarget | null>(null);
  const [briefing, setBriefing] = useState<string>("");
  const [isBriefing, setIsBriefing] = useState(false);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  const handleTargetClick = async (target: MissionTarget) => {
    setSelectedTarget(target);
    setIsBriefing(true);
    setBriefing("ESTABLISHING SECURE UPLINK TO ASSET CLOUD...");
    
    // Fetch a forensic narrative from Gemini for the selected target
    const text = await generateMissionBriefing(target);
    setBriefing(text);
    setIsBriefing(false);
  };

  const deployMission = () => {
    if (selectedTarget) {
      onSelectTarget(selectedTarget);
      setCompletedMissions(prev => Array.from(new Set([...prev, selectedTarget.ASSET])));
    }
  };

  const getPriorityColor = (priority: MissionTarget['PRIORITY']) => {
    switch (priority) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#facc15';
      case 'LOW': return '#10b981';
      default: return '#10b981';
    }
  };

  const getPriorityStyles = (priority: MissionTarget['PRIORITY']) => {
    switch (priority) {
      case 'CRITICAL': return 'border-red-500/40 text-red-500 bg-red-500/5 shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]';
      case 'HIGH': return 'border-orange-500/40 text-orange-500 bg-orange-500/5 shadow-[inset_0_0_15px_rgba(249,115,22,0.05)]';
      case 'MEDIUM': return 'border-amber-500/40 text-amber-500 bg-amber-500/5';
      case 'LOW': return 'border-emerald-500/40 text-emerald-500 bg-emerald-500/5';
      default: return 'border-emerald-900/40 text-emerald-900';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 relative font-terminal overflow-hidden p-4 lg:p-8 space-y-6">
      
      {/* Dynamic Background: Rotating Global Mesh */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
         <Globe size={1000} className="text-emerald-500 animate-spin-slow" />
      </div>

      {/* Header HUD: Mission Identification */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-emerald-900/30 pb-6 relative z-10 gap-4">
        <div className="flex items-center space-x-5">
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.15)] relative group">
            <Radar size={36} className="text-emerald-400 animate-pulse" />
            <div className="absolute inset-0 border border-emerald-400/20 rounded-xl animate-ping opacity-20"></div>
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-emerald-400 uppercase tracking-tighter leading-none">
              {GHOST_HUNTER_MISSION.MISSION_ID}
            </h2>
            <div className="flex items-center space-x-4 text-[10px] text-emerald-900 font-black uppercase tracking-[0.3em] mt-2">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                SCAN_ARRAY_ONLINE
              </span>
              <span className="h-2.5 w-px bg-emerald-900/40"></span>
              <span>OP_DIRECTOR: {GHOST_HUNTER_MISSION.OPERATOR}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <div className="text-[16px] text-emerald-100 font-mono tracking-widest bg-slate-950/80 px-4 py-1.5 border border-emerald-900/40 rounded shadow-lg">
             {new Date(GHOST_HUNTER_MISSION.TIMESTAMP).toLocaleDateString()} // {new Date(GHOST_HUNTER_MISSION.TIMESTAMP).toLocaleTimeString()}
           </div>
           <div className="flex items-center space-x-3 mt-2">
              <span className="text-[9px] text-emerald-800 font-black uppercase tracking-[0.2em]">ANOMALIES_ARCHIVED: {completedMissions.length}</span>
              <span className="h-2 w-px bg-emerald-900/40"></span>
              <span className="text-[9px] text-emerald-800 font-black uppercase tracking-[0.2em]">ACTIVE_THREADS: {GHOST_HUNTER_MISSION.TARGETS.length}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col xl:flex-row gap-8 overflow-hidden relative z-10">
        
        {/* Left Side: Interactive Tactical Map & Targets */}
        <div className="flex-1 flex flex-col space-y-6 min-h-0">
           
           {/* Global Anomaly Map (SVG) */}
           <div className="h-72 md:h-96 bg-slate-950/90 rounded-2xl border border-emerald-900/40 relative overflow-hidden group shadow-2xl">
              {/* Scanline Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%]"></div>
              
              <div className="absolute inset-0 opacity-10">
                 <svg width="100%" height="100%" viewBox="0 0 1000 500" className="stroke-emerald-500 fill-none stroke-1">
                    <path d="M100,200 Q200,100 300,200 T500,200 T700,200 T900,200" opacity="0.1" />
                    <path d="M50,300 Q250,250 450,300 T850,300" opacity="0.1" />
                    <path d="M0,250 L1000,250" strokeDasharray="10 5" opacity="0.2" />
                    {/* Abstract Coastlines */}
                    <path d="M120,130 L160,110 L220,150 L250,250 L180,280 L100,240 Z" />
                    <path d="M500,80 L560,90 L610,140 L580,220 L520,200 Z" />
                    <path d="M800,300 L850,280 L900,320 L870,380 L810,360 Z" />
                 </svg>
              </div>

              {/* Interactive Hotspot Nodes */}
              {GHOST_HUNTER_MISSION.TARGETS.map((target, idx) => {
                const x = 15 + (idx * 17) % 75; 
                const y = 25 + (idx * 23) % 65;
                const isSelected = selectedTarget?.ASSET === target.ASSET;
                const isCompleted = completedMissions.includes(target.ASSET);

                return (
                  <div 
                    key={`${target.ASSET}-${idx}`}
                    className="absolute cursor-pointer transition-all duration-300 transform hover:scale-125 z-20"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => handleTargetClick(target)}
                  >
                    <div className="relative flex items-center justify-center">
                      <div className={`w-4 h-4 rounded-full animate-ping opacity-30`} style={{ backgroundColor: isCompleted ? '#10b981' : getPriorityColor(target.PRIORITY) }}></div>
                      <div className={`w-2.5 h-2.5 rounded-full absolute transition-all ${isSelected ? 'scale-150 shadow-[0_0_15px_currentColor]' : ''}`} 
                           style={{ backgroundColor: isCompleted ? '#10b981' : getPriorityColor(target.PRIORITY), color: getPriorityColor(target.PRIORITY) }}></div>
                      
                      {/* Label on Hover/Select */}
                      <div className={`absolute top-6 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-emerald-900/50 px-3 py-1.5 rounded-md shadow-2xl transition-all ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100'} whitespace-nowrap`}>
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-black text-emerald-100 uppercase tracking-widest">{target.ASSET}</span>
                          <span className="text-[7px] font-mono text-emerald-700">{target.REGION}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Map Metadata HUD */}
              <div className="absolute bottom-6 left-6 flex flex-col space-y-1.5 bg-black/40 p-3 rounded border border-white/5 backdrop-blur-md">
                <div className="flex items-center space-x-2">
                   <Compass size={12} className="text-emerald-500" />
                   <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Projection: Mercator_Sovereign_v2</span>
                </div>
                <div className="flex items-center space-x-2">
                   <Database size={12} className="text-emerald-700" />
                   <span className="text-[8px] text-emerald-800 font-black uppercase tracking-widest">Sync: Sodir / NDR / NOPIMS / NSTA</span>
                </div>
              </div>

              <div className="absolute top-6 right-6">
                 <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-lg shadow-xl">
                    <Wifi size={14} className="text-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em]">SAT_UPLINK_STABLE</span>
                 </div>
              </div>
           </div>

           {/* Mission Targets Dossier Grid */}
           <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pr-3 pb-4">
              {GHOST_HUNTER_MISSION.TARGETS.map((target, idx) => {
                const isSelected = selectedTarget?.ASSET === target.ASSET;
                const isCompleted = completedMissions.includes(target.ASSET);

                return (
                  <div 
                    key={`${target.ASSET}-${idx}`}
                    onClick={() => handleTargetClick(target)}
                    className={`group p-5 glass-panel rounded-xl border transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected 
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                        : 'border-emerald-900/30 bg-slate-900/40 hover:border-emerald-500/60'
                    } ${isCompleted ? 'grayscale opacity-60' : ''}`}
                  >
                    {/* Completion Badge */}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 p-1 px-2 rounded-bl-lg z-20">
                        <ShieldCheck size={14} />
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-5">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-900 mb-1.5">{target.REGION}</span>
                        <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight leading-tight">{target.ASSET}</h3>
                      </div>
                      <div className={`p-2 rounded-lg border ${isSelected ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-black/60 border-emerald-900/40 text-emerald-900 group-hover:text-emerald-400'}`}>
                        <Scan size={16} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-emerald-900/10">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getPriorityStyles(target.PRIORITY)}`}>
                        {target.PRIORITY}
                      </div>
                      <div className="flex items-center text-emerald-900 group-hover:text-emerald-400 transition-colors">
                        <span className="text-[9px] font-black uppercase tracking-widest mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Investigate</span>
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Right Side: Detailed Forensic Briefing & Deployment */}
        <div className="w-full xl:w-[420px] flex flex-col space-y-6">
           
           <div className="flex-1 bg-slate-950/90 border border-emerald-900/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
              {/* Internal HUD Elements */}
              <div className="p-5 border-b border-emerald-900/40 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-3">
                  <Terminal size={20} className="text-emerald-500" />
                  <span className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.3em]">Tactical_Infiltration_Brief</span>
                </div>
                {selectedTarget && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase ${getPriorityStyles(selectedTarget.PRIORITY)}`}>
                    <AlertOctagon size={12} />
                    <span>{selectedTarget.PRIORITY}_THREAT</span>
                  </div>
                )}
              </div>

              <div className="flex-1 p-8 flex flex-col space-y-8 overflow-y-auto custom-scrollbar">
                {selectedTarget ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-500">
                    
                    {/* Header Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-[10px] text-emerald-900 font-black uppercase tracking-widest">
                         <MapPin size={12} />
                         <span>Asset_Signature</span>
                      </div>
                      <h4 className="text-3xl font-black text-emerald-100 uppercase tracking-tighter leading-none">{selectedTarget.ASSET}</h4>
                      <p className="text-[10px] text-emerald-700 font-mono tracking-tight uppercase">{selectedTarget.REGION} // SECURE_NODE: {selectedTarget.DATA_PORTAL}</p>
                    </div>

                    {/* Gemini Forensic Narrative Card */}
                    <div className="p-6 bg-slate-900/60 border-l-4 border-emerald-500 rounded-r-xl shadow-2xl relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Zap size={64} className="text-emerald-500" />
                      </div>
                      
                      {isBriefing ? (
                        <div className="flex flex-col items-center justify-center py-6 space-y-4">
                           <Loader2 size={32} className="text-emerald-500 animate-spin" />
                           <span className="text-[10px] font-black text-emerald-900 uppercase tracking-[0.3em]">Penetrating Forensic Vault...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           <div className="flex items-center space-x-2 text-emerald-500/40 mb-2">
                              <History size={14} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Sovereign_Briefing_Archived</span>
                           </div>
                           <p className="text-[13px] text-emerald-100 font-terminal italic leading-relaxed">
                            "{briefing}"
                           </p>
                        </div>
                      )}
                    </div>

                    {/* Mission Metadata Grid */}
                    <div className="grid grid-cols-2 gap-5">
                       <div className="p-4 bg-slate-900/80 border border-emerald-900/40 rounded-xl hover:border-emerald-500/40 transition-colors shadow-lg">
                          <span className="text-[9px] text-emerald-900 font-black uppercase block mb-2 tracking-widest">Anomaly_Class</span>
                          <span className="text-[11px] font-black text-emerald-400 uppercase leading-tight">{selectedTarget.ANOMALY_TYPE.replace(/_/g, ' ')}</span>
                       </div>
                       <div className="p-4 bg-slate-900/80 border border-emerald-900/40 rounded-xl hover:border-emerald-500/40 transition-colors shadow-lg">
                          <span className="text-[9px] text-emerald-900 font-black uppercase block mb-2 tracking-widest">Data_Gateway</span>
                          <span className="text-[11px] font-black text-emerald-400 uppercase leading-tight">{selectedTarget.DATA_PORTAL.replace(/_/g, ' ')}</span>
                       </div>
                    </div>

                    {/* Target Infiltration Blocks */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] text-emerald-900 font-black uppercase tracking-widest border-b border-emerald-900/10 pb-2">
                        <span>Target_Infiltration_Blocks</span>
                        <Target size={14} className="text-emerald-700" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedTarget.BLOCKS.map(block => (
                          <div key={block} className="flex items-center justify-between p-3 bg-slate-950 border border-emerald-900/40 rounded-lg group/item hover:border-emerald-400/40 transition-all shadow-inner">
                            <span className="text-[11px] text-emerald-100 font-mono tracking-tighter">B_{block}</span>
                            <Lock size={12} className="text-emerald-900 group-hover/item:text-emerald-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 text-center">
                    <div className="relative">
                       <MousePointer2 size={96} className="animate-bounce" />
                       <div className="absolute inset-0 border-2 border-emerald-500 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <span className="text-sm font-black uppercase tracking-[0.6em] max-w-[240px]">Select_Mission_Objective_From_Threat_Map</span>
                  </div>
                )}
              </div>

              {/* Action Footer: Deployment */}
              <div className="p-8 border-t border-emerald-900/40 bg-slate-950 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <button 
                  onClick={deployMission}
                  disabled={!selectedTarget || isBriefing}
                  className="w-full py-5 bg-emerald-500 text-slate-950 font-black uppercase text-[11px] tracking-[0.4em] rounded-xl shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center space-x-4 group disabled:opacity-30 disabled:grayscale transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-95"
                >
                  <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                  <span>Execute Forensic Veto</span>
                </button>
                <div className="mt-4 flex items-center justify-center space-x-4 text-[8px] text-emerald-900 font-black uppercase tracking-[0.3em] opacity-40">
                   <div className="h-px flex-1 bg-emerald-900/30"></div>
                   <span>System_Ready // v2.5.0</span>
                   <div className="h-px flex-1 bg-emerald-900/30"></div>
                </div>
              </div>
           </div>

           {/* Module Status: Infrastructure Stats */}
           <div className="p-6 glass-panel rounded-2xl border border-emerald-900/40 bg-slate-950/80 flex flex-col space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Wind size={40} className="text-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Activity size={18} className="text-emerald-500" />
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Network_Integrity</span>
                </div>
                <span className="text-[11px] font-black text-emerald-100 font-mono">99.98%_LOCKED</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" style={{ width: '99.98%' }}></div>
              </div>
              <div className="flex justify-between text-[8px] text-emerald-900 font-mono tracking-tighter">
                 <span className="flex items-center"><ChevronRight size={10} className="mr-1" /> UPLOAD: 14.52 MB/S</span>
                 <span className="flex items-center"><ChevronRight size={10} className="mr-1" /> DOWNLOAD: 122.18 MB/S</span>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: orbit 120s linear infinite; }
      `}</style>
    </div>
  );
};

export default MissionControl;