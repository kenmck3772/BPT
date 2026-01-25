
import React, { useMemo, useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { MOCK_TRAUMA_DATA } from '../constants';
import { TraumaLayer, TraumaEvent, TraumaData } from '../types';
import { 
  Scan, Maximize2, Minimize2, Target, Box, Binary, SlidersHorizontal, 
  Trash2, MoveVertical, MousePointer2, CornerUpRight, Lock, ScanLine, 
  Loader2, Compass, Flame, Thermometer, MinusSquare, Droplets, Activity, 
  Ruler, Zap, Percent, Sun, Eye, EyeOff, ShieldCheck, AlertTriangle, 
  Layers, Crosshair, CircleDot, ArrowRight, Cpu, Filter, 
  Eye as FocusEye, Search, X, CheckSquare, Square
} from 'lucide-react';
import { secureAsset } from '../services/vaultService';

const layerToKey: Record<TraumaLayer, keyof Omit<TraumaData, 'fingerId' | 'depth'>> = {
  [TraumaLayer.DEVIATION]: 'deviation',
  [TraumaLayer.CORROSION]: 'corrosion',
  [TraumaLayer.TEMPERATURE]: 'temperature',
  [TraumaLayer.WALL_LOSS]: 'wallLoss',
  [TraumaLayer.WATER_LEAKAGE]: 'waterLeakage',
  [TraumaLayer.STRESS]: 'stress',
  [TraumaLayer.BENDING_STRESS]: 'bendingStress',
  [TraumaLayer.HOOP_STRESS]: 'hoopStress',
  [TraumaLayer.ICI]: 'ici',
  [TraumaLayer.METAL_LOSS]: 'metalLoss',
  [TraumaLayer.OVALITY]: 'ovality',
  [TraumaLayer.UV_INDEX]: 'uvIndex'
};

const layerColors: Record<TraumaLayer, string[][]> = {
  [TraumaLayer.DEVIATION]: [['0', '#020617'], ['1', '#06b6d4']],
  [TraumaLayer.CORROSION]: [['0', '#020617'], ['1', '#f97316']],
  [TraumaLayer.TEMPERATURE]: [['0', '#020617'], ['1', '#fbbf24']],
  [TraumaLayer.WALL_LOSS]: [['0', '#020617'], ['1', '#ec4899']],
  [TraumaLayer.WATER_LEAKAGE]: [['0', '#020617'], ['1', '#3b82f6']],
  [TraumaLayer.STRESS]: [['0', '#020617'], ['1', '#a855f7']], 
  [TraumaLayer.BENDING_STRESS]: [['0', '#020617'], ['0.3', '#9d174d'], ['1', '#fdf2f8']],
  [TraumaLayer.HOOP_STRESS]: [['0', '#020617'], ['0.5', '#bef264'], ['1', '#fef9c3']], 
  [TraumaLayer.ICI]: [['0', '#020617'], ['1', '#10b981']],
  [TraumaLayer.METAL_LOSS]: [['0', '#020617'], ['1', '#94a3b8']],
  [TraumaLayer.OVALITY]: [['0', '#020617'], ['1', '#84cc16']],
  [TraumaLayer.UV_INDEX]: [['0', '#020617'], ['0.5', '#7c3aed'], ['1', '#facc15']]
};

interface TraumaNodeProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const TraumaNode: React.FC<TraumaNodeProps> = ({ isFocused = false, onToggleFocus }) => {
  const plotContainerRef = useRef<HTMLDivElement>(null);
  const [highlightedDepth, setHighlightedDepth] = useState<number | null>(null);
  const [activeLayer, setActiveLayer] = useState<TraumaLayer>(TraumaLayer.CORROSION);
  const [hoveredLayer, setHoveredLayer] = useState<TraumaLayer | null>(null);
  const [layerSearch, setLayerSearch] = useState('');
  const [pulse, setPulse] = useState(1.0);
  
  const [layerVisibility, setLayerVisibility] = useState<Record<TraumaLayer, boolean>>({
    [TraumaLayer.DEVIATION]: false,
    [TraumaLayer.CORROSION]: true,
    [TraumaLayer.TEMPERATURE]: false,
    [TraumaLayer.WALL_LOSS]: false,
    [TraumaLayer.WATER_LEAKAGE]: false,
    [TraumaLayer.STRESS]: true,
    [TraumaLayer.BENDING_STRESS]: false,
    [TraumaLayer.HOOP_STRESS]: true,
    [TraumaLayer.ICI]: false,
    [TraumaLayer.METAL_LOSS]: false,
    [TraumaLayer.OVALITY]: false,
    [TraumaLayer.UV_INDEX]: false
  });

  const [layerOpacities, setLayerOpacities] = useState<Record<TraumaLayer, number>>({
    [TraumaLayer.DEVIATION]: 75,
    [TraumaLayer.CORROSION]: 75,
    [TraumaLayer.TEMPERATURE]: 75,
    [TraumaLayer.WALL_LOSS]: 75,
    [TraumaLayer.WATER_LEAKAGE]: 75,
    [TraumaLayer.STRESS]: 75,
    [TraumaLayer.BENDING_STRESS]: 75,
    [TraumaLayer.HOOP_STRESS]: 75,
    [TraumaLayer.ICI]: 75,
    [TraumaLayer.METAL_LOSS]: 75,
    [TraumaLayer.OVALITY]: 75,
    [TraumaLayer.UV_INDEX]: 75
  });

  const [layerThresholds, setLayerThresholds] = useState<Record<TraumaLayer, number>>({
    [TraumaLayer.DEVIATION]: 0,
    [TraumaLayer.CORROSION]: 5,
    [TraumaLayer.TEMPERATURE]: 0,
    [TraumaLayer.WALL_LOSS]: 0,
    [TraumaLayer.WATER_LEAKAGE]: 0,
    [TraumaLayer.STRESS]: 10,
    [TraumaLayer.BENDING_STRESS]: 0,
    [TraumaLayer.HOOP_STRESS]: 15,
    [TraumaLayer.ICI]: 0,
    [TraumaLayer.METAL_LOSS]: 0,
    [TraumaLayer.OVALITY]: 0,
    [TraumaLayer.UV_INDEX]: 0
  });

  const [isScanning, setIsScanning] = useState(false);
  const [isTargeting, setIsTargeting] = useState(false);
  const [zScale, setZScale] = useState(2.5);
  const [uiRevision, setUiRevision] = useState<string>('initial');
  const [isSecuring, setIsSecuring] = useState(false);

  const allDepths = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.depth))).sort((a, b) => a - b), []);
  const fingerIds = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.fingerId))).sort((a, b) => a - b), []);

  const [blackBoxLogs, setBlackBoxLogs] = useState<TraumaEvent[]>(() => {
    const saved = localStorage.getItem('BRAHAN_BLACK_BOX_LOGS');
    return saved ? JSON.parse(saved) : [];
  });

  const filteredLayers = useMemo(() => {
    return Object.values(TraumaLayer).filter(l => 
      l.replace(/_/g, ' ').toLowerCase().includes(layerSearch.toLowerCase())
    );
  }, [layerSearch]);

  const toggleLayerVisibility = (layer: TraumaLayer) => {
    setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
    setActiveLayer(layer);
  };

  const isolateLayer = (layer: TraumaLayer) => {
    const nextVisibility = {} as Record<TraumaLayer, boolean>;
    Object.values(TraumaLayer).forEach(l => {
      nextVisibility[l] = l === layer;
    });
    setLayerVisibility(nextVisibility);
    setActiveLayer(layer);
  };

  const showAllLayers = () => {
    const nextVisibility = {} as Record<TraumaLayer, boolean>;
    Object.values(TraumaLayer).forEach(l => {
      nextVisibility[l] = true;
    });
    setLayerVisibility(nextVisibility);
  };

  const clearAllLayers = () => {
    const nextVisibility = {} as Record<TraumaLayer, boolean>;
    Object.values(TraumaLayer).forEach(l => {
      nextVisibility[l] = false;
    });
    setLayerVisibility(nextVisibility);
  };

  useEffect(() => {
    if (highlightedDepth === null) {
      setPulse(1.0);
      return;
    }
    const interval = setInterval(() => {
      setPulse(p => {
        const next = p + 0.05;
        return next > 1.4 ? 1.0 : next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [highlightedDepth]);

  const handleLogClick = (depth: number) => {
    const isAlreadyHighlighted = highlightedDepth === depth;
    setHighlightedDepth(isAlreadyHighlighted ? null : depth);
    if (isAlreadyHighlighted) return;
    setIsTargeting(true);
    if (plotContainerRef.current) {
        const zNormalized = ((depth - 1245) / 10);
        const layoutUpdate: any = {
            'scene.camera.eye': { x: 1.2, y: 1.2, z: 1.2 },
            'scene.camera.center': { x: 0, y: 0, z: zNormalized },
            'scene.camera.up': { x: 0, y: 0, z: 1 }
        };
        Plotly.relayout(plotContainerRef.current, layoutUpdate);
    }
    setTimeout(() => setIsTargeting(false), 2500);
  };

  const runForensicScan = () => {
    setIsScanning(true);
    setHighlightedDepth(null);
    setTimeout(() => {
      const key = layerToKey[activeLayer];
      let threshold = layerThresholds[activeLayer] || 15;
      const depthGroups = MOCK_TRAUMA_DATA.reduce((acc, curr) => {
        const val = curr[key] as number;
        if (val > threshold) {
          if (!acc[curr.depth] || (acc[curr.depth][key] as number) < val) acc[curr.depth] = curr;
        }
        return acc;
      }, {} as Record<number, TraumaData>);
      const newEvents: TraumaEvent[] = Object.values(depthGroups).map(a => ({
        timestamp: new Date().toISOString(), 
        layer: activeLayer, 
        depth: a.depth, 
        value: a[key] as number,
        unit: activeLayer.includes('STRESS') ? 'N·m' : 'idx', 
        severity: (a[key] as number) > 40 ? 'CRITICAL' : 'WARNING',
        description: `${activeLayer.replace('_', ' ')} anomaly detected at ${a.depth}m.`
      }));
      const updated = [...newEvents, ...blackBoxLogs].slice(0, 50);
      setBlackBoxLogs(updated);
      localStorage.setItem('BRAHAN_BLACK_BOX_LOGS', JSON.stringify(updated));
      setIsScanning(false);
    }, 1500);
  };

  const handleSecureAsset = () => {
    setIsSecuring(true);
    const visibleLayersCount = Object.values(layerVisibility).filter(v => v).length;
    setTimeout(() => {
        secureAsset({
            title: `Structural Composite: ${visibleLayersCount} Layers`,
            status: blackBoxLogs.some(l => l.severity === 'CRITICAL') ? 'CRITICAL' : 'VERIFIED',
            summary: `Multi-layer forensic scan (Layers: ${Object.keys(layerVisibility).filter(l => layerVisibility[l as TraumaLayer]).join(', ')}). Thresholded data de-emphasized.`,
            region: 'North Sea',
            valueEst: 11500000,
            confidence: 97
        });
        setIsSecuring(false);
    }, 1000);
  };

  useEffect(() => {
    if (!plotContainerRef.current) return;
    const baseRadius = 50; 
    let traces: any[] = [];
    const visibleLayersList = Object.entries(layerVisibility)
      .filter(([_, visible]) => visible)
      .map(([layer]) => layer as TraumaLayer);

    visibleLayersList.forEach((layer, layerIdx) => {
      const xData: number[][] = [], yData: number[][] = [], zData: number[][] = [], colorData: number[][] = [];
      const layerOffset = layerIdx * 0.9;
      const threshold = layerThresholds[layer] || 0;
      allDepths.forEach((depth) => {
        const xRow: number[] = [], yRow: number[] = [], zRow: number[] = [], cRow: number[] = [];
        fingerIds.forEach((fId, fIdx) => {
          const theta = (fIdx / fingerIds.length) * 2 * Math.PI;
          const entry = MOCK_TRAUMA_DATA.find(d => d.depth === depth && d.fingerId === fId);
          let rawVal = entry ? (entry[layerToKey[layer]] as number) : 0;
          const displayVal = rawVal >= threshold ? rawVal : 0;
          const r = baseRadius + (displayVal * 0.2); 
          xRow.push(r * Math.cos(theta));
          yRow.push(r * Math.sin(theta));
          zRow.push(depth + layerOffset);
          cRow.push(displayVal);
        });
        xData.push(xRow);
        yData.push(yRow);
        zData.push(zRow);
        colorData.push(cRow);
      });
      traces.push({
        type: 'surface',
        x: xData,
        y: yData,
        z: zData,
        surfacecolor: colorData,
        colorscale: layerColors[layer],
        showscale: false,
        opacity: layerOpacities[layer] / 100,
        name: layer,
        hoverinfo: 'skip'
      });
    });

    blackBoxLogs.forEach((log) => {
      const ringX: number[] = [], ringY: number[] = [], ringZ: number[] = [];
      const radius = baseRadius + 15;
      for (let i = 0; i <= 36; i++) {
        const theta = (i / 36) * 2 * Math.PI;
        ringX.push(radius * Math.cos(theta));
        ringY.push(radius * Math.sin(theta));
        ringZ.push(log.depth);
      }
      traces.push({
        type: 'scatter3d', mode: 'lines', x: ringX, y: ringY, z: ringZ,
        line: { 
          color: log.severity === 'CRITICAL' ? '#ef4444' : '#f97316', 
          width: highlightedDepth === log.depth ? 4 + (pulse * 6) : 3, 
          dash: 'dash' 
        },
        name: `LOG_DEPTH_${log.depth}`, hoverinfo: 'text', text: `LOG: ${log.layer} @ ${log.depth}m`
      });
    });

    if (highlightedDepth !== null) {
        const pingRadius = baseRadius + (20 * pulse);
        const pX: number[] = [], pY: number[] = [], pZ: number[] = [];
        for (let i = 0; i <= 60; i++) {
            const theta = (i / 60) * 2 * Math.PI;
            pX.push(pingRadius * Math.cos(theta));
            pY.push(pingRadius * Math.sin(theta));
            pZ.push(highlightedDepth);
        }
        
        traces.push({
            type: 'scatter3d',
            mode: 'lines',
            x: pX, y: pY, z: pZ,
            line: { 
                color: '#00FF41', 
                width: 12 * (1.5 - pulse), 
                opacity: 0.6 * (1.5 - pulse) 
            },
            name: 'Radar_Ping',
            hoverinfo: 'none'
        });

        traces.push({
          type: 'scatter3d',
          mode: 'markers',
          x: [0], y: [0], z: [highlightedDepth],
          marker: {
            size: 20 * pulse,
            color: '#00FF41',
            opacity: 0.9 * (pulse - 0.1),
            symbol: 'diamond',
            line: { color: '#ffffff', width: 2 }
          },
          name: 'Voxel_Core',
          hoverinfo: 'none'
        });

        [18, 22, 26].forEach((rOffset, ringIdx) => {
            const hX: number[] = [], hY: number[] = [], hZ: number[] = [];
            for (let i = 0; i <= 40; i++) {
                const theta = (i / 40) * 2 * Math.PI;
                const r = baseRadius + rOffset;
                hX.push(r * Math.cos(theta));
                hY.push(r * Math.sin(theta));
                hZ.push(highlightedDepth);
            }
            traces.push({
                type: 'scatter3d', mode: 'lines', x: hX, y: hY, z: hZ,
                line: { 
                  color: ringIdx === 0 ? '#00FF41' : ringIdx === 1 ? 'rgba(0, 255, 65, 0.4)' : 'rgba(0, 255, 65, 0.1)', 
                  width: (ringIdx === 0 ? 8 : ringIdx === 1 ? 12 : 16) * pulse 
                },
                opacity: (1.0 / (ringIdx + 1)) * (pulse - 0.3),
                name: ringIdx === 0 ? 'Forensic_Lock' : 'Lock_Glow', 
                hoverinfo: 'none'
            });
        });

        const planeX: number[][] = [[-150, 150], [-150, 150]], planeY: number[][] = [[-150, -150], [150, 150]], planeZ: number[][] = [[highlightedDepth, highlightedDepth], [highlightedDepth, highlightedDepth]];
        traces.push({
            type: 'surface', x: planeX, y: planeY, z: planeZ, 
            colorscale: [['0', 'rgba(0, 255, 65, 0.05)'], ['1', 'rgba(0, 255, 65, 0.05)']],
            showscale: false, opacity: 0.1 * (pulse - 0.5), name: 'Depth_Plane', hoverinfo: 'none'
        });
    }

    const layout: any = {
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', showlegend: false,
      margin: { l: 0, r: 0, b: 0, t: 0 },
      scene: {
        xaxis: { visible: false }, yaxis: { visible: false },
        zaxis: { 
          title: 'DEPTH (m)', 
          backgroundcolor: 'rgb(2, 6, 23)', 
          gridcolor: 'rgba(16, 185, 129, 0.1)', 
          zerolinecolor: 'rgba(16, 185, 129, 0.1)', 
          showbackground: true, 
          tickfont: { color: '#064e3b', size: 10 }, 
          range: [1240, 1250] 
        },
        camera: { eye: { x: 1.5, y: 1.5, z: 1.5 } }, 
        aspectratio: { x: 1, y: 1, z: zScale }
      },
      uirevision: uiRevision, hovermode: 'closest'
    };
    Plotly.newPlot(plotContainerRef.current, traces, layout, { responsive: true, displayModeBar: false });
  }, [allDepths, fingerIds, layerVisibility, layerOpacities, layerThresholds, zScale, uiRevision, highlightedDepth, blackBoxLogs, pulse]);

  return (
    <div className="flex flex-col h-full bg-slate-950/40 backdrop-blur-md relative overflow-hidden border border-emerald-900/10 rounded-xl font-terminal">
      {isTargeting && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
           <div className="w-64 h-64 border-2 border-[#00FF41] rounded-full animate-ping opacity-40"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00FF41] font-black text-[10px] tracking-[1.5em] uppercase bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-[#00FF41]/20">
             Locking_Depth_Voxel
           </div>
           <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-[#00FF41]/40"></div>
           <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-[#00FF41]/40"></div>
           <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-[#00FF41]/40"></div>
           <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-[#00FF41]/40"></div>
        </div>
      )}

      <div className="flex justify-between items-center p-4 border-b border-emerald-900/20 bg-slate-950/60 z-20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-900/20 border border-emerald-500/30 rounded">
            <Scan size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-400 font-terminal uppercase tracking-tighter">Trauma_Node_3D</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[8px] text-emerald-800 uppercase tracking-widest font-black">Multi-Layer_Autopsy_Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onToggleFocus} className="p-2 text-emerald-800 hover:text-emerald-400 transition-colors">
            {isFocused ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 relative">
        <div ref={plotContainerRef} className="flex-1" />
        
        <div className="w-72 border-l border-emerald-900/20 bg-slate-950/40 flex flex-col shadow-2xl z-10 overflow-hidden">
          {/* Layer Controls Header */}
          <div className="p-4 border-b border-emerald-900/20 space-y-4 bg-slate-900/40">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} /> Layer_Registry
                </h3>
                <div className="flex items-center gap-1.5">
                   <button 
                    onClick={showAllLayers}
                    title="Show All Layers"
                    className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all"
                   >
                     <CheckSquare size={12} />
                   </button>
                   <button 
                    onClick={clearAllLayers}
                    title="Purge All Layers"
                    className="p-1.5 bg-red-500/10 text-red-500 rounded border border-red-500/20 hover:bg-red-500 hover:text-black transition-all"
                   >
                     <Square size={12} />
                   </button>
                </div>
             </div>

             <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-800" />
                <input 
                  type="text"
                  placeholder="Filter_Layers..."
                  value={layerSearch}
                  onChange={(e) => setLayerSearch(e.target.value)}
                  className="w-full bg-black/40 border border-emerald-900/40 rounded-lg pl-8 pr-8 py-1.5 text-[10px] text-emerald-100 font-mono outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-950"
                />
                {layerSearch && (
                  <button 
                    onClick={() => setLayerSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-800 hover:text-emerald-400"
                  >
                    <X size={12} />
                  </button>
                )}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {filteredLayers.map(layer => {
              const isActive = activeLayer === layer;
              const isVisible = layerVisibility[layer];
              
              return (
                <div 
                  key={layer} 
                  onMouseEnter={() => isVisible && setHoveredLayer(layer)}
                  onMouseLeave={() => setHoveredLayer(null)}
                  className={`space-y-3 p-3 rounded-xl border transition-all duration-300 ${
                    isActive 
                      ? 'bg-emerald-500/5 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
                      : 'bg-slate-900/40 border-emerald-900/10 hover:border-emerald-900/30'
                  } ${hoveredLayer === layer ? 'ring-1 ring-emerald-400/40 border-emerald-400/20 shadow-lg' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                       <button 
                        onClick={() => toggleLayerVisibility(layer)}
                        className={`p-1.5 rounded transition-all ${isVisible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-950 text-emerald-900'}`}
                        title={isVisible ? "Hide Layer" : "Show Layer"}
                       >
                         {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                       </button>
                       <button 
                        onClick={() => setActiveLayer(layer)}
                        className={`text-[9px] font-black uppercase truncate transition-all ${isVisible ? 'text-emerald-100' : 'text-emerald-900'} ${isActive ? 'text-emerald-400' : ''}`}
                       >
                         {layer.replace(/_/g, ' ')}
                       </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => isolateLayer(layer)}
                        title="Isolate Layer"
                        className={`p-1 rounded transition-all ${isVisible && isActive ? 'bg-emerald-500 text-black' : 'text-emerald-900 hover:text-emerald-400'}`}
                      >
                        <Target size={12} />
                      </button>
                      {isVisible && (
                        <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: layerColors[layer][1][1], color: layerColors[layer][1][1] }}></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-1 animate-in fade-in duration-300">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[7px] font-black text-emerald-700 uppercase tracking-widest px-1">
                        <span className="flex items-center gap-1"><FocusEye size={8} /> Alpha_Sweep</span>
                        <span className="text-emerald-400">{layerOpacities[layer]}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={layerOpacities[layer]}
                        onChange={(e) => setLayerOpacities(prev => ({ ...prev, [layer]: parseInt(e.target.value) }))}
                        className={`w-full h-1 bg-slate-950 rounded-full accent-emerald-500 cursor-pointer appearance-none transition-opacity ${isVisible ? 'opacity-100' : 'opacity-40'}`}
                      />
                    </div>
                    
                    {isVisible && isActive && (
                      <div className="space-y-1.5 pt-2 border-t border-emerald-900/10">
                        <div className="flex justify-between text-[7px] font-black text-orange-900 uppercase tracking-widest px-1">
                          <span className="flex items-center gap-1"><Filter size={8} /> Logic_Gate</span>
                          <span className="text-orange-600">{layerThresholds[layer]}</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" step="1" value={layerThresholds[layer]}
                          onChange={(e) => {
                            setLayerThresholds(prev => ({ ...prev, [layer]: parseInt(e.target.value) }));
                            setUiRevision(Date.now().toString());
                          }}
                          className="w-full h-1 bg-slate-950 rounded-full accent-orange-500 cursor-pointer appearance-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredLayers.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center opacity-20 text-[9px] font-black uppercase tracking-widest py-8">
                 No matching trauma layers
               </div>
            )}
          </div>

          <div className="p-4 border-t border-emerald-900/20 bg-slate-900/40">
             <div className="flex justify-between text-[8px] font-black text-emerald-900 uppercase mb-2 tracking-[0.2em]">
                <span>Perspective_Scale</span>
                <span className="text-emerald-500">{zScale.toFixed(1)}x</span>
             </div>
             <input 
               type="range" min="0.5" max="10" step="0.5" value={zScale}
               onChange={(e) => {
                 setZScale(parseFloat(e.target.value));
                 setUiRevision(Date.now().toString());
               }}
               className="w-full h-1 bg-slate-900 rounded-full accent-emerald-500 cursor-pointer appearance-none"
             />
          </div>
        </div>
      </div>

      <div className="h-48 border-t border-emerald-900/20 bg-slate-950/60 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <Binary size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Black_Box_Telemetry_Audit</span>
             </div>
             <span className="text-[8px] text-emerald-900 font-black uppercase">Archive_Nodes: {blackBoxLogs.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
            {blackBoxLogs.map((log, i) => {
              const isSelected = highlightedDepth === log.depth;
              return (
                <div 
                  key={i} 
                  onClick={() => handleLogClick(log.depth)}
                  className={`p-3 rounded border flex items-center justify-between cursor-pointer transition-all group ${isSelected ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : (log.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20' : 'bg-slate-900 border-emerald-900/20 hover:border-emerald-500/40')}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded ${log.severity === 'CRITICAL' ? 'bg-red-500 text-slate-950' : 'bg-orange-500 text-slate-950'}`}>
                      {log.severity}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-100 flex items-center">
                        {log.layer} @ <span className="ml-1 text-[#00FF41] hover:underline decoration-dashed">{log.depth.toFixed(2)}m</span>
                      </span>
                      <span className="text-[9px] text-emerald-700 italic hidden md:block group-hover:text-emerald-400 transition-colors">"{log.description}"</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-emerald-400">{log.value.toFixed(2)} {log.unit}</span>
                    <ArrowRight size={12} className={`transition-transform duration-300 ${isSelected ? 'translate-x-2 text-emerald-400' : 'text-emerald-900'}`} />
                  </div>
                </div>
              );
            })}
            {blackBoxLogs.length === 0 && (
              <div className="h-full flex items-center justify-center opacity-20 text-[10px] font-black uppercase tracking-[0.5em]">
                No Active Anomalies Detected
              </div>
            )}
          </div>
      </div>

      <div className="p-4 border-t border-emerald-900/20 bg-slate-950/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={runForensicScan}
            disabled={isScanning}
            className={`flex items-center space-x-3 px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${isScanning ? 'bg-orange-500/20 text-orange-500 border border-orange-500/40' : 'bg-emerald-50 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
          >
            {isScanning ? <Loader2 size={14} className="animate-spin" /> : <ScanLine size={14} />}
            <span>{isScanning ? 'Penetrating_Voxel_Grid...' : 'Execute_Forensic_Scan'}</span>
          </button>
          <button 
            onClick={handleSecureAsset}
            disabled={isSecuring}
            className={`flex items-center space-x-3 px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${isSecuring ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40' : 'bg-amber text-slate-950 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'}`}
          >
            {isSecuring ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            <span>{isSecuring ? 'Securing_Vault_Node...' : 'Secure_3D_Composite'}</span>
          </button>
        </div>
        <div className="flex items-center space-x-6 text-[9px] font-black text-emerald-900 uppercase">
          <span className="flex items-center gap-2"><Cpu size={14} /> Node: SOVEREIGN_AUTOPSY_v88</span>
          <span className="flex items-center gap-2"><Crosshair size={14} className={isTargeting || highlightedDepth ? "text-emerald-400 animate-pulse" : ""} /> Status: {isTargeting || highlightedDepth ? 'LOCK' : 'SEARCH'}</span>
        </div>
      </div>
    </div>
  );
};

export default TraumaNode;
