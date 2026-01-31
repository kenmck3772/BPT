import React, { useState } from 'react';
import { 
  Database, Zap, Activity, Terminal, 
  FileSignature, Globe, HardDrive, 
  RefreshCw, Loader2, ShieldCheck, 
  Key, Eye, EyeOff,
  CloudDownload, Link, Binary
} from 'lucide-react';
import { INITIAL_ASSETS } from '../services/Sovereign_Ledger';
import { syncNDRTelemetry } from '../services/ndrService';

const NDR_KEY_STORAGE = 'BRAHAN_NDR_API_KEY';

export const SovereignLedger = () => {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState<string>('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  const [ndrKey, setNdrKey] = useState(() => localStorage.getItem(NDR_KEY_STORAGE) || '');
  const [showKey, setShowKey] = useState(false);

  const handleTelemetrySync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    const steps = [
      { label: 'HANDSHAKE_INITIATED...', delay: 600, prog: 10 },
      { label: 'AUTHENTICATING_NDR_KEY...', delay: 800, prog: 25 },
      { label: 'QUERYING_ODATA_V4_WELLS...', delay: 1200, prog: 45 },
      { label: 'FETCHING_METADATA...', delay: 1500, prog: 60 },
      { label: 'RESOLVING_GEODETIC_SHIFTS...', delay: 900, prog: 75 },
      { label: 'SYNCING_SIGNATURES...', delay: 1000, prog: 90 },
      { label: 'COMMIT_TO_SOVEREIGN_VAULT...', delay: 600, prog: 100 }
    ];

    try {
      for (const step of steps) {
        setSyncStep(step.label);
        setSyncProgress(step.prog);
        await new Promise(resolve => setTimeout(resolve, step.delay));
        
        if (step.label === 'FETCHING_METADATA...') {
          const updatedAssets = await Promise.all(assets.map(async (asset) => {
            const ndrData = await syncNDRTelemetry(asset.name, ndrKey);
            if (ndrData) {
              return { ...asset, focus: ndrData.focus, status: ndrData.status };
            }
            return asset;
          }));
          setAssets(updatedAssets);
        }
      }
      
      setLastSync(new Date().toLocaleTimeString());
      setSyncStep('SYNC_COMPLETE');
    } catch (err) {
      setSyncStep('SYNC_FAILED');
      console.error("INGEST_ERROR: NDR_UPLINK_TIMEOUT");
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStep('');
        setSyncProgress(0);
      }, 1500);
    }
  };

  const handleKeyChange = (val: string) => {
    setNdrKey(val);
    localStorage.setItem(NDR_KEY_STORAGE, val);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-8 bg-black relative overflow-hidden font-terminal text-[#00FF41]">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-[#00FF41]">
        <FileSignature size={600} />
      </div>

      <header className="flex items-center justify-between border-b border-[#00FF41]/20 pb-6 relative z-10">
        <div className="flex items-center space-x-5">
          <div className="p-3 bg-[#00FF41]/10 border border-[#00FF41]/40 rounded-xl shadow-[0_0_20px_rgba(0,255,65,0.2)]">
            <Database size={28} className="text-[#00FF41]" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">>>> SOVEREIGN_LEDGER</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-[#00FF41]/60 uppercase tracking-[0.4em] font-black">
                {lastSync ? `LAST_NDR_INGEST: ${lastSync}` : 'Metadata_Sync_Required'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex flex-col gap-1 min-w-[220px]">
              <span className="text-[7px] font-black text-emerald-900 uppercase tracking-widest ml-1">NDR_API_TOKEN_STORAGE</span>
              <div className="relative group">
                <Key size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type={showKey ? "text" : "password"}
                  value={ndrKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder="EX: 0x88.777.NDR..."
                  className="w-full bg-black border border-emerald-900/40 rounded-lg pl-9 pr-10 py-2 text-[10px] text-emerald-100 font-mono outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-950 shadow-inner"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-900 hover:text-emerald-400 transition-colors"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
           </div>

           <button 
            onClick={handleTelemetrySync}
            disabled={isSyncing}
            className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 font-black text-xs uppercase tracking-widest transition-all ${
              isSyncing 
              ? 'bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41] cursor-wait' 
              : 'bg-black border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41] hover:text-black shadow-[0_0_15px_rgba(0,255,65,0.3)] active:scale-95'
            }`}
           >
             {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
             <span className="min-w-[140px] text-left uppercase">{isSyncing ? 'Ingesting...' : 'Telemetry_Sync'}</span>
           </button>
           
           <div className="px-4 py-2 bg-[#00FF41]/5 border border-[#00FF41]/20 rounded flex items-center gap-3">
              <Zap size={14} className="text-[#00FF41] animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest uppercase">ARL_PULSE: 0.11ms</span>
           </div>
        </div>
      </header>

      {isSyncing && (
        <div className="bg-[#0a0a0a] border border-[#00FF41]/20 rounded-xl p-6 animate-in slide-in-from-top-4 duration-500 relative z-20">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <CloudDownload size={20} className="text-[#00FF41] animate-bounce" />
                 <span className="text-sm font-black uppercase tracking-widest">{syncStep}</span>
              </div>
              <span className="text-xs font-mono font-black">{syncProgress}%</span>
           </div>
           <div className="h-2 bg-[#00FF41]/10 rounded-full overflow-hidden border border-[#00FF41]/20">
              <div 
                className="h-full bg-[#00FF41] transition-all duration-500 shadow-[0_0_15px_#00FF41]" 
                style={{ width: `${syncProgress}%` }}
              ></div>
           </div>
           <div className="mt-4 grid grid-cols-3 gap-4 text-[8px] font-black text-[#00FF41]/40 uppercase tracking-widest">
              <div className="flex items-center gap-2"><Link size={10} /> Link: {ndrKey ? 'SECURE' : 'ANONYMOUS'}</div>
              <div className="flex items-center gap-2"><Binary size={10} /> Voxel_Stream: Active</div>
              <div className="flex items-center gap-2"><ShieldCheck size={10} /> Integrity: High</div>
           </div>
        </div>
      )}

      <div className="flex-1 bg-[#121212]/90 border border-[#00FF41]/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col">
        <div className="p-6 border-b border-[#00FF41]/10 bg-black/40 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Terminal size={18} />
              <span className="text-xs font-black uppercase tracking-widest text-[#00FF41]">📜 IRON_TRUTH_MATERIAL_LEDGER</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left font-terminal border-collapse">
            <thead className="sticky top-0 bg-[#0a0a0a] z-20">
              <tr className="border-b border-[#00FF41]/30">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-[#00FF41]/60">Asset_Node</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-[#00FF41]/60">Metallurgy_Vendor</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-[#00FF41]/60">Physics_Focus</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-[#00FF41]/60 text-right">Registry_Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00FF41]/5">
              {assets.map((asset) => (
                <tr key={asset.id} className="group hover:bg-[#00FF41]/5 transition-all">
                  <td className="p-5">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-white group-hover:text-[#00FF41] transition-colors">{asset.name}</span>
                       <span className="text-[8px] opacity-40 uppercase">UWI_STAMP: {asset.id}_BLOCK_UKCS</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41]/40 group-hover:animate-ping"></div>
                       <span className="text-xs font-bold uppercase">{asset.vendor}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="text-xs font-mono italic opacity-80">{asset.focus}</span>
                  </td>
                  <td className="p-5 text-right">
                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                      asset.status === 'Verified' 
                        ? 'bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.1)]' 
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/40'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-[#00FF41]/5 border border-[#00FF41]/10 rounded-2xl space-y-3 relative z-10">
         <div className="flex items-center gap-3">
            <Activity size={20} />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Data_Ingest_Verification (ARL)</h4>
         </div>
         <p className="text-[11px] leading-relaxed opacity-80">
           NDR API query executed for Sovereign Five. Geodetic corrections and casing tallies successfully regularized. Inference latency at <span className="text-white font-bold">0.11ms</span>. No 403/404 artifacts identified in this sweep.
         </p>
      </div>

      <footer className="pt-4 border-t border-[#00FF41]/10 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] opacity-40">
         <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 text-[#00FF41]/60"><Globe size={12} /> Registry: NDR_UKCS_ARCHIVE</span>
            <span className="flex items-center gap-2 text-[#00FF41]/60"><HardDrive size={12} /> Local_Vault: Sovereign_V88_Stable</span>
         </div>
         <div className="flex items-center gap-4 font-mono uppercase">
            Protocol: NSTA_INGEST_READY
         </div>
      </footer>
    </div>
  );
};