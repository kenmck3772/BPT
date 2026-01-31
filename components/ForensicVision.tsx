
import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Search, Loader2, Zap, 
  ShieldCheck, ShieldAlert, FileText, X, 
  Maximize2, Minimize2, Scan, Database,
  Terminal, Image as ImageIcon,
  AlertTriangle, Binary
} from 'lucide-react';
import { analyzeForensicImage } from '../services/geminiService';
import { secureAsset } from '../services/vaultService';

interface ForensicVisionProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

export default function ForensicVision({ isFocused, onToggleFocus }: ForensicVisionProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isSecuring, setIsSecuring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError("CAMERA_PERMISSION_DENIED");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      setImage(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runVisualAutopsy = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setResults(null);
    setError(null);

    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];

    try {
      const data = await analyzeForensicImage(base64Data, mimeType);
      if (data) {
        setResults(data);
      } else {
        setError("ANALYSIS_FAILED: ABORTING_PROCEDURE");
      }
    } catch (err) {
      setError("ANALYSIS_CRASHED: CHECK_KERNEL_LOGS");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSecureToVault = () => {
    if (!results) return;
    setIsSecuring(true);
    setTimeout(() => {
      secureAsset({
        title: `Visual_Artifact_Autopsy: ${results.objects?.[0]?.label || 'Sovereign_Target'}`,
        status: results.riskAssessment.includes('CRITICAL') ? 'CRITICAL' : 'VERIFIED',
        summary: results.verdict,
        region: 'UKCS_Basin_Nexus',
        valueEst: results.riskAssessment.includes('CRITICAL') ? 12000000 : 500000,
        confidence: 96.5
      });
      setIsSecuring(false);
      setImage(null);
      setResults(null);
    }, 1200);
  };

  const clearSession = () => {
    setImage(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Scan size={400} className="text-emerald-500 animate-pulse" />
      </div>

      <header className="flex items-center justify-between border-b border-emerald-900/30 pb-4 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl shadow-lg">
            <Camera size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">Forensic_Vision_Lab</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-emerald-800 uppercase tracking-[0.4em] font-black">Mode: MULTIMODAL_AUTOPSY // Auth: LEVEL_7</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => { clearSession(); }} 
            className="p-2 text-emerald-900 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>
          {onToggleFocus && (
            <button onClick={onToggleFocus} aria-label="Toggle Focus Mode" className="p-2 text-emerald-900 hover:text-[#00FF41] transition-all">
              {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 min-h-0 overflow-hidden">
        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-slate-950/80 border border-emerald-900/30 rounded-3xl flex flex-col items-center justify-center p-8 shadow-2xl relative overflow-hidden group">
            {isAnalyzing && (
               <div className="absolute inset-x-0 h-1 bg-emerald-500/40 shadow-[0_0_15px_#00FF41] animate-scan z-20 pointer-events-none"></div>
            )}

            {!image && !cameraActive ? (
              <div className="flex flex-col items-center space-y-8 text-center animate-in fade-in duration-500">
                <div className="p-8 bg-emerald-500/5 rounded-full border-2 border-dashed border-emerald-500/20 group-hover:border-emerald-500/40 transition-all">
                  <ImageIcon size={64} className="text-emerald-900 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-emerald-100 uppercase tracking-tighter">Initialize_Visual_Ingest</h3>
                  <p className="text-xs text-emerald-800 font-black uppercase tracking-widest max-w-xs">Upload forensic artifacts or activate live camera stream for voxel analysis.</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }}
                    className="px-6 py-3 bg-emerald-500 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-3 shadow-lg"
                  >
                    <Upload size={16} /> Upload Artifact
                  </button>
                  <button 
                    onClick={() => { startCamera(); }}
                    className="px-6 py-3 border border-emerald-500 text-emerald-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/10 transition-all flex items-center gap-3"
                  >
                    <Camera size={16} /> Live Ingest
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            ) : cameraActive ? (
              <div className="relative w-full h-full flex flex-col">
                <video ref={videoRef} autoPlay playsInline className="flex-1 w-full rounded-2xl object-cover border border-emerald-500/20 grayscale hover:grayscale-0 transition-all" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                  <button onClick={() => { captureFrame(); }} className="p-4 bg-emerald-500 text-slate-950 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-110 active:scale-95 transition-all">
                    <Zap size={24} />
                  </button>
                  <button onClick={() => { stopCamera(); }} className="p-4 bg-red-600 text-white rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-110 active:scale-95 transition-all">
                    <X size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                <img src={image || ""} alt="Artifact Preview" className="max-w-full max-h-full rounded-2xl border border-emerald-500/20 shadow-2xl animate-in zoom-in-95" />
                {!results && !isAnalyzing && (
                  <button 
                    onClick={() => { runVisualAutopsy(); }}
                    className="absolute bottom-8 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:scale-105 transition-all flex items-center gap-4"
                  >
                    <Search size={20} /> Execute Visual Autopsy
                  </button>
                )}
              </div>
            )}
          </div>
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/40 rounded-xl flex items-center gap-3 animate-in shake">
              <ShieldAlert size={20} className="text-red-500" />
              <span className="text-[10px] font-black text-red-100 uppercase">{error}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-slate-950/90 border border-emerald-900/30 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-emerald-900/30 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center space-x-3">
                <Terminal size={18} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Diagnostic_Matrix_Output</span>
              </div>
              {results && (
                 <span className={`px-3 py-1 rounded text-[9px] font-black uppercase ${results.riskAssessment.includes('CRITICAL') ? 'bg-red-600 text-white shadow-[0_0_10px_#ef4444]' : 'bg-emerald-600 text-white'}`}>
                    Risk: {results.riskAssessment.includes('CRITICAL') ? 'CRITICAL' : 'MINIMAL'}
                 </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {!results && !isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                  <Binary size={64} className="animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-[0.5em]">Awaiting_Artifact_Injest</span>
                </div>
              ) : isAnalyzing ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-10 bg-emerald-900/20 rounded-xl w-3/4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-emerald-900/20 rounded-xl"></div>
                    <div className="h-24 bg-emerald-900/20 rounded-xl"></div>
                  </div>
                  <div className="h-32 bg-emerald-900/20 rounded-xl"></div>
                  <div className="h-48 bg-emerald-900/20 rounded-xl"></div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                       <Database size={14} /> <span>I. Identified_Components</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {results.objects?.map((obj: any, i: number) => (
                         <div key={i} className="p-4 bg-slate-900 border border-emerald-900/20 rounded-2xl flex flex-col gap-2 group hover:border-emerald-500 transition-all">
                            <div className="flex justify-between items-center">
                               <span className="text-[11px] font-black text-emerald-100 uppercase">{obj.label}</span>
                               <span className="text-[10px] font-mono text-emerald-500">{Math.round(obj.confidence * 100)}%</span>
                            </div>
                            {obj.notes && <p className="text-[9px] text-emerald-900 leading-tight italic">"{obj.notes}"</p>}
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                       <FileText size={14} /> <span>II. Artifact_OCR_Extraction</span>
                    </div>
                    <div className="p-5 bg-black/60 border border-emerald-900/40 rounded-2xl shadow-inner font-mono text-[11px] text-emerald-400 leading-relaxed whitespace-pre-wrap italic border-l-4 border-l-emerald-500">
                       "{results.ocrText}"
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className="p-6 bg-red-600/10 border border-red-500/30 rounded-2xl space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert size={64} className="text-red-500" /></div>
                        <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                           <AlertTriangle size={16} /> <span>III. Integrity_Risk_Autopsy</span>
                        </div>
                        <p className="text-[12px] font-mono text-red-100 leading-relaxed">{results.riskAssessment}</p>
                     </div>
                     <div className="p-6 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl space-y-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                           <ShieldCheck size={16} /> Forensic_Verdict
                        </span>
                        <p className="text-[13px] font-black text-white uppercase tracking-tighter leading-tight">{results.verdict}</p>
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-emerald-900/40 bg-slate-950 flex gap-4">
               <button 
                disabled={!results || isSecuring}
                onClick={() => { handleSecureToVault(); }}
                className="flex-1 py-4 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)] hover:bg-emerald-500 disabled:opacity-20 transition-all flex items-center justify-center space-x-3"
               >
                 {isSecuring ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                 <span>{isSecuring ? 'SECURING_ARTIFACT...' : 'Commit_Autopsy_to_Vault'}</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}} />
    </div>
  );
}
