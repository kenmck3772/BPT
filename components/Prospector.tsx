
import React, { useState } from 'react';
import { 
  Globe, Coins, Target, Zap, 
  Loader2, Ship, ChevronRight, 
  ShieldAlert, Send, Briefcase,
  Users, Anchor, Sparkles, Map,
  MessageSquareCode, TrendingUp
} from 'lucide-react';
import { getProspectorBrief } from '../services/geminiService';
import { ProspectorBrief } from '../types';

const SEVEN_SEAS = [
  { id: 'north_sea', name: 'North Sea', ghost: 'The Stretched Wire', safe: 'Depth Variance Study' },
  { id: 'gom', name: 'Gulf of Mexico', ghost: 'The Salt Mirror', safe: 'Velocity Calibration' },
  { id: 'tasman', name: 'Tasman Sea', ghost: 'The Green Ghost', safe: 'Mineralogical Mapping' },
  { id: 'timor', name: 'Timor Sea', ghost: 'The Gas Cloud', safe: 'Gas Attenuation Study' },
  { id: 'java', name: 'Java Sea', ghost: 'The Moving Floor', safe: 'Surface Datum Check' },
  { id: 'guinea', name: 'Gulf of Guinea', ghost: 'The Thin Phantom', safe: 'Thin-Bed Evaluation' },
  { id: 'caribbean', name: 'Caribbean Sea', ghost: 'The Fresh Mirage', safe: 'Fluid Salinity Check' },
];

