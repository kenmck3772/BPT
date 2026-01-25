
import React, { useState, useEffect } from 'react';
import { 
  Lock, ShieldCheck, Database, Trash2, 
  FileText, Calendar, Hash, ExternalLink, 
  Search, AlertTriangle, ChevronRight, HardDrive,
  Fingerprint, Activity, Zap
} from 'lucide-react';
import { getVaultItems } from '../services/vaultService';
import { AnalysisResult } from '../types';

const Vault: React.FC = () => {
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<AnalysisResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setItems(getVaultItems());
  }, []);

  const filteredItems = items.filter(item => {
    const term = (searchTerm || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const summary = (item.summary || '').toLowerCase();
    const id = (item.id || '').toLowerCase();
    
    return title.includes(term) || summary.includes(term) || id.includes(term);
  });

  const purgeVault = () => {
    if (window.confirm("CONFIRM: IRREVERSIBLE PURGE OF ALL SECURED ASSETS?")) {
      localStorage.removeItem('BRAHAN_SOVEREIGN_CHEST');
      setItems([]);
      setSelectedItem(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      {/* Background HUD Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Lock size={400} className="text-amber-500 animate-pulse" />
      </div>

      <header className="flex items-center justify-between border-b border-amber-900/30 pb-4 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Lock size={24} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-amber-400 uppercase tracking-tighter">Sovereign_Vault</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-amber-900 uppercase tracking-[0.4em] font-black">Encrypted_Asset_Storage // Auth: LEVEL_7</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-900" />
            <input 
              type="text" 
              placeholder="Search_Archive..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-amber-900/30 rounded-lg pl-9 pr-4 py-2 text-[11px] text-amber-100 font-mono outline-none focus:border-amber-500 transition-all placeholder:text-amber-900"
            />
          </div>
          <button 
            onClick={purgeVault}
            className="p-2 text-amber-900 hover:text-red-500 transition-colors border border-transparent hover:border-red-900/30 rounded"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 space-x-6 relative z-10 overflow-hidden">
        {/* Asset List */}
        <div className="w-1/3 flex flex-col space-y-2 overflow-y-auto custom-scrollbar pr-2">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                selectedItem?.id === item.id 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                  : 'bg-slate-900/60 border-amber-900/20 text-amber-800 hover:border-amber-500/50'
              }`}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase truncate">{item.title}</span>
                <span className={`text-[8px] font-mono mt-1 ${selectedItem?.id === item.id ? 'text-slate-800' : 'text-amber-900'}`}>
                  {item.id} // {item.status}
                </span>
              </div>
              <ChevronRight size={16} className={selectedItem?.id === item.id ? '' : 'opacity-40 group-hover:opacity-100'} />
            </button>
          ))}
          {filteredItems.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
              <Database size={48} />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Vault_Empty</span>
            </div>
          )}
        </div>

        {/* Detail Viewer */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedItem ? (
            <div className="flex-1 bg-slate-950/80 border border-amber-900/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-4 border-b border-amber-900/20 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-3">
                  <FileText size={18} className="text-amber-500" />
                  <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">Asset_Manifest: {selectedItem.id}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded text-[9px] font-black uppercase ${
                    selectedItem.status === 'CRITICAL' ? 'bg-red-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                  }`}>
                    {selectedItem.status}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-amber-100 uppercase tracking-tighter">{selectedItem.title}</h1>
                  <div className="flex items-center space-x-4 text-[10px] font-mono text-amber-900 uppercase">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(selectedItem.timestamp).toLocaleString()}</span>
                    {selectedItem.region && <span className="flex items-center gap-1"><HardDrive size={12} /> {selectedItem.region}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-900/60 border border-amber-900/20 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-amber-900">
                      <Zap size={14} />
                      <span className="text-[9px] font-black uppercase">Value_Estimation</span>
                    </div>
                    <div className="text-2xl font-black text-amber-400">
                      {selectedItem.valueEst ? `$${(selectedItem.valueEst / 1000000).toFixed(2)}M` : 'UNQUANTIFIED'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/60 border border-amber-900/20 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-amber-900">
                      <Activity size={14} />
                      <span className="text-[9px] font-black uppercase">Confidence_Rating</span>
                    </div>
                    <div className="text-2xl font-black text-amber-400">
                      {selectedItem.confidence ? `${selectedItem.confidence.toFixed(1)}%` : '--%'}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-900/40 border-l-4 border-amber-500 rounded-r-xl space-y-3 shadow-inner">
                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Forensic_Summary</span>
                  <p className="text-[13px] text-amber-100 font-terminal italic leading-relaxed">
                    "{selectedItem.summary}"
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Cryptographic_Identity</span>
                    <Fingerprint size={14} className="text-amber-900" />
                  </div>
                  <div className="p-4 bg-slate-950 border border-amber-900/20 rounded-xl font-mono text-[10px] text-amber-700 break-all select-all">
                    {selectedItem.hash}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-amber-900/20 bg-slate-900/40 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-[9px] text-amber-900 font-black uppercase tracking-widest">Sovereign_Watermark_Active</span>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]"></div>
                </div>
                <button className="px-6 py-2.5 bg-amber-500 text-slate-950 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center space-x-2">
                  <ExternalLink size={14} />
                  <span>Export_Secure_PDF</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
              <ShieldCheck size={120} className="animate-pulse" />
              <div className="text-center space-y-2">
                <span className="text-lg font-black uppercase tracking-[0.5em] block text-amber-500">Awaiting_Asset_Selection</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Encrypted Terminal V.2.5</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="p-3 border-t border-amber-900/20 bg-slate-950/60 rounded flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-6 text-[9px] font-black text-amber-900 uppercase">
          <span className="flex items-center gap-2"><Database size={14} /> Total_Nodes: {items.length}</span>
          <span className="flex items-center gap-2 text-amber-700"><Hash size={14} /> SHA512_Audit_Verified</span>
        </div>
        <div className="flex items-center space-x-1 text-[8px] text-amber-900 font-mono italic">
          [>> JACKPOT SECURED: ENCRYPTING TO WATERMARKED PDF (THE_CHEST)]
        </div>
      </footer>
    </div>
  );
};

export default Vault;
