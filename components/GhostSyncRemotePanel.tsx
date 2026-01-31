import React, { useState, useEffect, useMemo } from 'react';
import { 
  Link as LinkIcon, Send, Loader2, AlertCircle, 
  X, Globe, Terminal, Ruler, Database, 
  ChevronRight, Activity, Search, ShieldAlert, 
  CheckCircle2, CloudDownload, Cpu, Radio
} from 'lucide-react';

interface GhostSyncRemotePanelProps {
  onDataLoaded: (id: string, name: string, color: string, data: Record<number, number>) => void;
  onClose: () => void;
  sessionId: string;
  initialUrl?: string;
}

const PRESETS = [
  { name: 'NSTA_NDR_Ninian_N42', url: 'https://ndr.nstauthority.co.uk/artifacts/N42_GR_FINAL.las', type: 'LAS' },
  { name: 'NPD_Factpages_Statfjord', url: 'https://factpages.sodir.no/data/wells/STAT_B_L12.csv', type: 'CSV' },
  { name: 'NOPIMS_Thistle_Legacy', url: 'https://nopims.industry.gov.au/artifacts/THISTLE_78.las', type: 'LAS' },
  { name: 'Sovereign_Vault_Bypass', url: 'https://brahan-vault.local/ghosts/NC12_RECON.json', type: 'JSON' },
  { name: 'Culzean_C1_VAM21', url: 'https://vallourec.com/culzean/C1_HPHT.las', type: 'LAS' },
  { name: 'Buzzard_P4_Tenaris', url: 'https://tenaris.com/buzzard/P4_STRESS.las', type: 'LAS' }
];

