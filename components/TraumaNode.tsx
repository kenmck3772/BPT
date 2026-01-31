
import React, { useMemo, useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { MOCK_TRAUMA_DATA } from '../constants';
import { TraumaLayer, TraumaData } from '../types';
import { 
  Maximize2, Minimize2, Navigation, ScanLine, 
  Activity, Layers, Crosshair, 
  ZoomIn, ZoomOut, RotateCcw, RotateCw, Move, 
  MapPin, Zap, LayoutGrid, CheckSquare, 
  Square as SquareIcon, Box, Terminal, AlertOctagon,
  Search, X, Target as TargetIcon, Trash2, Eye, EyeOff,
  MoveVertical, Focus, ArrowUp, ArrowDown, ShieldAlert,
  Thermometer, Droplets, Waves, BoxSelect, SlidersHorizontal,
  Palette, Info, Triangle, CircleDot, Gauge,
  ShieldCheck,
  Compass,
  Camera,
  MousePointer2,
  Orbit,
  Hand,
  PlayCircle,
  PauseCircle,
  Video
} from 'lucide-react';

const layerToKey: Record<TraumaLayer, keyof Omit<TraumaData, 'fingerId' | 'depth'>> = {
  [TraumaLayer.PRESSURE]: 'stress',
  [TraumaLayer.THERMAL]: 'temperature',
  [TraumaLayer.EYERUNE_TRUTH]: 'eyeruneTruth',
  [TraumaLayer.DEVIATION]: 'deviation',
  [TraumaLayer.VIBRATION]: 'vibration'
};

const layerColors: Record<TraumaLayer, string[][]> = {
  [TraumaLayer.PRESSURE]: [['0', '#450a0a'], ['1', '#ef4444']],
  [TraumaLayer.THERMAL]: [['0', '#020617'], ['1', '#3b82f6']],
  [TraumaLayer.EYERUNE_TRUTH]: [['0', '#2e1065'], ['1', '#ffffff']], 
  [TraumaLayer.DEVIATION]: [['0', '#064e3b'], ['1', '#fef08a']],
  [TraumaLayer.VIBRATION]: [['0', '#1e1b4b'], ['1', '#ffffff']]
};

const LAYER_CONFIGS = {
  [TraumaLayer.PRESSURE]: { label: "Pressure Variance", icon: Gauge, category: "Mechanical Stress", source: "NDR_VERIFIED_TRACE" },
  [TraumaLayer.THERMAL]: { label: "Thermal Pulse", icon: Thermometer, category: "Environmental", source: "NDR_VERIFIED_TRACE" },
  [TraumaLayer.EYERUNE_TRUTH]: { label: "The Eyerune Truth", icon: CircleDot, category: "Forensic Reconstruction", source: "AUTHOR_TRUTH_KERNEL" },
  [TraumaLayer.DEVIATION]: { label: "Directional Deviation", icon: Compass, category: "Geodetic Audit", source: "NDR_VERIFIED_TRACE" },
  [TraumaLayer.VIBRATION]: { label: "High-Freq Vibration", icon: Zap, category: "Mechanical Stress", source: "SENSORY_VOXEL_DATA" }
};

const CATEGORIES: Record<string, { label: string; icon: any; layers: TraumaLayer[] }> = {
  CORE: { label: "Sovereign Core Registry", icon: ShieldAlert, layers: [TraumaLayer.PRESSURE, TraumaLayer.THERMAL, TraumaLayer.DEVIATION] },
  STRESS: { label: "Forensic Stress Traces", icon: Waves, layers: [TraumaLayer.EYERUNE_TRUTH, TraumaLayer.VIBRATION] }
};

interface TraumaNodeProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const TraumaNode: React.FC<TraumaNodeProps> = ({ isFocused = false, onToggleFocus }) => {
  const plotContainerRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<'orbit' | 'pan'>('orbit');
  const [showTrajectoryLine, setShowTrajectoryLine] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const rotationRef = useRef<number | null>(null);
  
  const [camera, setCamera] = useState({
    eye: { x: 2.2, y: 2.2, z: 1.5 },
    center: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 0, z: 1 }
  });
  
  const [zScale, setZScale] = useState(2.0);
  const [uirevision, setUirevision] = useState<string>('initial-state');

  const [layerVisibility, setLayerVisibility] = useState<Record<TraumaLayer, boolean>>({
    [TraumaLayer.PRESSURE]: true,
    [TraumaLayer.THERMAL]: false,
    [TraumaLayer.EYERUNE_TRUTH]: false,
    [TraumaLayer.DEVIATION]: false,
    [TraumaLayer.VIBRATION]: false
  });

  const [layerOpacities, setLayerOpacities] = useState<Record<TraumaLayer, number>>(() => {
    const obj = {} as Record<TraumaLayer, number>;
    Object.values(TraumaLayer).forEach(l => obj[l as TraumaLayer] = 0.85);
    return obj;
  });

  const allDepths = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.depth))).sort((a, b) => a - b) as number[], []);
  
  const centerLine = useMemo(() => {
    const path: Record<number, { x: number, y: number }> = {};
    allDepths.forEach((d) => { path[d] = { x: 0, y: 0 }; });
    return path;
  }, [allDepths]);

  // Main Render Effect
  useEffect(() => {
    if (!plotContainerRef.current) return;
    const traces: any[] = [];
    const numPhi = 40; 

    if (showTrajectoryLine) {
        traces.push({
            type: 'scatter3d',
            x: allDepths.map(d => centerLine[d].x),
            y: allDepths.map(d => centerLine[d].y),
            z: allDepths,
            mode: 'lines',
            line: { color: '#10b981', width: 4, opacity: 0.3 },
            name: 'PHYSICAL_AXIS',
            hoverinfo: 'none',
            showlegend: false
        });
    }

    Object.entries(layerVisibility).forEach(([layer, visible]) => {
      if (!visible) return;
      const traumaLayer = layer as TraumaLayer;
      const dataKey = layerToKey[traumaLayer];
      const opacity = layerOpacities[traumaLayer];
      const zValues: number[][] = [];
      const xValues: number[][] = [];
      const yValues: number[][] = [];
      const intensityValues: number[][] = [];

      allDepths.forEach((d) => {
        const rowX: number[] = [];
        const rowY: number[] = [];
        const rowIntensity: number[] = [];
        const center = centerLine[d] || { x: 0, y: 0 };
        for (let phiIdx = 0; phiIdx < numPhi; phiIdx++) {
          const phi = (phiIdx / numPhi) * 2 * Math.PI;
          const entry = MOCK_TRAUMA_DATA.find(t => t.depth === d && t.fingerId === phiIdx + 1);
          const val = entry ? (entry[dataKey] as number) : 0;
          
          let radiusAdjustment = 0;
          if (traumaLayer === TraumaLayer.EYERUNE_TRUTH) {
             radiusAdjustment = val * 0.6;
          } else if (traumaLayer === TraumaLayer.PRESSURE) {
             radiusAdjustment = (val - 100) * 0.015;
          } else if (traumaLayer === TraumaLayer.DEVIATION) {
             radiusAdjustment = val * 0.08;
          } else if (traumaLayer === TraumaLayer.VIBRATION) {
             radiusAdjustment = val * 0.5;
          } else {
             radiusAdjustment = (val - 20) * 0.04;
          }

          const radius = 1.8 + radiusAdjustment;
          rowX.push(center.x + radius * Math.cos(phi));
          rowY.push(center.y + radius * Math.sin(phi));
          rowIntensity.push(val);
        }
        xValues.push(rowX);
        yValues.push(rowY);
        zValues.push(Array(numPhi).fill(d));
        intensityValues.push(rowIntensity);
      });

      traces.push({
        type: 'surface',
        x: xValues, y: yValues, z: zValues,
        surfacecolor: intensityValues,
        colorscale: layerColors[traumaLayer],
        opacity: opacity,
        showscale: false,
        name: LAYER_CONFIGS[traumaLayer].label,
        hoverinfo: 'name+z',
        lighting: { ambient: 0.5, diffuse: 0.8, fresnel: 0.2, specular: 0.5, roughness: 0.5 },
        contours: traumaLayer === TraumaLayer.EYERUNE_TRUTH ? {
          z: { show: true, usecolormap: true, project: { z: true }, color: '#ffffff' }
        } : undefined
      });
    });

    const layout: any = {
      paper_bgcolor: 'rgba(0,0,0,0)', 
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 0, r: 0, b: 0, t: 0 },
      scene: {
        xaxis: { visible: false, zeroline: false },
        yaxis: { visible: false, zeroline: false },
        zaxis: { title: 'TVD (m)', color: '#10b981', gridcolor: '#064e3b', autorange: 'reversed', zeroline: false },
        aspectmode: 'manual', 
        aspectratio: { x: 1, y: 1, z: zScale },
        camera: camera, 
        dragmode: dragMode
      },
      uirevision: uirevision, 
      showlegend: false
    };

    Plotly.newPlot(plotContainerRef.current, traces, layout, { 
      responsive: true, 
      displayModeBar: false, 
      scrollZoom: true 
    });
    
    const plot = plotContainerRef.current as any;
    plot.on('plotly_relayout', (eventData: any) => {
      const newCamera = eventData['scene.camera'];
      if (newCamera) { 
        setCamera(newCamera); 
        setUirevision('camera-active');
      }
    });

    return () => { if (plotContainerRef.current) Plotly.purge(plotContainerRef.current); };
  }, [allDepths, layerVisibility, layerOpacities, zScale, showTrajectoryLine]);

  // Auto-Rotate Loop
  useEffect(() => {
    if (!isAutoRotating || !plotContainerRef.current) {
      if (rotationRef.current) cancelAnimationFrame(rotationRef.current);
      return;
    }

    let angle = Math.atan2(camera.eye.y, camera.eye.x);
    const radius = Math.sqrt(camera.eye.x ** 2 + camera.eye.y ** 2);

    const step = () => {
      angle += 0.005;
      const nextEye = {
        ...camera.eye,
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      };

      Plotly.relayout(plotContainerRef.current!, {
        'scene.camera.eye': nextEye
      });

      rotationRef.current = requestAnimationFrame(step);
    };

    rotationRef.current = requestAnimationFrame(step);
    return () => { if (rotationRef.current) cancelAnimationFrame(rotationRef.current); };
  }, [isAutoRotating]);

  // Camera Control Handlers
  const handleZoom = (factor: number) => {
    const newEye = {
      x: camera.eye.x * factor,
      y: camera.eye.y * factor,
      z: camera.eye.z * factor
    };
    setCamera(prev => ({ ...prev, eye: newEye }));
    setUirevision(Date.now().toString());
  };

  const handleResetCamera = () => {
    const defaultCam = { eye: { x: 2.2, y: 2.2, z: 1.5 }, center: { x: 0, y: 0, z: 0 }, up: { x: 0, y: 0, z: 1 } };
    setCamera(defaultCam);
    setUirevision('reset-' + Date.now());
    setIsAutoRotating(false);
  };

  const setViewPreset = (view: 'FRONT' | 'TOP' | 'PERSPECTIVE') => {
    let newEye;
    switch(view) {
      case 'FRONT': newEye = { x: 3.5, y: 0, z: 0 }; break;
      case 'TOP': newEye = { x: 0, y: 0, z: 3.5 }; break;
      case 'PERSPECTIVE': newEye = { x: 2.2, y: 2.2, z: 1.5 }; break;
    }
    setCamera(prev => ({ ...prev, eye: newEye, center: { x: 0, y: 0, z: 0 } }));
    setUirevision('preset-' + view + '-' + Date.now());
    setIsAutoRotating(false);
  };

  const toggleSoloLayer = (soloLayer: TraumaLayer) => {
    const newState = { ...layerVisibility };
    Object.keys(newState).forEach(key => { newState[key as TraumaLayer] = (key === soloLayer); });
    setLayerVisibility(newState);
    setUirevision('layer-toggle-' + soloLayer);
  };

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden border border-emerald-900/30 font-terminal">
      <div className="flex justify-between items-center p-4 border-b border-emerald-900/20 bg-slate-950/90 z-20 shadow-2xl backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Box size={20} className="text-emerald-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-emerald-400 uppercase tracking-tighter">Trauma_Node_3D</h2>
            <span className="text-[8px] font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1.5">
               <Activity size={10} /> Forensic_Cylindrical_Reconstruction: Active
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowTrajectoryLine(!showTrajectoryLine)} className={`px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all border ${showTrajectoryLine ? 'bg-emerald-500 text-black border-emerald-400' : 'text-emerald-800 border-emerald-900/30 hover:text-emerald-600'}`}>
             Physical_Axis
          </button>
          {onToggleFocus && (
            <button onClick={onToggleFocus} aria-label="Toggle Focus Mode" className="p-2 text-emerald-900 hover:text-[#00FF41] transition-all bg-emerald-500/5 rounded border border-emerald-900/30">
              {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative min-h-0 bg-[#010409]">
        <div ref={plotContainerRef} className="w-full h-full" />
        
        {/* Floating Advanced Camera HUD */}
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-3">
           <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-1.5 backdrop-blur-xl shadow-2xl flex flex-col space-y-1">
              <button 
                onClick={() => setDragMode('orbit')} 
                className={`p-3 rounded-lg transition-all border ${dragMode === 'orbit' ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-emerald-900 border-transparent hover:text-emerald-500'}`} 
                title="Orbit Mode"
              >
                <Orbit size={20} />
              </button>
              <button 
                onClick={() => setDragMode('pan')} 
                className={`p-3 rounded-lg transition-all border ${dragMode === 'pan' ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-emerald-900 border-transparent hover:text-emerald-500'}`} 
                title="Pan Mode"
              >
                <Hand size={20} />
              </button>
           </div>
           
           <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-1.5 backdrop-blur-xl shadow-2xl flex flex-col space-y-1">
              <button 
                onClick={() => handleZoom(0.85)} 
                className="p-3 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all" 
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>
              <button 
                onClick={() => handleZoom(1.15)} 
                className="p-3 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all" 
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              <div className="h-px bg-emerald-900/40 mx-2 my-1" />
              <button 
                onClick={() => setIsAutoRotating(!isAutoRotating)} 
                className={`p-3 rounded-lg transition-all ${isAutoRotating ? 'bg-orange-500 text-black shadow-[0_0_15px_#f97316]' : 'text-emerald-900 hover:text-orange-500'}`} 
                title="Turntable Mode"
              >
                {isAutoRotating ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
              </button>
              <button 
                onClick={handleResetCamera} 
                className="p-3 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all" 
                title="Reset Camera"
              >
                <RotateCcw size={20} />
              </button>
           </div>

           <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-1.5 backdrop-blur-xl shadow-2xl flex flex-col space-y-1">
              <button onClick={() => setViewPreset('PERSPECTIVE')} className="p-3 text-emerald-900 hover:text-emerald-400 text-[9px] font-black uppercase" title="Perspective View">Persp</button>
              <button onClick={() => setViewPreset('FRONT')} className="p-3 text-emerald-900 hover:text-emerald-400 text-[9px] font-black uppercase" title="Front View">Front</button>
              <button onClick={() => setViewPreset('TOP')} className="p-3 text-emerald-900 hover:text-emerald-400 text-[9px] font-black uppercase" title="Top View">Top</button>
           </div>
        </div>

        <div className="absolute top-4 left-4 z-30 w-80 space-y-4">
           <div className="bg-slate-950/80 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <MoveVertical size={14} /> Vertical_Stretch
                 </span>
                 <span className="text-[10px] font-mono text-emerald-500">{zScale.toFixed(1)}x</span>
              </div>
              <input type="range" min="0.5" max="10" step="0.1" value={zScale} onChange={e => setZScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-emerald-900/30 accent-emerald-500 appearance-none rounded-full cursor-pointer" />
           </div>

           <div className="bg-slate-950/80 border border-emerald-500/20 rounded-xl flex flex-col backdrop-blur-xl shadow-2xl max-h-[480px] overflow-hidden">
              <div className="p-4 border-b border-emerald-900/20 bg-slate-900/40">
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} /> Forensic_Trace_Registry
                 </span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4 bg-black/20">
                 {Object.entries(CATEGORIES).map(([catKey, cat]) => (
                     <div key={catKey} className="space-y-1">
                        <div className="flex items-center gap-2 px-2 py-1 text-[8px] font-black text-emerald-900 uppercase tracking-tighter border-b border-emerald-900/10">
                           <cat.icon size={10} /> {cat.label}
                        </div>
                        {cat.layers.map((layer) => {
                           const isVisible = layerVisibility[layer];
                           const config = LAYER_CONFIGS[layer];
                           const Icon = config.icon;
                           
                           return (
                             <div key={layer} className={`flex flex-col gap-1 p-2 transition-all rounded border ${isVisible ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 'border-transparent opacity-40 grayscale group hover:opacity-100 hover:grayscale-0'}`}>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => {
                                      setLayerVisibility(prev => ({ ...prev, [layer]: !isVisible }));
                                      setUirevision('toggle-' + Date.now());
                                  }} className={`flex-1 flex items-center gap-2 transition-all ${isVisible ? 'text-emerald-400' : 'text-emerald-900'}`}>
                                     <div className={`p-0.5 rounded ${isVisible ? 'text-white' : 'text-emerald-900'}`}>
                                        {isVisible ? <CheckSquare size={14} /> : <SquareIcon size={14} />}
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <Icon size={12} className={isVisible ? 'text-white' : 'text-emerald-900'} />
                                       <span className={`text-[9px] font-black uppercase tracking-tighter truncate ${isVisible ? 'text-emerald-100' : 'text-emerald-900'}`}>
                                         {config.label}
                                       </span>
                                     </div>
                                  </button>
                                  <button onClick={() => toggleSoloLayer(layer)} className="p-1 text-emerald-900 hover:text-emerald-400" title="Solo Focus"><TargetIcon size={10} /></button>
                                </div>

                                {isVisible && (
                                  <div className="mt-2 space-y-2 px-1 animate-in fade-in slide-in-from-top-1">
                                     <div className="flex items-center justify-between text-[7px] font-black uppercase text-emerald-800">
                                        <span className="flex items-center gap-1"><ShieldCheck size={8} /> Source: {config.source}</span>
                                     </div>
                                     <input 
                                       type="range" min="0.1" max="1.0" step="0.05" value={layerOpacities[layer]} 
                                       onChange={(e) => {
                                           setLayerOpacities(prev => ({ ...prev, [layer]: parseFloat(e.target.value) }));
                                           setUirevision('opacity-' + Date.now());
                                       }}
                                       className="w-full h-1 bg-emerald-900/30 accent-emerald-500 appearance-none rounded-full cursor-pointer"
                                     />
                                  </div>
                                )}
                             </div>
                           );
                        })}
                     </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="absolute bottom-8 left-8 p-4 bg-black/80 border border-emerald-500/40 rounded-xl backdrop-blur-md shadow-2xl">
           <div className="flex items-center gap-3 mb-1">
              <Video size={14} className="text-emerald-400" />
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Cylindrical_Autopsy_Map</h3>
           </div>
           <p className="text-[9px] text-emerald-900 uppercase">Forensic reconstruction @ 1235m - 1245m</p>
        </div>
      </div>
    </div>
  );
};

export default TraumaNode;
