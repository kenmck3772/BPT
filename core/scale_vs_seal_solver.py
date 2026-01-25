
"""
BRAHAN_SEER PRODUCTION CHEMISTRY: SCALE_VS_SEAL_SOLVER v1.0
Orchestration: Forensic Pressure Waveform Analysis
"""

import numpy as np
import json
import time

class ValveForensics:
    def __init__(self, well_id: str):
        self.well_id = well_id
        self.P_static = 3000.0  # Reservoir Pressure
        self.inhibitor_lapse_days = 14
        
    def calculate_scale_probability(self):
        """Calculates probability of BaSO4 saturation based on lapse period."""
        # Simple kinetic model: growth is non-linear after threshold
        growth_factor = np.exp(self.inhibitor_lapse_days / 7.0)
        prob = min(0.95, 0.2 * growth_factor)
        return prob

    def analyze_decay_pattern(self, t_series, p_series):
        """
        Differentiates between Linear/Exponential (Seal Failure)
        and Stutter/Ratchet (Scale Choke).
        """
        diffs = np.diff(p_series)
        second_diffs = np.diff(diffs)
        
        # High variance in second derivative indicates erratic 'ratcheting'
        ratchet_score = np.std(second_diffs)
        
        # Detect 'Holds' (where flapper sits on scale bed)
        holds = [1 for d in diffs if abs(d) < 5.0]
        hold_count = sum(holds)
        
        if ratchet_score > 10.0 and hold_count > 5:
            return "SCALE_CHOKE_DETECTED", ratchet_score
        else:
            return "MECHANICAL_SEAL_FAILURE", ratchet_score

    def generate_verdict(self, t_series, p_series):
        pattern, score = self.analyze_decay_pattern(t_series, p_series)
        scale_prob = self.calculate_scale_probability()
        
        print(f"\n--- FORENSIC VERDICT: {self.well_id} ---")
        print(f"> PATTERN: {pattern}")
        print(f"> RATCHET_INDEX: {score:.2f}")
        print(f"> SCALE_GROWTH_PROB: {scale_prob * 100:.1f}%")
        
        if pattern == "SCALE_CHOKE_DETECTED" or scale_prob > 0.8:
            print(">>> RECOMMENDATION: CHEMICAL BULLHEAD REMEDIATION (£40k)")
            print(">>> SAVINGS vs INTERVENTION: £7.96M")
        else:
            print(">>> RECOMMENDATION: VESSEL MOBILIZATION REQUIRED (£8M)")

if __name__ == "__main__":
    # Simulated data for Well D-03
    times = np.linspace(0, 30, 31)
    # 3000 to 2800 (T=2), Hold to T=10, Snap to 2500, Ratchet to T=30
    pressures = [3000, 2900, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2750, 2700, 2600, 2550, 2500, 
                 2510, 2480, 2495, 2450, 2430, 2440, 2390, 2370, 2385, 2330, 2310, 2320, 2250, 2230, 2210]
    
    solver = ValveForensics("WELL_D-03")
    solver.generate_verdict(times, pressures)
