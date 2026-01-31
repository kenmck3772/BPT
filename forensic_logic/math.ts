export function calculateLinearRegression(data: number[]): { slope: number; intercept: number; rSquared: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0, rSquared: 0 };
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const num = (n * sumXY - sumX * sumY);
  const den = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  const rValue = den === 0 ? 0 : num / den;
  const rSquared = rValue * rValue;

  return { slope, intercept, rSquared };
}

export function diagnoseSawtooth(rSquared: number, slope: number): { status: string; color: string; diagnosis: string } {
  const absSlope = Math.abs(slope);
  
  if (rSquared > 0.98) {
    if (absSlope > 15) {
      return {
        status: "🔴 CRITICAL: RAPID FLOW BREACH",
        color: "#ef4444", 
        diagnosis: `Extreme linear recharge at ${absSlope.toFixed(2)} PSI/unit. Direct high-pressure conduit confirmed. Immediate shutdown of parent well advised.`
      };
    } else if (absSlope > 5) {
      return {
        status: "🟠 WARNING: STEADY RECHARGE",
        color: "#f97316", 
        diagnosis: `Steady linear build-up (${absSlope.toFixed(2)} PSI/unit). High-flow micro-annulus or valve bypass. Monitor for escalation.`
      };
    } else {
      return {
        status: "🟡 CAUTION: PERSISTENT INGRESS",
        color: "#fbbf24", 
        diagnosis: `Slow but highly consistent linear ingress (${absSlope.toFixed(3)} PSI/unit). Likely gas migration from lower reservoir. Potential for gas-cap formation.`
      };
    }
  } 
  else if (rSquared > 0.85) {
    if (absSlope > 2) {
      return {
        status: "🔵 UNSTABLE: HYDRAULIC TRANSIENT",
        color: "#3b82f6",
        diagnosis: `Fluctuating pressure shift. Signature suggests thermal expansion or fluid cooling combined with minor seepage.`
      };
    } else {
      return {
        status: "🟢 STABLE: NORMAL OPERATIONS",
        color: "#10b981",
        diagnosis: "Minimal pressure delta. Residual fluctuations consistent with diurnal thermal cycling."
      };
    }
  } 
  else {
    return {
      status: "🟢 SYSTEM_IDLE: STATIC ANNULUS",
      color: "#10b981",
      diagnosis: "Non-linear pressure behavior detected. Typical of closed-system thermal normalization or localized fluid compression."
    };
  }
}

export function detectCyclicalCorrelation(pData: number[], tData: number[]): number {
  if (pData.length !== tData.length || pData.length < 2) return 0;
  const n = pData.length;
  
  let sumP = 0, sumT = 0, sumPT = 0, sumP2 = 0, sumT2 = 0;
  for (let i = 0; i < n; i++) {
    sumP += pData[i] || 0;
    sumT += tData[i] || 0;
    sumPT += (pData[i] || 0) * (tData[i] || 0);
    sumP2 += (pData[i] || 0) * (pData[i] || 0);
    sumT2 += (tData[i] || 0) * (tData[i] || 0);
  }
  
  const num = (n * sumPT) - (sumP * sumT);
  const den = Math.sqrt((n * sumP2 - sumP * sumP) * (n * sumT2 - sumT * sumT));
  return den === 0 ? 0 : num / den;
}

/**
 * Calculates the phase lag (in units of sample indices) between 
 * peak temperature and peak pressure pulses.
 */
export function calculateThermalLag(pData: number[], tData: number[]): number {
  if (pData.length < 2 || tData.length < 2) return 0;
  const pMaxIdx = pData.indexOf(Math.max(...pData));
  const tMaxIdx = tData.indexOf(Math.max(...tData));
  return Math.abs(pMaxIdx - tMaxIdx);
}
