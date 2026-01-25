
"""
BRAHAN_SEER INDUSTRIAL ENGINE: HYDRAULIC_FINGERPRINTING v1.0
Analyzes Transient Pressure Reflections (TPR) to detect unrecorded downhole artifacts.
"The echo reveals what the tally hides."
"""

import numpy as np
import time

class HydraulicFingerprinter:
    def __init__(self, initial_pressure=2500, wave_speed=1450):
        self.Pi = initial_pressure  # PSI
        self.Vs = wave_speed       # m/s (acoustic velocity in fluid)
        self.tau = 4.5             # Decay constant (system damping)

    def generate_ideal_decay(self, t, delta_p):
        """Model the base pressure decay: P(t) = Pi + ΔP * e^(-t/τ)"""
        return self.Pi + delta_p * np.exp(-t / self.tau)

    def process_signal(self, time_array, raw_pressure, delta_p):
        """
        Extracts echoes by subtracting the theoretical decay model from raw telemetry.
        Residuals indicate reflections from impedance changes (Phantom Steel).
        """
        print(">>> INITIATING_HYDRAULIC_FINGERPRINT_ANALYSIS")
        time.sleep(0.5)
        
        # 1. Calculate theoretical base decay
        ideal_p = self.generate_ideal_decay(time_array, delta_p)
        
        # 2. Extract Residuals (The Echo Stream)
        residuals = raw_pressure - ideal_p
        
        # 3. Peak Detection (Acoustic Impedance Reflection)
        # Simplified peak search for demonstration
        threshold = np.std(residuals) * 2.5
        echo_indices = [i for i, val in enumerate(residuals) if val > threshold]
        
        echoes = []
        for idx in echo_indices:
            t_echo = time_array[idx]
            # Depth calculation: d = (Vs * t_echo) / 2 (Two-way travel time)
            depth = (self.Vs * t_echo) / 2
            amplitude = residuals[idx]
            echoes.append({
                "t_echo": t_echo,
                "calculated_depth": depth,
                "impedance_magnitude": amplitude,
                "status": "PHANTOM_STEEL_DETECTED" if depth > 500 else "SURFACE_REFLECTION"
            })
            
        return echoes

    def run_audit(self):
        # Simulated telemetry stream
        t = np.linspace(0, 10, 1000)
        # Base decay + Random Noise + A hidden reflection pulse at t=4.2s (approx 3045m depth)
        reflection_pulse = np.zeros_like(t)
        reflection_pulse[420] = 45.0 
        
        raw_p = self.generate_ideal_decay(t, 800) + reflection_pulse + np.random.normal(0, 2, 1000)
        
        results = self.process_signal(t, raw_p, 800)
        
        print(f"\n[ACOUSTIC_AUDIT_LOG]")
        for echo in results:
            print(f"> ECHO_DETECTED @ {echo['calculated_depth']:.2f}m | MAGNITUDE: {echo['impedance_magnitude']:.2f} PSI")
            print(f"> CLASSIFICATION: {echo['status']}")
            
        if not results:
            print("> STATUS: NO UNRECORDED REFLECTIONS DETECTED.")

if __name__ == "__main__":
    fingerprinter = HydraulicFingerprinter()
    fingerprinter.run_audit()
