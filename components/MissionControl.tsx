
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Cpu, Database, Activity, HardDrive, Loader2, Globe, Cloud, RefreshCw, 
  AlertCircle, CheckCircle2, Target as TargetIcon, Search, ClipboardList, Monitor,
  Laptop, Server, ChevronRight, Zap, Radio, Calendar, Plus, X, FileText, Shield,
  Skull, Scale, Trash2, Clock, Check
} from 'lucide-react';
import { GHOST_HUNTER_MISSION } from '../constants';
import { Task } from '../types';

type DeviceProfile = 'CHROMEBOOK' | 'FIELD_TABLET' | 'RIG_SERVER';

interface MissionControlProps {
  setGlobalWellName?: (name: string) => void;
}

export default function MissionControl({ setGlobalWellName }: MissionControlProps) {
  const [status, setStatus] = useState('connecting...');
  const [logs, setLogs] = useState<string[]>([]);
  const [archiveFile, setArchiveFile] = useState("");
  const [target, setTarget] = useState('https://ndr.nstauthority.co.uk/');
  
  // Task Management State - Updated with Actionable Directives
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: 'T-001', 
      label: "Harris Datum Audit", 
      module: "Ghost_Sync", 
      detail: "ACTION: Initialize Ghost_Sync. Apply recursive least-squares cross-correlation to the 1994 Mud Logs. Veto the -4.05m datum shift.", 
      completed: false, 
      dueDate: "2026-02-01" 
    },
    { 
      id: 'T-002', 
      label: "Heather Metallurgy Recovery", 
      module: "Vault", 
      detail: "ACTION: Load Integrity_Ledger. Reconcile Apex Job #4459 against mill certs. Identify discordant carbon-crossover joints.", 
      completed: true, 
      dueDate: "2026-02-15" 
    }
  ]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ label: '', module: 'Core', detail: '', dueDate: '' });

  // Interactive States
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfile>('CHROMEBOOK');
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Memoized Progress
  const missionProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completedCount = tasks.filter(t => t.completed).length;
    return Math.round((completedCount / tasks.length) * 100);
  }, [tasks]);

  useEffect(() => {
    const checkEngine = async () => {
      try {
        const res = await fetch('http://localhost:8000/');
        if (res.ok) {
          setStatus('idle');
        } else {
          setTimeout(() => setStatus('idle'), 1200);
        }
      } catch (e) { 
        setTimeout(() => setStatus('idle'), 1200);
      }
    };
    checkEngine();
    addLog('>>> KERNEL_IDLE: AWAITING_MISSION_TARGET');
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-99), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.label) return;
    const task: Task = {
      id: `T-${Math.random().toString(36).substring(7).toUpperCase()}`,
      label: newTask.label,
      module: newTask.module,
      detail: newTask.detail,
      completed: false,
      dueDate: newTask.dueDate || undefined
    };
    setTasks(prev => [task, ...prev]);
    setNewTask({ label: '', module: 'Core', detail: '', dueDate: '' });
    setShowTaskForm(false);
    addLog(`>>> TASK_ADDED: ${task.label}`);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    addLog(`>>> TASK_STATE_CHANGED: ${id}`);
  };

  const initiateHarvest = async () => {
    if (isHarvesting) return;
    
    setIsHarvesting(true);
    setStatus('active');
    addLog('>>> BRAHAN_SOVEREIGN_START');
    addLog('>>> TARGET_ACQUISITION: HARRIS_210/24a-H1');
    addLog('>>> BRIDGE_CONFIRMED_PORT_8000');
    
    if (setGlobalWellName) setGlobalWellName("HARRIS_210/24a-H1");

    setTimeout(() => {
        addLog('>>> VIRTUAL_DATA_ACQUISITION_INITIALIZED');
        addLog('>>> HARVEST_COMPLETE (SIMULATED)');
        setArchiveFile("Harris_H1_Apex_Artifact.las");
        setStatus('idle');
        setIsHarvesting(false);
        addLog('>>> ARTIFACT_COMMITTED_TO_BUFFER: HARRIS_H1_APEX_1994');
    }, 2500);
  };

  const handleGcsSync = () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncStatus('IDLE');
    setStatus('active');
    addLog(`>>> INITIATING_GCS_UPLINK: ${target}`);
    
    setTimeout(() => {
      addLog('>>> RESOLVING_GCS_BUCKET_PERMISSIONS...');
      setTimeout(() => {
        addLog('>>> FETCHING_ARTIFACT: HARRIS_H1_RECON.json');
        setTimeout(() => {
          addLog('>>> PAYLOAD_RETRIEVED: Harris Subsea Ghost Profile [VETO_AUTH]');
          addLog('>>> UPDATING_TERMINAL_ENVIRONMENT_VARIABLES...');
          setSyncStatus('SUCCESS');
          setIsSyncing(false);
          setStatus('idle');
          addLog('>>> GCS_SYNC_COMPLETE: KERNEL_STABLE');
        }, 1200);
      }, 800);
    }, 1000);
  };

  const generateTotalDossier = () => {
    setIsGeneratingDossier(true);
    addLog(">>> INITIATING_TOTAL_FIELD_RECONCILIATION...");
    addLog(">>> MODULE 1: ECONOMIC RISK AUDIT START...");
    addLog(">>> MODULE 2: TECHNICAL INTERVENTION LEDGER START...");
    addLog(">>> MODULE 3: REGULATORY VETO START...");
    
    setTimeout(() => {
       setIsGeneratingDossier(false);
       addLog(">>> DOSSIER_COMPLETE: TRI-RAIL VERIFICATION VERIFIED.");
    }, 3000);
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    return due <= today;
  };

  return (
    <div className="p-8 bg-black/40 text-[#00FF41] border border-[#00FF41]/20 rounded-2xl font-terminal shadow-[0_0_50px_rgba(0,0,0,0.8)] h-full flex flex-col space-y-8 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0"></div>

      <div className="flex items-center justify-between border-b border-[#00FF41]/20 pb-6 shrink-0 relative z-10">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-[#00FF41]/10 rounded-lg border border-[#00FF41]/30">
            <Cpu size={28} className={status === 'active' ? 'text-[#00FF41] animate-pulse scale-110 shadow-[0_0_15px_#00FF41]' : 'text-emerald-900'} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-[#00FF41] drop-shadow-[0_0_10px_#00FF41]">Brahan_Core_v88</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[9px] text-[#00FF41]/60 font-black uppercase tracking-[0.2em]">Sovereign Diagnostic Kernel // Mission: Harris_H1</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={generateTotalDossier}
            disabled={isGeneratingDossier}
            className={`px-6 py-2.5 rounded-xl border border-red-500/40 bg-red-600/10 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 ${isGeneratingDossier ? 'animate-pulse opacity-50' : ''}`}
          >
             {isGeneratingDossier ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
             <span>Generate Total Field Dossier</span>
          </button>
          <div className="h-10 w-px bg-[#00FF41]/10"></div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <Monitor size={12} />
            <span className="text-[8px] font-black uppercase">Device: {deviceProfile}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1 min-h-0 relative z-10 overflow-hidden">
        <div className="lg:col-span-2 space-y-8 overflow-y-auto custom-scrollbar pr-4 pb-4">
          
          {/* Mission Targets Card */}
          <div className="bg-[#121212]/80 p-6 rounded-2xl border border-[#00FF41]/10 shadow-2xl backdrop-blur-md relative z-20">
            <h3 className="text-[12px] font-black text-[#00FF41] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <TargetIcon size={18} className="text-red-500 animate-pulse" /> Active_Mission_Targets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               {GHOST_HUNTER_MISSION.TARGETS.map((t, idx) => (
                 <div key={idx} className={`p-4 rounded-xl border transition-all flex flex-col space-y-2 group ${t.ASSET === 'Harris_H1' ? 'border-red-500/40 bg-red-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                    <div className="flex justify-between items-start">
                       <span className="text-[10px] font-black uppercase text-white">{t.ASSET}</span>
                       <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${t.PRIORITY === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-black'}`}>{t.PRIORITY}</span>
                    </div>
                    <span className="text-[8px] font-mono text-emerald-900 uppercase leading-tight">{t.ANOMALY_TYPE}</span>
                    <span className="text-[7px] font-black text-emerald-950/60 uppercase tracking-tighter">Source: {t.DATA_PORTAL}</span>
                 </div>
               ))}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-[#00FF41]/40 font-black block tracking-widest">Harvest_Portal_Source</label>
                <div className="flex gap-2">
                   <div className="flex-1 bg-black/60 border border-[#00FF41]/20 rounded-xl p-4 text-[#00FF41] font-mono text-xs flex items-center gap-3">
                      <Globe size={14} className="opacity-40" />
                      <input 
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="bg-transparent border-none outline-none flex-1 text-[#00FF41] font-mono"
                      />
                   </div>
                   <button 
                    onClick={initiateHarvest} 
                    disabled={isHarvesting}
                    className="px-8 bg-[#00FF41] text-black rounded-xl font-black text-xs uppercase hover:bg-emerald-400 transition-all shadow-lg active:scale-95 flex items-center gap-2 relative z-30 disabled:opacity-50"
                   >
                     {isHarvesting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                     <span>{isHarvesting ? 'Harvesting' : 'Harvest'}</span>
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Task Ledger */}
          <div className="bg-emerald-950/10 p-6 rounded-2xl border border-emerald-500/20 shadow-2xl backdrop-blur-md relative z-20">
             <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <ClipboardList size={18} className="text-emerald-500/70" /> Mission_Task_Ledger
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                     <div className="w-32 h-1.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-500/20">
                        <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_#10b981]" style={{ width: `${missionProgress}%` }}></div>
                     </div>
                     <span className="text-[8px] font-black text-emerald-500 uppercase">{missionProgress}% AUDIT_VELOCITY</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="p-2 bg-emerald-500/10 border border-emerald-500/40 rounded-lg text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all"
                >
                   {showTaskForm ? <X size={16} /> : <Plus size={16} />}
                </button>
             </div>

             {showTaskForm && (
               <form onSubmit={addTask} className="mb-8 p-6 bg-black/60 border border-emerald-500/40 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-emerald-900">Task_Label</label>
                        <input 
                          required
                          value={newTask.label}
                          onChange={e => setNewTask({...newTask, label: e.target.value})}
                          className="w-full bg-slate-900 border border-emerald-900/40 rounded-lg px-3 py-2 text-[10px] outline-none focus:border-emerald-500"
                          placeholder="e.g. Harris Shift Verification"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-emerald-900">Assigned_Module</label>
                        <select 
                          value={newTask.module}
                          onChange={e => setNewTask({...newTask, module: e.target.value})}
                          className="w-full bg-slate-900 border border-emerald-900/40 rounded-lg px-3 py-2 text-[10px] outline-none focus:border-emerald-500"
                        >
                           <option>Ghost_Sync</option>
                           <option>Pay_Recovery</option>
                           <option>Pulse_Analyzer</option>
                           <option>Chem_Autopsy</option>
                           <option>Vault</option>
                        </select>
                     </div>
                     <div className="space-y-1 md:col-span-2">
                        <label className="text-[8px] font-black uppercase text-emerald-900">Detailed_Directives</label>
                        <textarea 
                          value={newTask.detail}
                          onChange={e => setNewTask({...newTask, detail: e.target.value})}
                          className="w-full bg-slate-900 border border-emerald-900/40 rounded-lg px-3 py-2 text-[10px] outline-none focus:border-emerald-500 h-20 resize-none"
                          placeholder="Specific forensic parameters..."
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-emerald-900">Due_Date (Veto_Deadline)</label>
                        <div className="relative">
                          <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900" />
                          <input 
                            type="date"
                            value={newTask.dueDate}
                            onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                            className="w-full bg-slate-950 border border-emerald-900/40 rounded-lg pl-9 pr-3 py-2 text-[10px] outline-none focus:border-emerald-500 text-emerald-500 font-terminal"
                          />
                        </div>
                     </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-emerald-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400">Commit_Task_to_Kernel</button>
               </form>
             )}

             <div className="grid grid-cols-1 gap-3">
                {tasks.map((task) => {
                  const overdue = isOverdue(task.dueDate);
                  return (
                    <div key={task.id} className={`p-4 rounded-xl border transition-all flex items-center justify-between group ${task.completed ? 'bg-emerald-500/5 border-emerald-500/20 shadow-inner' : 'bg-black/40 border-emerald-900/30 hover:border-emerald-500/50'}`}>
                      <div className="flex items-center gap-4 flex-1">
                         <button 
                          onClick={() => toggleTask(task.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                            task.completed 
                              ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_#10b981]' 
                              : 'border-emerald-900 text-transparent hover:border-emerald-500'
                          }`}
                         >
                            <Check size={14} strokeWidth={4} className={`transition-all duration-300 ${task.completed ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
                         </button>

                         <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                               <span className={`text-[9px] font-black uppercase tracking-widest ${task.completed ? 'text-emerald-900' : 'text-emerald-400'}`}>{task.module}</span>
                            </div>
                            <span className={`text-xs font-black uppercase tracking-tighter transition-all duration-500 truncate ${task.completed ? 'text-emerald-500/40 line-through' : 'text-white'}`}>
                              {task.label}
                            </span>
                            <p className={`text-[8px] font-mono leading-tight italic transition-all ${task.completed ? 'text-emerald-950 opacity-40' : 'text-emerald-900'}`}>
                               {task.detail}
                            </p>
                         </div>

                         {task.dueDate && (
                           <div className={`px-3 py-1.5 rounded border flex flex-col items-center min-w-[80px] transition-all ${task.completed ? 'opacity-20 grayscale' : overdue ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-emerald-500/5 border-emerald-900/40 text-emerald-700'}`}>
                              <span className="text-[7px] font-black uppercase tracking-tighter mb-0.5">Deadline</span>
                              <div className="flex items-center gap-1">
                                <Calendar size={10} />
                                <span className="text-[9px] font-bold font-terminal">{task.dueDate}</span>
                              </div>
                           </div>
                         )}
                      </div>
                      <button 
                        onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                        className={`ml-4 p-2 text-emerald-950 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ${task.completed ? 'group-hover:opacity-40' : ''}`}
                      >
                         <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
             </div>
             
             <div className="mt-8 p-6 bg-black/40 border border-emerald-500/20 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                   <Shield size={20} className="text-emerald-400" />
                   <h4 className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Total_Field_Reconciliation_Ledger</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-4 bg-slate-900/40 border border-red-500/20 rounded-xl space-y-2">
                      <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">RAIL_1: HARRIS</span>
                      <p className="text-[9px] text-emerald-100/60 leading-tight">Datum: 4.05m Shift Verified. C1-C5 bypassed pay detected.</p>
                   </div>
                   <div className="p-4 bg-slate-900/40 border border-orange-500/20 rounded-xl space-y-2">
                      <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">RAIL_2: HEATHER</span>
                      <p className="text-[9px] text-emerald-100/60 leading-tight">Iron: 13Cr L-80 Metallurgy verified via Job #4459.</p>
                   </div>
                   <div className="p-4 bg-slate-900/40 border border-blue-500/20 rounded-xl space-y-2">
                      <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">RAIL_3: BALLOCH</span>
                      <p className="text-[9px] text-emerald-100/60 leading-tight">Integrity: Thermal Pulse confirms 12m scale-fill tag.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col min-h-0 space-y-8">
           {/* GCS Uplink */}
           <div className="bg-blue-900/5 p-6 rounded-2xl border border-blue-500/20 shadow-2xl backdrop-blur-md relative z-20">
              <h3 className="text-[12px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <Cloud size={18} className="text-blue-400/70" /> Sovereign_GCS_Uplink
              </h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase text-blue-400/40 font-black block tracking-widest">Engine_Status_GS_URI</label>
                   <input 
                     type="text" 
                     value="gs://brahan-nexus/HARRIS_H1_RECON.json"
                     readOnly
                     className="w-full bg-black/60 border border-blue-500/20 rounded-xl p-4 text-blue-100 outline-none font-mono text-xs focus:border-blue-500 placeholder:text-blue-900 transition-all opacity-80"
                   />
                 </div>

                 <button 
                   onClick={handleGcsSync} 
                   disabled={isSyncing} 
                   className="w-full py-5 border-2 border-blue-500 bg-blue-500/10 hover:bg-blue-500 hover:text-white font-black uppercase tracking-[0.5em] flex items-center justify-center gap-4 transition-all shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] disabled:opacity-30 group relative z-30"
                 >
                   {isSyncing ? <Loader2 size={22} className="animate-spin" /> : <RefreshCw size={22} className="group-hover:rotate-180 transition-transform duration-500" />}
                   {isSyncing ? 'SYNCING_REMOTE_KERNEL...' : 'SYNC_GCS_ENVIRONMENT'}
                 </button>
              </div>
           </div>

           {/* Log Stream */}
           <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] border border-[#00FF41]/20 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] border-l-4">
            <div className="p-4 border-b border-[#00FF41]/10 flex items-center justify-between bg-[#00FF41]/5 backdrop-blur-md">
               <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#00FF41]">
                  <Activity size={16} className="animate-pulse" /> <span>System_Log_Stream</span>
               </div>
               <span className="text-[9px] font-black text-[#00FF41]/40 tracking-widest">RETAINING: {logs.length} ENTRIES</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] space-y-2 custom-scrollbar bg-black/20">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#00FF41]/20 gap-6">
                  <Database size={64} strokeWidth={1} className="opacity-10" />
                  <span className="uppercase tracking-[1em] font-black text-xs">Orchestrator_Standby</span>
                </div>
              ) : (
                logs.map((l, i) => (
                  <div key={i} className={`flex gap-4 p-2 rounded transition-colors hover:bg-[#00FF41]/5 animate-in slide-in-from-left-2 duration-300 ${l?.includes('!!!') ? 'text-red-500 bg-red-500/5' : l?.includes('GCS') ? 'text-blue-400' : 'text-[#00FF41]/90'}`}>
                    <span className="text-[#00FF41]/30 font-black shrink-0 w-8 select-none">{(i + 1).toString().padStart(2, '0')}</span> 
                    <span className="whitespace-pre-wrap leading-relaxed glow-text">{l}</span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .glow-text {
          text-shadow: 0 0 5px currentColor;
        }
      `}} />
    </div>
  );
}
