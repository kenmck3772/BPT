
import React, { useMemo, useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { MOCK_TRAUMA_DATA } from '../constants';
import { TraumaLayer, TraumaEvent } from '../types';
import { 
  Zap, Layers, Thermometer, Droplets, Beaker, Terminal, 
  Move, MousePointer2, Activity, Play, Pause, 
  Box, Circle, Target, Scan,
  Eye, EyeOff, ShieldAlert, Home, Target as TargetReticle, 
  Filter, RefreshCcw, Maximize2, Minimize2, Navigation, 
  SearchCode, Sparkles, ArrowRight, Radio, Layers3,
  ChevronDown, ChevronUp, Scale, Compass, Focus,
  Grid3X3, List, AlertCircle, Info, Hash, Fingerprint
} from 'lucide-react';

const STORAGE_KEY = 'BRAHAN_TRAUMA_LOG';

interface TraumaNodeProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const TraumaNode: React.FC<TraumaNodeProps> = ({ isFocused = false, onToggleFocus }) => {
  const plotContainerRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const autoRotateRef = useRef<number | null>(null);
  const currentRotationRef = useRef(0);
  
  const allDepths = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.depth))).sort((a, b) => a - b), []);
  const fingerIds = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.fingerId))).sort((a, b) => a - b), []);
  const absoluteMinDepth = allDepths[0];
  const absoluteMaxDepth = allDepths[allDepths.length - 1];

  const [activeLayers, setActiveLayers] = useState<TraumaLayer[]>([TraumaLayer.DEVIATION, TraumaLayer.STRESS]);
  const [viewMode, setViewMode] = useState<'3D_SURFACE' | 'MFC_HEATMAP'>('3D_SURFACE');
  const [layerOpacities, setLayerOpacities] = useState<Record<TraumaLayer, number>>({
    [TraumaLayer.DEVIATION]: 0.95,
    [TraumaLayer.CORROSION]: 0.7,
    [TraumaLayer.WALL_LOSS]: 0.8,
    [TraumaLayer.STRESS]: 0.9, 
    [TraumaLayer.WATER_LEAKAGE]: 0.85,
    [TraumaLayer.TEMPERATURE]: 0.6,
  });
  
  const [minDepth, setMinDepth] = useState<number>(absoluteMinDepth);
  const [maxDepth, setMaxDepth] = useState<number>(absoluteMaxDepth);

  const [isXSectionOpen, setIsXSectionOpen] = useState(false);
  const [dragMode, setDragMode] = useState<'orbit' | 'pan'>('orbit');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [highlightedDepth, setHighlightedDepth] = useState<number | null>(null);
  const [scanLineDepth, setScanLineDepth] = useState<number | null>(null);
  const [isHighlightPulsing, setIsHighlightPulsing] = useState(false);
  const [isTargeting, setIsTargeting] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  
  const filteredDepths = useMemo(() => 
    allDepths.filter(d => d >= minDepth && d <= maxDepth), 
    [allDepths, minDepth, maxDepth]
  );
  
  const [currentXDepth, setCurrentXDepth] = useState<number>(allDepths[0]);

  // Automated MFC Anomaly Detection
  const anomalies = useMemo(() => {
    const results: TraumaEvent[] = [];
    allDepths.forEach(d => {
      const dataAtDepth = MOCK_TRAUMA_DATA.filter(p => p.depth === d);
      const values = dataAtDepth.map(p => p.deviation);
      const maxDev = Math.max(...values);
      const minDev = Math.min(...values);
      const ovality = maxDev - minDev;

      if (ovality > 3.0) {
        results.push({
          timestamp: 'AUTO_DETECT',
          layer: 'OVALITY',
          depth: d,
          value: ovality,
          unit: 'mm',
          severity: 'CRITICAL',
          description: `Severe tubing ovality detected. Max deformation: ${maxDev.toFixed(2)}mm`
        });
      } else if (maxDev > 2.0) {
        results.push({
          timestamp: 'AUTO_DETECT',
          layer: 'PITTING',
          depth: d,
          value: maxDev,
          unit: 'mm',
          severity: 'WARNING',
          description: `Localized finger deflection indicates internal pitting.`
        });
      }
    });
    return results;
  }, [allDepths]);

  const layerConfig = {
    [TraumaLayer.DEVIATION]: { 
      label: 'Caliper Deviation', 
      unit: 'mm', 
      min: 0, 
      max: 5, 
      colorscale: [
        [0, '#020617'], 
        [0.3, '#064e3b'], 
        [0.4, '#10b981'], 
        [0.6, '#38bdf8'],
        [0.8, '#ff5f1f'], 
        [1, '#ff0000']
      ], 
      color: '#10b981', 
      icon: <Fingerprint size={14} /> 
    },
    [TraumaLayer.STRESS]: { 
      label: 'Stress Field', 
      unit: 'kpsi', 
      min: 0, 
      max: 100, 
      colorscale: [
        [0, '#020617'], 
        [0.3, '#312e81'],
        [0.6, '#c026d3'],
        [0.8, '#f59e0b'],
        [1, '#ffffff']
      ], 
      color: '#c026d3', 
      icon: <Activity size={14} /> 
    },
    [TraumaLayer.CORROSION]: { label: 'MFC Corrosion', unit: 'ici', min: 0, max: 100, colorscale: [[0, '#020617'], [0.2, '#451a03'], [0.6, '#9a3412'], [1, '#fdba74']], color: '#ea580c', icon: <Beaker size={14} /> },
    [TraumaLayer.WALL_LOSS]: { label: 'Wall Depletion', unit: '%', min: 0, max: 25, colorscale: [[0, '#020617'], [0.4, '#1e293b'], [0.6, '#4338ca'], [0.8, '#9333ea'], [1, '#f472b6']], color: '#f472b6', icon: <Layers size={14} /> },
    [TraumaLayer.WATER_LEAKAGE]: { 
      label: 'Leakage Flux', 
      unit: 'FLUX', 
      min: 0, 
      max: 100, 
      colorscale: [
        [0, '#020617'], 
        [0.2, '#064e3b'], 
        [0.4, '#0d9488'], 
        [0.6, '#22d3ee'], 
        [0.8, '#e0f2fe'], 
        [1, '#ffffff']
      ], 
      color: '#22d3ee', 
      icon: <Droplets size={14} /> 
    },
    [TraumaLayer.TEMPERATURE]: { label: 'Thermal Profile', unit: '°C', min: 60, max: 100, colorscale: [[0, '#020617'], [0.5, '#4338ca'], [1, '#ffffff']], color: '#ec4899', icon: <Thermometer size={14} /> }
  };

  useEffect(() => {
    if (!plotContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      Plotly.Plots.resize(plotContainerRef.current!);
      if (heatmapRef.current) Plotly.Plots.resize(heatmapRef.current);
    });
    observer.observe(plotContainerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAutoRotating && !isXSectionOpen && plotContainerRef.current && viewMode === '3D_SURFACE') {
      const rotate = () => {
        currentRotationRef.current += 0.006;
        const radius = 2.4;
        const x = radius * Math.cos(currentRotationRef.current);
        const y = radius * Math.sin(currentRotationRef.current);
        Plotly.relayout(plotContainerRef.current!, { 'scene.camera.eye': { x, y, z: 0.8 } });
        autoRotateRef.current = requestAnimationFrame(rotate);
      };
      autoRotateRef.current = requestAnimationFrame(rotate);
    } else if (autoRotateRef.current) {
      cancelAnimationFrame(autoRotateRef.current);
    }
    return () => { if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current); };
  }, [isAutoRotating, isXSectionOpen, viewMode]);

  const handleLogClick = (ev: TraumaEvent, index: number) => {
    const id = `ANOMALY-${index}`;
    setLastClickedId(id);
    setIsFlashing(true);
    setIsTargeting(true);
    setHighlightedDepth(ev.depth);
    setCurrentXDepth(ev.depth);
    setIsHighlightPulsing(true);
    setTimeout(() => setIsHighlightPulsing(false), 1500);
    setTimeout(() => setIsFlashing(false), 300);
    setTimeout(() => setIsTargeting(false), 3000);

    if (plotContainerRef.current && viewMode === '3D_SURFACE') {
      Plotly.relayout(plotContainerRef.current, { 
        'scene.camera.center': { x: 0, y: 0, z: ev.depth },
        'scene.camera.eye': { x: 1.2, y: 1.2, z: ev.depth + 0.5 }
      });
    }
  };

  const handleResetFilter = () => {
    setMinDepth(absoluteMinDepth);
    setMaxDepth(absoluteMaxDepth);
  };

  const setViewAngle = (angle: 'top' | 'side' | 'iso') => {
    if (!plotContainerRef.current || isXSectionOpen) return;
    const midZ = (minDepth + maxDepth) / 2;
    const cameraMap = {
      top: { eye: { x: 0, y: 0, z: midZ + 10 }, center: { x: 0, y: 0, z: midZ }, up: { x: 0, y: 1, z: 0 } },
      side: { eye: { x: 4.5, y: 0, z: midZ }, center: { x: 0, y: 0, z: midZ }, up: { x: 0, y: 0, z: 1 } },
      iso: { eye: { x: 2.3, y: 2.3, z: midZ + 5 }, center: { x: 0, y: 0, z: midZ }, up: { x: 0, y: 0, z: 1 } }
    };
    setIsAutoRotating(false);
    Plotly.relayout(plotContainerRef.current, { 'scene.camera': cameraMap[angle] });
  };

  // handleResetFocus added to fix "Cannot find name 'handleResetFocus'" error.
  const handleResetFocus = () => {
    setViewAngle('iso');
    setHighlightedDepth(null);
    setIsTargeting(false);
    setIsAutoRotating(false);
  };

  useEffect(() => {
    if (!plotContainerRef.current) return;
    const fIds = fingerIds;
    const numFingers = fIds.length;
    const traces: any[] = [];

    if (viewMode === 'MFC_HEATMAP') {
      const zData: number[][] = [];
      const primaryLayer = activeLayers[0] || TraumaLayer.DEVIATION;
      
      fIds.forEach(fId => {
        const fingerRow: number[] = [];
        filteredDepths.forEach(d => {
          const point = MOCK_TRAUMA_DATA.find(p => p.depth === d && p.fingerId === fId);
          fingerRow.push(point ? (point as any)[primaryLayer.toLowerCase()] || 0 : 0);
        });
        zData.push(fingerRow);
      });

      traces.push({
        z: zData,
        x: filteredDepths,
        y: fIds,
        type: 'heatmap',
        colorscale: layerConfig[primaryLayer].colorscale,
        showscale: false,
        zsmooth: 'best'
      });

      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 40, r: 20, t: 20, b: 40 },
        xaxis: { gridcolor: '#1e293b', tickfont: { color: '#475569', size: 9 }, title: { text: 'DEPTH (m)', font: { color: '#0f172a', size: 10 } } },
        yaxis: { gridcolor: '#1e293b', tickfont: { color: '#475569', size: 9 }, title: { text: 'FINGER ID', font: { color: '#0f172a', size: 10 } } },
        uirevision: 'true'
      };

      Plotly.react(plotContainerRef.current!, traces, layout, { responsive: true, displayModeBar: false });
      return;
    }

    if (isXSectionOpen) {
      activeLayers.forEach((layer) => {
        const theta: number[] = [];
        const r: number[] = [];
        const layerData = MOCK_TRAUMA_DATA.filter(d => d.depth === currentXDepth);
        fIds.forEach((fId, idx) => {
          const point = layerData.find(d => d.fingerId === fId);
          theta.push((idx / numFingers) * 360);
          r.push(layer === TraumaLayer.DEVIATION ? (point?.deviation || 0) + 50 : 50 + ((point as any)[layer.toLowerCase()] || 0));
        });
        theta.push(theta[0]);
        r.push(r[0]);
        traces.push({
          type: 'scatterpolar', r, theta, fill: 'toself', name: layerConfig[layer].label,
          line: { color: isHighlightPulsing ? '#ffffff' : layerConfig[layer].color, width: 2 },
          opacity: layerOpacities[layer],
          fillcolor: layerConfig[layer].color + '33'
        });
      });
      // Nominal Tubing Overlay
      traces.push({ type: 'scatterpolar', r: Array(361).fill(50), theta: Array.from({length:361}, (_,i)=>i), mode: 'lines', line: { color: '#10b98133', width: 1, dash: 'dot' }, name: 'NOMINAL' });

      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 40, r: 40, t: 40, b: 40 }, showlegend: false,
        polar: {
          bgcolor: '#010409',
          radialaxis: { visible: true, gridcolor: 'rgba(16, 185, 129, 0.1)', tickfont: { size: 8, color: '#064e3b' }, range: [0, 100] },
          angularaxis: { gridcolor: 'rgba(16, 185, 129, 0.1)', tickfont: { size: 8, color: '#064e3b' }, direction: 'clockwise' }
        },
        uirevision: 'true'
      };
      Plotly.react(plotContainerRef.current!, traces, layout, { responsive: true, displayModeBar: false });
    } else {
      const nominalRadius = 50;
      activeLayers.forEach((layer, layerIndex) => {
        const x: number[][]= [], y: number[][]= [], z: number[][]= [], colorValues: number[][] = [];
        const baseRadiusOffset = layerIndex * 2.5;
        filteredDepths.forEach((depth) => {
          const rowX: number[] = [], rowY: number[] = [], rowZ: number[] = [], rowColor: number[] = [];
          for (let i = 0; i <= numFingers; i++) {
            const fingerIdx = i === numFingers ? 0 : i;
            const dataPoint = MOCK_TRAUMA_DATA.find(t => t.depth === depth && t.fingerId === fIds[fingerIdx]);
            const theta = (i / numFingers) * 2 * Math.PI;
            const r = nominalRadius + (dataPoint ? (dataPoint as any)[layer.toLowerCase()] || 0 : 0) + baseRadiusOffset;
            rowX.push(r * Math.cos(theta)); rowY.push(r * Math.sin(theta)); rowZ.push(depth);
            rowColor.push((dataPoint as any)[layer.toLowerCase()] || 0);
          }
          x.push(rowX); y.push(rowY); z.push(rowZ); colorValues.push(rowColor);
        });
        traces.push({
          type: 'surface', x, y, z, surfacecolor: colorValues,
          cmin: layerConfig[layer].min, cmax: layerConfig[layer].max,
          colorscale: layerConfig[layer].colorscale, showscale: false,
          lighting: { ambient: 0.2, diffuse: 0.8, roughness: 0.1 },
          opacity: layerOpacities[layer], 
        });
      });
      
      if (highlightedDepth !== null) {
        const hx: number[] = [], hy: number[] = [], hz: number[] = [];
        for (let i = 0; i <= 64; i++) {
          const theta = (i / 64) * 2 * Math.PI;
          hx.push(100 * Math.cos(theta)); hy.push(100 * Math.sin(theta)); hz.push(highlightedDepth);
        }
        traces.push({ type: 'scatter3d', x: hx, y: hy, z: hz, mode: 'lines', line: { color: isHighlightPulsing ? '#ffffff' : '#ff0000', width: 8 }, showlegend: false });
      }

      const rangeSize = maxDepth - minDepth;
      const zAspect = Math.max(1.5, (10 / Math.max(0.1, rangeSize)) * 4.5);
      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', margin: { l: 0, r: 0, t: 0, b: 0 },
        dragmode: dragMode, uirevision: 'true',
        scene: {
          xaxis: { visible: false }, yaxis: { visible: false },
          zaxis: { gridcolor: 'rgba(16, 185, 129, 0.03)', tickfont: { size: 9, color: '#064e3b' }, range: [minDepth, maxDepth] },
          aspectratio: { x: 1, y: 1, z: zAspect }, bgcolor: '#010409',
        }
      };
      
      if (!isInitializedRef.current) {
          layout.scene.camera = { eye: { x: 2.2, y: 2.2, z: (minDepth + maxDepth) / 2 + 5 }, center: { x: 0, y: 0, z: (minDepth + maxDepth) / 2 }, up: { x: 0, y: 0, z: 1 } };
          Plotly.newPlot(plotContainerRef.current!, traces, layout, { responsive: true, displayModeBar: false });
          isInitializedRef.current = true;
      } else {
          Plotly.react(plotContainerRef.current!, traces, layout, { responsive: true, displayModeBar: false });
      }
    }
  }, [activeLayers, layerOpacities, isXSectionOpen, dragMode, highlightedDepth, isHighlightPulsing, currentXDepth, filteredDepths, minDepth, maxDepth, viewMode]);

  const Tooltip = ({ label, desc }: { label: string, desc: string }) => (
    <div className="absolute left-full ml-3 w-max px-3 py-1.5 bg-slate-950 border border-emerald-500/50 rounded shadow-[0_0_15px_rgba(16,185,129,0.2)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[100] transform translate-x-[-10px] group-hover:translate-x-0">
      <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">{label}</div>
      <div className="text-[7px] font-mono text-emerald-700 uppercase whitespace-nowrap">{desc}</div>
      <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-950 border-b border-l border-emerald-500/50 rotate-45"></div>
    </div>
  );

  return (
    <div className={`flex flex-col h-full p-4 bg-slate-900/50 border rounded-lg overflow-hidden relative shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isFocused ? 'border-emerald-400/80 ring-4 ring-emerald-500/20' : 'border-emerald-900/40 hover:border-emerald-500/60'} ${isFlashing ? 'bg-orange-500/15 border-orange-500/80 shadow-[0_0_120px_rgba(255,95,31,0.15)]' : ''} ${isShaking ? 'animate-shake' : ''}`} onClick={() => { if(!isFocused && onToggleFocus) onToggleFocus(); }}>
      
      {!isFocused && (
        <div className="absolute inset-0 bg-emerald-500/0 hover:bg-emerald-500/5 cursor-pointer z-[55] flex items-center justify-center transition-all group">
           <div className="bg-slate-950/90 border border-emerald-500/30 px-6 py-3 rounded-full flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 transform duration-300">
              <Sparkles size={16} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Engage Forensic Focus</span>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 z-20">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded relative shadow-[0_0_15px_rgba(16,185,129,0.1)] group">
            <Scan size={20} className="text-emerald-500 group-hover:animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-emerald-400 font-terminal uppercase tracking-tighter text-glow-emerald">Trauma Node</h2>
              {isFocused && <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[8px] font-black rounded uppercase tracking-widest">Focused</span>}
            </div>
            <span className="text-[9px] text-emerald-800 font-terminal uppercase tracking-[0.5em] font-black">Multi-Finger Caliper Analyzer v2.5</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
           <div className={`flex bg-slate-950/90 border border-emerald-900/40 rounded p-1 space-x-1 shadow-2xl backdrop-blur-md transition-all ${!isFocused ? 'opacity-40 grayscale' : 'opacity-100'}`}>
             <div className="relative group flex items-center">
               <button onClick={(e) => { e.stopPropagation(); setViewMode(prev => prev === '3D_SURFACE' ? 'MFC_HEATMAP' : '3D_SURFACE'); isInitializedRef.current = false; }} className={`p-2 rounded transition-all ${viewMode === 'MFC_HEATMAP' ? 'bg-orange-500 text-slate-950 shadow-[0_0_10px_#f97316]' : 'text-emerald-800 hover:text-emerald-400'}`}>
                 <Grid3X3 size={14} />
               </button>
               <Tooltip label="VIEW MODE" desc="Toggle Surface/Heatmap" />
             </div>
             <div className="w-px h-5 bg-emerald-900/30 my-auto"></div>
             {Object.entries(layerConfig).map(([key, cfg]) => (
               <div key={key} className="relative group flex items-center">
                 <button onClick={(e) => { e.stopPropagation(); setActiveLayers([key as TraumaLayer]); }} className={`p-2 rounded transition-all ${activeLayers.includes(key as TraumaLayer) ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-emerald-800 hover:text-emerald-600'}`}>
                   {cfg.icon}
                 </button>
                 <Tooltip label={cfg.label} desc={`Unit: ${cfg.unit}`} />
               </div>
             ))}
           </div>
           {onToggleFocus && (
             <button onClick={(e) => { e.stopPropagation(); onToggleFocus(); }} className={`p-2.5 rounded transition-all shadow-xl z-[60] flex items-center space-x-2 ${isFocused ? 'bg-red-500/10 border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-slate-950' : 'bg-slate-950/90 border border-emerald-900/40 text-emerald-400'}`}>
               {isFocused ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
             </button>
           )}
        </div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 relative">
        <div className="flex-1 min-h-0 relative bg-slate-950/95 rounded-xl border border-emerald-900/20 overflow-hidden group shadow-inner transition-all duration-500">
          {isTargeting && (
            <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
              <div className="relative w-[400px] h-[400px]">
                <div className="absolute inset-0 border-2 border-orange-500/40 rounded-full animate-ping"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <TargetReticle size={140} className="text-orange-500 opacity-40" />
                   <div className="absolute text-[13px] font-black text-orange-400 tracking-[0.8em] mt-48 uppercase animate-pulse">Locus_Engaged</div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-6 left-6 z-20 flex flex-col space-y-4">
             <div className="flex flex-col space-y-1.5 bg-slate-900/95 border border-emerald-900/40 rounded-lg p-2.5 shadow-2xl backdrop-blur-md">
                <div className="relative group">
                  <button onClick={(e) => { e.stopPropagation(); setIsXSectionOpen(!isXSectionOpen); isInitializedRef.current = false; }} className={`p-2.5 rounded transition-all ${isXSectionOpen ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800'}`}>
                    {isXSectionOpen ? <Circle size={18} /> : <Box size={18} />}
                  </button>
                  <Tooltip label="X-SECTION" desc="Toggle Radial Cross-Section" />
                </div>
             </div>
             
             {viewMode === '3D_SURFACE' && !isXSectionOpen && (
               <div className="flex flex-col space-y-1.5 bg-slate-900/95 border border-emerald-900/40 rounded-lg p-2.5 shadow-2xl backdrop-blur-md">
                  <button onClick={(e) => { e.stopPropagation(); setDragMode('orbit'); }} className={`p-2.5 rounded ${dragMode === 'orbit' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800'}`}><MousePointer2 size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setDragMode('pan'); }} className={`p-2.5 rounded ${dragMode === 'pan' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800'}`}><Move size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setIsAutoRotating(!isAutoRotating); }} className={`p-2.5 rounded mt-2 ${isAutoRotating ? 'bg-orange-500 text-slate-950 animate-pulse' : 'text-emerald-800'}`}>{isAutoRotating ? <Pause size={18} /> : <Play size={18} />}</button>
                  <div className="h-px bg-emerald-900/20 my-2 mx-1"></div>
                  <button onClick={(e) => { e.stopPropagation(); handleResetFocus(); }} className="p-2.5 text-emerald-800 hover:text-emerald-400"><RefreshCcw size={18} /></button>
               </div>
             )}
          </div>

          <div ref={plotContainerRef} className="w-full h-full z-10" />
        </div>

        <div className={`flex flex-col bg-slate-950/95 border border-emerald-900/50 rounded-xl p-5 z-10 overflow-hidden relative space-y-6 shadow-2xl transition-all duration-500 ${isFocused ? 'w-[480px]' : 'w-full md:w-80 opacity-40 grayscale pointer-events-none'}`}>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
              <div className="flex items-center space-x-3">
                <AlertCircle size={20} className="text-orange-500" />
                <h3 className="text-[14px] font-black text-emerald-400 uppercase tracking-[0.2em]">MFC Anomalies</h3>
              </div>
              <div className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/40 text-orange-500 text-[9px] font-black rounded uppercase">{anomalies.length} Critical</div>
            </div>
            
            <div className="flex-1 overflow-y-auto font-terminal text-[11px] space-y-3 pr-2 custom-scrollbar max-h-[280px]">
              {anomalies.map((ev, i) => {
                const isActive = highlightedDepth === ev.depth;
                return (
                  <div key={i} onClick={() => handleLogClick(ev, i)} className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${isActive ? 'bg-slate-900 border-orange-500 ring-2 ring-orange-500/20' : 'bg-slate-950/60 border-emerald-900/40 hover:border-emerald-500/50'}`}>
                    <div className="flex justify-between items-center text-[10px] font-bold mb-2">
                      <span className={`flex items-center ${isActive ? 'text-orange-400' : 'text-emerald-800'}`}>
                        <Target size={14} className="mr-2" /> {ev.depth.toFixed(2)}m
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest ${ev.layer === 'OVALITY' ? 'bg-red-500 text-slate-950' : 'bg-orange-500/20 text-orange-400'}`}>{ev.layer}</span>
                    </div>
                    <div className="text-[10px] text-emerald-100 italic leading-snug">"{ev.description}"</div>
                    {isActive && <div className="mt-3 h-0.5 bg-orange-500/40 animate-pulse"></div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col space-y-4 border-t border-emerald-900/40 pt-5">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
              <div className="flex items-center space-x-3">
                <Filter size={20} className="text-emerald-500" />
                <h3 className="text-[14px] font-black text-emerald-400 uppercase tracking-[0.2em]">Filter Window</h3>
              </div>
              <button onClick={handleResetFilter} className="text-[9px] font-black text-emerald-800 hover:text-emerald-400"><RefreshCcw size={12} /></button>
            </div>
            <div className="space-y-4">
               <div className="p-3 bg-slate-900/60 rounded-lg border border-emerald-900/20">
                 <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-emerald-900 mb-2">
                   <span>Scan Start (m)</span>
                   <span className="text-emerald-400">{minDepth.toFixed(1)}</span>
                 </div>
                 <input type="range" min={absoluteMinDepth} max={maxDepth - 0.1} step="0.1" value={minDepth} onChange={(e) => setMinDepth(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-800 appearance-none rounded-full accent-emerald-500" />
               </div>
               <div className="p-3 bg-slate-900/60 rounded-lg border border-emerald-900/20">
                 <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-emerald-900 mb-2">
                   <span>Scan End (m)</span>
                   <span className="text-emerald-400">{maxDepth.toFixed(1)}</span>
                 </div>
                 <input type="range" min={minDepth + 0.1} max={absoluteMaxDepth} step="0.1" value={maxDepth} onChange={(e) => setMaxDepth(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-800 appearance-none rounded-full accent-emerald-500" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraumaNode;
