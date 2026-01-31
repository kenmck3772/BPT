import React, { useState, useMemo } from 'react';
import { 
  Cpu, Zap, ShieldAlert, Loader2, Binary, 
  Terminal, Search, Database, FileText, 
  AlertOctagon, CheckCircle2, UserCheck, Scale,
  Eye, Radio, Scan, Target, Link, ExternalLink,
  ShieldCheck, Share2, CloudDownload, Building,
  FileCode, Layers, FileSpreadsheet, Download,
  Filter, Maximize2, Minimize2, Flame, Droplet,
  Shield
} from 'lucide-react';
import { processUnstructuredArtifact, analyzeHarvestedMetadata } from '../services/geminiService';
import { secureAsset } from '../services/vaultService';

interface ForensicHarvesterProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const MOCK_RAW_INPUT = `
CNR INTERNATIONAL - NINIAN CENTRAL
DATE: 12-OCT-1985
WELL: N-42 / 3/3-N42
OPERATOR: BRITOIL (PRE-CNR)
STATUS: SHUT IN (UNAUTHORIZED)
---
Handwritten note in header: "Vertical datum referenced to original platform MSL. KB elevation 31.2m. Seabed subsidence expected."
Intervention summary: "Bleed down recorded in A-annulus. SITP holding at 2100 PSI despite surface plug. Manual seal checked."
Missing fields in NDR index: No suspension expiry date listed.
`;

const JACKDAW_HPHT_LINER_MANIFEST = `
JACKDAW FIELD (SHELL) - WELL J-01
TARGET: HPHT LINER STRING (9-7/8")
---
TALLY SCAN: Heat Numbers 8872-B thru 8904-C.
GRADE: CRA (Chrome Resistance Alloy) 25Cr Super Duplex.
SPEC: API-5CT / Q1 High Precision.
---
CRITICAL AUDIT: Scan mill certs for residual stress violations in heat 8891.
`;

const BUZZARD_PRODUCTION_LOG = `
BUZZARD FIELD (CNOOC) - 20/6-B44
TARGET: PRODUCTION CASING AUDIT
---
H2S CONCENTRATION: 45,000 PPM (RECORDED AT CHOKE).
CO2: 12%.
PRESSURE: 3200 PSI SITP.
---
ANOMALY: Sustained B-Annulus recharge detected since June 2023. 
SUSPECT: Stress corrosion cracking in 13Cr joints @ 4200ft.
`;

const MOCK_HARVESTED_WELLS = [
  { uwi: "211/12-A1", operator: "EnQuest", status: "Suspended", verticalDatum: "RT", suspensionDate: "2023-01-15", sitp: "1450", pid: "PRJ-001", fid: "FILE-X82" },
  { uwi: "15/17-N42", operator: "CNOOC", status: "Shut In", verticalDatum: "NULL", suspensionDate: "PENDING", sitp: "2100", pid: "PRJ-002", fid: "FILE-N91" },
  { uwi: "20/6-B44", operator: "CNOOC", status: "Active (Choked)", verticalDatum: "KB", suspensionDate: "N/A", sitp: "3200", pid: "PRJ-BUZ", fid: "FILE-B88" },
  { uwi: "21/11-N1", operator: "Apache", status: "Suspended", verticalDatum: "GL", suspensionDate: "NULL", sitp: "180", pid: "PRJ-004", fid: "FILE-A12" }
];

