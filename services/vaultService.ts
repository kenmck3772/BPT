
import { AnalysisResult } from '../types';

const STORAGE_KEY = 'BRAHAN_SOVEREIGN_CHEST';

export function playLockSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
    
    // Second click
    setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.05);
        gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.05);
    }, 120);
  } catch (e) {
    console.warn("Audio Context blocked or unsupported");
  }
}

export function secureAsset(asset: Omit<AnalysisResult, 'id' | 'timestamp' | 'hash'>): AnalysisResult {
  const timestamp = new Date().toISOString();
  const id = `ARCH-${Math.random().toString(36).substring(7).toUpperCase()}`;
  const hash = `SHA512:${Math.random().toString(16).substring(2, 64)}`;
  
  const isHighValue = (asset.valueEst || 0) > 5000000 || (asset.confidence || 0) > 90;
  
  const newEntry: AnalysisResult = {
    ...asset,
    id,
    timestamp,
    hash,
    isHighValue
  };

  const existing = getVaultItems();
  const updated = [newEntry, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  playLockSound();
  return newEntry;
}

export function getVaultItems(): AnalysisResult[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}
