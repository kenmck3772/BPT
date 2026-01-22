import React, { useMemo, useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { MOCK_TRAUMA_DATA } from '../constants';
import { TraumaLayer, TraumaEvent, TraumaData } from '../types';
import { 
  Zap, Layers, Thermometer, Droplets, Beaker, Terminal, 
  Box, Target, Scan,
  Eye, EyeOff, Activity,
  Maximize2, Minimize2, Navigation, 
  Sparkles, Grid3X3, AlertCircle, Fingerprint,
  Sliders, Scissors, Navigation2, Shield, Crosshair,
  Map, RefreshCcw, SearchCode, Ruler, Compass
} from 'lucide-react';

const layerToKey: Record<TraumaLayer, keyof Omit<TraumaData, 'fingerId' | 'depth'>> = {
  [TraumaLayer.DEVIATION]: 'deviation',
  [TraumaLayer.CORROSION]: 'corrosion',
  [TraumaLayer.TEMPERATURE]: 'temperature',
  [TraumaLayer.WALL_LOSS]: 'wallLoss',
  [TraumaLayer.WATER_LEAKAGE]: 'waterLeakage',
  [TraumaLayer.STRESS]: 'stress',
  [TraumaLayer.ICI]: 'ici',
};

interface TraumaNodeProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const TraumaNode: React.FC<TraumaNodeProps> = ({ isFocused = false, onToggleFocus }) => {
  const plotContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const autoRotateRef = useRef<number | null>(null);
  const currentRotationRef = useRef(0);
  const scanBeamIntervalRef = useRef<number | null>(null);
  
  const allDepths = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.depth))).sort((a, b) => a - b), []);
  const fingerIds = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.fingerId))).sort((a, b) => a - b), []);
  const absoluteMinDepth = allDepths[0];
  const absoluteMaxDepth = allDepths[allDepths.length - 1];

  const [activeLayers, setActiveLayers] = useState<TraumaLayer[]>([TraumaLayer.DEVIATION, TraumaLayer.WALL_LOSS]);
  const [viewMode, setViewMode] = useState<'3D_SURFACE' | 'MFC_HEATMAP' | 'CROSS_SECTION'>('3D_SURFACE');
  const [layerOpacities, setLayerOpacities] = useState<Record<TraumaLayer, number>>({
    [TraumaLayer.DEVIATION]: 0.9,
    [TraumaLayer.CORROSION]: 0.7,
    [TraumaLayer.WALL_LOSS]: 0.85,
    [TraumaLayer.STRESS]: 0.9, 
    [TraumaLayer.WATER_LEAKAGE]: 0.85,
    [TraumaLayer.TEMPERATURE]: 0.6,
    [TraumaLayer.ICI]: 0.75,
  });
  
  const [minDepth, setMinDepth] = useState<number>(absoluteMinDepth);
  const [maxDepth, setMaxDepth] = useState<number>(absoluteMaxDepth);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [scanBeamDepth, setScanBeamDepth] = useState<number>(absoluteMinDepth);

  const [highlightedDepth, setHighlightedDepth] = useState<number | null>(null);
  const [isHighlightPulsing, setIsHighlightPulsing] = useState(false);
  const [isTargeting, setIsTargeting] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  const filteredDepths = useMemo(() => 
    allDepths.filter(d => d >= minDepth && d <= maxDepth), 
    [allDepths, minDepth, maxDepth]
  );
  
  const [currentXDepth, setCurrentXDepth] = useState<number>(allDepths[0]);

  // Dynamic Laser Scan Beam Logic
  useEffect(() => {
    let depth = absoluteMinDepth;
    let dir = 1;
    const interval = window.setInterval(() => {
      depth += 0.05 * dir;
      if (depth >= absoluteMaxDepth) dir = -1;
      if (depth <= absoluteMinDepth) dir = 1;
      setScanBeamDepth(depth);
    }, 50);
    scanBeamIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [absoluteMinDepth, absoluteMaxDepth]);

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
          timestamp: 'AUTO_DETECT', layer: 'OVALITY', depth: d, value: ovality, unit: 'mm', severity: 'CRITICAL',
          description: `Severe tubing ovality detected. Max deformation: ${maxDev.toFixed(2)}mm`
        });
      }

      const maxWallLoss = Math.max(...dataAtDepth.map(p => p.wallLoss));
      if (maxWallLoss > 20) {
        results.push({
          timestamp: 'AUTO_DETECT', layer: 'WALL_LOSS', depth: d, value: maxWallLoss, unit: '%', severity: 'CRITICAL',
          description: `Critical wall depletion (${maxWallLoss.toFixed(1)}%) identified. Forensic analysis suggests structural integrity breach.`
        });
      }
    });
    return results;
  }, [allDepths]);

  const layerConfig = {
    [TraumaLayer.DEVIATION]: { 
      label: 'Caliper Deviation', unit: 'mm', min: 0, max: 5, 
      colorscale: [[0, '#020617'], [0.3, '#064e3b'], [0.4, '#10b981'], [1, '#ffffff']], 
      color: '#10b981', icon: <Fingerprint size={14} /> 
    },
    [TraumaLayer.WALL_LOSS]: { 
      label: 'Wall Depletion', unit: '%', min: 0, max: 25, 
      colorscale: [[0, '#020617'], [0.2, '#1e1b4b'], [0.5, '#4c1d95'], [0.8, '#ec4899'], [1, '#ffffff']], 
      color: '#ec4899', icon: <Layers size={14} /> 
    },
    [TraumaLayer.STRESS]: { 
      label: 'Stress Field', unit: 'kpsi', min: 0, max: 100, 
      colorscale: [[0, '#020617'], [0.3, '#312e81'], [0.6, '#c026d3'], [1, '#ffffff']], 
      color: '#c026d3', icon: <Activity size={14} /> 
    },
    [TraumaLayer.ICI]: { 
      label: 'Internal Corrosion Index', unit: 'ICI', min: 0, max: 100, 
      colorscale: [[0, '#020617'], [0.5, '#71710a'], [1, '#facc15']], 
      color: '#facc15', icon: <Shield size={14} /> 
    },
    [TraumaLayer.CORROSION]: { label: 'MFC Corrosion', unit: 'ici', min: 0, max: 100, colorscale: [[0, '#020617'], [0.2, '#451a03'], [1, '#fdba74']], color: '#ea580c', icon: <Beaker size={14} /> },
    [TraumaLayer.WATER_LEAKAGE]: { 
      label: 'Leakage Flux', unit: 'FLUX', min: 0, max: 100, 
      colorscale: [[0, '#020617'], [0.4, '#0d9488'], [1, '#ffffff']], 
      color: '#22d3ee', icon: <Droplets size={14} /> 
    },
    [TraumaLayer.TEMPERATURE]: { label: 'Thermal Profile', unit: '°C', min: 60, max: 100, colorscale: [[0, '#020617'], [0.5, '#4338ca'], [1, '#ffffff']], color: '#ec4899', icon: <Thermometer size={14} /> }
  };

  useEffect(() => {
    if (!plotContainerRef.current) return;
    const observer = new ResizeObserver(() => Plotly.Plots.resize(plotContainerRef.current!));
    observer.observe(plotContainerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAutoRotating && viewMode === '3D_SURFACE' && plotContainerRef.current) {
      const rotate = () => {
        currentRotationRef.current += 0.005;
        const radius = 2.4;
        const x = radius * Math.cos(currentRotationRef.current);
        const y = radius * Math.sin(currentRotationRef.current);
        Plotly.relayout(plotContainerRef.current!, { 'scene.camera.eye': { x, y, z: 0.8 } });
        autoRotateRef.current = requestAnimationFrame(rotate);
      };
      autoRotateRef.current = requestAnimationFrame(rotate);
    } else if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current);
    return () => { if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current); };
  }, [isAutoRotating, viewMode]);

  const handleLogClick = (ev: TraumaEvent) => {
    setIsFlashing(true); setIsTargeting(true); setIsShaking(true); setIsHighlightPulsing(true);
    setHighlightedDepth(ev.depth); setCurrentXDepth(ev.depth);
    if (plotContainerRef.current && viewMode === '3D_SURFACE') {
      Plotly.relayout(plotContainerRef.current, { 
        'scene.camera.center': { x: 0, y: 0, z: ev.depth },
        'scene.camera.eye': { x: 1.8, y: 1.8, z: ev.depth + 0.5 }
      });
    }
    setTimeout(() => setIsHighlightPulsing(false), 3000);
    setTimeout(() => setIsFlashing(false), 400);
    setTimeout(() => setIsShaking(false), 600);
    setTimeout(() => setIsTargeting(false), 4500);
  };

  const handleResetFocus = () => {
    if (!plotContainerRef.current) return;
    const midZ = (minDepth + maxDepth) / 2;
    if (viewMode === '3D_SURFACE') {
        Plotly.relayout(plotContainerRef.current, { 
            'scene.camera': { eye: { x: 2.2, y: 2.2, z: midZ + 5 }, center: { x: 0, y: 0, z: midZ }, up: { x: 0, y: 0, z: 1 } }
        });
    }
    setHighlightedDepth(null); setIsTargeting(false); setIsAutoRotating(false);
  };

  const toggleLayer = (layer: TraumaLayer) => {
    setActiveLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]);
  };

  const handleOpacityChange = (layer: TraumaLayer, value: number) => {
    setLayerOpacities(prev => ({ ...prev, [layer]: value }));
  };

  useEffect(() => {
    if (!plotContainerRef.current) return;
    const fIds = fingerIds;
    const numFingers = fIds.length;
    const traces: any[] = [];

    if (viewMode === 'MFC_HEATMAP') {
      const zData: number[][] = [];
      const primaryLayer = activeLayers[0] || TraumaLayer.DEVIATION;
      const dataKey = layerToKey[primaryLayer];
      fIds.forEach(fId => {
        const fingerRow: number[] = [];
        filteredDepths.forEach(d => {
          const point = MOCK_TRAUMA_DATA.find(p => p.depth === d && p.fingerId === fId);
          fingerRow.push(point ? (point as any)[dataKey] || 0 : 0);
        });
        zData.push(fingerRow);
      });
      traces.push({
        z: zData, x: filteredDepths, y: fIds, type: 'heatmap',
        colorscale: layerConfig[primaryLayer].colorscale, showscale: false, zsmooth: 'best'
      });
      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 40, r: 20, t: 20, b: 40 },
        xaxis: { gridcolor: '#1e293b', tickfont: { color: '#475569', size: 9 }, title: { text: 'DEPTH (m)', font: { color: '#475569', size: 10 } } },
        yaxis: { gridcolor: '#1e293b', tickfont: { color: '#475569', size: 9 }, title: { text: 'FINGER ID', font: { color: '#475569', size: 10 } } },
        uirevision: 'true'
      };
      Plotly.react(plotContainerRef.current!, traces, layout, { responsive: true, displayModeBar: false });
      return;
    }

    if (viewMode === 'CROSS_SECTION') {
        const primaryLayer = activeLayers[0] || TraumaLayer.DEVIATION;
        const dataKey = layerToKey[primaryLayer];
        const layerData = MOCK_TRAUMA_DATA.filter(d => d.depth === currentXDepth);
        const angles: number[] = [];
        const radii: number[] = [];
        const colors: number[] = [];
        fIds.forEach((fId, idx) => {
            const point = layerData.find(d => d.fingerId === fId);
            angles.push((idx / numFingers) * 360);
            radii.push(50 + ((point as any)[dataKey] || 0));
            colors.push((point as any)[dataKey] || 0);
        });
        traces.push({
            type: 'barpolar', r: radii, theta: angles, marker: {
                color: colors, colorscale: layerConfig[primaryLayer].colorscale,
                cmin: layerConfig[primaryLayer].min, cmax: layerConfig[primaryLayer].max,
                line: { color: '#010409', width: 0.5 }
            },
            width: (360 / numFingers) * 0.9, opacity: layerOpacities[primaryLayer]
        });
        traces.push({
            type: 'scatterpolar', r: Array(361).fill(50), theta: Array.from({length: 361}, (_, i) => i),
            mode: 'lines', line: { color: '#10b981', width: 1.5, dash: 'dot' }, opacity: 0.4
        });
        const layout: any = {
            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 20, r: 20, t: 20, b: 20 }, showlegend: false,
            polar: {
                bgcolor: '#010409',
                radialaxis: { visible: true, gridcolor: 'rgba(16, 185, 129, 0.1)', tickfont: { size: 8, color: '#064e3b' }, range: [0, 95], gridwidth: 1 },
                angularaxis: { gridcolor: 'rgba(16, 185, 129, 0.1)', tickfont: { size: 8, color: '#064e3b' }, direction: 'clockwise', gridwidth: 1 }
            },
            uirevision: 'true'
        };
        Plotly.react(plotContainerRef.current!, traces, layout, { responsive: true, displayModeBar: false });
        return;
    }

    if (viewMode === '3D_SURFACE') {
      // 1. Holographic Calibration Aura (Faint Spatial Grid)
      const gridSegments = 16;
      for (let i = 0; i <= gridSegments; i++) {
        const depth = minDepth + (maxDepth - minDepth) * (i / gridSegments);
        const circleX: number[]=[], circleY: number[]=[], circleZ: number[]=[];
        for (let j=0; j<=36; j++) {
            const t=(j/36)*2*Math.PI;
            circleX.push(185 * Math.cos(t)); circleY.push(185 * Math.sin(t)); circleZ.push(depth);
        }
        traces.push({
            type: 'scatter3d', x: circleX, y: circleY, z: circleZ, mode: 'lines',
            line: { color: 'rgba(16, 185, 129, 0.08)', width: 1 }, showlegend: false
        });
      }

      // 2. High-Sheen Metallic Surface Rendering
      activeLayers.forEach((layer, idx) => {
        const x: number[][]=[], y: number[][]=[], z: number[][]=[], colorValues: number[][]=[];
        const baseRadiusOffset = idx * 3.5; 
        const dataKey = layerToKey[layer];
        
        filteredDepths.forEach((depth) => {
          const rowX: number[]=[], rowY: number[]=[], rowZ: number[]=[], rowColor: number[]=[];
          for (let i = 0; i <= numFingers; i++) {
            const fingerIdx = i === numFingers ? 0 : i;
            const dataPoint = MOCK_TRAUMA_DATA.find(t => t.depth === depth && t.fingerId === fIds[fingerIdx]);
            const theta = (i / numFingers) * 2 * Math.PI;
            const val = (dataPoint as any)[dataKey] || 0;
            const r = 50 + val + baseRadiusOffset;
            rowX.push(r * Math.cos(theta)); rowY.push(r * Math.sin(theta)); rowZ.push(depth);
            rowColor.push(val);
          }
          x.push(rowX); y.push(rowY); z.push(rowZ); colorValues.push(rowColor);
        });

        traces.push({
          type: 'surface', x, y, z, surfacecolor: colorValues,
          colorscale: layerConfig[layer].colorscale, showscale: false,
          opacity: layerOpacities[layer], 
          lighting: { 
            ambient: 0.04,      // High shadow contrast
            diffuse: 0.4,       // Subtle shape scatter
            specular: 4.8,      // Brilliant glints
            roughness: 0.02,    // Polished mirror finish
            fresnel: 10.0       // Neon edge rim-lighting
          },
          lightposition: { x: 20000, y: 15000, z: 10000 } // Extreme point source for directional highlights
        });
      });
      
      // Target Lock Highlighter
      if (highlightedDepth !== null) {
        const segments = 120;
        const hx: number[]=[], hy: number[]=[], hz: number[]=[];
        for (let i=0; i<=segments; i++){ 
          const t=(i/segments)*2*Math.PI; 
          hx.push(115 * Math.cos(t)); hy.push(115 * Math.sin(t)); hz.push(highlightedDepth); 
        }
        traces.push({ 
          type: 'scatter3d', x: hx, y: hy, z: hz, mode: 'lines', 
          line: { color: '#ff0000', width: 22 }, showlegend: false 
        });
      }

      // Laser Forensic Scan Beam
      const sbX: number[]=[], sbY: number[]=[], sbZ: number[]=[];
      for (let i=0; i<=64; i++){
        const t=(i/64)*2*Math.PI;
        sbX.push(150 * Math.cos(t)); sbY.push(150 * Math.sin(t)); sbZ.push(scanBeamDepth);
      }
      traces.push({
        type: 'scatter3d', x: sbX, y: sbY, z: sbZ, mode: 'lines',
        line: { color: '#22d3ee', width: 3, dash: 'solid' },
        opacity: 0.6, showlegend: false
      });

      const rangeSize = maxDepth - minDepth;
      const zAspect = Math.max(1.5, (10 / Math.max(0.1, rangeSize)) * 4.5);
      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', margin: { l: 0, r: 0, t: 0, b: 0 },
        dragmode: 'orbit', uirevision: 'true',
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
  }, [activeLayers, layerOpacities, viewMode, highlightedDepth, isHighlightPulsing, currentXDepth, filteredDepths, minDepth, maxDepth, scanBeamDepth]);

  return (
    <div className={`flex flex-col h-full p-4 bg-slate-900/50 border rounded-lg overflow-hidden relative shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isFocused ? 'border-emerald-400/80 ring-4 ring-emerald-500/20' : 'border-emerald-900/40 hover:border-emerald-500/60'} ${isFlashing ? 'bg-orange-500/10 border-orange-500/80' : ''} ${isShaking ? 'animate-shake' : ''}`} onClick={() => { if(!isFocused && onToggleFocus) onToggleFocus(); }}>
      
      {!isFocused && (
        <div className="absolute inset-0 bg-emerald-500/0 hover:bg-emerald-500/5 cursor-pointer z-[55] flex items-center justify-center transition-all group">
           <div className="bg-slate-950/90 border border-emerald-500/30 px-6 py-3 rounded-full flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity transform duration-300">
              <Sparkles size={16} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Engage Workspace Focus</span>
           </div>
        </div>
      )}

      {isTargeting && (
        <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center bg-slate-950/30 backdrop-blur-[2px]">
           <div className="relative w-[500px] h-[500px] flex items-center justify-center">
              <div className="absolute inset-0 border-[0.5px] border-orange-500/40 rounded-full animate-forensic-ping opacity-0"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-slate-950/90 border border-orange-500/50 p-6 rounded-lg shadow-[0_0_50px_rgba(249,115,22,0.4)]">
                 <Crosshair size={64} className="text-orange-500 animate-pulse" />
                 <span className="text-[14px] font-black text-orange-400 tracking-[0.6em] uppercase mt-4">Target_Locked</span>
                 <div className="px-4 py-1.5 bg-orange-500 text-slate-950 font-terminal font-black text-xs rounded-sm mt-2">DEPTH: {highlightedDepth?.toFixed(2)}m</div>
              </div>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 z-20">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded relative shadow-[0_0_15px_rgba(16,185,129,0.1)] group">
            <Scan size={20} className="text-emerald-500 group-hover:animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 font-terminal uppercase tracking-tighter text-glow-emerald">Trauma Node</h2>
            <span className="text-[9px] text-emerald-800 font-terminal uppercase tracking-[0.5em] font-black">High-Gloss Forensic Render v2.2</span>
          </div>
        </div>
        <div className="flex space-x-2">
           <button onClick={(e) => { e.stopPropagation(); handleResetFocus(); }} className="p-2.5 rounded bg-slate-950/90 border border-emerald-900/40 text-emerald-800 hover:text-emerald-400 transition-all shadow-xl z-[60]"><Target size={20} /></button>
           {onToggleFocus && (
             <button onClick={(e) => { e.stopPropagation(); onToggleFocus(); }} className={`p-2.5 rounded transition-all shadow-xl z-[60] flex items-center space-x-2 ${isFocused ? 'bg-red-500/10 border border-red-500/40 text-red-500' : 'bg-slate-950/90 border border-emerald-900/40 text-emerald-400'}`}>
               {isFocused ? <Minimize2 size={20} /> : <Maximize2 size={16} />}
             </button>
           )}
        </div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 relative">
        <div className="flex-1 min-h-0 relative bg-slate-950/95 rounded-xl border border-emerald-900/20 overflow-hidden group shadow-inner transition-all duration-500">
          <div className="absolute top-6 left-6 z-20 flex flex-col space-y-4">
             <div className="flex flex-col space-y-1.5 bg-slate-900/95 border border-emerald-900/40 rounded-lg p-2.5 shadow-2xl backdrop-blur-md">
                <button onClick={(e) => { e.stopPropagation(); setViewMode('3D_SURFACE'); isInitializedRef.current = false; }} className={`p-2.5 rounded transition-all ${viewMode === '3D_SURFACE' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_#10b981]' : 'text-emerald-800 hover:text-emerald-400'}`}><Box size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); setViewMode('CROSS_SECTION'); isInitializedRef.current = false; }} className={`p-2.5 rounded transition-all ${viewMode === 'CROSS_SECTION' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_#10b981]' : 'text-emerald-800 hover:text-emerald-400'}`}><Scissors size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); setViewMode('MFC_HEATMAP'); isInitializedRef.current = false; }} className={`p-2.5 rounded transition-all ${viewMode === 'MFC_HEATMAP' ? 'bg-orange-500 text-slate-950 shadow-[0_0_15px_#f97316]' : 'text-emerald-800 hover:text-orange-500'}`}><Grid3X3 size={18} /></button>
             </div>
          </div>
          <div className="absolute top-6 right-6 z-20 flex flex-col items-end space-y-2 pointer-events-none">
             <div className="flex items-center space-x-2 bg-slate-950/90 border border-emerald-500/20 px-3 py-1 rounded shadow-xl">
                <SearchCode size={12} className="text-cyan-400" />
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Scanning: {scanBeamDepth.toFixed(2)}m</span>
             </div>
             <div className="flex items-center space-x-2 bg-slate-950/90 border border-emerald-500/20 px-3 py-1 rounded shadow-xl">
                <Compass size={12} className="text-emerald-800" />
                <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Renderer: Metallic_Obsidian</span>
             </div>
          </div>
          <div ref={plotContainerRef} className="w-full h-full z-10" />
        </div>

        <div className={`flex flex-col bg-slate-950/95 border border-emerald-900/50 rounded-xl p-5 z-10 overflow-hidden relative space-y-6 shadow-2xl transition-all duration-500 ${isFocused ? 'w-[480px]' : 'w-full md:w-80'}`}>
          <div className="flex flex-col space-y-4 border-b border-emerald-900/40 pb-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Sliders size={20} className="text-emerald-500" />
                <h3 className="text-[14px] font-black text-emerald-400 uppercase tracking-[0.2em]">Diagnostic Grid</h3>
              </div>
              <button onClick={() => setLayerOpacities(Object.fromEntries(Object.keys(layerConfig).map(k => [k, 0.8])))} className="text-[9px] font-black text-emerald-800 hover:text-emerald-400 transition-colors"><RefreshCcw size={12} /></button>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {Object.entries(layerConfig).map(([key, cfg]) => {
                const layer = key as TraumaLayer;
                const isActive = activeLayers.includes(layer);
                return (
                  <div key={layer} className={`p-3 rounded-lg border transition-all duration-300 relative overflow-hidden group/layer ${isActive ? 'bg-slate-900 border-emerald-500/30' : 'bg-slate-950 border-emerald-900/10 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 truncate">
                         <div className={`p-1 rounded ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-emerald-900'}`}>{cfg.icon}</div>
                         <span className={`text-[10px] font-black uppercase tracking-tight truncate ${isActive ? 'text-emerald-50' : 'text-emerald-900'}`}>{cfg.label}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleLayer(layer); }} className={`p-1.5 transition-colors ${isActive ? 'text-emerald-400' : 'text-emerald-900 hover:text-emerald-400'}`}>
                        {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={layerOpacities[layer]} onClick={(e) => e.stopPropagation()} onChange={(e) => handleOpacityChange(layer, parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 appearance-none cursor-pointer rounded-full accent-emerald-500" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col space-y-4 flex-1 min-h-0">
            <h3 className="text-[14px] font-black text-emerald-400 uppercase tracking-[0.2em]">MFC Alerts</h3>
            <div className="flex-1 overflow-y-auto font-terminal text-[11px] space-y-3 pr-2 custom-scrollbar">
              {anomalies.map((ev, i) => (
                <div key={i} onClick={(e) => { e.stopPropagation(); handleLogClick(ev); }} className={`p-4 bg-slate-900/40 border rounded cursor-pointer transition-all relative overflow-hidden group/alert ${highlightedDepth === ev.depth ? 'border-orange-500 bg-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-emerald-900/20 hover:border-emerald-500/50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-black tracking-tighter transition-all duration-300 ${highlightedDepth === ev.depth ? 'text-orange-400 scale-125 transform origin-left' : 'text-emerald-800'}`}>@{ev.depth.toFixed(2)}m</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black transition-all ${ev.severity === 'CRITICAL' ? 'bg-red-500 text-slate-950 shadow-[0_0_15px_#ef4444]' : 'bg-orange-500/30 text-orange-400'}`}>{ev.layer}</span>
                  </div>
                  <div className={`text-[11px] leading-relaxed italic transition-colors duration-300 ${highlightedDepth === ev.depth ? 'text-white' : 'text-emerald-100/60'}`}>{ev.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraumaNode;