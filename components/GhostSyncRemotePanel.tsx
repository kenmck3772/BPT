
import React, { useState } from 'react';
import { Link as LinkIcon, Send, Loader2, AlertCircle, X, Globe, Terminal } from 'lucide-react';

interface GhostSyncRemotePanelProps {
  onDataLoaded: (id: string, name: string, data: Record<number, number>) => void;
  onClose: () => void;
  sessionId: string;
}

const GhostSyncRemotePanel: React.FC<GhostSyncRemotePanelProps> = ({ onDataLoaded, onClose, sessionId }) => {
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!url) return;
    setIsFetching(true);
    setError(null);
    
    // Explicit try-catch block for remote acquisition perimeter
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain, text/csv, */*',
          'X-BRAHAN-SESSION': sessionId, // Unique session header for forensic tracking
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`REMOTE_UPLINK_FAILURE: Status ${response.status} (${response.statusText})`);
      }
      
      const content = await response.text();
      const filename = url.split('/').pop() || 'remote_log';
      const logsMap: Record<number, number> = {};
      const lines = content.split('\n');
      
      const isLas = filename.toLowerCase().endsWith('.las') || content.includes('~A');
      if (isLas) {
        const aIndex = lines.findIndex(l => l.trim().startsWith('~A'));
        if (aIndex !== -1) {
          lines.slice(aIndex + 1).forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 2) {
              const depth = Math.round(parseFloat(parts[0]));
              const val = parseFloat(parts[1]);
              if (!isNaN(depth) && !isNaN(val)) logsMap[depth] = val;
            }
          });
        }
      } else {
        lines.forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 2) {
            const depth = Math.round(parseFloat(parts[0]));
            const val = parseFloat(parts[1]);
            if (!isNaN(depth) && !isNaN(val)) logsMap[depth] = val;
          }
        });
      }

      if (Object.keys(logsMap).length === 0) {
        throw new Error("DATA_VOID: No valid datum-value pairs identified in payload.");
      }
      
      onDataLoaded(`REMOTE-${Math.random().toString(36).substring(7).toUpperCase()}`, filename, logsMap);
      setUrl('');
    } catch (err: any) {
      console.error(`BRAHAN_KERNEL_LOG: Remote Fetch Aborted. Session: ${sessionId}. Reason:`, err);
      setError(err.message || 'UNKNOWN_CORE_EXCEPTION');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={!isFetching ? onClose : undefined}
      ></div>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Globe size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-blue-100 uppercase tracking-tighter">Remote_Forensic_Link</h3>
              <div className="flex items-center space-x-2">
                <span className="text-[8px] text-blue-900 uppercase font-black tracking-widest">Protocol: X-BRAHAN-UPLINK</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isFetching}
            className="p-2 text-slate-500 hover:text-white transition-colors disabled:opacity-20"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-black/40 border border-blue-900/20 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                <Terminal size={14} />
                <span>Acquisition_Target_URI</span>
              </div>
              <div className="text-[7px] text-blue-900 font-mono uppercase tracking-tighter">
                Session: {sessionId.substring(0, 16)}...
              </div>
            </div>
            
            <div className="flex space-x-3">
              <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ndr-archive.gov.au/logs/well_123.las"
                className="flex-1 bg-slate-950 border border-blue-900/30 rounded-lg px-4 py-3 text-[12px] text-blue-100 font-mono outline-none focus:border-blue-500 placeholder:text-blue-950 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button 
              onClick={handleFetch} 
              disabled={isFetching || !url}
              className="w-full flex items-center justify-center space-x-3 py-4 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-30 disabled:shadow-none transition-all"
            >
              {isFetching ? <Loader2 size={18} className="animate-spin" /> : <LinkIcon size={18} />}
              <span>{isFetching ? 'PENETRATING_SOURCE...' : 'ESTABLISH_UPLINK'}</span>
            </button>
            
            {error && (
              <div className="flex items-center justify-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-[10px] font-black text-red-500 uppercase animate-pulse">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-blue-900/10 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-blue-900 uppercase">Supported Types</span>
              <p className="text-[9px] text-slate-500 font-mono">ASCII LAS Section 3.0, CSV [Depth, Value]</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[8px] font-black text-blue-900 uppercase">Archive Hash</span>
              <p className="text-[9px] text-slate-500 font-mono">SHA256_PERIMETER_SECURE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GhostSyncRemotePanel;