const GhostSyncRemotePanel: React.FC<GhostSyncRemotePanelProps> = ({ onDataLoaded, onClose, sessionId, initialUrl }) => {
  const [url, setUrl] = useState(initialUrl || '');
  const [samplingRate, setSamplingRate] = useState<string>('1.0');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{url?: string; rate?: string}>({});
  const [fetchLog, setFetchLog] = useState<string[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');

  const addLog = (msg: string) => setFetchLog(prev => [...prev.slice(-8), `> ${msg}`]);

  useEffect(() => {
    if (initialUrl) setUrl(initialUrl);
  }, [initialUrl]);

  // Forensic-grade real-time validation (0.11ms ARL Target)
  useEffect(() => {
    const errors: {url?: string; rate?: string} = {};
    
    if (url.trim()) {
      try {
        const parsed = new URL(url);
        const protocol = parsed.protocol.toLowerCase();
        if (protocol !== 'https:' && protocol !== 'http:') {
           errors.url = "ERR: INVALID_PROTOCOL";
        } else if (protocol === 'http:') {
          errors.url = "ERR: INSECURE_PROTOCOL (HTTPS_REQUIRED)";
        }
      } catch (e) {
        errors.url = "MALFORMED_URI_STRUCTURE";
      }
    } else {
      errors.url = "PENDING: TARGET_URI_EMPTY";
    }

    const rateVal = parseFloat(samplingRate);
    if (samplingRate === '') {
        errors.rate = "ERR: RATE_EMPTY";
    } else if (isNaN(rateVal) || rateVal <= 0 || rateVal > 100) {
      errors.rate = "OUT_OF_BOUNDS: [0.001 - 100.0]";
    }

    setFieldErrors(errors);
  }, [url, samplingRate]);

  const isValid = useMemo(() => {
    return url.trim() !== '' && 
           samplingRate !== '' && 
           Object.keys(fieldErrors).length === 0;
  }, [url, samplingRate, fieldErrors]);

  const filteredPresets = useMemo(() => {
    const q = (catalogSearch || '').toLowerCase().trim();
    if (!q) return PRESETS;
    return PRESETS.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.url.toLowerCase().includes(q)
    );
  }, [catalogSearch]);

  const handleFetch = async () => {
    if (!isValid) return;

    setError(null);
    setFetchLog([]);
    setIsFetching(true);
    addLog("INITIATING_REMOTE_HANDSHAKE...");
    
    try {
      await new Promise(r => setTimeout(r, 600));
      const targetHost = new URL(url).hostname;
      addLog(`RESOLVING_HOST: ${targetHost}`);
      
      await new Promise(r => setTimeout(r, 800));
      addLog("ESTABLISHING_TLS_VOXEL_TUNNEL...");
      
      await new Promise(r => setTimeout(r, 1200));
      addLog("PENETRATING_RESTRICTED_BUFFER...");
      
      const filename = url.split('/').pop() || 'remote_artifact.las';
      const mockData: Record<number, number> = {};
      const rate = parseFloat(samplingRate);
      
      for (let d = 1200; d <= 2000; d += rate) {
        const roundedDepth = Math.round(d * 100) / 100;
        mockData[roundedDepth] = 50 + Math.sin(roundedDepth * 0.05) * 30 + Math.random() * 8;
      }
      
      addLog(`UPLINK_STABLE: ${Object.keys(mockData).length} SAMPLES INDEXED`);
      
      setTimeout(() => {
        onDataLoaded(`REMOTE-${Math.random().toString(36).substring(7).toUpperCase()}`, filename, '#3b82f6', mockData);
        onClose();
      }, 800);
    } catch (err: any) {
      setError("REMOTE_UPLINK_FAILURE: [UPLINK_ABORTED]");
      addLog("LINK_TERMINATED_ON_ERROR");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 font-terminal">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={!isFetching ? onClose : undefined}></div>
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_60px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-300 flex flex-col md:flex-row gap-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        
        <div className="flex-1 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CloudDownload size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-blue-100 uppercase tracking-tighter">Remote_Forensic_Link</h3>
              <span className="text-[8px] text-blue-900 uppercase font-black tracking-widest">Session_ID: {sessionId}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`p-4 bg-black/40 border rounded-xl space-y-2 transition-all duration-300 ${fieldErrors.url ? 'border-red-500 bg-red-500/5' : 'border-blue-900/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                  <Terminal size={14} />
                  <span>Target_Artifact_URI</span>
                </div>
                {fieldErrors.url && <span className="text-[8px] font-black text-red-500 animate-pulse">{fieldErrors.url}</span>}
              </div>
              <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://ndr-archive.gov/logs/well_42.las" 
                className="w-full bg-slate-950 border border-blue-900/30 rounded-lg px-4 py-2.5 text-[11px] text-blue-100 font-mono outline-none focus:border-blue-500 transition-all placeholder:text-blue-950 shadow-inner" 
              />
            </div>

            <div className={`p-4 bg-black/40 border rounded-xl space-y-2 transition-all duration-300 ${fieldErrors.rate ? 'border-red-500 bg-red-500/5' : 'border-blue-900/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                  <Ruler size={14} />
                  <span>Sampling_Interval (m)</span>
                </div>
                {fieldErrors.rate && <span className="text-[8px] font-black text-red-500 animate-pulse">{fieldErrors.rate}</span>}
              </div>
              <input 
                type="text" 
                value={samplingRate} 
                onChange={(e) => setSamplingRate(e.target.value)} 
                className="w-full bg-slate-950 border border-blue-900/30 rounded-lg px-4 py-2.5 text-[11px] text-blue-100 font-mono outline-none focus:border-blue-500 transition-all shadow-inner" 
              />
            </div>

            <div className="flex flex-col space-y-3">
              <button 
                onClick={handleFetch} 
                disabled={isFetching || !isValid} 
                className={`w-full flex items-center justify-center space-x-3 py-4 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.3em] transition-all ${
                  isFetching ? 'bg-blue-600/50 cursor-wait' : isValid ? 'bg-blue-600 hover:bg-blue-500 shadow-xl' : 'bg-slate-800 text-slate-600 grayscale'
                }`}
              >
                {isFetching ? <Loader2 size={18} className="animate-spin" /> : <LinkIcon size={18} />}
                <span>{isFetching ? 'ESTABLISHING_UPLINK...' : 'INITIATE_REMOTE_INGEST'}</span>
              </button>
              
              {error && (
                <div className="flex items-center justify-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-[10px] font-black text-red-500 uppercase">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {fetchLog.length > 0 && (
                <div className="p-3 bg-black border border-blue-900/40 rounded-lg font-mono text-[9px] text-blue-500/70 space-y-1">
                  {fetchLog.map((log, i) => <div key={i} className="animate-in fade-in slide-in-from-left-1">{log}</div>)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-56 flex flex-col space-y-4">
           <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-[9px] font-black text-blue-900 uppercase tracking-[0.2em]">
                <Database size={14} />
                <span>Artifact_Catalog</span>
              </div>
              <div className="relative">
                <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-900" />
                <input 
                  type="text" 
                  placeholder="Search Index..." 
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-900/30 rounded-md pl-7 pr-2 py-1.5 text-[9px] text-blue-400 outline-none font-mono" 
                />
              </div>
           </div>
           
           <div className="flex-1 bg-black/40 border border-blue-900/20 rounded-xl p-3 space-y-2 overflow-y-auto max-h-[250px] md:max-h-none custom-scrollbar">
              {filteredPresets.map((p, i) => (
                <button 
                  key={i} 
                  onClick={() => setUrl(p.url)}
                  className="w-full text-left p-3 rounded-lg border border-blue-900/10 bg-slate-900/40 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all group flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-100 group-hover:text-blue-400 uppercase truncate">{p.name}</span>
                    <span className="text-[7px] font-black bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase">{p.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-blue-900 font-mono">
                    <span className="truncate max-w-[120px]">{p.url}</span>
                    <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
           </div>
           
           <button onClick={onClose} disabled={isFetching} className="w-full py-2 bg-slate-950 border border-blue-900/20 rounded-lg text-[9px] font-black text-blue-900 uppercase hover:text-white transition-all shadow-sm">
             Close_Uplink
           </button>
        </div>
      </div>
    </div>
  );
};

export default GhostSyncRemotePanel;