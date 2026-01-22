
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
  Map, RefreshCcw, SearchCode, Ruler, Compass,
  CheckSquare, Square, MousePointer2, Percent, 
  Disc, BarChart4, ChevronDown, ChevronRight,
  Trash2, HardDrive
} from 'lucide-react';

const layerToKey: Record<TraumaLayer, keyof Omit<TraumaData, 'fingerId' | 'depth'>> = {
  [TraumaLayer.DEVIATION]: 'deviation',
  [TraumaLayer.CORROSION]: 'corrosion',
  [TraumaLayer.TEMPERATURE]: 'temperature',
  [TraumaLayer.WALL_LOSS]: 'wallLoss',
  [TraumaLayer.WATER_LEAKAGE]: 'waterLeakage',
  [TraumaLayer.STRESS]: 'stress',
  [TraumaLayer.ICI]: 'ici',
  [TraumaLayer.METAL_LOSS]: 'metalLoss',
  [TraumaLayer.OVALITY]: 'ovality'
};

// Added layerConfig to resolve missing name and property access errors
const layerConfig: Record<TraumaLayer, {
  label: string;
  unit: string;
  colorscale: string;
  min: number;
  max: number;
  icon: React.ReactNode;
  color: string;
  category: 'Structural' | 'Environmental';
}> = {
  [TraumaLayer.DEVIATION]: {
    label: 'Axis Deviation',
    unit: 'deg',
    colorscale: 'Viridis',
    min: 0,
    max: 5,
    icon: <Navigation size={14} />,
    color: '#10b981',
    category: 'Structural'
  },
  [TraumaLayer.CORROSION]: {
    label: 'Wall Corrosion',
    unit: '%',
    colorscale: 'YlOrRd',
    min: 0,
    max: 100,
    icon: <Beaker size={14} />,
    color: '#f59e0b',
    category: 'Structural'
  },
  [TraumaLayer.TEMPERATURE]: {
    label: 'Thermal Flux',
    unit: '°C',
    colorscale: 'Hot',
    min: 20,
    max: 120,
    icon: <Thermometer size={14} />,
    color: '#ef4444',
    category: 'Environmental'
  },
  [TraumaLayer.WALL_LOSS]: {
    label: 'Wall Thinning',
    unit: 'mm',
    colorscale: 'Reds',
    min: 0,
    max: 25,
    icon: <Scissors size={14} />,
    color: '#dc2626',
    category: 'Structural'
  },
  [TraumaLayer.WATER_LEAKAGE]: {
    label: 'Fluid Ingress',
    unit: 'l/min',
    colorscale: 'Blues',
    min: 0,
    max: 100,
    icon: <Droplets size={14} />,
    color: '#3b82f6',
    category: 'Environmental'
  },
  [TraumaLayer.STRESS]: {
    label: 'Stress Load',
    unit: 'kpsi',
    colorscale: 'Electric',
    min: 0,
    max: 100,
    icon: <Activity size={14} />,
    color: '#8b5cf6',
    category: 'Structural'
  },
  [TraumaLayer.ICI]: {
    label: 'ICI Index',
    unit: 'pts',
    colorscale: 'Portland',
    min: 0,
    max: 100,
    icon: <Fingerprint size={14} />,
    color: '#ec4899',
    category: 'Structural'
  },
  [TraumaLayer.METAL_LOSS]: {
    label: 'Metal Loss',
    unit: '%',
    colorscale: 'Inferno',
    min: 0,
    max: 40,
    icon: <Zap size={14} />,
    color: '#f97316',
    category: 'Structural'
  },
  [TraumaLayer.OVALITY]: {
    label: 'Tubing Ovality',
    unit: 'mm',
    colorscale: 'Jet',
    min: 0,
    max: 10,
    icon: <Disc size={14} />,
    color: '#22d3ee',
    category: 'Structural'
  }
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

  const [activeLayers, setActiveLayers] = useState<TraumaLayer[]>([TraumaLayer.DEVIATION, TraumaLayer.METAL_LOSS, TraumaLayer.OVALITY]);
  const [viewMode, setViewMode] = useState<'3D_SURFACE' | 'MFC_HEATMAP' | 'CROSS_SECTION'>('3D_SURFACE');
  const [layerOpacities, setLayerOpacities] = useState<Record<TraumaLayer, number>>({
    [TraumaLayer.DEVIATION]: 0.9,
    [TraumaLayer.CORROSION]: 0.8,
    [TraumaLayer.WALL_LOSS]: 0.9,
    [TraumaLayer.STRESS]: 0.95, 
    [TraumaLayer.WATER_LEAKAGE]: 0.9,
    [TraumaLayer.TEMPERATURE]: 0.7,
    [TraumaLayer.ICI]: 0.85,
    [TraumaLayer.METAL_LOSS]: 0.95,
    [TraumaLayer.OVALITY]: 0.9
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
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Structural': true,
    'Environmental': true
  });

  const [ripple, setRipple] = useState<{ x: number, y: number, key: number } | null>(null);
  
  const filteredDepths = useMemo(() => 
    allDepths.filter(d => d >= minDepth && d <= maxDepth), 
    [allDepths, minDepth, maxDepth]
  );
  
  const [currentXDepth, setCurrentXDepth] = useState<number>(allDepths[0]);

  // Added triggerShake helper to resolve missing name error
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  // --- PERSISTENT LOG LOGIC ---
  const [blackBoxLogs, setBlackBoxLogs] = useState<TraumaEvent[]>(() => {
    const saved = localStorage.getItem('BRAHAN_BLACK_BOX_LOGS');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('BRAHAN_BLACK_BOX_LOGS', JSON.stringify(blackBoxLogs));
    // Also update BRAHAN_TRAUMA_LOG for audit compatibility
    localStorage.setItem('BRAHAN_TRAUMA_LOG', JSON.stringify(blackBoxLogs));
  }, [blackBoxLogs]);

  useEffect(() => {
    let depth = absoluteMinDepth;
    let dir = 1;
    const interval = window.setInterval(() => {
      const speed = highlightedDepth ? 0.02 : 0.05;
      depth += speed * dir;
      if (depth >= absoluteMaxDepth) dir = -1;
      if (depth <= absoluteMinDepth) dir = 1;
      setScanBeamDepth(depth);
    }, 50);
    scanBeamIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [absoluteMinDepth, absoluteMaxDepth, highlightedDepth]);

  // Detect and auto-record anomalies
  useEffect(() => {
    const newAnomalies: TraumaEvent[] = [];
    allDepths.forEach(d => {
      const dataAtDepth = MOCK_TRAUMA_DATA.filter(p => p.depth === d);
      
      const maxOval = Math.max(...dataAtDepth.map(p => p.ovality));
      if (maxOval > 4.0) {
        newAnomalies.push({
          timestamp: new Date().toISOString(), layer: 'OVALITY', depth: d, value: maxOval, unit: 'mm', severity: 'CRITICAL',
          description: `Severe tubing ovality detected. Max deformation: ${maxOval.toFixed(2)}mm`
        });
      }

      const maxMetalLoss = Math.max(...dataAtDepth.map(p => p.metalLoss));
      if (maxMetalLoss > 25) {
        newAnomalies.push({
          timestamp: new Date().toISOString(), layer: 'METAL_LOSS', depth: d, value: maxMetalLoss, unit: '%', severity: 'CRITICAL',
          description: `Critical metal loss (${maxMetalLoss.toFixed(1)}%) identified.`
        });
      }

      const maxStress = Math.max(...dataAtDepth.map(p => p.stress));
      if (maxStress > 70) {
        newAnomalies.push({
          timestamp: new Date().toISOString(), layer: 'STRESS', depth: d, value: maxStress, unit: 'kpsi', severity: 'CRITICAL',
          description: `Anomalous stress concentration (${maxStress.toFixed(1)} kpsi).`
        });
      }
    });

    setBlackBoxLogs(prev => {
      const updated = [...prev];
      let changed = false;
      newAnomalies.forEach(anomaly => {
        // Prevent duplicates based on depth and layer
        const exists = updated.some(l => l.depth === anomaly.depth && l.layer === anomaly.layer);
        if (!exists) {
          updated.unshift(anomaly);
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [allDepths]);

  const clearLogs = () => {
    setBlackBoxLogs([]);
    triggerShake();
  };

  const handleLogClick = (ev: TraumaEvent) => {
    setIsFlashing(true); 
    setIsTargeting(true); 
    setIsShaking(true); 
    setIsHighlightPulsing(true);
    setHighlightedDepth(ev.depth); 
    setCurrentXDepth(ev.depth);
    
    if (plotContainerRef.current && viewMode === '3D_SURFACE') {
      Plotly.relayout(plotContainerRef.current, { 
        'scene.camera.center': { x: 0, y: 0, z: ev.depth },
        'scene.camera.eye': { x: 1.5, y: 1.5, z: ev.depth + 0.3 }
      });
    }

    setTimeout(() => setIsHighlightPulsing(false), 3000);
    setTimeout(() => setIsFlashing(false), 400);
    setTimeout(() => setIsShaking(false), 600);
    setTimeout(() => setIsTargeting(false), 5000);
  };

  const handleResetFocus = () => {
    if (!plotContainerRef.current) return;
    const midZ = (minDepth + maxDepth) / 2;
    if (viewMode === '3D_SURFACE') {
        Plotly.relayout(plotContainerRef.current, { 
            'scene.camera': { eye: { x: 2.2, y: 2.2, z: midZ + 5 }, center: { x: 0, y: 0, z: midZ }, up: { x: 0, y: 0, z: 1 } }
        });
    }
    setHighlightedDepth(null); 
    setIsTargeting(false); 
    setIsAutoRotating(false);
  };

  const toggleLayer = (layer: TraumaLayer) => {
    setActiveLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]);
  };

  const toggleAllLayers = () => {
    const allLayers = Object.values(TraumaLayer);
    if (activeLayers.length === allLayers.length) {
      setActiveLayers([]);
    } else {
      setActiveLayers(allLayers);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleOpacityChange = (layer: TraumaLayer, value: number) => {
    setLayerOpacities(prev => ({ ...prev, [layer]: value }));
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFocused && onToggleFocus) {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipple({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        key: Date.now()
      });
      onToggleFocus();
    }
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
            line: { color: 'rgba(16, 185, 129, 0.05)', width: 1 }, showlegend: false
        });
      }

      activeLayers.forEach((layer, idx) => {
        const x: number[][]=[], y: number[][]=[], z: number[][]=[], colorValues: number[][]=[];
        const baseRadiusOffset = idx * 4.0; 
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
            ambient: 0.08, diffuse: 0.95, specular: 4.5, roughness: 0.02, fresnel: 5.0
          },
          lightposition: { x: 5000, y: 5000, z: 10000 },
          hovertemplate: `<b>${layerConfig[layer].label}</b><br>` +
                        `Depth: %{z:.2f} m<br>` +
                        `Value: %{surfacecolor:.2f} ${layerConfig[layer].unit}` +
                        `<extra></extra>`
        });
      });
      
      if (highlightedDepth !== null) {
        const segments = 120;
        const hx: number[]=[], hy: number[]=[], hz: number[]=[];
        for (let i=0; i<=segments; i++){ 
          const t=(i/segments)*2*Math.PI; 
          hx.push(115 * Math.cos(t)); hy.push(115 * Math.sin(t)); hz.push(highlightedDepth); 
        }
        traces.push({ 
          type: 'scatter3d', x: hx, y: hy, z: hz, mode: 'lines', 
          line: { color: isHighlightPulsing ? '#ff1e1e' : '#ff5f1f', width: 28 }, 
          showlegend: false 
        });
      }

      const sbX: number[]=[], sbY: number[]=[], sbZ: number[]=[];
      for (let i=0; i<=64; i++){
        const t=(i/64)*2*Math.PI;
        sbX.push(150 * Math.cos(t)); sbY.push(150 * Math.sin(t)); sbZ.push(scanBeamDepth);
      }
      traces.push({
        type: 'scatter3d', x: sbX, y: sbY, z: sbZ, mode: 'lines',
        line: { color: '#22d3ee', width: 4, dash: 'solid' },
        opacity: 0.8, showlegend: false
      });

      const rangeSize = maxDepth - minDepth;
      const zAspect = Math.max(1.5, (10 / Math.max(0.1, rangeSize)) * 4.5);
      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', margin: { l: 0, r: 0, t: 0, b: 0 },
        dragmode: 'orbit', uirevision: 'true',
        scene: {
          xaxis: { visible: false }, yaxis: { visible: false },
          zaxis: { 
            gridcolor: 'rgba(16, 185, 129, 0.05)', 
            tickfont: { size: 9, color: '#064e3b' }, 
            range: [minDepth, maxDepth],
            backgroundcolor: '#010409'
          },
          aspectratio: { x: 1, y: 1, z: zAspect }, 
          bgcolor: '#010409',
          camera: { projection: { type: 'perspective' } }
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
    <div 
      className={`flex flex-col h-full p-4 bg-slate-900/50 border rounded-lg overflow-hidden relative shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isFocused ? 'border-emerald-400/80 ring-4 ring-emerald-500/20' : 'border-emerald-900/40 hover:border-emerald-500/60'} ${isFlashing ? 'bg-orange-500/10 border-orange-500/80' : ''} ${isShaking ? 'animate-shake' : ''}`} 
      onClick={handleContainerClick}
    >
      
      {ripple && (
        <span 
          key={ripple.key}
          className="ripple-effect"
          style={{ top: ripple.y, left: ripple.x, width: '100px', height: '100px' }}
          onAnimationEnd={() => setRipple(null)}
        />
      )}

      {!isFocused && (
        <div className="absolute inset-0 bg-emerald-500/0 hover:bg-emerald-500/5 cursor-pointer z-[55] flex items-center justify-center transition-all group">
           <div className="bg-slate-950/90 border border-emerald-500/30 px-6 py-3 rounded-full flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity transform duration-300">
              <Sparkles size={16} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Engage Workspace Focus</span>
           </div>
        </div>
      )}

      {isTargeting && (
        <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center bg-slate-950/30 backdrop-blur-[2px] animate-in fade-in duration-300">
           <div className="relative w-[500px] h-[500px] flex items-center justify-center">
              <div className="absolute inset-0 border-[0.5px] border-orange-500/40 rounded-full animate-forensic-ping opacity-0"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-slate-950/95 border border-orange-500/50 p-8 rounded-lg shadow-[0_0_80px_rgba(249,115,22,0.3)]">
                 <div className="relative mb-4">
                    <Crosshair size={72} className="text-orange-500 animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
                 </div>
                 <span className="text-[16px] font-black text-orange-400 tracking-[0.8em] uppercase mb-2">Target_Locked</span>
                 <div className="flex space-x-4">
                    <div className="px-4 py-1.5 bg-orange-500 text-slate-950 font-terminal font-black text-xs rounded-sm">DEPTH: {highlightedDepth?.toFixed(2)}m</div>
                    <div className="px-4 py-1.5 bg-slate-800 text-orange-400 font-terminal font-black text-xs rounded-sm border border-orange-500/30">STATUS: ANALYZING</div>
                 </div>
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
            <span className="text-[9px] text-emerald-800 font-terminal uppercase tracking-[0.5em] font-black">Forensic Structural Engine v4.0</span>
          </div>
        </div>
        <div className="flex space-x-2">
           <button onClick={(e) => { e.stopPropagation(); handleResetFocus(); }} title="Recenter View" className="p-2.5 rounded bg-slate-950/90 border border-emerald-900/40 text-emerald-800 hover:text-emerald-400 transition-all shadow-xl z-[60] text-glow-emerald"><Target size={20} /></button>
           {onToggleFocus && (
             <button onClick={(e) => { e.stopPropagation(); onToggleFocus(); }} className={`p-2.5 rounded transition-all shadow-xl z-[60] flex items-center space-x-2 ${isFocused ? 'bg-red-500/10 border border-red-500/40 text-red-500' : 'bg-slate-950/90 border border-emerald-900/40 text-emerald-400'}`}>
               {isFocused ? <Minimize2 size={20} /> : <Maximize2 size={16} />}
             </button>
           )}
        </div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 relative">
        <div className="flex-1 min-h-0 relative bg-slate-950/95 rounded-xl border border-emerald-900/20 overflow-hidden group shadow-inner transition-all duration-500">
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 bg-slate-900/90 border border-emerald-500/30 p-2 rounded-full backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-4">
             {(Object.entries(layerConfig) as [TraumaLayer, typeof layerConfig[TraumaLayer]][]).map(([key, cfg]) => {
                const layer = key;
                const isActive = activeLayers.includes(layer);
                return (
                  <button 
                    key={`hud-${layer}`}
                    onClick={(e) => { e.stopPropagation(); toggleLayer(layer); }}
                    title={cfg.label}
                    className={`p-2 rounded-full transition-all relative group/hud ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-emerald-900 hover:text-emerald-600 hover:bg-emerald-500/5'}`}
                  >
                    <div style={{ color: isActive ? cfg.color : undefined }} className={`transition-all ${isActive ? 'scale-110 drop-shadow-[0_0_5px_currentColor]' : ''}`}>
                       {cfg.icon}
                    </div>
                  </button>
                );
             })}
          </div>

          <div className="absolute top-6 left-6 z-20 flex flex-col space-y-4">
             <div className="flex flex-col space-y-1.5 bg-slate-900/95 border border-emerald-900/40 rounded-lg p-2.5 shadow-2xl backdrop-blur-md">
                <button onClick={(e) => { e.stopPropagation(); setViewMode('3D_SURFACE'); isInitializedRef.current = false; }} className={`p-2.5 rounded transition-all ${viewMode === '3D_SURFACE' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800'}`}><Box size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); setViewMode('CROSS_SECTION'); isInitializedRef.current = false; }} className={`p-2.5 rounded transition-all ${viewMode === 'CROSS_SECTION' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800'}`}><Scissors size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); setViewMode('MFC_HEATMAP'); isInitializedRef.current = false; }} className={`p-2.5 rounded transition-all ${viewMode === 'MFC_HEATMAP' ? 'bg-orange-500 text-slate-950' : 'text-emerald-800'}`}><Grid3X3 size={18} /></button>
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
              <button 
                onClick={(e) => { e.stopPropagation(); toggleAllLayers(); }} 
                className="p-1.5 rounded bg-emerald-900/20 text-emerald-800 hover:text-emerald-400 border border-emerald-900/40"
              >
                {activeLayers.length === Object.keys(layerConfig).length ? <Square size={14} /> : <CheckSquare size={14} />}
              </button>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {['Structural', 'Environmental'].map(section => (
                <div key={section} className="space-y-2">
                   <button 
                     onClick={() => toggleSection(section)}
                     className="w-full flex items-center justify-between py-1 border-b border-emerald-900/20 group/sec"
                   >
                     <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest group-hover/sec:text-emerald-500">{section}_Forensics</span>
                     {expandedSections[section] ? <ChevronDown size={12} className="text-emerald-900" /> : <ChevronRight size={12} className="text-emerald-900" />}
                   </button>
                   
                   {expandedSections[section] && (
                     <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1">
                       {(Object.entries(layerConfig) as [TraumaLayer, typeof layerConfig[TraumaLayer]][]).filter(([_, cfg]) => cfg.category === section).map(([key, cfg]) => {
                         const layer = key;
                         const isActive = activeLayers.includes(layer);
                         return (
                           <div key={layer} className={`p-2.5 rounded-lg border transition-all duration-300 relative overflow-hidden group/layer cursor-pointer ${isActive ? 'bg-slate-900 border-emerald-500/50' : 'bg-slate-950 border-emerald-900/10 opacity-60'}`}>
                             <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center space-x-2 truncate">
                                  <div className={`p-1 rounded ${isActive ? 'text-slate-950' : 'bg-slate-800 text-emerald-900'}`} style={{ backgroundColor: isActive ? cfg.color : undefined }}>{cfg.icon}</div>
                                  <span className={`text-[9px] font-black uppercase tracking-tight truncate ${isActive ? 'text-emerald-50' : 'text-emerald-900'}`}>{cfg.label}</span>
                               </div>
                               <button onClick={(e) => { e.stopPropagation(); toggleLayer(layer); }} className={`p-1 rounded ${isActive ? 'text-emerald-400' : 'text-emerald-900'}`}>
                                 {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                               </button>
                             </div>
                             <input type="range" min="0" max="1" step="0.01" value={layerOpacities[layer]} onClick={(e) => e.stopPropagation()} onChange={(e) => handleOpacityChange(layer, parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 appearance-none cursor-pointer rounded-full accent-emerald-500" />
                           </div>
                         );
                       })}
                     </div>
                   )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-4 flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HardDrive size={18} className="text-emerald-500" />
                <h3 className="text-[14px] font-black text-emerald-400 uppercase tracking-[0.2em]">Black Box Recorder</h3>
              </div>
              <button onClick={clearLogs} className="p-1.5 text-emerald-900 hover:text-red-500 transition-colors" title="Wipe Flight Data">
                <Trash2 size={14} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto font-terminal text-[10px] space-y-3 pr-2 custom-scrollbar">
              {blackBoxLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic space-y-2">
                  <Terminal size={24} />
                  <span>NO_TRAUMA_RECORDED</span>
                </div>
              ) : blackBoxLogs.map((ev, i) => (
                <div 
                  key={i} 
                  onClick={(e) => { e.stopPropagation(); handleLogClick(ev); }} 
                  className={`p-3 bg-slate-900/60 border rounded cursor-pointer transition-all relative overflow-hidden group/alert ${highlightedDepth === ev.depth ? 'border-orange-500 bg-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'border-emerald-900/20 hover:border-emerald-500/40'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                       <span className="text-[7px] text-emerald-800 font-black uppercase tracking-widest">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                       <span className={`font-black tracking-tighter ${highlightedDepth === ev.depth ? 'text-orange-400' : 'text-emerald-500'}`}>DEPTH: {ev.depth.toFixed(2)}m</span>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${ev.severity === 'CRITICAL' ? 'bg-red-500 text-slate-950' : 'bg-orange-500/30 text-orange-400'}`}>{ev.layer}</span>
                  </div>
                  <div className={`leading-relaxed italic ${highlightedDepth === ev.depth ? 'text-white' : 'text-emerald-100/60'}`}>{ev.description}</div>
                  
                  {highlightedDepth === ev.depth && (
                    <div className="mt-2 flex items-center space-x-2 animate-in fade-in duration-300">
                      <div className="h-0.5 flex-1 bg-orange-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 animate-[loading-bar_3s_linear_infinite]"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default TraumaNode;
