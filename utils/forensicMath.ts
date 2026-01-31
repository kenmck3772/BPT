export function calculateLinearRegression(data: number[]): { slope: number; intercept: number; rSquared: number } {
  const n = data.length;
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

/**
 * BRAHAN_SEER: CYCLICAL_PATTERN_DETECTION
 * Analyzes correlation between two data streams (typically Pressure vs Temp).
 * Lock-on identifies if P variance is a slave to T variance.
 */
export function detectCyclicalCorrelation(pData: number[], tData: number[]): number {
  if (pData.length !== tData.length || pData.length < 2) return 0;
  const n = pData.length;
  
  let sumP = 0, sumT = 0, sumPT = 0, sumP2 = 0, sumT2 = 0;
  for (let i = 0; i < n; i++) {
    sumP += pData[i];
    sumT += tData[i];
    sumPT += pData[i] * tData[i];
    sumP2 += pData[i] * pData[i];
    sumT2 += tData[i] * tData[i];
  }
  
  const num = (n * sumPT) - (sumP * sumT);
  const den = Math.sqrt((n * sumP2 - sumP * sumP) * (n * sumT2 - sumT * sumT));
  return den === 0 ? 0 : num / den;
}

export function diagnoseSawtooth(rSquared: number, slope: number): { status: string; color: string; diagnosis: string } {
  const absSlope = Math.abs(slope);
  
  if (rSquared > 0.97) {
    if (absSlope > 10) {
      return {
        status: "🔴 CRITICAL: RAPID SUSTAINED BREACH",
        color: "#ef4444", 
        diagnosis: `Linear recharge at ${absSlope.toFixed(2)} PSI/unit. High-flow conduit detected. Immediate intervention required.`
      };
    } else if (absSlope > 1.5) {
       return {
        status: "🟠 WARNING: PERSISTENT MICRO-LEAK",
        color: "#f97316", 
        diagnosis: `Linear build-up at ${absSlope.toFixed(2)} PSI/unit. Evidence of micro-annulus or seal degradation.`
      };
    } else {
      return {
        status: "🟡 CAUTION: LOW-RATE INGRESS",
        color: "#fbbf24", 
        diagnosis: "Highly linear but extremely slow build-up. Possible gas migration or slight hydraulic imbalance."
      };
    }
  } else if (rSquared > 0.80) {
    return {
      status: "🔵 UNSTABLE: HYDRAULIC TRANSIENT",
      color: "#3b82f6",
      diagnosis: "Non-linear pressure shift. Potential thermal expansion or fluid cooling. Not currently indicative of a mechanical breach."
    };
  } else {
    return {
      status: "🟢 STABLE: NORMAL OPERATIONS",
      color: "#10b981",
      diagnosis: "Erratic or static pressure signature. Typical behavior for a closed-system annulus."
    };
  }
}