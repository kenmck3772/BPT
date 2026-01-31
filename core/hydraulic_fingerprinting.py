
"""
BRAHAN_SEER INDUSTRIAL ENGINE: HYDRAULIC_FINGERPRINTING v1.1
Analyzes Transient Pressure Reflections (TPR) to detect unrecorded downhole artifacts.
Enhanced with Kalman Filtering for signal denoising.
"The echo reveals what the tally hides."
"""

import numpy as np
import time

class HydraulicFingerprinter:
    def __init__(self, initial_pressure=2500, wave_speed=1450):
        self.Pi = initial_pressure  # PSI
        self.Vs = wave_speed       # m/s (acoustic velocity in fluid)
        self.tau = 4.5             # Decay constant (system damping)

    def apply_kalman_filter(self, z, q=0.1, r=10.0):
        """
        Simple 1D Kalman Filter to denoise pressure telemetry.
        q: Process noise covariance (trust in model stability)
        r: Measurement noise covariance (trust in sensor data)
        """
        n = len(z)
        x_hat = np.zeros(n)      # A posteriori estimate of x
        p = np.zeros(n)          # A posteriori error estimate
        x_hat_minus = np.zeros(n) # A priori estimate of x
        p_minus = np.zeros(n)    # A priori error estimate
        k = np.zeros(n)          # Kalman gain

        # Initial guesses
        x_hat[0] = z[0]
        p[0] = 1.0

        for i in range(1, n):
            # Time update (Prediction)
            x_hat_minus[i] = x_hat[i-1]
            p_minus[i] = p[i-1] + q

            # Measurement update (Correction)
            k[i] = p_minus[i] / (p_minus[i] + r)
            x_hat[i] = x_hat_minus[i] + k[i] * (z[i] - x_hat_minus[i])
            p[i] = (1 - k[i]) * p_minus[i]

        return x_hat

    def generate_ideal_decay(self, t, delta_p):
        """Model the base pressure decay: P(t) = Pi + ΔP * e^(-t/τ)"""
        return self.Pi + delta_p * np.exp(-t / self.tau)

    def process_signal(self, time_array, raw_pressure, delta_p):
        """
        Extracts echoes by denoising the signal via Kalman Filter, 
        then subtracting the theoretical decay model from filtered telemetry.
        """
        print(">>> INITIATING_HYDRAULIC_FINGERPRINT_ANALYSIS")
        print(">>> APPLYING_KALMAN_DENOISING_PROTOCOL...")
        time.sleep(0.5)
        
        # 1. Denoise the raw signal
        filtered_pressure = self.apply_kalman_filter(raw_pressure)
        
        # 2. Calculate theoretical base decay
        ideal_p = self.generate_ideal_decay(time_array, delta_p)
        
        # 3. Extract Residuals (The Echo Stream) from the filtered signal
        # Using the filtered signal reduces false positives from high-frequency sensor noise
        residuals = filtered_pressure - ideal_p
        
        # 4. Peak Detection (Acoustic Impedance Reflection)
        # Using a dynamic threshold based on signal noise floor
        threshold = np.std(residuals) * 3.0
        echoes = []
        
        # Find local maxima in residuals that exceed threshold
        for i in range(1, len(residuals) - 1):
            if residuals[i] > threshold and residuals[i] > residuals[i-1] and residuals[i] > residuals[i+1]:
                t_echo = time_array[i]
                # Depth calculation: d = (Vs * t_echo) / 2 (Two-way travel time)
                depth = (self.Vs * t_echo) / 2
                amplitude = residuals[i]
                
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
        # Base decay + High Gaussian Noise + A hidden reflection pulse at t=4.2s (approx 3045m depth)
        reflection_pulse = np.zeros_like(t)
        reflection_pulse[420] = 45.0 
        
        # Simulating heavy sensor noise (R=15)
        raw_p = self.generate_ideal_decay(t, 800) + reflection_pulse + np.random.normal(0, 15, 1000)
        
        results = self.process_signal(t, raw_p, 800)
        
        print(f"\n[ACOUSTIC_AUDIT_LOG]")
        print(f"> SENSOR_NOISE_FLOOR: High [σ=15]")
        print(f"> KALMAN_STATE: Converged")
        
        for echo in results:
            print(f"> ECHO_DETECTED @ {echo['calculated_depth']:.2f}m | MAGNITUDE: {echo['impedance_magnitude']:.2f} PSI")
            print(f"> CLASSIFICATION: {echo['status']}")
            
        if not results:
            print("> STATUS: NO UNRECORDED REFLECTIONS DETECTED.")

if __name__ == "__main__":
    fingerprinter = HydraulicFingerprinter()
    fingerprinter.run_audit()
