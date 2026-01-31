
import React, { useState } from 'react';
import { ScanLine, GripVertical, Palette, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { SignalMetadata } from '../hooks/useGhostSync';

interface GhostSyncSignalRegistryProps {
  signals: SignalMetadata[];
  onToggle: (id: string) => void;
  onUpdateColor?: (id: string, color: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onAddSignal?: (name: string, color: string) => void;
  onRemoveSignal?: (id: string) => void;
}

const GhostSyncSignalRegistry: React.FC<GhostSyncSignalRegistryProps> = ({ 
  signals, 
  onToggle, 
  onUpdateColor,
  onReorder,
  onAddSignal,
  onRemoveSignal
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    if (onReorder) {
      onReorder(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !onAddSignal) return;
    onAddSignal(newName.trim(), newColor);
    setNewName('');
  };

  return (
    <div className="flex-1 glass-panel p-5 rounded-lg border border-[#00FF41]/30 bg-slate-900/60 overflow-hidden flex flex-col shadow-xl">
      <h3 className="text-[10px] font-black text-[#00FF41] uppercase tracking-widest mb-4 flex items-center shrink-0 border-b border-[#00FF41]/20 pb-2">
         <ScanLine size={12} className="mr-2" /> Signal_Registry
      </h3>

      {/* Add Custom Signal Form */}
      <form onSubmit={handleAdd} className="mb-4 flex items-center gap-2 p-2 bg-black/40 border border-[#00FF41]/10 rounded-lg group/form">
        <div className="relative group/color-add">
           <div className="w-5 h-5 rounded border border-white/20 shadow-inner" style={{ backgroundColor: newColor }}></div>
           <input 
             type="color" 
             value={newColor} 
             onChange={(e) => setNewColor(e.target.value)}
             className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
           />
        </div>
        <input 
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New_Trace_Name..."
          className="flex-1 bg-transparent border-none text-[10px] text-emerald-100 font-terminal outline-none placeholder:text-emerald-900"
        />
        <button 
          type="submit" 
          disabled={!newName.trim()}
          className="p-1.5 bg-emerald-500 text-slate-950 rounded hover:bg-emerald-400 disabled:opacity-20 transition-all"
        >
          <Plus size={14} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {signals.map((sig, index) => {
          if (!sig) return null; // Defensive check for null entries in signals array
          const isBase = sig.id === 'SIG-001' || sig.id === 'SIG-002';
          return (
            <div 
              key={sig.id} 
              draggable={!isBase}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between p-2.5 bg-slate-950/80 border rounded transition-all group ${
                draggedIndex === index ? 'opacity-50 scale-95 border-[#00FF41]' : 
                sig.visible ? 'border-[#00FF41]/40 shadow-sm' : 'border-red-950/20 opacity-40 grayscale'
              } ${!isBase ? 'cursor-move' : 'cursor-default'}`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                {!isBase ? (
                  <GripVertical size={12} className="text-[#003b0f] group-hover:text-[#00FF41] shrink-0" />
                ) : (
                  <div className="w-3 shrink-0" />
                )}
                
                <div className="relative group/color shrink-0">
                  <div 
                    className="w-4 h-4 rounded-sm shadow-[0_0_10px_currentColor] border border-white/10" 
                    style={{ backgroundColor: sig.color, color: sig.color }}
                  ></div>
                  <input 
                    type="color"
                    value={sig.color}
                    onChange={(e) => onUpdateColor?.(sig.id, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Change Trace Color"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className={`text-[9px] font-black uppercase truncate ${sig.visible ? 'text-emerald-100' : 'text-[#003b0f]'}`}>
                    {sig.name || 'UNNAMED_TRACE'}
                  </span>
                  <span className="text-[7px] text-[#003b0f] font-mono tracking-tighter truncate">
                    ID: {sig.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggle(sig.id); }}
                  className={`p-1.5 rounded-md transition-all ${
                    sig.visible ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30' : 'bg-red-500/5 text-[#003b0f] border-transparent'
                  }`}
                  title={sig.visible ? "Hide Trace" : "Show Trace"}
                >
                  {sig.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                {!isBase && onRemoveSignal && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveSignal(sig.id); }}
                    className="p-1.5 text-red-900 hover:text-red-500 transition-colors"
                    title="Delete Trace"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-[#00FF41]/20 flex items-center justify-between text-[7px] font-black text-[#003b0f] uppercase">
         <span>Drag to Layer</span>
         <span className="flex items-center gap-1"><Palette size={10} /> Click swatch to tint</span>
      </div>
    </div>
  );
};

export default GhostSyncSignalRegistry;
