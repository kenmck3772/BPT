
import React, { useMemo, useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { MOCK_TRAUMA_DATA } from '../constants';
import { TraumaLayer, TraumaEvent, TraumaData } from '../types';
import { 
  Scan, Maximize2, Minimize2, Navigation, 
  Target, Info, AlertCircle, Crosshair,
  Search, Trash2, Clock, MapPin, Activity,
  ShieldAlert, ChevronRight, Zap, Loader2,
  Thermometer, Flame, Droplets, Gauge,
  CircleDot
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

const layerToUnit: Record<TraumaLayer, string> = {
  [TraumaLayer.DEVIATION]: 'deg',
  [TraumaLayer.CORROSION]: '%',
  [TraumaLayer.TEMPERATURE]: '°C',
  [TraumaLayer.WALL_LOSS]: 'mm',
  [TraumaLayer.WATER_LEAKAGE]: '%',
  [TraumaLayer.STRESS]: 'kpsi',
  [TraumaLayer.ICI]: 'idx',
  [TraumaLayer.METAL_LOSS]: 'mm',
  [TraumaLayer.OVALITY]: '%'
};

interface TraumaNodeProps {
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const TraumaNode: React.FC<TraumaNodeProps> = ({ isFocused = false, onToggleFocus }) => {
  const plotContainerRef = useRef<HTMLDivElement>(null);
  const [highlightedDepth, setHighlightedDepth] = useState<number | null>(null);
  const [hoveredDepth, setHoveredDepth] = useState<number | null>(null);
  const [flashDepth, setFlashDepth] = useState<number | null>(null);
  const [isTargeting, setIsTargeting] = useState(false);
  const [activeLayer, setActiveLayer] = useState<TraumaLayer>(TraumaLayer.METAL_LOSS);
  const [isScanning, setIsScanning] = useState(false);
  const [isCrossSectionView, setIsCrossSectionView] = useState(false);
  const [pingCoord, setPingCoord] = useState<{ x: number, y: number } | null>(null);
  const [scanSweepDepth, setScanSweepDepth] = useState<number | null>(null);
  const [pulseScale, setPulseScale] = useState(1);
  const [uiRevision, setUiRevision] = useState<string>('initial');

  const allDepths = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.depth))).sort((a, b) => a - b), []);
  const fingerIds = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.fingerId))).sort((a, b) => a - b), []);

  const [blackBoxLogs, setBlackBoxLogs] = useState<TraumaEvent[]>(() => {
    const saved = localStorage.getItem('BRAHAN_BLACK_BOX_LOGS');
    return saved ? JSON.parse(saved) : [];
  });

  const clearLogs = () => {
    if (window.confirm("CONFIRM: WIPE FORENSIC TRACE HISTORY?")) {
      setBlackBoxLogs([]);
      localStorage.removeItem('BRAHAN_BLACK_BOX_LOGS');
    }
  };

  const runForensicScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const key = layerToKey[activeLayer];
      const unit = layerToUnit[activeLayer];
      
      const depthGroups = MOCK_TRAUMA_DATA.reduce((acc, curr) => {
        const val = curr[key] as number;
        if (val > 15) {
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
          description: `Anomalous ${activeLayer.toLowerCase()} detected during automated survey at ${a.depth}m. Trace ID: ${Math.random().toString(36).substring(7).toUpperCase()}`
        };
      });

      const existingKey = (e: TraumaEvent) => `${e.layer}-${e.depth}`;
      const uniqueNew = newEvents.filter(ne => !blackBoxLogs.some(be => existingKey(be) === existingKey(ne)));

      const updated = [...uniqueNew, ...blackBoxLogs].slice(0, 100);
      setBlackBoxLogs(updated);
      localStorage.setItem('BRAHAN_BLACK_BOX_LOGS', JSON.stringify(updated));
      setIsScanning(false);
    }, 1200);
  };

  // Plotly Initialization and Updates
  useEffect(() => {
    if (!plotContainerRef.current) return;

    const baseRadius = 50; 
    let traces: any[] = [];
    let layout: any = {};

    const getColorScale = (layer: TraumaLayer) => {
      switch(layer) {
        case TraumaLayer.STRESS:
          return [[0, '#020617'], [0.2, '#1e3a8a'], [0.5, '#7c3aed'], [0.8, '#db2777'], [1.0, '#ffffff']];
        case TraumaLayer.TEMPERATURE:
          return [[0, '#0c4a6e'], [0.3, '#0ea5e9'], [0.6, '#fde047'], [0.9, '#f97316'], [1.0, '#ffffff']];
        case TraumaLayer.WATER_LEAKAGE:
          return [[0, '#020617'], [0.3, '#1d4ed8'], [0.6, '#60a5fa'], [0.9, '#bfdbfe'], [1.0, '#ffffff']];
        default:
          return [[0, '#020617'], [0.1, '#064e3b'], [0.3, '#10b981'], [0.6, '#f59e0b'], [0.8, '#ef4444'], [1.0, '#ffffff']];
      }
    };

    if (isCrossSectionView) {
      // 2D CROSS-SECTION (POLAR)
      const targetDepth = highlightedDepth || allDepths[0];
      const dataAtDepth = MOCK_TRAUMA_DATA.filter(d => d.depth === targetDepth);
      const key = layerToKey[activeLayer];
      
      const rValues: number[] = [];
      const thetaValues: number[] = [];
      const colorValues: number[] = [];

      fingerIds.forEach((fId, idx) => {
        const entry = dataAtDepth.find(d => d.fingerId === fId);
        const val = entry ? (entry[key] as number) : 0;
        rValues.push(baseRadius + val);
        thetaValues.push((idx / fingerIds.length) * 360);
        colorValues.push(val);
      });

      // Close the loop
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
        line: { color: activeLayer === TraumaLayer.STRESS ? '#db2777' : '#10b981', width: 3 },
        marker: {
          color: colorValues,
          colorscale: getColorScale(activeLayer),
          size: 6,
          line: { color: '#010409', width: 1 }
        },
        name: `DEPTH_${targetDepth}m`
      });

      // Add a reference circle for nominal ID
      traces.push({
        type: 'scatterpolar',
        r: Array(thetaValues.length).fill(baseRadius),
        theta: thetaValues,
        mode: 'lines',
        line: { color: 'rgba(16, 185, 129, 0.2)', width: 1, dash: 'dot' },
        name: 'NOMINAL_ID'
      });

      layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 20, r: 20, b: 20, t: 40 },
        polar: {
          bgcolor: 'rgba(2, 6, 23, 0.5)',
          angularaxis: {
            tickfont: { size: 8, color: '#10b981', family: 'Fira Code' },
            gridcolor: 'rgba(16, 185, 129, 0.1)',
            linecolor: 'rgba(16, 185, 129, 0.3)'
          },
          radialaxis: {
            tickfont: { size: 8, color: '#10b981', family: 'Fira Code' },
            gridcolor: 'rgba(16, 185, 129, 0.1)',
            linecolor: 'rgba(16, 185, 129, 0.3)',
            range: [0, 150]
          }
        },
        showlegend: false,
        title: {
          text: `CROSS-SECTION // DEPTH: ${targetDepth.toFixed(3)}m`,
          font: { color: '#10b981', size: 12, family: 'Fira Code' },
          y: 0.95
        }
      };
    } else {
      // 3D VOXEL MAP
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
          const isFlashed = flashDepth === depth;
          const isNearSweep = scanSweepDepth !== null && Math.abs(depth - scanSweepDepth) < 0.2;
          
          const r = baseRadius + (isFlashed ? (val + 30) * pulseScale : val);
          
          xRow.push(r * Math.cos(theta));
          yRow.push(r * Math.sin(theta));
          zRow.push(depth);
          
          if (isFlashed) cRow.push(1000); 
          else if (isNearSweep) cRow.push(500); 
          else cRow.push(val);
        });

        xRow.push(xRow[0]);
        yRow.push(yRow[0]);
        zRow.push(zRow[0]);
        cRow.push(cRow[0]);

        xData.push(xRow);
        yData.push(yRow);
        zData.push(zRow);
        colorData.push(cRow);
      });

      const surfaceTrace = {
        type: 'surface',
        x: xData,
        y: yData,
        z: zData,
        surfacecolor: colorData,
        colorscale: getColorScale(activeLayer),
        showscale: false,
        lighting: { ambient: 0.5, diffuse: 0.8, specular: 2.0, roughness: 0.1, fresnel: 0.8 },
        lightposition: { x: 500, y: 500, z: 1245 },
        opacity: 0.95,
        name: activeLayer
      };

      traces = [surfaceTrace];

      // Axis Reference
      traces.push({
        type: 'scatter3d',
        mode: 'lines',
        x: [0, 0], y: [0, 0], z: [allDepths[0], allDepths[allDepths.length-1]],
        line: { color: '#064e3b', width: 2, dash: 'dot' },
        name: 'AXIS'
      });

      // Hover Highlight Slice
      if (hoveredDepth !== null && highlightedDepth === null) {
        const sliceX: number[] = [];
        const sliceY: number[] = [];
        const sliceZ: number[] = [];
        for (let i = 0; i <= 64; i++) {
          const theta = (i / 64) * 2 * Math.PI;
          sliceX.push(baseRadius * 1.5 * Math.cos(theta));
          sliceY.push(baseRadius * 1.5 * Math.sin(theta));
          sliceZ.push(hoveredDepth);
        }
        traces.push({
          type: 'scatter3d',
          mode: 'lines',
          x: sliceX, y: sliceY, z: sliceZ,
          line: { color: 'rgba(16, 185, 129, 0.2)', width: 4 },
          name: 'PREVIEW_SLICE'
        });
      }

      // Advanced Targeting System (Locked)
      if (highlightedDepth !== null) {
        const ringColor = activeLayer === TraumaLayer.STRESS ? '#db2777' : '#FF5F1F';
        [1.1, 1.4].forEach(scale => {
          const ringX: number[] = [];
          const ringY: number[] = [];
          const ringZ: number[] = [];
          for (let i = 0; i <= 64; i++) {
            const theta = (i / 64) * 2 * Math.PI;
            ringX.push(baseRadius * scale * Math.cos(theta));
            ringY.push(baseRadius * scale * Math.sin(theta));
            ringZ.push(highlightedDepth);
          }
          traces.push({
            type: 'scatter3d',
            mode: 'lines',
            x: ringX, y: ringY, z: ringZ,
            line: { color: ringColor, width: scale === 1.1 ? 8 : 2, dash: scale === 1.4 ? 'dash' : 'solid' },
            name: `TARGET_LOCK_${scale}`
          });
        });

        const vaneLen = 120;
        traces.push({
          type: 'scatter3d',
          mode: 'lines',
          x: [-vaneLen, vaneLen, null, 0, 0],
          y: [0, 0, null, -vaneLen, vaneLen],
          z: [highlightedDepth, highlightedDepth, null, highlightedDepth, highlightedDepth],
          line: { color: ringColor, width: 2, opacity: 0.4 },
          name: 'TARGET_VANES'
        });
        
        traces.push({
          type: 'scatter3d',
          mode: 'text+markers',
          x: [baseRadius * 1.8], y: [0], z: [highlightedDepth],
          text: [`[ANOMALY_COORD: ${highlightedDepth.toFixed(3)}m]`],
          marker: { size: 4, color: ringColor },
          textfont: { color: '#ffffff', size: 10, family: 'Fira Code' },
          textposition: 'middle right',
          name: 'LOCK_UI'
        });
      }

      // Sweep Plane
      if (scanSweepDepth !== null) {
        const sweepX: number[] = [];
        const sweepY: number[] = [];
        const sweepZ: number[] = [];
        for (let i = 0; i <= 40; i++) {
          const theta = (i / 40) * 2 * Math.PI;
          sweepX.push(110 * Math.cos(theta));
          sweepY.push(110 * Math.sin(theta));
          sweepZ.push(scanSweepDepth);
        }
        traces.push({
          type: 'scatter3d',
          mode: 'lines',
          x: sweepX, y: sweepY, z: sweepZ,
          line: { color: 'rgba(16, 185, 129, 0.4)', width: 6 },
          name: 'SCAN_SWEEP'
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
            backgroundcolor: '#010409', gridcolor: '#064e3b', zerolinecolor: '#10b981',
            tickfont: { color: '#10b981', size: 10, family: 'Fira Code' }
          },
          dragmode: 'orbit',
          aspectmode: 'manual',
          aspectratio: { x: 1, y: 1, z: 2 },
          camera: uiRevision === 'initial' ? {
            eye: { x: 1.8, y: 1.8, z: 1.2 },
            center: { x: 0, y: 0, z: 0 },
            projection: { type: 'perspective' }
          } : undefined
        },
        autosize: true
      };
    }

    Plotly.react(plotContainerRef.current, traces, layout, { 
      responsive: true, 
      displayModeBar: true, 
      modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
      displaylogo: false
    });

    return () => {
      if (plotContainerRef.current) Plotly.purge(plotContainerRef.current);
    };
  }, [allDepths, fingerIds, activeLayer, highlightedDepth, flashDepth, scanSweepDepth, pulseScale, hoveredDepth, uiRevision, isCrossSectionView]);

  const handleLogClick = (e: React.MouseEvent, depth: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPingCoord({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setPingCoord(null), 800);

    setHighlightedDepth(depth);
    setFlashDepth(depth);
    setIsTargeting(true);
    
    setUiRevision(Date.now().toString());

    setPulseScale(1.4);
    setTimeout(() => setPulseScale(1.0), 150);
    setTimeout(() => setPulseScale(1.2), 300);
    setTimeout(() => setPulseScale(1.0), 450);

    const startDepth = allDepths[0];
    const duration = 1000;
    const startTime = performance.now();
    
    const animateSweep = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress * (2 - progress); 
      const currentSweep = startDepth + (depth - startDepth) * easedProgress;
      setScanSweepDepth(currentSweep);
      
      if (progress < 1) requestAnimationFrame(animateSweep);
      else setTimeout(() => setScanSweepDepth(null), 300);
    };
    requestAnimationFrame(animateSweep);

    if (plotContainerRef.current && !isCrossSectionView) {
      const zRange = allDepths[allDepths.length-1] - allDepths[0];
      const normalizedZ = (depth - allDepths[0]) / zRange;
      const cameraCenterZ = normalizedZ * 2 - 1; 

      Plotly.relayout(plotContainerRef.current, {
        'scene.camera.center': { x: 0, y: 0, z: cameraCenterZ },
        'scene.camera.eye': { x: 1.1, y: 1.1, z: cameraCenterZ + 0.4 } 
      });
    }

    setTimeout(() => setFlashDepth(null), 1000);
    setTimeout(() => {
      setIsTargeting(false);
      // We don't null highlightedDepth here so it stays available for the Cross-Section view
    }, 6000);
  };

  return (
    <div className="flex flex-col h-full space-y-3 p-4 bg-slate-900/40 border border-emerald-900/30 rounded-lg transition-all relative overflow-hidden">
      
      {isTargeting && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center animate-in fade-in duration-500">
           <div className={`absolute inset-0 animate-pulse ${activeLayer === TraumaLayer.STRESS ? 'bg-pink-500/10' : 'bg-orange-500/5'}`}></div>
           
           <div className="absolute top-10 left-10 p-5 border border-emerald-500/20 bg-slate-950/90 backdrop-blur-xl rounded-lg animate-in slide-in-from-left-4 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <div className="flex items-center space-x-3 mb-3 border-b border-emerald-900/40 pb-2">
                 <Target size={16} className="text-emerald-400 animate-spin-slow" />
                 <span className="text-[10px] font-black text-emerald-400 tracking-[0.3em] uppercase">Target_Acquisition_Lock</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[7px] text-emerald-900 font-black uppercase mb-1">Depth_Vector</span>
                  <span className="text-[12px] font-terminal font-black text-emerald-100">{highlightedDepth?.toFixed(3)}m</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] text-emerald-900 font-black uppercase mb-1">Layer_Hash</span>
                  <span className="text-[12px] font-terminal font-black text-emerald-100">{activeLayer}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[8px] font-black text-emerald-700 uppercase">
                <span>Status: Reconstructing...</span>
                <Loader2 size={10} className="animate-spin" />
              </div>
           </div>

           <div className={`text-orange-500 font-black tracking-[0.6em] text-[10px] uppercase bg-slate-950/95 px-8 py-4 border flex items-center space-x-5 shadow-[0_0_80px_rgba(255,95,31,0.3)] animate-in zoom-in-95 duration-300 ${activeLayer === TraumaLayer.STRESS ? 'border-pink-500/50 text-pink-500 shadow-pink-500/30' : 'border-orange-500/50'}`}>
              <Crosshair size={20} className={`${activeLayer === TraumaLayer.STRESS ? 'text-pink-400' : 'text-orange-400'} animate-pulse`} />
              <span>Forensic_Sync: {highlightedDepth?.toFixed(3)}M</span>
              <div className={`w-3 h-3 rounded-full animate-ping ${activeLayer === TraumaLayer.STRESS ? 'bg-pink-500' : 'bg-orange-500'}`}></div>
           </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <div className={`p-2 bg-emerald-950/80 border rounded shadow-[0_0_15px_rgba(16,185,129,0.2)] ${activeLayer === TraumaLayer.STRESS ? 'border-pink-500/40 shadow-pink-500/10' : 'border-emerald-500/40'}`}>
            <Scan size={20} className={activeLayer === TraumaLayer.STRESS ? 'text-pink-400' : 'text-emerald-400'} />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-400 font-terminal uppercase tracking-tighter">{isCrossSectionView ? 'Radial_Inspector' : 'Trauma_Node_3D'}</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[8px] text-emerald-800 uppercase tracking-widest font-black">{isCrossSectionView ? '2D RADIAL CROSS-SECTION ANALYSIS' : 'Interactive Forensic Scan (DRAG TO ROTATE)'}</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
           <button 
             onClick={() => setIsCrossSectionView(!isCrossSectionView)}
             className={`flex items-center space-x-2 px-4 py-1.5 rounded font-black text-[9px] uppercase tracking-widest transition-all ${isCrossSectionView ? 'bg-orange-500 text-slate-950 shadow-[0_0_15px_rgba(255,95,31,0.3)]' : 'bg-slate-900 border border-emerald-900/50 text-emerald-400 hover:border-emerald-400'}`}
           >
             <CircleDot size={14} className={isCrossSectionView ? 'animate-pulse' : ''} />
             <span>{isCrossSectionView ? '3D View' : 'Cross-Section'}</span>
           </button>

           <div className="flex items-center bg-slate-950/80 border border-emerald-900/30 p-1 rounded-sm shadow-xl space-x-1">
              {[
                { id: TraumaLayer.METAL_LOSS, icon: <Activity size={12} />, label: 'ML' },
                { id: TraumaLayer.STRESS, icon: <Gauge size={12} />, label: 'STR' },
                { id: TraumaLayer.TEMPERATURE, icon: <Thermometer size={12} />, label: 'TMP' },
                { id: TraumaLayer.WATER_LEAKAGE, icon: <Droplets size={12} />, label: 'H2O' }
              ].map(toggle => (
                <button
                  key={toggle.id}
                  onClick={() => setActiveLayer(toggle.id)}
                  title={toggle.id}
                  className={`p-1.5 rounded-sm transition-all flex items-center space-x-1.5 ${activeLayer === toggle.id 
                    ? toggle.id === TraumaLayer.STRESS ? 'bg-pink-500 text-slate-950 shadow-[0_0_10px_#db2777]' : 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_#10b981]' 
                    : 'text-emerald-800 hover:text-emerald-400 hover:bg-emerald-900/10'}`}
                >
                  {toggle.icon}
                  <span className="text-[7px] font-black uppercase">{toggle.label}</span>
                </button>
              ))}
           </div>

           <select 
              value={activeLayer}
              onChange={(e) => setActiveLayer(e.target.value as TraumaLayer)}
              className="bg-slate-900 border border-emerald-900/50 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-1.5 rounded outline-none focus:border-emerald-400 transition-colors shadow-lg"
           >
              {Object.values(TraumaLayer).map(layer => (
                <option key={layer} value={layer}>{layer}</option>
              ))}
           </select>
           
           <button 
             onClick={runForensicScan}
             disabled={isScanning}
             className={`flex items-center space-x-2 px-4 py-1.5 rounded font-black text-[9px] uppercase tracking-widest transition-all ${isScanning ? 'bg-orange-500/20 text-orange-500 cursor-wait' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.1)]'}`}
           >
             {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
             <span>{isScanning ? 'Scanning...' : 'Trauma_Scan'}</span>
           </button>

           <button onClick={onToggleFocus} className="p-2 text-emerald-800 hover:text-emerald-400 transition-colors">
             {isFocused ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
           </button>
        </div>
      </div>

      <div ref={plotContainerRef} className="flex-1 bg-slate-950 rounded-lg border border-emerald-900/20 overflow-hidden relative shadow-inner cursor-move">
         <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
            <div className={`bg-slate-950/90 border px-3 py-1.5 rounded flex items-center space-x-2 shadow-xl ${activeLayer === TraumaLayer.STRESS ? 'border-pink-500/40' : 'border-emerald-900/40'}`}>
               <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeLayer === TraumaLayer.STRESS ? 'bg-pink-500' : 'bg-emerald-500'}`}></div>
               <span className={`text-[8px] font-black uppercase tracking-widest ${activeLayer === TraumaLayer.STRESS ? 'text-pink-100' : 'text-emerald-100'}`}>{isCrossSectionView ? 'RADIAL_INSPECTOR' : '3D_VOXEL_MAP'} // {activeLayer}</span>
            </div>
            {isCrossSectionView && !highlightedDepth && (
               <div className="bg-orange-500/10 border border-orange-500/40 px-3 py-1 rounded mt-2 animate-pulse">
                  <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest flex items-center"><Info size={10} className="mr-1.5" /> SELECT LOG TO SET DEPTH</span>
               </div>
            )}
         </div>
         {isScanning && (
            <div className={`absolute inset-0 pointer-events-none z-20 overflow-hidden ${activeLayer === TraumaLayer.STRESS ? 'bg-pink-500/5' : 'bg-emerald-500/5'}`}>
               <div className={`h-1 w-full absolute top-0 animate-[scanline_1.5s_linear_infinite] ${activeLayer === TraumaLayer.STRESS ? 'bg-pink-500/30' : 'bg-emerald-500/30'}`}></div>
            </div>
         )}
      </div>

      <div className="h-64 bg-slate-950/95 border border-emerald-900/30 rounded flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-slate-900/90 border-b border-emerald-900/40 p-2.5 flex items-center justify-between z-20">
           <div className="flex items-center space-x-3">
             <ShieldAlert size={14} className="text-emerald-500" />
             <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Sovereign_Forensic_Records</span>
           </div>
           <div className="flex items-center space-x-3">
             <span className="text-[8px] font-mono text-emerald-900 uppercase">Archive_Nodes: {blackBoxLogs.length}</span>
             <button onClick={clearLogs} title="Wipe Trace Data" className="p-1 text-emerald-900 hover:text-red-500 transition-colors">
               <Trash2 size={12} />
             </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {blackBoxLogs.map((log, idx) => {
            const severityColor = log.severity === 'CRITICAL' ? 'border-red-500' : 
                                  log.severity === 'WARNING' ? 'border-orange-500' : 
                                  'border-emerald-500';
            
            const severityBg = log.severity === 'CRITICAL' ? 'bg-red-500 text-slate-950 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                               log.severity === 'WARNING' ? 'bg-orange-500 text-slate-950 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 
                               'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]';

            return (
              <div 
                key={`${log.timestamp}-${idx}`} 
                onClick={(e) => handleLogClick(e, log.depth)}
                onMouseEnter={() => setHoveredDepth(log.depth)}
                onMouseLeave={() => setHoveredDepth(null)}
                className={`flex flex-col bg-slate-900/30 border-l-[6px] rounded p-4 hover:bg-emerald-500/5 cursor-pointer group transition-all relative overflow-hidden ${severityColor} ${highlightedDepth === log.depth ? 'bg-orange-500/15 border-orange-500 shadow-[0_0_25px_rgba(255,95,31,0.25)] scale-[0.99] translate-x-1' : 'border-opacity-40 border-emerald-900/20'}`}
              >
                {highlightedDepth === log.depth && (
                  <div className="absolute inset-0 bg-orange-500/5 animate-pulse pointer-events-none"></div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-1.5 rounded text-[10px] font-black tracking-[0.2em] uppercase shadow-lg transition-all ${severityBg} ${log.severity === 'CRITICAL' ? 'animate-pulse' : ''}`}>
                      {log.severity}
                    </span>
                    
                    <div className="flex items-center space-x-3 bg-slate-950 px-3 py-1.5 rounded border border-emerald-500/30 shadow-inner group-hover:border-emerald-400 transition-colors">
                      <Activity size={14} className="text-emerald-500" />
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-emerald-900 uppercase leading-none mb-1">Layer_Hash</span>
                        <span className="text-[11px] font-black uppercase text-emerald-100 tracking-wider leading-none">{log.layer}</span>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-1.5 text-emerald-900 font-mono text-[9px] opacity-60">
                      <Clock size={10} />
                      <span>{new Date(log.timestamp).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className={`flex flex-col items-end px-5 py-1.5 rounded bg-slate-950 border transition-all ${log.severity === 'CRITICAL' ? 'border-red-500/40 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]' : 'border-emerald-500/30 shadow-inner'}`}>
                      <div className="flex items-baseline space-x-1.5">
                        <span className={`text-2xl font-black font-terminal leading-none tracking-tighter ${log.severity === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {log.value.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">{log.unit}</span>
                      </div>
                      <span className="text-[7px] text-emerald-900 font-black uppercase leading-none mt-1 tracking-widest">ANOMALY_VECTOR</span>
                    </div>

                    <div className={`flex items-center space-x-2 bg-slate-950 px-3 py-1 rounded border text-[11px] font-terminal font-black transition-all ${highlightedDepth === log.depth ? 'border-orange-500 text-orange-400' : 'border-emerald-900/50 text-emerald-400'}`}>
                      <MapPin size={12} className={highlightedDepth === log.depth ? 'text-orange-700' : 'text-emerald-700'} />
                      <span>{log.depth.toFixed(3)}m</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pl-1 border-t border-emerald-900/10 pt-2">
                  <p className="text-[11px] text-emerald-100/60 font-mono italic leading-tight max-w-[85%]">
                    "{log.description}"
                  </p>
                  <ChevronRight size={18} className={`transition-all ${highlightedDepth === log.depth ? 'text-orange-400 translate-x-1' : 'text-emerald-900 group-hover:text-emerald-400 group-hover:translate-x-1'}`} />
                </div>
              </div>
            );
          })}
          
          {blackBoxLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-30 py-10">
              <Crosshair size={32} className="text-emerald-900 mb-3" />
              <div className="text-[10px] text-emerald-900 uppercase font-black tracking-[0.4em]">Vault_Empty: No anomalies mapped.</div>
              <div className="text-[8px] text-emerald-950 mt-1.5 uppercase font-bold">Initiate Trauma_Scan to generate forensic records.</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[8px] font-black uppercase text-emerald-900 tracking-tighter pt-2 border-t border-emerald-900/20">
         <div className="flex items-center space-x-5">
            <span className="flex items-center"><Info size={10} className="mr-1.5" /> MOUSE_DRAG: {isCrossSectionView ? 'ZOOM_RADIAL' : 'ROTATE_CYLINDER'}</span>
            <span className="flex items-center text-emerald-700"><Zap size={10} className="mr-1.5" /> CLICK_RECORD: SYNC_DEPTH_COORD</span>
         </div>
         <div className="flex items-center space-x-3">
            <div className="h-1 w-10 bg-emerald-500/10 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500/40 animate-[loading_4s_infinite]"></div>
            </div>
            <span className="text-emerald-950">BUFFER_LOCK_0XF</span>
         </div>
      </div>
    </div>
  );
};

export default TraumaNode;