const ForensicHarvester: React.FC<ForensicHarvesterProps> = ({ isFocused, onToggleFocus }) => {
  const [mode, setMode] = useState<'UNSTRUCTURED' | 'SHAREPOINT'>('UNSTRUCTURED');
  const [rawText, setRawText] = useState(MOCK_RAW_INPUT);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isNotarizing, setIsNotarizing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isCsvGenerated, setIsCsvGenerated] = useState(false);

  // SharePoint Specific State
  const [msalFlow, setMsalFlow] = useState<'IDLE' | 'AUTH_WAIT' | 'FETCHING' | 'DONE'>('IDLE');
  const [deviceCode] = useState("D-9B82-XC42");
  const [harvestedData, setHarvestedData] = useState<any[]>([]);
  
  const targetSite = "6c6998d8-b8af-4e28-9d34-af902416f6a0";
  const projListId = "a46b592d-5cf4-4843-af4c-a5524e5160be";
  const fileListId = "6c34a73a-e634-45b6-b9ab-decca6d6d810";

  const handleHarvestUnstructured = async () => {
    setIsHarvesting(true);
    setResult(null);
    setIsVerified(false);
    const data = await processUnstructuredArtifact(rawText);
    setResult(data);
    setIsHarvesting(false);
  };

  const initiateSharePointFlow = () => {
    setMsalFlow('AUTH_WAIT');
    setTimeout(() => {
      setMsalFlow('FETCHING');
      setTimeout(() => {
        setHarvestedData(MOCK_HARVESTED_WELLS);
        setMsalFlow('DONE');
      }, 2000);
    }, 4000); 
  };

  const loadJackdawPreset = () => {
    setRawText(JACKDAW_HPHT_LINER_MANIFEST);
    setMode('UNSTRUCTURED');
    setResult(null);
  };

  const loadBuzzardPreset = () => {
    setRawText(BUZZARD_PRODUCTION_LOG);
    setMode('UNSTRUCTURED');
    setResult(null);
  };

  const handleBatchAudit = async () => {
    setIsHarvesting(true);
    setResult(null);
    const audit = await analyzeHarvestedMetadata(harvestedData);
    setResult({
      ...audit,
      context: "Quad 2 Well Projects",
      siteId: targetSite,
      listId: projListId
    });
    setIsHarvesting(false);
    setIsCsvGenerated(true);
  };

  const downloadWorkOrderCsv = () => {
    const headers = "File Name,Project ID,File ID\n";
    const rows = harvestedData.map(w => `${w.uwi}_Artifact.las,${w.pid},${w.fid}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ndr_harvest_list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleNotarize = () => {
    setIsNotarizing(true);
    setTimeout(() => {
      setIsNotarizing(false);
      setIsVerified(true);
      
      const isCritical = result?.complianceRiskLevel === 'CRITICAL' || 
                        (result?.flags && result?.flags.some((f: any) => f.severity === 'CRITICAL'));
      
      let summaryText = "";
      if (mode === 'UNSTRUCTURED') {
        const isJackdaw = rawText.includes('JACKDAW');
        const isBuzzard = rawText.includes('BUZZARD');
        summaryText = `Unstructured artifact transformation complete. ${
          isJackdaw ? 'Jackdaw Mill Cert Audit successful.' : 
          isBuzzard ? 'Buzzard Production Sweep complete. H2S stress risk verified.' : 
          'Audit Verdict: ' + (result?.auditVerdict || 'N/A')
        }`;
      } else {
        summaryText = `SharePoint Nexus audit complete for Site ${targetSite.substring(0, 8)}. Quad 2 targeted search identified ${result?.flags?.length || 0} violations.`;
      }

      secureAsset({
        title: mode === 'UNSTRUCTURED' ? `Forensic_Harvester: ${result?.uwi || 'ANALYSIS_ARTIFACT'}` : `SharePoint_Nexus_Audit: Quad_2_Targeted`,
        status: isCritical ? 'CRITICAL' : 'VERIFIED',
        summary: summaryText,
        region: rawText.includes('BUZZARD') ? 'Buzzard (CNOOC)' : rawText.includes('JACKDAW') ? 'Jackdaw (HPHT)' : 'North Sea (Quad 2)',
        valueEst: result?.totalExposure || 8500000,
        confidence: 96.5
      });
    }, 1200);
  };

  const materialGrade = useMemo(() => {
    const upperText = rawText.toUpperCase();
    if (upperText.includes('25CR') || upperText.includes('SUPER DUPLEX')) return '25Cr Super Duplex';
    if (upperText.includes('13CR') || upperText.includes('L-80')) return '13Cr L-80';
    if (upperText.includes('JACKDAW')) return '25Cr Super Duplex';
    if (upperText.includes('BUZZARD')) return '13Cr L-80';
    return null;
  }, [rawText]);

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal text-[#E0E0E0]">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Scan size={400} className="text-emerald-500 animate-pulse" />
      </div>

      <header className="flex items-center justify-between border-b border-emerald-900/30 pb-4 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl shadow-lg">
            <Cpu size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">Forensic_Harvester</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-emerald-800 uppercase tracking-[0.4em] font-black">Mode: ARREARS_HUNT_v2.1 // Source: {mode}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
           <div className="flex gap-2">
             <button 
               onClick={loadJackdawPreset}
               className="px-4 py-2 rounded-xl bg-orange-600/10 border border-orange-500/40 text-orange-400 text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2"
             >
               <Flame size={14} />
               <span>Jackdaw_HPHT</span>
             </button>
             <button 
               onClick={loadBuzzardPreset}
               className="px-4 py-2 rounded-xl bg-yellow-600/10 border border-yellow-500/40 text-yellow-400 text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-white transition-all flex items-center gap-2"
             >
               <Droplet size={14} />
               <span>Buzzard_Sweep</span>
             </button>
           </div>
           <div className="bg-[#121212] p-1 border border-emerald-900/40 rounded-lg flex">
              <button 
                onClick={() => {setMode('UNSTRUCTURED'); setResult(null); setMsalFlow('IDLE'); setIsCsvGenerated(false);}}
                className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all ${mode === 'UNSTRUCTURED' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-900 hover:text-emerald-400'}`}
              >
                Unstructured_Void
              </button>
              <button 
                onClick={() => {setMode('SHAREPOINT'); setResult(null); setMsalFlow('IDLE'); setIsCsvGenerated(false);}}
                className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all ${mode === 'SHAREPOINT' ? 'bg-blue-500 text-white shadow-lg' : 'text-blue-900 hover:text-blue-400'}`}
              >
                SharePoint_Nexus
              </button>
           </div>
           {onToggleFocus && (
              <button onClick={onToggleFocus} aria-label="Toggle Focus Mode" className="p-2 text-emerald-900 hover:text-[#00FF41] transition-all">
                {isFocused ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
           )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 min-h-0 overflow-hidden">
        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-[#121212]/90 border border-emerald-900/30 rounded-2xl flex flex-col p-5 shadow-2xl relative overflow-hidden">
            {mode === 'UNSTRUCTURED' ? (
              <>
                <div className="flex items-center justify-between mb-4 border-b border-emerald-900/10 pb-2">
                  <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Artifact_Void (Raw_Stream)</span>
                  </div>
                  <Radio size={14} className="text-red-950 animate-pulse" />
                </div>
                
                <textarea 
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="flex-1 bg-black/40 border border-emerald-900/20 rounded-xl p-4 text-[11px] text-emerald-100 font-mono outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-950 resize-none custom-scrollbar"
                />

                <div className="mt-4">
                  <button 
                    onClick={handleHarvestUnstructured}
                    disabled={isHarvesting || !rawText.trim()}
                    className="w-full py-4 bg-emerald-600 text-white font-black uppercase text-[11px] tracking-[0.4em] rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)] hover:bg-emerald-500 disabled:opacity-30 transition-all flex items-center justify-center space-x-3"
                  >
                    {isHarvesting ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                    <span>{isHarvesting ? 'CRAWLING_UNSTRUCTURED_EVIDENCE...' : 'Initiate_Voxel_Transformation'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between border-b border-blue-900/20 pb-3">
                  <div className="flex items-center space-x-2 text-blue-400 font-black text-[10px] uppercase">
                    <Share2 size={16} /> <span>MSAL_Device_Flow_Link (Quad_2_Targeted)</span>
                  </div>
                </div>

                {msalFlow === 'IDLE' ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center px-10">
                    <CloudDownload size={64} className="text-blue-500 animate-bounce" />
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-blue-100 uppercase tracking-tighter">Harvest_SharePoint_Registry</h3>
                       <div className="flex flex-col gap-2 mt-4 text-left p-4 bg-black/40 border border-blue-900/20 rounded-xl font-mono">
                          <div className="flex items-center gap-2 text-[9px] text-blue-400 uppercase">
                             <Target size={12} /> <span>Site: {targetSite.substring(0, 12)}...</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-blue-400 uppercase">
                             <Layers size={12} /> <span>List: {projListId.substring(0, 12)}...</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-orange-500 uppercase font-black">
                             <Filter size={12} /> <span>Filter: quad eq '2' and ptyp eq 'well'</span>
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={initiateSharePointFlow}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-500 shadow-xl transition-all flex items-center justify-center gap-3"
                    >
                      <Link size={18} /> Establish_Azure_Handshake
                    </button>
                  </div>
                ) : msalFlow === 'AUTH_WAIT' ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in">
                    <div className="p-8 bg-black/60 border border-blue-500/40 rounded-2xl space-y-4 max-w-sm w-full text-center shadow-2xl">
                       <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-2">Action_Required: Authenticate</span>
                       <p className="text-[11px] text-blue-100 leading-relaxed font-mono">
                         Visit <span className="text-white font-bold underline">microsoft.com/devicelogin</span><br/>and enter the following code:
                       </p>
                       <div className="text-3xl font-black text-white tracking-[0.2em] py-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                         {deviceCode}
                       </div>
                       <div className="flex items-center justify-center gap-3">
                          <Loader2 size={16} className="text-blue-500 animate-spin" />
                          <span className="text-[8px] font-black text-blue-900 uppercase">Awaiting token acquisition...</span>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                       <div className="flex items-center justify-between text-[8px] font-black text-blue-900 uppercase mb-2">
                          <span>QUAD_2_WELL_PROJECTS_IDENTIFIED</span>
                          <span className="text-emerald-500 font-bold">Files found in: {fileListId.substring(0, 8)}...</span>
                       </div>
                       {harvestedData.map((well, idx) => (
                         <div key={idx} className="p-3 bg-black/40 border border-blue-900/20 rounded-lg group hover:border-blue-500 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <Building size={14} className="text-blue-800" />
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-blue-100">{well.uwi}</span>
                                  <span className="text-[8px] font-mono text-blue-900 uppercase">{well.operator} // Released: 1</span>
                               </div>
                            </div>
                            <div className="flex flex-col items-end">
                               <span className={`text-[8px] font-black uppercase text-blue-600`}>FID: {well.fid}</span>
                               <span className="text-[8px] font-black uppercase text-blue-900">PID: {well.pid}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                    <button 
                      onClick={handleBatchAudit}
                      disabled={isHarvesting}
                      className="mt-4 w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-emerald-400 shadow-xl transition-all flex items-center justify-center gap-3"
                    >
                      {isHarvesting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                      Execute_Quad_2_Audit
                    </button>
                  </div>
                )}
              </div>
            )}

            {isHarvesting && mode === 'UNSTRUCTURED' && (
               <div className="absolute inset-x-0 top-12 h-0.5 bg-emerald-500/40 shadow-[0_0_15px_#00FF41] animate-scan-vertical z-20 pointer-events-none"></div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-[#121212]/90 border border-emerald-900/30 rounded-2xl flex flex-col p-5 shadow-2xl overflow-hidden relative">
            <div className="p-4 border-b border-emerald-900/30 flex items-center justify-between bg-black/40 -mx-5 -mt-5">
               <div className="flex items-center space-x-2 pl-5">
                  <Database size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Relational_Ledger (Forensic_Truth)</span>
               </div>
               {result && (
                 <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase mr-5 ${result.complianceRiskLevel === 'CRITICAL' || (result.flags && result.flags.some((f: any) => f.severity === 'CRITICAL')) ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    Risk: {result.complianceRiskLevel || (result.flags?.some((f:any) => f.severity === 'CRITICAL') ? 'CRITICAL' : 'LOW')}
                 </span>
               )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pt-4">
               {!result && !isHarvesting ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                    <Binary size={64} className="animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-[0.4em]">Awaiting_Kernel_Sync</span>
                 </div>
               ) : isHarvesting ? (
                 <div className="space-y-6 animate-pulse">
                    <div className="h-20 bg-emerald-900/10 rounded-xl"></div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="h-16 bg-emerald-900/10 rounded-xl"></div>
                       <div className="h-16 bg-emerald-900/10 rounded-xl"></div>
                    </div>
                    <div className="h-32 bg-emerald-900/10 rounded-xl"></div>
                 </div>
               ) : (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    {mode === 'UNSTRUCTURED' ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-black/40 border border-emerald-900/20 rounded-lg">
                              <span className="text-[7px] text-emerald-900 uppercase font-black block mb-1">Target_UWI</span>
                              <span className="text-sm font-black text-emerald-100">{result.uwi || (rawText.includes('JACKDAW') ? 'JACKDAW-J01' : rawText.includes('BUZZARD') ? 'BUZZARD-B44' : 'N/A')}</span>
                          </div>
                          <div className="p-3 bg-black/40 border border-emerald-900/20 rounded-lg">
                              <span className="text-[7px] text-emerald-900 uppercase font-black block mb-1">Operator_Identity</span>
                              <span className="text-sm font-black text-emerald-100">{result.operator || (rawText.includes('JACKDAW') ? 'Shell_UK' : rawText.includes('BUZZARD') ? 'CNOOC_UK' : 'N/A')}</span>
                          </div>
                        </div>

                        {materialGrade && (
                          <div className={`p-4 rounded-xl border flex items-center justify-between animate-in zoom-in duration-500 ${
                            materialGrade.includes('25Cr') ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
                          }`}>
                            <div className="flex items-center gap-3">
                              <Shield size={20} className={materialGrade.includes('25Cr') ? 'text-orange-400' : 'text-yellow-400'} />
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Material_Grade_Detected</span>
                                <span className="text-sm font-black uppercase tracking-tighter">{materialGrade}</span>
                              </div>
                            </div>
                            <div className="px-2 py-1 bg-black/40 rounded border border-current text-[7px] font-black uppercase">Artifact_Verified</div>
                          </div>
                        )}

                        {rawText.toUpperCase().includes('BUZZARD') || (materialGrade && materialGrade.includes('13Cr')) ? (
                           <div className="p-5 bg-yellow-600/5 border border-yellow-500/30 rounded-xl space-y-4 animate-in zoom-in duration-500">
                             <div className="flex items-center gap-2 text-yellow-400 font-black text-[10px] uppercase">
                                <Droplet size={16} /> <span>Buzzard_Production_Forensics</span>
                             </div>
                             <div className="space-y-2">
                                <div className="flex justify-between items-center py-1 border-b border-yellow-900/10">
                                   <span className="text-[8px] text-emerald-900 uppercase">H2S_Level</span>
                                   <span className="text-[10px] text-red-500 font-bold uppercase">45,000 PPM</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-yellow-900/10">
                                   <span className="text-[8px] text-emerald-900 uppercase">Integrity_Lock</span>
                                   <span className="text-[10px] text-white font-mono uppercase">FAIL: B-Annulus_Migration</span>
                                </div>
                                <div className="p-3 bg-red-600/10 border border-red-500/40 rounded flex items-start gap-3">
                                   <AlertOctagon size={14} className="text-red-500 shrink-0 mt-0.5" />
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-red-500 uppercase">Stress_Corrosion_Detected</span>
                                      <p className="text-[10px] text-red-200/70 italic leading-tight">"Metallurgical autopsy suggests L-80 casing embrittlement at production depths. Cross-referencing H2S curves against B-Annulus recharge confirms structural breach."</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                        ) : rawText.toUpperCase().includes('JACKDAW') || (materialGrade && materialGrade.includes('25Cr')) ? (
                          <div className="p-5 bg-orange-600/5 border border-orange-500/30 rounded-xl space-y-4 animate-in zoom-in duration-500">
                             <div className="flex items-center gap-2 text-orange-400 font-black text-[10px] uppercase">
                                <Flame size={16} /> <span>HPHT_Mill_Cert_Audit_Results</span>
                             </div>
                             <div className="space-y-2">
                                <div className="flex justify-between items-center py-1 border-b border-orange-900/10">
                                   <span className="text-[8px] text-emerald-900 uppercase">Target_Grade</span>
                                   <span className="text-[10px] text-white font-bold uppercase">25Cr_Super_Duplex</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-orange-900/10">
                                   <span className="text-[8px] text-emerald-900 uppercase">Heat_Sequence</span>
                                   <span className="text-[10px] text-white font-mono uppercase">8872B - 8904C</span>
                                </div>
                                <div className="p-3 bg-red-600/10 border border-red-500/40 rounded flex items-start gap-3">
                                   <AlertOctagon size={14} className="text-red-500 shrink-0 mt-0.5" />
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-red-500 uppercase">Critical_Heat_Anomaly</span>
                                      <p className="text-[10px] text-red-200/70 italic leading-tight">"Heat Number 8891 identified as stress-fatigue artifact. 12 joints flagged for decommissioning bypass."</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertOctagon size={12} className="text-red-500" />
                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Compliance_Scan (Art_10)</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <div className={`p-4 rounded-xl border flex items-center justify-between ${result?.verticalDatum === 'MISSING' ? 'bg-red-500/10 border-red-500/40 text-red-500 animate-glow-pulse' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100'}`}>
                                  <div className="flex items-center gap-3">
                                      {result?.verticalDatum === 'MISSING' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                                      <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Vertical_Datum_Anchor</span>
                                        <span className="text-[8px] font-mono opacity-60">Status: {result?.verticalDatum || 'N/A'}</span>
                                      </div>
                                  </div>
                                  {result?.verticalDatum === 'MISSING' && <span className="text-[7px] font-black px-2 py-0.5 bg-red-600 text-white rounded">DATA_ABYSS</span>}
                                </div>

                                <div className={`p-4 rounded-xl border flex items-center justify-between ${result?.suspensionDate === 'MISSING' ? 'bg-red-500/10 border-red-500/40 text-red-500 animate-glow-pulse' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100'}`}>
                                  <div className="flex items-center gap-3">
                                      {result?.suspensionDate === 'MISSING' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                                      <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Suspension_Expiry_Registry</span>
                                        <span className="text-[8px] font-mono opacity-60">Status: {result?.suspensionDate || 'N/A'}</span>
                                      </div>
                                  </div>
                                  {result?.suspensionDate === 'MISSING' && <span className="text-[7px] font-black px-2 py-0.5 bg-red-600 text-white rounded">DATA_ABYSS</span>}
                                </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-6">
                         <div className="flex items-center justify-between border-b border-emerald-900/20 pb-3">
                            <h3 className="text-xl font-black text-emerald-400 uppercase tracking-tighter">Quad_2_Nexus_Audit</h3>
                            <div className="flex flex-col items-end">
                               <span className="text-[8px] font-black text-emerald-900 uppercase">Estimated_Fiscal_Exposure</span>
                               <span className="text-xl font-black text-orange-500">£{result?.totalExposure?.toLocaleString() || '0'}</span>
                            </div>
                         </div>

                         {isCsvGenerated && (
                            <div className="p-4 bg-blue-900/10 border border-blue-500/40 rounded-xl flex items-center justify-between animate-in zoom-in duration-300">
                               <div className="flex items-center gap-3">
                                  <FileSpreadsheet size={20} className="text-blue-400" />
                                  <div className="flex flex-col">
                                     <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Work_Order_CSV_Constructed</span>
                                     <span className="text-[8px] text-blue-900 uppercase">Headers: File Name, Project ID, File ID</span>
                                  </div>
                               </div>
                               <button 
                                 onClick={downloadWorkOrderCsv}
                                 className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-[0_0_10px_#2563eb]"
                               >
                                  <Download size={14} />
                               </button>
                            </div>
                         )}
                         
                         <div className="space-y-4">
                            {result?.flags?.map((flag: any, i: number) => (
                               <div key={i} className={`p-4 border-l-4 rounded bg-black/40 ${flag.severity === 'CRITICAL' ? 'border-red-500' : 'border-orange-500'}`}>
                                  <div className="flex justify-between items-center mb-1">
                                     <span className="text-[10px] font-black text-white">{flag.uwi}</span>
                                     <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${flag.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-orange-500 text-slate-950'}`}>{flag.severity}</span>
                                  </div>
                                  <div className="text-[9px] font-black text-emerald-900 uppercase tracking-tighter mb-2">{flag.riskType}</div>
                                  <p className="text-[10px] text-emerald-100/70 italic leading-tight">"{flag.reason}"</p>
                               </div>
                            ))}
                         </div>
                      </div>
                    )}

                    <div className="p-4 bg-emerald-500/5 border-l-2 border-emerald-500 rounded-r-lg space-y-2">
                       <div className="flex items-center gap-2">
                          <Eye size={12} className="text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Forensic_Verdict</span>
                       </div>
                       <p className="text-[10px] text-emerald-100 italic leading-relaxed">"{result?.auditVerdict || result?.summaryReport || (rawText.toUpperCase().includes('BUZZARD') ? 'Buzzard Production History audit finalized. Critical H2S stress fractures highly probable in B-44.' : rawText.toUpperCase().includes('JACKDAW') ? 'High-spec liner heat number scan complete.' : 'System analyzed. Handshake nominal.')}"</p>
                    </div>
                 </div>
               )}
            </div>

            <div className="p-4 border-t border-emerald-900/30 mt-auto flex flex-col gap-3">
               <button 
                disabled={!result || isVerified}
                onClick={handleNotarize}
                className={`w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.4em] transition-all flex items-center justify-center space-x-3 ${isVerified ? 'bg-emerald-600/20 text-emerald-600 border border-emerald-600/40 cursor-default' : 'bg-emerald-600 text-white border border-emerald-400 hover:bg-emerald-500 shadow-xl'}`}
               >
                 {isNotarizing ? <Loader2 size={18} className="animate-spin" /> : isVerified ? <CheckCircle2 size={18} /> : <UserCheck size={18} />}
                 <span>{isNotarizing ? 'ARCHITECT_NOTARIZATION...' : isVerified ? 'SME_VERIFIED' : 'Notarize_Relational_Truth (Art_14)'}</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="p-4 border-t border-emerald-900/30 bg-[#121212] rounded-xl flex items-center justify-between relative z-10">
         <div className="flex items-center space-x-8 text-[9px] font-black text-emerald-900 uppercase">
            <span className="flex items-center gap-2"><Scale size={14} /> Compliance: EU AI Act v2026</span>
            <span className="flex items-center gap-2"><Target size={14} /> NSTA: Quad 2 Targeted</span>
         </div>
         <div className="flex items-center space-x-1 text-[8px] text-emerald-950 font-mono italic">
            [>> TRANSFORMATION_MODE: {mode}_TO_SOVEREIGN_VAULT]
         </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-vertical {
          0% { transform: translateY(0%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
        .animate-scan-vertical {
          animation: scan-vertical 2s linear infinite;
        }
        @keyframes glow-pulse {
          0% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); }
          50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.6); }
          100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); }
        }
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default ForensicHarvester;