const Prospector: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [brief, setBrief] = useState<ProspectorBrief | null>(null);
  const isHunter = !document.body.classList.contains('light-theme');

  const handleGenerate = async (regionId: string, regionName: string) => {
    setSelectedRegion(regionId);
    setIsGenerating(true);
    setBrief(null);
    try {
      const result = await getProspectorBrief(regionName);
      setBrief(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex flex-col h-full space-y-4 p-6 relative overflow-hidden transition-colors duration-700 ${isHunter ? 'bg-slate-950/40 text-emerald-400' : 'bg-white text-slate-900'}`}>
      {isHunter && (
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Coins size={400} className="text-amber-500 animate-pulse" />
        </div>
      )}

      <header className={`flex items-center justify-between border-b pb-4 relative z-10 ${isHunter ? 'border-amber-900/30' : 'border-slate-100'}`}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl shadow-lg transition-all ${isHunter ? 'bg-amber-500/10 border border-amber-500/40' : 'bg-blue-50 border border-blue-100'}`}>
            {isHunter ? <Briefcase size={24} className="text-amber-400" /> : <TrendingUp size={24} className="text-blue-500" />}
          </div>
          <div>
            <h2 className={`text-2xl font-black uppercase tracking-tighter ${isHunter ? 'text-amber-400' : 'text-slate-900'}`}>
              {isHunter ? 'Brahan_Prospector_Node' : 'Market Intelligence Suite'}
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`text-[9px] uppercase tracking-[0.4em] font-black ${isHunter ? 'text-amber-800' : 'text-slate-400'}`}>
                {isHunter ? 'Mode: Advertisement_Intelligence' : 'Strategy: Business Opportunity Scan'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 min-h-0 overflow-hidden">
        <div className="flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2">
          <div className={`rounded-2xl flex flex-col p-5 shadow-xl transition-all ${isHunter ? 'bg-slate-950/80 border border-amber-900/30' : 'bg-slate-50 border border-slate-200'}`}>
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center ${isHunter ? 'text-amber-400' : 'text-slate-400'}`}>
              <Anchor size={14} className="mr-2" /> Strategic_Basins
            </h3>
            <div className="space-y-2">
              {SEVEN_SEAS.map((sea) => (
                <button
                  key={sea.id}
                  onClick={() => handleGenerate(sea.id, sea.name)}
                  className={`w-full p-4 rounded-xl border transition-all text-left group flex justify-between items-center ${
                    selectedRegion === sea.id 
                      ? (isHunter ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-blue-600 text-white border-blue-700 shadow-md')
                      : (isHunter ? 'bg-slate-900/40 border-amber-900/20 text-amber-800 hover:border-amber-500/50' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100')
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase leading-none">{sea.name}</span>
                    <span className={`text-[8px] font-mono mt-1 ${selectedRegion === sea.id ? (isHunter ? 'text-slate-900' : 'text-white/80') : (isHunter ? 'text-amber-900' : 'text-slate-400')}`}>
                      {isHunter ? `GHOST: ${sea.ghost}` : `ID: ${sea.safe}`}
                    </span>
                  </div>
                  <ChevronRight size={16} className={selectedRegion === sea.id ? '' : 'opacity-40 group-hover:opacity-100'} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden">
          <div className={`flex-1 border rounded-2xl flex flex-col overflow-hidden shadow-2xl relative transition-all ${isHunter ? 'bg-slate-950/80 border-amber-900/30' : 'bg-white border-slate-200'}`}>
            <div className={`p-4 border-b flex items-center justify-between transition-all ${isHunter ? 'border-amber-900/30 bg-slate-900/60' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="flex items-center space-x-3">
                <Sparkles size={18} className={isHunter ? "text-amber-500" : "text-blue-500"} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isHunter ? "text-amber-400" : "text-slate-900"}`}>
                  {isHunter ? 'Generated_Rescue_Brief' : 'Market Analysis Output'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
              {!brief && !isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                   <Map size={80} className="animate-pulse" />
                   <span className="text-xs font-black uppercase tracking-[0.4em]">Select_Parameter_to_Scan</span>
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                   <Loader2 size={40} className={`animate-spin ${isHunter ? "text-amber-500" : "text-blue-500"}`} />
                   <span className={`text-[10px] font-black animate-pulse uppercase tracking-[0.5em] ${isHunter ? "text-amber-500" : "text-slate-400"}`}>
                     {isHunter ? 'Penetrating_Commercial_Fog...' : 'Aggregating Data Sources...'}
                   </span>
                </div>
              ) : brief && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className={`p-6 border-l-4 rounded-r-xl shadow-xl relative overflow-hidden transition-all ${isHunter ? 'bg-amber-500/5 border-amber-500' : 'bg-blue-50 border-blue-500'}`}>
                     <span className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isHunter ? 'text-amber-500' : 'text-blue-600'}`}>
                       {isHunter ? 'Technical_Opening_Line (The Bait)' : 'Strategic Narrative Hook'}
                     </span>
                     <p className={`text-lg font-black leading-tight italic ${isHunter ? 'text-amber-100' : 'text-slate-800'}`}>
                       "{brief.technical_hook}"
                     </p>
                  </div>

                  <div className={`p-6 border rounded-xl relative transition-all ${isHunter ? 'bg-slate-900/60 border-amber-900/30' : 'bg-slate-50 border-slate-200'}`}>
                     <div className="flex items-center space-x-2 mb-4">
                        <Zap size={14} className={isHunter ? "text-amber-500 animate-pulse" : "text-blue-500"} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isHunter ? 'text-amber-400' : 'text-slate-500'}`}>
                          {isHunter ? 'Buried_Treasure_Tease' : 'Projected Value Opportunity'}
                        </span>
                     </div>
                     <p className={`text-[13px] font-black tracking-widest uppercase ${isHunter ? 'text-emerald-400' : 'text-blue-600'}`}>
                       {brief.buried_treasure_tease}
                     </p>
                  </div>

                  <div className="space-y-3">
                     <span className={`text-[10px] font-black uppercase tracking-widest flex items-center ${isHunter ? 'text-amber-900' : 'text-slate-400'}`}>
                        <ShieldAlert size={14} className="mr-2" /> Detail Intelligence
                     </span>
                     <div className={`p-5 rounded-xl text-xs leading-relaxed transition-all ${isHunter ? 'bg-slate-950 border border-amber-900/20 text-amber-200/60 font-mono' : 'bg-white border border-slate-200 text-slate-600'}`}>
                        {brief.raw_intelligence}
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`p-5 border-t bg-slate-950 flex space-x-3 transition-all ${isHunter ? 'border-amber-900/40' : 'border-slate-100'}`}>
               <button 
                disabled={!brief}
                className={`flex-1 py-4 font-black uppercase text-[10px] tracking-[0.4em] rounded-xl transition-all flex items-center justify-center space-x-3 ${isHunter ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:bg-amber-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
               >
                 <Send size={16} />
                 <span>{isHunter ? 'Execute_Cold_Outreach' : 'Generate Project Proposal'}</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prospector;
