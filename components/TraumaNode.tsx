
import React, { useMemo, useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { MOCK_TRAUMA_DATA } from '../constants';
import { TraumaLayer, TraumaEvent, TraumaData } from '../types';
// Added Box to the imports from lucide-react
import { 
  Scan, Maximize2, Minimize2, Navigation, 
  Target, Info, AlertCircle, Crosshair,
  Search, Trash2, Clock, MapPin, Activity,
  ShieldAlert, ChevronRight, Zap, Loader2,
  Thermometer, Flame, Droplets, Gauge,
  CircleDot, Layers, BoxSelect, Cpu,
  Compass, Ruler, MinusSquare, Percent,
  SlidersHorizontal, Settings, Sun,
  Binary, Terminal, ShieldCheck,
  MoveVertical, MousePointer2,
  Box
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
  [TraumaLayer.OVALITY]: 'ovality',
  [TraumaLayer.UV_INDEX]: 'uvIndex'
};

const layerToUnit: Record<TraumaLayer, string> = {
  [TraumaLayer.DEVIATION]: 'deg',
  [TraumaLayer.CORROSION]: '%',
  [TraumaLayer.TEMPERATURE]: '°C',
  [TraumaLayer.WALL_LOSS]: 'mm',
  [TraumaLayer.WATER_LEAKAGE]: '%',
  [TraumaLayer.STRESS]: 'kpsi',
  [TraumaLayer.ICI]: 'idx',
  [TraumaLayer.METAL_LOSS]: 'mm',
  [TraumaLayer.OVALITY]: '%',
  [TraumaLayer.UV_INDEX]: 'uv'
};

const layerToIcon: Record<TraumaLayer, React.ReactNode> = {
  [TraumaLayer.DEVIATION]: <Compass size={14} />,
  [TraumaLayer.CORROSION]: <Flame size={14} />,
  [TraumaLayer.TEMPERATURE]: <Thermometer size={14} />,
  [TraumaLayer.WALL_LOSS]: <MinusSquare size={14} />,
  [TraumaLayer.WATER_LEAKAGE]: <Droplets size={14} />,
  [TraumaLayer.STRESS]: <Activity size={14} />,
  [TraumaLayer.ICI]: <Ruler size={14} />,
  [TraumaLayer.METAL_LOSS]: <Zap size={14} />,
  [TraumaLayer.OVALITY]: <Percent size={14} />,
  [TraumaLayer.UV_INDEX]: <Sun size={14} />
};

interface TraumaNodeProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const TraumaNode: React.FC<TraumaNodeProps> = ({ isFocused = false, onToggleFocus }) => {
  const plotContainerRef = useRef<HTMLDivElement>(null);
  const [highlightedDepth, setHighlightedDepth] = useState<number | null>(null);
  const [activeLayer, setActiveLayer] = useState<TraumaLayer>(TraumaLayer.CORROSION);
  const [isScanning, setIsScanning] = useState(false);
  const [isCrossSectionView, setIsCrossSectionView] = useState(false);
  const [uiRevision, setUiRevision] = useState<string>('initial');
  const [isGlitching, setIsGlitching] = useState(false);
  const [isTargeting, setIsTargeting] = useState(false);
  const [zScale, setZScale] = useState(2.5);

  const [layerOpacities, setLayerOpacities] = useState<Record<TraumaLayer, number>>(
    Object.values(TraumaLayer).reduce((acc, layer) => ({ ...acc, [layer]: 85 }), {} as Record<TraumaLayer, number>)
  );

  const allDepths = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.depth))).sort((a, b) => a - b), []);
  const fingerIds = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.fingerId))).sort((a, b) => a - b), []);

  const [blackBoxLogs, setBlackBoxLogs] = useState<TraumaEvent[]>(() => {
    const saved = localStorage.getItem('BRAHAN_BLACK_BOX_LOGS');
    return saved ? JSON.parse(saved) : [];
  });

  const runForensicScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const key = layerToKey[activeLayer];
      const unit = layerToUnit[activeLayer];
      
      const depthGroups = MOCK_TRAUMA_DATA.reduce((acc, curr) => {
        const val = curr[key] as number;
        if (val > 15 || (activeLayer === TraumaLayer.OVALITY && val > 3)) {
          if (!acc[curr.depth] || (acc[curr.depth][key] as number) < val) {
            acc[curr.depth] = curr;
          }
        }
        return acc;
      }, {} as Record<number, TraumaData>);

      const newEvents: TraumaEvent[] = Object.values(depthGroups).map(a => {
        const val = a[key] as number;
        let severity: 'CRITICAL' | 'WARNING' | 'INFO' = 'INFO';
        if (val > 40) severity = 'CRITICAL';
        else if (val > 20) severity = 'WARNING';

        return {
          timestamp: new Date().toISOString(),
          layer: activeLayer,
          depth: a.depth,
          value: val,
          unit: unit,
          severity,
          description: `Localized ${activeLayer.toLowerCase()} surge detected at ${a.depth}m. Structural integrity suspect.`
        };
      });

      const updated = [...newEvents, ...blackBoxLogs].slice(0, 100);
      setBlackBoxLogs(updated);
      localStorage.setItem('BRAHAN_BLACK_BOX_LOGS', JSON.stringify(updated));
      setIsScanning(false);
    }, 1500);
  };

  useEffect(() => {
    if (!plotContainerRef.current) return;

    const baseRadius = 50; 
    let traces: any[] = [];
    let layout: any = {};

    const getColorScale = (layer: TraumaLayer) => {
      switch(layer) {
        case TraumaLayer.CORROSION:
          return [[0, '#020617'], [0.3, '#1e293b'], [0.6, '#ef4444'], [1.0, '#ffffff']];
        case TraumaLayer.STRESS:
          return [[0, '#020617'], [0.4, '#4338ca'], [0.7, '#a855f7'], [1.0, '#ffffff']];
        case TraumaLayer.TEMPERATURE:
          return [[0, '#020617'], [0.5, '#fde047'], [1.0, '#fbbf24']];
        case TraumaLayer.METAL_LOSS:
          return [[0, '#020617'], [0.4, '#10b981'], [0.8, '#ef4444'], [1.0, '#ffffff']];
        default:
          return [[0, '#020617'], [0.5, '#10b981'], [1.0, '#34d399']];
      }
    };

    if (isCrossSectionView) {
      const targetDepth = highlightedDepth || allDepths[0];
      const dataAtDepth = MOCK_TRAUMA_DATA.filter(d => d.depth === targetDepth);
      const key = layerToKey[activeLayer];
      
      const rValues: number[] = [];
      const thetaValues: number[] = [];
      const colorValues: number[] = [];

      fingerIds.forEach((fId, idx) => {
        const entry = dataAtDepth.find(d => d.fingerId === fId);
        const val = entry ? (entry[key] as number) : 0;
        const r = baseRadius + (val * 0.4); 
        
        rValues.push(r);
        thetaValues.push((idx / fingerIds.length) * 360);
        colorValues.push(val);
      });

      rValues.push(rValues[0]);
      thetaValues.push(thetaValues[0]);
      colorValues.push(colorValues[0]);

      traces.push({
        type: 'scatterpolar',
        r: rValues,
        theta: thetaValues,
        mode: 'lines+markers',
        fill: 'toself',
        fillcolor: 'rgba(16, 185, 129, 0.1)',
        line: { color: '#10b981', width: 2 },
        marker: {
          color: colorValues,
          colorscale: getColorScale(activeLayer),
          size: 6,
          line: { width: 0.5, color: '#ffffff' }
        },
        name: `RADIAL_SLICE @ ${targetDepth}m`
      });

      layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 40, r: 40, b: 40, t: 60 },
        polar: {
          bgcolor: 'rgba(2, 6, 23, 0.9)',
          angularaxis: { 
            tickfont: { size: 9, color: '#064e3b', family: 'Fira Code' }, 
            gridcolor: 'rgba(16, 185, 129, 0.1)',
            linecolor: '#10b981'
          },
          radialaxis: { 
            tickfont: { size: 8, color: '#10b981', family: 'Fira Code' }, 
            gridcolor: 'rgba(16, 185, 129, 0.1)',
            range: [0, 150],
            linecolor: '#10b981'
          }
        },
        showlegend: false,
        title: {
          text: `RADIAL_FORENSIC_MAPPING: ${activeLayer} (DEPTH: ${targetDepth}m)`,
          font: { color: '#10b981', size: 10, family: 'Fira Code' }
        }
      };
    } else {
      const xData: number[][] = [];
      const yData: number[][] = [];
      const zData: number[][] = [];
      const colorData: number[][] = [];

      allDepths.forEach((depth) => {
        const xRow: number[] = [];
        const yRow: number[] = [];
        const zRow: number[] = [];
        const cRow: number[] = [];
        const dataAtDepth = MOCK_TRAUMA_DATA.filter(d => d.depth === depth);

        fingerIds.forEach((fId, fIdx) => {
          const theta = (fIdx / fingerIds.length) * 2 * Math.PI;
          const entry = dataAtDepth.find(d => d.fingerId === fId);
          let val = entry ? (entry[layerToKey[activeLayer]] as number) : 0;
          
          // Topological displacement: Physical deformation based on trauma value
          const r = baseRadius + (val * 0.6); 
          
          xRow.push(r * Math.cos(theta));
          yRow.push(r * Math.sin(theta));
          zRow.push(depth);
          cRow.push(val);
        });

        // Close cylinder loop
        xRow.push(xRow[0]);
        yRow.push(yRow[0]);
        zRow.push(zRow[0]);
        cRow.push(cRow[0]);

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
        colorscale: getColorScale(activeLayer),
        showscale: false,
        lighting: { 
          ambient: 0.6, 
          diffuse: 0.9, 
          roughness: 0.1, 
          specular: 1.5,
          fresnel: 0.2
        },
        opacity: layerOpacities[activeLayer] / 100,
        name: activeLayer,
        hoverinfo: 'z+surfacecolor'
      });

      // Target Lock Visualization (3D Rings)
      if (highlightedDepth !== null) {
        const ringTheta = Array.from({length: 60}, (_, i) => (i/59) * 2 * Math.PI);
        const ringX = ringTheta.map(t => baseRadius * 1.8 * Math.cos(t));
        const ringY = ringTheta.map(t => baseRadius * 1.8 * Math.sin(t));
        const ringZ = ringTheta.map(() => highlightedDepth);

        traces.push({
          type: 'scatter3d',
          mode: 'lines',
          x: ringX, y: ringY, z: ringZ,
          line: { color: '#ef4444', width: 6, opacity: 0.8 },
          name: 'DEPTH_LOCK_TARGET'
        });

        // Laser Crosshair Planes
        traces.push({
          type: 'scatter3d',
          mode: 'lines',
          x: [-120, 120, null, 0, 0],
          y: [0, 0, null, -120, 120],
          z: [highlightedDepth, highlightedDepth, null, highlightedDepth, highlightedDepth],
          line: { color: '#ef4444', width: 2, opacity: 0.4 },
          name: 'TARGET_VANES'
        });
      }

      layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 0, r: 0, b: 0, t: 0 },
        uirevision: uiRevision,
        scene: {
          xaxis: { visible: false },
          yaxis: { visible: false },
          zaxis: { 
            title: 'DEPTH (m)', 
            backgroundcolor: '#010409', 
            gridcolor: '#064e3b',
            tickfont: { color: '#10b981', size: 10, family: 'Fira Code' },
            titlefont: { color: '#10b981', size: 12, family: 'Fira Code' }
          },
          aspectmode: 'manual',
          aspectratio: { x: 1, y: 1, z: zScale },
          camera: {
            eye: { x: 1.6, y: 1.6, z: 1.2 },
            projection: { type: 'perspective' }
          }
        },
        autosize: true
      };
    }

    Plotly.react(plotContainerRef.current, traces, layout, { 
      responsive: true, 
      displayModeBar: false,
      displaylogo: false
    });

    return () => {
      if (plotContainerRef.current) Plotly.purge(plotContainerRef.current);
    };
  }, [allDepths, fingerIds, activeLayer, highlightedDepth, uiRevision, isCrossSectionView, layerOpacities, zScale]);

  const handleLogClick = (depth: number) => {
    setHighlightedDepth(depth);
    setIsTargeting(true);
    setIsGlitching(true);
    setUiRevision(Date.now().toString());

    // Auto-focus camera logic
    if (plotContainerRef.current && !isCrossSectionView) {
      const zRange = allDepths[allDepths.length-1] - allDepths[0];
      const normalizedZ = (depth - allDepths[0]) / zRange;
      const cameraCenterZ = normalizedZ * 2 - 1; 

      Plotly.relayout(plotContainerRef.current, {
        'scene.camera.center': { x: 0, y: 0, z: cameraCenterZ },
        'scene.camera.eye': { x: 1.4, y: 1.4, z: cameraCenterZ + 0.6 } 
      });
    }

    setTimeout(() => {
        setIsGlitching(false);
        setIsTargeting(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 bg-slate-900/40 border border-emerald-900/30 rounded-lg relative overflow-hidden font-terminal">
      
      {/* TARGETING HUD */}
      {isTargeting && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center animate-in fade-in duration-300">
           <div className="w-full h-full border-[20px] border-red-500/10 pointer-events-none"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-64 h-64 border border-red-500/40 rounded-full animate-ping opacity-20"></div>
           </div>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Box size={24} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">Trauma_Node_3D</h2>
              <div className="flex items-center space-x-3 text-[10px] text-emerald-800 font-black uppercase tracking-widest">
                <Binary size={14} />
                <span>Surface_Reconstruction_Engine</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/50 p-1.5 rounded-lg border border-emerald-900/30">
             <button 
               onClick={() => setIsCrossSectionView(!isCrossSectionView)}
               className={`flex items-center space-x-2 px-4 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all ${isCrossSectionView ? 'bg-orange-500 text-slate-950' : 'text-emerald-800 hover:text-emerald-400'}`}
               title="Toggle radial mapping view"
             >
               <Layers size={14} />
               <span>{isCrossSectionView ? '3D_Mode' : 'Radial_Map'}</span>
             </button>
             
             <button 
               onClick={runForensicScan}
               disabled={isScanning}
               className={`flex items-center space-x-2 px-4 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all ${isScanning ? 'bg-orange-500/20 text-orange-500' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'}`}
             >
               {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Scan size={14} />}
               <span>Scan_Sector</span>
             </button>

             <button onClick={onToggleFocus} className="p-2 text-emerald-900 hover:text-emerald-400">
               {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
             </button>
          </div>
        </div>

        {/* MODALITY SELECTOR */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
           {Object.values(TraumaLayer).map((layer) => (
             <button
               key={layer}
               onClick={() => {
                 setIsGlitching(true);
                 setActiveLayer(layer);
                 setUiRevision(Date.now().toString());
                 setTimeout(() => setIsGlitching(false), 250);
               }}
               className={`flex items-center space-x-2 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                 activeLayer === layer 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-slate-900/50 text-emerald-900 border-emerald-900/20 hover:text-emerald-500 hover:border-emerald-500/40'
               }`}
             >
               {layerToIcon[layer]}
               <span>{layer}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        {/* MAIN PLOT CANVAS */}
        <div 
          ref={plotContainerRef} 
          className={`flex-1 bg-slate-950 rounded-xl border border-emerald-900/40 overflow-hidden relative shadow-2xl transition-all duration-300 ${isGlitching ? 'blur-xl grayscale' : ''}`}
        >
           {/* HUD Overlay Stats */}
           <div className="absolute bottom-4 left-4 z-20 space-y-2 pointer-events-none">
              <div className="bg-slate-950/80 border border-emerald-900/40 px-3 py-1.5 rounded flex items-center space-x-3 backdrop-blur-md">
                 <MoveVertical size={12} className="text-emerald-500" />
                 <span className="text-[9px] text-emerald-700 font-black uppercase">Depth_Voxel:</span>
                 <span className="text-[10px] text-emerald-100 font-black">{highlightedDepth ? highlightedDepth.toFixed(2) : '---'}m</span>
              </div>
              <div className="bg-slate-950/80 border border-emerald-900/40 px-3 py-1.5 rounded flex items-center space-x-3 backdrop-blur-md">
                 <MousePointer2 size={12} className="text-emerald-500" />
                 <span className="text-[9px] text-emerald-700 font-black uppercase">InteractionMode:</span>
                 <span className="text-[10px] text-emerald-100 font-black">ORBIT_TARGET</span>
              </div>
           </div>
        </div>

        {/* SIDEBAR ANALYTICS */}
        <div className="w-full lg:w-80 flex flex-col space-y-4 h-96 lg:h-auto">
          {/* Layer Calibrator */}
          <div className="bg-slate-950/90 border border-emerald-900/30 rounded-xl p-5 flex flex-col space-y-4 shadow-xl">
             <div className="flex items-center justify-between border-b border-emerald-900/10 pb-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Calibration_Array</span>
                <SlidersHorizontal size={14} className="text-emerald-700" />
             </div>
             
             <div className="space-y-4 overflow-y-auto max-h-40 custom-scrollbar pr-1">
                {Object.values(TraumaLayer).map((layer) => (
                  <div key={layer} className={`space-y-1.5 ${activeLayer === layer ? 'opacity-100' : 'opacity-30 transition-opacity hover:opacity-60'}`}>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                         <span className="text-[8px] font-black uppercase text-emerald-100">{layer}</span>
                       </div>
                       <span className="text-[9px] font-terminal text-emerald-400">{layerOpacities[layer]}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={layerOpacities[layer]} 
                      onChange={(e) => setLayerOpacities(p => ({ ...p, [layer]: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-slate-900 appearance-none rounded-full accent-emerald-500" 
                    />
                  </div>
                ))}
             </div>

             <div className="pt-2 border-t border-emerald-900/10 space-y-2">
                <div className="flex justify-between text-[8px] font-black uppercase text-emerald-900">
                   <span>Wellbore_Z-Scale</span>
                   <span>x{zScale.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="0.5" value={zScale} 
                  onChange={(e) => setZScale(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-900 appearance-none rounded-full accent-orange-500" 
                />
             </div>
          </div>

          {/* BLACK BOX LOGS */}
          <div className="flex-1 bg-slate-950/90 border border-emerald-900/40 rounded-xl flex flex-col overflow-hidden shadow-2xl">
             <div className="bg-slate-900/90 border-b border-emerald-900/60 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Black_Box_Vault</span>
                </div>
                <button onClick={() => setBlackBoxLogs([])} className="p-1 text-emerald-900 hover:text-red-500"><Trash2 size={12} /></button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {blackBoxLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleLogClick(log.depth)}
                    className={`flex flex-col border-l-4 rounded px-3 py-2 transition-all cursor-pointer group ${highlightedDepth === log.depth ? 'bg-emerald-500/10 border-emerald-400' : 'bg-slate-900/40 border-emerald-900/30 hover:bg-slate-900/80'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[8px] font-black uppercase ${log.severity === 'CRITICAL' ? 'text-red-500' : 'text-orange-400'}`}>{log.severity}</span>
                      <span className="text-[8px] font-mono text-emerald-900">{log.depth.toFixed(2)}m</span>
                    </div>
                    <div className="text-[10px] text-emerald-100 font-black uppercase truncate">{log.layer} DISCREPANCY</div>
                    <div className="flex items-center justify-between mt-1 text-[8px] text-emerald-700 font-mono">
                       <span>VALUE: {log.value.toFixed(2)} {log.unit}</span>
                       <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
                {blackBoxLogs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 italic text-[10px] py-12 text-center px-8">
                     <Terminal size={32} className="mb-2" />
                     <span>No active anomalies archived. Run sector scan to populate.</span>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: orbit 20s linear infinite; }
      `}</style>
    </div>
  );
};

export default TraumaNode;
