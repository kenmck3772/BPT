import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Cpu, Zap, Loader2, Globe, Binary, 
  AlertTriangle, Settings, Ghost, Copy, Check, 
  Database, Save, X, ShieldCheck, ShieldAlert 
} from 'lucide-react';
import { loginWithSovereignID, isMockMode, saveUplinkConfig } from '../services/authService';
import DataIntegrityLegend from './DataIntegrityLegend';

interface SovereignAuthProps {
  onAuthenticated: (user: any) => void;
}

const SovereignAuth: React.FC<SovereignAuthProps> = ({ onAuthenticated }) => {
  const [isHandshaking, setIsHandshaking] = useState(false);
  const [authStep, setAuthStep] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [configInput, setConfigInput] = useState('');
  const [configError, setConfigError] = useState<string | null>(null);
  const [detectedHost, setDetectedHost] = useState('');

  useEffect(() => {
    const host = window.location.hostname || "LOCAL_SANDBOX_NODE";
    setDetectedHost(host);
  }, []);

  const handleLogin = async () => {
    setIsHandshaking(true);
    setAuthStep(isMockMode ? 'MAPPING_LOCAL_VOXELS...' : 'ESTABLISHING_TLS_TUNNEL...');
    
    setTimeout(async () => {
      setAuthStep(isMockMode ? 'BYPASSING_AUTH_FIREWALL...' : 'ACQUIRING_OAUTH_TOKEN...');
      
      const user = await loginWithSovereignID();
      if (user) {
        setAuthStep('HANDSHAKE_NOMINAL: WELCOME HUNTER');
        setTimeout(() => onAuthenticated(user), 800);
      } else {
        setIsHandshaking(false);
        setAuthStep('UPLINK_ABORTED: AUTH_REFUSED');
      }
    }, 1200);
  };

  const copyDomain = () => {
    navigator.clipboard.writeText(detectedHost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = () => {
    try {
      let jsonStr = configInput.trim();
      if (jsonStr.includes('{')) {
        const start = jsonStr.indexOf('{');
        const end = jsonStr.lastIndexOf('}') + 1;
        jsonStr = jsonStr.substring(start, end);
      }
      const cleaned = jsonStr
        .replace(/(\w+):/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/,\s*}/g, '}')
        .replace(/;\s*$/g, '');

      const config = JSON.parse(cleaned);
      if (!config.apiKey) throw new Error("API_KEY_MISSING");
      saveUplinkConfig(config);
    } catch (err: any) {
      setConfigError("INVALID_KERNEL_SCHEMA: Paste the entire config object.");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center font-terminal overflow-hidden px-4">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00FF41 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10 animate-in zoom-in-95">
        
        {/* Left Side: Auth Card */}
        <div className="p-8 bg-slate-950 border-2 border-emerald-500/30 rounded-3xl shadow-[0_0_80px_rgba(0,255,65,0.15)] relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 p-4 bg-black border-2 border-emerald-500 rounded-full shadow-[0_0_30px_#00FF41]">
            {isMockMode ? <Ghost size={40} className="text-orange-500 animate-pulse" /> : <Cpu size={40} className="text-emerald-500 animate-pulse" />}
          </div>

          <div className="text-center mt-6 space-y-2">
            <h1 className="text-3xl font-black text-emerald-400 tracking-tighter uppercase glow-text">Brahan_Terminal</h1>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.4em] opacity-60">Sovereign Forensic Node // v88.7</p>
          </div>

          <div className="mt-8 space-y-6">
            {!showConfig ? (
              <>
                <div className="p-4 bg-blue-500/5 border border-blue-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <Globe size={12} /> 1. Authorize Domain
                      </span>
                      <button onClick={copyDomain} className="p-1 hover:bg-blue-500/10 text-blue-500 rounded transition-colors border border-blue-500/20">
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                  </div>
                  <div className="bg-black p-3 rounded-lg border border-blue-500/40 font-mono text-[11px] text-blue-400 break-all text-center select-all">
                      {detectedHost}
                  </div>
                </div>

                <div className={`p-4 rounded-2xl space-y-3 border ${isMockMode ? 'bg-orange-500/10 border-orange-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                  <div className="flex items-start gap-4">
                    {isMockMode ? <AlertTriangle size={20} className="text-orange-500 shrink-0" /> : <ShieldCheck size={20} className="text-emerald-500 shrink-0" />}
                    <div className="space-y-1">
                      <span className={`text-[9px] font-black uppercase ${isMockMode ? 'text-orange-500' : 'text-emerald-500'}`}>
                        2. {isMockMode ? 'Uplink Not Configured' : 'Live Uplink Locked'}
                      </span>
                      <p className={`text-[10px] leading-tight ${isMockMode ? 'text-orange-200/60' : 'text-emerald-200/60'}`}>
                        {isMockMode ? 'Kernel requires secure credentials to exit Demo Mode.' : 'API Keys detected in Kernel source. Ready for handshake.'}
                      </p>
                    </div>
                  </div>
                  {isMockMode && (
                    <button onClick={() => setShowConfig(true)} className="w-full py-2.5 bg-orange-500/20 border border-orange-500/40 rounded-lg text-orange-400 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-all">
                      Update Kernel Config
                    </button>
                  )}
                </div>

                <button 
                  onClick={handleLogin}
                  disabled={isHandshaking}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all border-2 flex items-center justify-center gap-3 ${
                    isHandshaking 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                    : isMockMode 
                      ? 'bg-orange-500 text-black border-orange-400 hover:bg-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.3)]'
                      : 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400 shadow-[0_0_30px_rgba(0,255,65,0.3)]'
                  }`}
                >
                  {isHandshaking ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                  <span>{isHandshaking ? authStep : 'Initiate_Handshake'}</span>
                </button>
              </>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-emerald-400 flex items-center gap-2">
                     <Database size={14} /> Kernel_Config_Injest
                  </h3>
                  <button onClick={() => setShowConfig(false)} className="text-emerald-900 hover:text-emerald-400">
                    <X size={16} />
                  </button>
                </div>
                <textarea 
                  autoFocus
                  value={configInput}
                  onChange={(e) => setConfigInput(e.target.value)}
                  placeholder={`Paste config here...`}
                  className="w-full h-48 bg-black border border-emerald-500/20 rounded-xl p-4 font-mono text-[10px] text-emerald-400 outline-none focus:border-emerald-500 resize-none shadow-inner"
                />
                {configError && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-[9px] text-red-500 font-bold uppercase animate-pulse">{configError}</div>}
                <button onClick={handleSaveConfig} className="w-full py-4 bg-emerald-500 text-slate-950 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20">
                  <Save size={18} /> Commit to Kernel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Protocol Brief */}
        <div className="space-y-6">
           <div className="p-6 bg-emerald-900/10 border-l-4 border-emerald-500 rounded-r-2xl space-y-4 backdrop-blur-md">
              <div className="flex items-center gap-3 text-emerald-500 font-black text-xs uppercase tracking-[0.4em]">
                 <ShieldAlert size={18} /> <span>Strict_Forensic_Protocol</span>
              </div>
              <p className="text-sm font-black text-white uppercase tracking-tight leading-tight">
                "Absolute data integrity is the only priority. Estimation is strictly prohibited. If the truth is missing, report the absence."
              </p>
           </div>
           
           <DataIntegrityLegend />
        </div>
      </div>
    </div>
  );
};

export default SovereignAuth;
