
import React, { useState, useMemo } from 'react';
import { 
  Beaker, FlaskConical, AlertTriangle, FileText, 
  Search, Loader2, Zap, ShieldAlert, Scale, 
  Terminal, Activity, Droplets, ArrowRight,
  TrendingDown, Database, Clock, ShieldCheck,
  ChevronRight, ArrowDownToLine, Info, Hammer,
  Coins, TrendingUp, BarChart3, HardDrive, AlertOctagon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Line, ComposedChart } from 'recharts';
import { performChemistryAudit, generateChemicalWashProcedure, generateCommercialAudit } from '../services/geminiService';
import { secureAsset } from '../services/vaultService';

const ChemistryForensics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DIAGNOSTIC' | 'REMEDIATION' | 'COMMERCIAL'>('DIAGNOSTIC');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [memo, setMemo] = useState<string | null>(null);
  const [procedure, setProcedure] = useState<string | null>(null);
  const [commercialAudit, setCommercialAudit] = useState<string | null>(null);
  const [isSecuring, setIsSecuring] = useState(false);

  // Simulated SSSV Pressure Data showing "The Ratchet"
  const pressureData = useMemo(() => {
    const data = [];
    for (let t = 0; t <= 30; t++) {
      let p;
      if (t < 5) p = 3000 - (t * 40); // Initial seating attempt
      else if (t < 15) p = 2800; // The "Hold" on scale bed
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
    const dataString = `WELL: D-03. VALVE: Halliburton 4.5" Flapper. DATA: P(0)=3000, P(2)=2800, P(10)=2800 (Hold), P(20)=Ratchet. INHIBITOR: 14 Day Lapse.`;
    const result = await performChemistryAudit(dataString);
    setMemo(result);
    setIsAnalyzing(false);
  };

  const handleGenerateProcedure = async () => {
    setIsAnalyzing(true);
    setProcedure(null);
    const result = await generateChemicalWashProcedure("D-03", 1200); // 1200m depth
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
          ? `Ratchet Effect confirmed. Scale Choking (BaSO4) identified. £7.9M cost avoidance proposed.`
          : activeTab === 'REMEDIATION'
          ? `Top-side Bullhead Wash procedure finalized. High-pH DTPA selected. Soak duration 8h. Compatible with 13Cr.`
          : `The Ignorance Tax: D-03 Audit. Total Option A: £7.2M. Total Option B: £55k. Net Savings: £7,145,000. Negligence alert issued to Board.`,
        region: 'North Sea (Block 3/3)',
        valueEst: activeTab === 'COMMERCIAL' ? 7145000 : 7960000,
        confidence: 91.2
      });
      setIsSecuring(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      {/* Background HUD Decor */}
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
                Target: WELL_D-03_INTERVENTION // Phase: {activeTab}
              </span>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-900 border border-amber-900/40 p-1 rounded-lg">
          <button onClick={() => setActiveTab('DIAGNOSTIC')} className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'DIAGNOSTIC' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-amber-800 hover:text-amber-400'}`}>
            <Activity size={12} /><span>Forensic_Autopsy</span>
          </button>
          <button onClick={() => setActiveTab('REMEDIATION')} className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'REMEDIATION' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-amber-800 hover:text-amber-400'}`}>
            <Hammer size={12} /><span>Remediation_Planner</span>
          </button>
          <button onClick={() => setActiveTab('COMMERCIAL')} className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'COMMERCIAL' ? 'bg-yellow-500 text-slate-950 shadow-lg' : 'text-yellow-800 hover:text-yellow-400'}`}>
            <Coins size={12} /><span>Commercial_Veto</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
           <div className="bg-slate-950 px-4 py-2 border border-amber-900/40 rounded flex items-center gap-3">
              <ShieldAlert size={14} className={activeTab === 'COMMERCIAL' ? 'text-yellow-500' : 'text-amber-500'} />
              <span className={`text-[10px] font-mono tracking-widest ${activeTab === 'COMMERCIAL' ? 'text-yellow-500' : 'text-amber-500'}`}>
                {activeTab === 'COMMERCIAL' ? 'FISCAL_GATE: VETO_AUTHORIZED' : 'CHEMICAL_SAFETY: 13Cr_COMPATIBLE'}
              </span>
           </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 min-h-0 overflow-hidden">
        
        {/* Left Column: Data Artifacts & Comparative Ledger */}
        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          {activeTab === 'DIAGNOSTIC' && (
            <div className="flex-1 bg-slate-950/80 border border-amber-900/30 rounded-2xl flex flex-col p-5 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-amber-900/10 pb-2">
                 <div className="flex items-center space-x-2"><Activity size={16} className="text-amber-500" /><span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Pressure_Waveform_Telemetry</span></div>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={pressureData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                     <CartesianGrid strokeDasharray="1 5" stroke="#451a03" opacity={0.3} />
                     <XAxis dataKey="time" stroke="#78350f" fontSize={9} />
                     <YAxis stroke="#78350f" fontSize={9} domain={[2000, 3200]} />
                     <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #78350f', fontSize: '10px' }} />
                     <Line type="stepAfter" dataKey="pressure" stroke="#fbbf24" strokeWidth={3} dot={false} isAnimationActive={false} />
                     <Line type="monotone" dataKey="linearLeak" stroke="#334155" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                     <ReferenceLine x={15} stroke="#ef4444" strokeDasharray="3 3" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'REMEDIATION' && (
            <div className="flex-1 bg-slate-950/80 border border-emerald-900/30 rounded-2xl flex flex-col p-5 shadow-2xl overflow-hidden">
               <div className="flex items-center justify-between mb-4 border-b border-emerald-900/10 pb-2">
                  <div className="flex items-center space-x-2"><ShieldCheck size={16} className="text-emerald-500" /><span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Ready-to-Execute_Procedure</span></div>
               </div>
               <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                  {[
                    { step: 1, label: 'PRE-FLUSH', chemical: 'Xylene / Mutual Solvent', vol: '10 bbl', dur: '30 min' },
                    { step: 2, label: 'MAIN_PILL', chemical: 'High-pH DTPA (Scale Dissolver)', vol: '25 bbl', dur: '4 hr Soak' },
                    { step: 3, label: 'POST-FLUSH', chemical: 'Inhibitor Brine + Glycol', vol: '50 bbl', dur: '1 hr' }
                  ].map((step) => (
                    <div key={step.step} className="p-3 bg-slate-900 border border-emerald-900/20 rounded-xl flex items-center justify-between">
                       <span className="text-[10px] font-black text-emerald-400">0{step.step} // {step.label}</span>
                       <span className="text-[9px] text-emerald-900 font-mono italic">{step.chemical} ({step.vol})</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'COMMERCIAL' && (
            <div className="flex-1 bg-slate-950/80 border border-yellow-900/30 rounded-2xl flex flex-col p-6 shadow-2xl overflow-hidden relative">
               <div className="flex items-center justify-between mb-6 border-b border-yellow-900/10 pb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart3 size={18} className="text-yellow-500" />
                    <span className="text-[11px] font-black text-yellow-400 uppercase tracking-[0.2em]">The_Ignorance_Tax: D-03_Intervention</span>
                  </div>
                  <div className="text-[8px] font-black text-yellow-900 uppercase">Audit_Locked: True</div>
               </div>

               <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-3 gap-2 text-[8px] font-black text-yellow-900 uppercase border-b border-yellow-900/10 pb-1 mb-2">
                    <span>Fiscal_Item</span>
                    <span className="text-right">Option_A (Office_Plan)</span>
                    <span className="text-right">Option_B (Forensic_Wash)</span>
                  </div>
                  {[
                    { item: 'Vessel_Mobilization', a: '£3,000,000', b: '£0' },
                    { item: 'Operations (10 Days)', a: '£2,500,000', b: '£55,000' },
                    { item: 'Replacement_Hardware', a: '£500,000', b: '£0' },
                    { item: 'Weather_Risk_Adj (20%)', a: '£1,200,000', b: '£0' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 items-center py-2 border-b border-yellow-900/5 group hover:bg-yellow-500/5 transition-all">
                       <span className="text-[10px] font-bold text-yellow-100 uppercase">{row.item}</span>
                       <span className="text-[10px] font-mono text-red-500 text-right">{row.a}</span>
                       <span className="text-[10px] font-mono text-emerald-500 text-right">{row.b}</span>
                    </div>
                  ))}

                  <div className="mt-8 grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-900 rounded-xl border border-yellow-900/30">
                        <span className="text-[8px] text-yellow-900 uppercase font-black block mb-1">Total_Capex_Exposure</span>
                        <div className="text-2xl font-black text-red-500 tracking-tighter">£7,200,000</div>
                     </div>
                     <div className="p-4 bg-slate-900 rounded-xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <span className="text-[8px] text-emerald-900 uppercase font-black block mb-1">Forensic_Capex_Exposure</span>
                        <div className="text-2xl font-black text-emerald-400 tracking-tighter">£55,000</div>
                     </div>
                  </div>
               </div>

               <div className="mt-auto p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-4">
                     <TrendingUp size={24} className="text-yellow-400 animate-bounce-slow" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-yellow-900 uppercase tracking-widest">Audit_Net_Savings_Potential</span>
                        <span className="text-3xl font-black text-yellow-400 tracking-tighter">£7,145,000</span>
                     </div>
                  </div>
                  <AlertOctagon size={24} className="text-yellow-600 animate-pulse" />
               </div>
            </div>
          )}

          <div className="p-4 bg-slate-900/80 border border-amber-900/30 rounded-2xl flex flex-col gap-4 shadow-xl">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Decision_Gate_Executor</span>
                <Clock size={14} className="text-amber-900" />
             </div>
             <button 
              onClick={activeTab === 'DIAGNOSTIC' ? handleExecuteAudit : activeTab === 'REMEDIATION' ? handleGenerateProcedure : handleGenerateCommercial}
              disabled={isAnalyzing}
              className={`w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.4em] transition-all flex items-center justify-center space-x-3 group ${activeTab === 'COMMERCIAL' ? 'bg-yellow-500 text-slate-950 shadow-[0_0_25px_rgba(234,179,8,0.3)] hover:bg-yellow-400' : (activeTab === 'DIAGNOSTIC' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400')}`}
             >
               {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
               <span>{isAnalyzing ? 'RECONSTRUCTING_ARTIFACTS...' : (activeTab === 'DIAGNOSTIC' ? 'Execute_Forensic_Autopsy' : activeTab === 'REMEDIATION' ? 'Design_Remediation_Program' : 'Execute_Commercial_Audit')}</span>
             </button>
          </div>
        </div>

        {/* Right Column: Output Viewport (Memo, Procedure, or Audit) */}
        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-slate-950/90 border border-amber-900/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
            <div className={`p-4 border-b border-amber-900/30 flex items-center justify-between bg-slate-900/60`}>
              <div className="flex items-center space-x-3">
                <FileText size={18} className={activeTab === 'COMMERCIAL' ? 'text-yellow-500' : 'text-amber-500'} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'COMMERCIAL' ? 'text-yellow-400' : 'text-amber-400'}`}>
                   {activeTab === 'DIAGNOSTIC' ? 'Technical_Forensic_Memo' : activeTab === 'REMEDIATION' ? 'Chemical_Wash_Procedure' : 'BOARD_FISCAL_DIRECTIVE'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                 <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-orange-500 animate-ping' : (activeTab === 'COMMERCIAL' ? (commercialAudit ? 'bg-yellow-500' : 'bg-amber-900') : (memo ? 'bg-emerald-500' : 'bg-amber-900'))}`}></div>
                 <span className={`text-[8px] font-black uppercase ${isAnalyzing ? "text-orange-500" : "text-amber-500"}`}>{isAnalyzing ? 'PROCESSING' : 'VETTED'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              {!(activeTab === 'DIAGNOSTIC' ? memo : activeTab === 'REMEDIATION' ? procedure : commercialAudit) && !isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                   <Scale size={100} className="animate-pulse text-amber-900" />
                   <div className="text-center space-y-2">
                    <span className="text-sm font-black uppercase tracking-[0.5em] block">Waiting for Evidence Synthesis</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-950 italic italic tracking-widest">Target: Block 3/3 // Well D-03</span>
                   </div>
                </div>
              ) : isAnalyzing ? (
                <div className="space-y-6 animate-pulse p-4">
                   <div className="h-10 bg-slate-900 rounded-xl w-3/4"></div>
                   <div className="h-64 bg-slate-900 rounded-2xl"></div>
                   <div className="space-y-3">
                      <div className="h-4 bg-slate-900 rounded-full"></div>
                      <div className="h-4 bg-slate-900 rounded-full w-5/6"></div>
                   </div>
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
               <button 
                disabled={!(activeTab === 'DIAGNOSTIC' ? memo : activeTab === 'REMEDIATION' ? procedure : commercialAudit) || isSecuring}
                onClick={handleSecureToVault}
                className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.4em] transition-all flex items-center justify-center space-x-3 ${activeTab === 'COMMERCIAL' ? 'bg-yellow-600 text-slate-950 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'bg-emerald-500 text-slate-950'}`}
               >
                 {isSecuring ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                 <span>{isSecuring ? 'ARCHIVING_DIRECTIVE...' : (activeTab === 'COMMERCIAL' ? 'Secure_Veto_to_Vault' : 'Secure_Artifact_to_Vault')}</span>
               </button>
            </div>
          </div>
          
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
             <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
             <div className="space-y-1">
                <span className={`text-[9px] font-black text-red-500 uppercase tracking-widest`}>
                   {activeTab === 'COMMERCIAL' ? 'FIDUCIARY_DUTY_WARNING' : 'ECONOMIC_RECOVERY_VETO'}
                </span>
                <p className="text-[10px] text-red-200/60 leading-tight italic">
                   {activeTab === 'COMMERCIAL' 
                     ? "Warning: Approving Option A despite the verified Scale Choke evidence constitutes reckless capital expenditure. This audit serves as a formal veto on grounds of financial negligence."
                     : "Forensic evidence of a reversible scale choke makes Option A a violation of NSTA 'Maximum Economic Recovery' (MER UK) mandates."}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChemistryForensics;
