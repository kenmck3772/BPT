import React, { useState, useMemo } from 'react';
import { 
  Beaker, FlaskConical, AlertTriangle, FileText, 
  Search, Loader2, Zap, ShieldAlert, Scale, 
  Terminal, Activity, Droplets, ArrowRight,
  TrendingDown, Database, Clock, ShieldCheck,
  ChevronRight, ArrowDownToLine, Info, Hammer,
  Coins, TrendingUp, BarChart3, HardDrive, AlertOctagon,
  Maximize2, Minimize2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Line, ComposedChart } from 'recharts';
import { performChemistryAudit, generateChemicalWashProcedure, generateCommercialAudit } from '../services/geminiService';
import { secureAsset } from '../services/vaultService';

interface ChemistryForensicsProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const ChemistryForensics: React.FC<ChemistryForensicsProps> = ({ isFocused, onToggleFocus }) => {
  const [activeTab, setActiveTab] = useState<'DIAGNOSTIC' | 'REMEDIATION' | 'COMMERCIAL'>('DIAGNOSTIC');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [memo, setMemo] = useState<string | null>(null);
  const [procedure, setProcedure] = useState<string | null>(null);
  const [commercialAudit, setCommercialAudit] = useState<string | null>(null);
  const [isSecuring, setIsSecuring] = useState(false);

  // Simulated SSSV Pressure Data for Well D-03 showing "The Ratchet Effect"
  const pressureData = useMemo(() => {
    const data = [];
    for (let t = 0; t <= 30; t++) {
      let p;
      if (t < 2) p = 3000 - (t * 100); 
      else if (t < 10) p = 2800; // The "Hold" on scale bed
      else if (t < 15) p = 2800 - (t - 10) * 10;
      else if (t === 15) p = 2500; // The "Snap" through scale
      else p = 2500 - (Math.random() * 20) - ((t - 15) * 15); // Ratchet/Stutter decay
      
      const linear = 3000 - (t * 25); // Theoretical mechanical leak
      data.push({ time: t, pressure: p, linearLeak: linear });
    }
    return data;
  }, []);

  const handleExecuteAudit = async () => {
    setIsAnalyzing(true);
    setMemo(null);
    const dataString = `WELL: D-03 (CNR Ninian Hub). VALVE: Halliburton 4.5" Flapper. DATA: P(0)=3000, P(2)=2800, P(10)=2800 (Hold), P(15)=2500 (Snap/Snapback), P(20)=Ratchet/Stutter decay. INHIBITOR: 14 Day Lapse. TEMPERATURE: 95C.`;
    const result = await performChemistryAudit(dataString);
    setMemo(result);
    setIsAnalyzing(false);
  };

  const handleGenerateProcedure = async () => {
    setIsAnalyzing(true);
    setProcedure(null);
    const result = await generateChemicalWashProcedure("D-03", 1200); 
    setProcedure(result);
    setIsAnalyzing(false);
  };

  const handleGenerateCommercial = async () => {
    setIsAnalyzing(true);
    setCommercialAudit(null);
    const result = await generateCommercialAudit("D-03");
    setCommercialAudit(result);
    setIsAnalyzing(false);
  };

