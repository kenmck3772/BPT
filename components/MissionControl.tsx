import React, { useState, useEffect } from 'react';
import { Play, Cpu, Database, Activity, HardDrive, Loader2, Globe } from 'lucide-react';

export default function MissionControl() {
  const [status, setStatus] = useState('offline');
  const [logs, setLogs] = useState<string[]>([]);
  const [archiveFile, setArchiveFile] = useState("");
  const [target, setTarget] = useState('https://nlog.nl/en/data');

  useEffect(() => {
    const checkEngine = async () => {
      try {
        const res = await fetch('http://localhost:8000/');
        if (res.ok) setStatus('idle');
      } catch (e) { setStatus('offline'); }
    };
    checkEngine();
  }, []);

  const initiateHarvest = async () => {
    setStatus('active');
    setLogs(['>>> BRAHAN_SOVEREIGN_START', '>>> BRIDGE_CONFIRMED_PORT_8000']);
    try {
      const res = await fetch('http://localhost:8000/start-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target, objective: "Technical Data Acquisition" })
      });
      const data = await res.json();
      setLogs((prev) => [...prev, ...data.logs, '>>> HARVEST_COMPLETE']);
      setArchiveFile(data.file);
      setStatus('idle');
    } catch (e) {
      setStatus('offline');
      setLogs((prev) => [...prev, '!!! KERNEL_ERROR: CONNECTION_BREACHED']);
    }
  };

  return (
    <div className="p-8 bg-black text-[#00FF41] border-2 border-[#00FF41]/40 rounded-xl font-terminal shadow-2xl">
      <div className="flex items-center justify-between mb-8 border-b border-[#00FF41]/20 pb-4">
        <div className="flex items-center gap-4">
          <Cpu className={status === 'offline' ? 'text-red-900' : 'text-[#00FF41]'} />
          <h2 className="text-xl font-black uppercase tracking-[0.3em]">Brahan_Core_v88</h2>
        </div>
        {archiveFile && (
          <div className="flex items-center gap-2 text-[10px] bg-blue-900/20 text-blue-400 px-3 py-1 rounded border border-blue-500/40">
            <HardDrive size={14} />
            <span>SAVED: {archiveFile}</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-[#00FF41]/5 p-4 rounded border border-[#00FF41]/10">
          <label className="text-[10px] uppercase text-[#003b0f] font-black block mb-2">Technical_Nexus</label>
          <select 
            value={target} 
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-transparent border-none text-[#00FF41] outline-none font-mono text-lg"
          >
            <option value="https://nlog.nl/en/data" className="bg-black">HOLLAND_NLOG</option>
            <option value="https://factpages.sodir.no/" className="bg-black">NORWAY_FACTPAGES</option>
            <option value="https://www.bgs.ac.uk/map-viewers/geoindex-onshore/" className="bg-black">UK_BGS_ONSHORE</option>
          </select>
        </div>

        <button 
          onClick={initiateHarvest} 
          disabled={status !== 'idle'} 
          className="w-full py-6 border-2 border-[#00FF41] bg-[#00FF41]/5 hover:bg-[#00FF41] hover:text-black font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all"
        >
          {status === 'active' ? <Loader2 className="animate-spin" /> : <Play size={20} />}
          {status === 'active' ? 'ACQUISITION_IN_PROGRESS' : 'INITIALIZE_HARVEST'}
        </button>

        <div className="bg-black/90 border border-[#00FF41]/20 p-4 h-80 overflow-y-auto font-mono text-[10px]">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#003b0f] gap-4 opacity-40">
              <Database size={48} />
              <span>ORCHESTRATOR_STANDBY</span>
            </div>
          ) : (
            logs.map((l, i) => <div key={i} className="mb-1">[{i + 1}] {l}</div>)
          )}
        </div>
      </div>
    </div>
  );
}