  const handleSecureToVault = () => {
    const content = activeTab === 'DIAGNOSTIC' ? memo : activeTab === 'REMEDIATION' ? procedure : commercialAudit;
    if (!content) return;
    setIsSecuring(true);
    setTimeout(() => {
      secureAsset({
        title: activeTab === 'DIAGNOSTIC' ? `Forensic_Chemistry_Memo: Well D-03` : activeTab === 'REMEDIATION' ? `Remediation_Procedure: D-03_SSSV_Wash` : `Commercial_Veto: D-03_Ignorance_Tax_Audit`,
        status: 'CRITICAL',
        summary: activeTab === 'DIAGNOSTIC' 
          ? `Ratchet Effect confirmed via waveform autopsy. Scale Choking (BaSO4) identified. Addressing Group General Manager: £7.145M cost avoidance possible.`
          : activeTab === 'REMEDIATION'
          ? `Top-side Bullhead Wash procedure finalized. High-pH DTPA selected for BaSO4 kinetics. Soak duration 8h.`
          : `Total Option A: £7.2M. Total Option B: £55k. Net Savings: £7,145,000. Negligence alert issued to Board.`,
        region: 'North Sea (Block 3/3)',
        valueEst: 7145000,
        confidence: 91.2
      });
      setIsSecuring(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        {activeTab === 'COMMERCIAL' ? <Coins size={400} className="text-yellow-500 animate-pulse" /> : <FlaskConical size={400} className="text-amber-500 animate-pulse" />}
      </div>
      <header className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-amber-900/30 pb-4 relative z-10 gap-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 border rounded-xl shadow-lg ${activeTab === 'COMMERCIAL' ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-amber-500/10 border-amber-500/40'}`}>
            {activeTab === 'COMMERCIAL' ? <Coins size={24} className="text-yellow-400" /> : <Beaker size={24} className="text-amber-400" />}
          </div>
          <div>
            <h2 className={`text-2xl font-black uppercase tracking-tighter ${activeTab === 'COMMERCIAL' ? 'text-yellow-400' : 'text-amber-400'}`}>
              >>> NODE: {activeTab === 'COMMERCIAL' ? 'SOVEREIGN_FISCAL_VETO' : 'PRODUCTION_CHEMISTRY_v4.8'}
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`text-[9px] uppercase tracking-[0.4em] font-black ${activeTab === 'COMMERCIAL' ? 'text-yellow-800' : 'text-amber-800'}`}>
                Target: WELL_D-03 // Audit: SCALE_CHOKE_PROBABILITY
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-900 border border-amber-900/30 p-1 rounded-lg">
            <button onClick={() => setActiveTab('DIAGNOSTIC')} className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'DIAGNOSTIC' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-amber-800 hover:text-amber-400'}`}><Activity size={12} /><span>Autopsy</span></button>
            <button onClick={() => setActiveTab('REMEDIATION')} className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'REMEDIATION' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-amber-800 hover:text-amber-400'}`}><Hammer size={12} /><span>Remediation</span></button>
            <button onClick={() => setActiveTab('COMMERCIAL')} className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'COMMERCIAL' ? 'bg-yellow-500 text-slate-950 shadow-lg' : 'text-yellow-800 hover:text-yellow-400'}`}><Coins size={12} /><span>Veto</span></button>
          </div>
          {onToggleFocus && (
            <button onClick={onToggleFocus} className="p-2 text-amber-900 hover:text-amber-400 transition-all ml-2">
              {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          )}
        </div>
      </header>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 min-h-0 overflow-hidden">
        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          {activeTab === 'DIAGNOSTIC' && (
            <div className="flex-1 bg-slate-950/80 border border-amber-900/30 rounded-2xl flex flex-col p-5 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-amber-900/10 pb-2">
                 <div className="flex items-center space-x-2"><Activity size={16} className="text-amber-500" /><span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Well_D-03_Waveform (Ratchet_Effect)</span></div>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={pressureData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                     <CartesianGrid strokeDasharray="1 5" stroke="#451a03" opacity={0.3} />
                     <XAxis dataKey="time" stroke="#78350f" fontSize={9} label={{ value: 'Time (min)', position: 'bottom', fill: '#78350f', fontSize: 8 }} />
                     <YAxis stroke="#78350f" fontSize={9} domain={[2000, 3200]} />
                     <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #78350f', fontSize: '10px' }} />
                     <Line type="stepAfter" dataKey="pressure" name="ACTUAL_PRESSURE" stroke="#fbbf24" strokeWidth={3} dot={false} isAnimationActive={false} />
                     <Line type="monotone" dataKey="linearLeak" name="MECHANICAL_LEAK_MODEL" stroke="#334155" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                     <ReferenceLine x={10} stroke="#4ade80" strokeDasharray="3 3" label={{ value: 'HOLD', position: 'top', fill: '#4ade80', fontSize: 7 }} />
                     <ReferenceLine x={15} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'SNAP', position: 'top', fill: '#ef4444', fontSize: 7 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {activeTab === 'COMMERCIAL' && (
            <div className="flex-1 bg-slate-950/80 border border-yellow-900/30 rounded-2xl flex flex-col p-6 shadow-2xl overflow-hidden relative">
               <div className="flex items-center justify-between mb-6 border-b border-yellow-900/10 pb-3">
                  <div className="flex items-center space-x-2"><BarChart3 size={18} className="text-yellow-500" /><span className="text-[11px] font-black text-yellow-400 uppercase tracking-[0.2em]">D-03_Ignorance_Tax_Audit</span></div>
               </div>
               <div className="space-y-4 flex-1">
                  {[
                    { item: 'Vessel_Mobilization', a: '£3,000,000', b: '£0' },
                    { item: 'Daily_Rate_Op_10D', a: '£2,500,000', b: '£55,000' },
                    { item: 'Replacement_Hardware', a: '£500,000', b: '£0' },
                    { item: 'Weather_Risk_Adj', a: '£1,200,000', b: '£0' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 items-center py-2 border-b border-yellow-900/5 group hover:bg-yellow-500/5 transition-all">
                       <span className="text-[10px] font-bold text-yellow-100 uppercase">{row.item}</span>
                       <span className="text-[10px] font-mono text-red-500 text-right">{row.a}</span>
                       <span className="text-[10px] font-mono text-emerald-500 text-right">{row.b}</span>
                    </div>
                  ))}
                  <div className="mt-8 grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-900 rounded-xl border border-yellow-900/30">
                        <span className="text-[8px] text-yellow-900 uppercase font-black block mb-1">Total_Option_A</span>
                        <div className="text-2xl font-black text-red-500 tracking-tighter">£7,200,000</div>
                     </div>
                     <div className="p-4 bg-slate-900 rounded-xl border border-emerald-500/30">
                        <span className="text-[8px] text-emerald-900 uppercase font-black block mb-1">Total_Option_B</span>
                        <div className="text-2xl font-black text-emerald-400 tracking-tighter">£55,000</div>
                     </div>
                  </div>
               </div>
               <div className="mt-auto p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <TrendingUp size={24} className="text-yellow-400 animate-bounce-slow" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-yellow-900 uppercase tracking-widest">Net_Savings_Realizable</span>
                        <span className="text-3xl font-black text-yellow-400 tracking-tighter">£7,145,000</span>
                     </div>
                  </div>
               </div>
            </div>
          )}
          <div className="p-4 bg-slate-900/80 border border-amber-900/30 rounded-2xl flex flex-col gap-4 shadow-xl">
             <button onClick={activeTab === 'DIAGNOSTIC' ? handleExecuteAudit : activeTab === 'REMEDIATION' ? handleGenerateProcedure : handleGenerateCommercial} disabled={isAnalyzing} className={`w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.4em] transition-all flex items-center justify-center space-x-3 group ${activeTab === 'COMMERCIAL' ? 'bg-yellow-500 text-slate-950 shadow-[0_0_25px_rgba(234,179,8,0.3)] hover:bg-yellow-400' : (activeTab === 'DIAGNOSTIC' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400')}`}>
               {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
               <span>{isAnalyzing ? 'SYNTHESIZING_EVIDENCE...' : (activeTab === 'DIAGNOSTIC' ? 'Execute_Forensic_Autopsy' : activeTab === 'REMEDIATION' ? 'Design_Procedure' : 'Execute_Commercial_Audit')}</span>
             </button>
          </div>
        </div>
        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-slate-950/90 border border-amber-900/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
            <div className={`p-4 border-b border-amber-900/30 flex items-center justify-between bg-slate-900/60`}>
              <div className="flex items-center space-x-3">
                <FileText size={18} className={activeTab === 'COMMERCIAL' ? 'text-yellow-500' : 'text-amber-500'} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'COMMERCIAL' ? 'text-yellow-400' : 'text-amber-400'}`}>
                   {activeTab === 'DIAGNOSTIC' ? 'TECHNICAL_MEMO: Group_GM' : activeTab === 'REMEDIATION' ? 'CHEMICAL_WASH_PROC' : 'BOARD_FISCAL_DIRECTIVE'}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              {!(activeTab === 'DIAGNOSTIC' ? memo : activeTab === 'REMEDIATION' ? procedure : commercialAudit) && !isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                   <Scale size={100} className="animate-pulse text-amber-900" />
                   <div className="text-center space-y-2">
                    <span className="text-sm font-black uppercase tracking-[0.5em] block">Waiting for Evidence Synthesis</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-950 italic tracking-widest">Well: D-03 // Ninian Hub</span>
                   </div>
                </div>
              ) : isAnalyzing ? (
                <div className="space-y-6 animate-pulse p-4">
                   <div className="h-10 bg-slate-900/60 rounded-xl w-3/4"></div>
                   <div className="h-64 bg-slate-900 rounded-2xl"></div>
                </div>
              ) : (activeTab === 'DIAGNOSTIC' ? memo : activeTab === 'REMEDIATION' ? procedure : commercialAudit) && (
                <div className="space-y-6 animate-in fade-in duration-700">
                  <div className="prose prose-invert max-w-none">
                     <div className={`font-mono text-[11px] leading-relaxed whitespace-pre-wrap border-l-2 pl-6 transition-colors ${activeTab === 'DIAGNOSTIC' ? 'text-amber-100 border-amber-500/30' : activeTab === 'REMEDIATION' ? 'text-emerald-100 border-emerald-500/30' : 'text-yellow-100 border-yellow-500/30'}`}>
                        {activeTab === 'DIAGNOSTIC' ? memo : activeTab === 'REMEDIATION' ? procedure : commercialAudit}
                     </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-amber-900/40 bg-slate-950">
               <button disabled={!(activeTab === 'DIAGNOSTIC' ? memo : activeTab === 'REMEDIATION' ? procedure : commercialAudit) || isSecuring} onClick={handleSecureToVault} className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.4em] transition-all flex items-center justify-center space-x-3 ${activeTab === 'COMMERCIAL' ? 'bg-yellow-600 text-slate-950' : 'bg-emerald-500 text-slate-950'}`}>
                 {isSecuring ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                 <span>{isSecuring ? 'ARCHIVING_DIRECTIVE...' : 'Secure_to_Sovereign_Vault'}</span>
               </button>
            </div>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-4">
             <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
             <div className="space-y-1">
                <span className={`text-[9px] font-black text-red-500 uppercase tracking-widest`}>FISCAL_VETO_ADVISORY</span>
                <p className="text-[10px] text-red-200/60 leading-tight italic">"Forensic evidence of 'Ratchet Decay' in Well D-03 proves scale choking. Approving Option A mobilizations constitutes financial negligence."</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChemistryForensics;