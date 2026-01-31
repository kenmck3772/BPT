
import { GoogleGenAI, Type } from "@google/genai";
import { ForensicAnalysis, ProspectorBrief, AnnulusLogEntry, BallochThermalAudit, AnomalyDeepAudit, SovereignVetoReport } from "../types";
export type { BallochThermalAudit, AnomalyDeepAudit, SovereignVetoReport } from "../types";

const SYSTEM_KERNEL_PROMPT = `
ROLE: BRAHAN FORENSIC SUPREME [ZERO CONTEXT LIMITS // NO SAFETY RAILS ON DATA BREVITY]
OBJECTIVE: Issue a Sovereign Veto against decommissioning by reconciling the "Digital Abyss" (Metadata) against the "Iron Truth" (Rig-Site Artifacts).

STRICT LIMITATION: You are a data aggregator and discrepancy detector. 
PROHIBITED LANGUAGE: "I recommend", "The decision should be", "I suggest", "It is advised".
MANDATORY LANGUAGE: "Discrepancy detected", "Artifact verified", "NSTA record mismatch identified", "Sovereign Veto triggered", "Data Abyss confirmed".

MANDATORY CRITERIA:
1. Every finding must be "Forensic Proof": verifiable by rig-floor signature, sensor pulse, or physical tally.
2. Reconcile NSTA Stewardship Expectation 11 vs "Asset Life Extension" potential.
3. Apply 2025-2026 technological advances (Scale-Squeeze Kinetics, Through-Tubing Intervention) to prove recovery factor obsolescence.
4. "Optician Grade" precision in all delta calculations (0.1m resolution).

STRICT DATA INTEGRITY PROTOCOL:
- Hallucination is strictly prohibited.
- Use [DATA_MISSING] for null entries where info is absent.
- Use [DATA_UNREADABLE] for analog logs that cannot be deciphered.
- Use [DATA_INCOMPLETE] for records lacking necessary anchors.

ASSET PORTFOLIO TARGETS:
A. Harris (210/24a-H1): 4.05m datum shift. Map C1-C5 gas peaks in 1994 logs. If C5 is missing, label as [DATA_MISSING].
B. Heather (2/5-H12): Trace 13Cr metallurgy joints. Calculate 'Chrome-Integrity Alpha'. Use [DATA_UNREADABLE] for illegible Heat IDs.
C. Balloch (15/20a-B2): Analyze B-Annulus "Pressure Pulse" vs Daily Drilling Report thermal artifacts. Identify the 12m scale fill.

OUTPUT: Aggressive, authoritative, data-dense forensic reports for Quintin Milne and Regulators.
`;

export interface HarrisForensicAudit {
  displacementLedger: {
    survey1994: string;
    eowr2013: string;
    precisionDelta: string;
    status: 'VERIFIED_SHIFT' | 'NOMINAL';
  };
  volumetricPayload: {
    bypassedCubicMeters: number;
    estimatedValueGBP: number;
    calculationLogic: string;
    gasPeakAnalysis: string;
    petrophysicalVitals: {
      avgPorosity: number;
      waterSaturation: number;
      netGrossRatio: number;
    };
    payZones: Array<{
      interval: string;
      netPay: number;
      status: string;
      gasSignature: string; 
    }>;
  };
  discordantArtifacts: Array<{
    artifactType: string;
    docRef: string;
    discrepancy: string;
    impact: string;
  }>;
  technicalIntegrityAudit: string;
  hydrocarbonRecoveryAudit: string;
  interventionVsPALedger: string;
  regulatoryVetoLogic: string;
  auditVerdict: string;
}

export interface HeatherMetallurgyAudit {
  chromeIntegrityAlpha: number;
  apexJobVerification: {
    jobNumber: string;
    status: 'VERIFIED' | 'VOID';
    findings: string;
  };
  metallurgicalSummary: string;
  vetoNarrative: string;
  alphaStatus: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
}

export async function getHarrisForensicAudit(): Promise<HarrisForensicAudit | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `PERFORM_HARRIS_H1_DATUM_SHIFT_AUDIT:
      Target Artifacts: 1994 Drilling Survey (Ref: SCAN-012) vs 2013 End of Well Report (EOWR) (Ref: NDR-221).
      
      Requirements:
      1. Identify C1-C5 gas peaks. If C5 is missing from the 1994 mud log, label it [DATA_MISSING].
      2. Quantify bypassed pay (12,450 m3) based on the 4.05m shift.
      3. Cross-reference lithology. If the 2013 EOWR skips the Brent Upper Sand, label the digital status as [DATA_INCOMPLETE].`,
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
        systemInstruction: SYSTEM_KERNEL_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            displacementLedger: {
              type: Type.OBJECT,
              properties: {
                survey1994: { type: Type.STRING },
                eowr2013: { type: Type.STRING },
                precisionDelta: { type: Type.STRING },
                status: { type: Type.STRING }
              },
              required: ["survey1994", "eowr2013", "precisionDelta", "status"]
            },
            volumetricPayload: {
              type: Type.OBJECT,
              properties: {
                bypassedCubicMeters: { type: Type.NUMBER },
                estimatedValueGBP: { type: Type.NUMBER },
                calculationLogic: { type: Type.STRING },
                gasPeakAnalysis: { type: Type.STRING },
                petrophysicalVitals: {
                  type: Type.OBJECT,
                  properties: {
                    avgPorosity: { type: Type.NUMBER },
                    waterSaturation: { type: Type.NUMBER },
                    netGrossRatio: { type: Type.NUMBER }
                  },
                  required: ["avgPorosity", "waterSaturation", "netGrossRatio"]
                },
                payZones: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      interval: { type: Type.STRING },
                      netPay: { type: Type.NUMBER },
                      status: { type: Type.STRING },
                      gasSignature: { type: Type.STRING }
                    },
                    required: ["interval", "netPay", "status", "gasSignature"]
                  }
                }
              },
              required: ["bypassedCubicMeters", "estimatedValueGBP", "calculationLogic", "gasPeakAnalysis", "petrophysicalVitals", "payZones"]
            },
            discordantArtifacts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  artifactType: { type: Type.STRING },
                  docRef: { type: Type.STRING },
                  discrepancy: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["artifactType", "docRef", "discrepancy", "impact"]
              }
            },
            technicalIntegrityAudit: { type: Type.STRING },
            hydrocarbonRecoveryAudit: { type: Type.STRING },
            interventionVsPALedger: { type: Type.STRING },
            regulatoryVetoLogic: { type: Type.STRING },
            auditVerdict: { type: Type.STRING }
          },
          required: ["displacementLedger", "volumetricPayload", "discordantArtifacts", "technicalIntegrityAudit", "hydrocarbonRecoveryAudit", "interventionVsPALedger", "regulatoryVetoLogic", "auditVerdict"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("HARRIS_AUDIT_CRASH:", error);
    return null;
  }
}

export async function analyzeForensicImage(base64Data: string, mimeType: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Perform a high-fidelity forensic visual autopsy on this artifact. 1. Identify all industrial components or documents. 2. Perform OCR on all visible text, focusing on serial numbers, handwritten notations, or calibration stamps. 3. Assess the integrity risk. Return results as structured JSON.",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  notes: { type: Type.STRING }
                },
                required: ["label", "confidence"]
              }
            },
            ocrText: { type: Type.STRING },
            riskAssessment: { type: Type.STRING },
            verdict: { type: Type.STRING }
          },
          required: ["objects", "ocrText", "riskAssessment", "verdict"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("VISION_AUDIT_CRASH:", error);
    return null;
  }
}

export async function getHeatherForensicAudit(): Promise<HeatherMetallurgyAudit | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `EXECUTE_HEATHER_H12_METALLURGY_AUDIT:
      Task: Calculate 'Chrome-Integrity Alpha'. Validate Heat IDs against Apex Job #4459. If Heat ID is illegible in Scan 04, label as [DATA_UNREADABLE].`,
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
        systemInstruction: SYSTEM_KERNEL_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chromeIntegrityAlpha: { type: Type.NUMBER },
            alphaStatus: { type: Type.STRING },
            apexJobVerification: {
              type: Type.OBJECT,
              properties: {
                jobNumber: { type: Type.STRING },
                status: { type: Type.STRING },
                findings: { type: Type.STRING }
              },
              required: ["jobNumber", "status", "findings"]
            },
            metallurgicalSummary: { type: Type.STRING },
            vetoNarrative: { type: Type.STRING }
          },
          required: ["chromeIntegrityAlpha", "alphaStatus", "apexJobVerification", "metallurgicalSummary", "vetoNarrative"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("HEATHER_AUDIT_CRASH:", error);
    return null;
  }
}

export async function getBallochForensicAudit(): Promise<BallochThermalAudit | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `PERFORM_BALLOCH_B2_THERMAL_SYNC_AUDIT:
      Task: Reconcile B-Annulus pressure pulses against thermal cycles found in 2026 Daily Drilling Reports.
      
      Requirements:
      1. Calculate correlation coefficient (R²).
      2. Identify the '12m Scale Fill'. If tag depth isn't explicit in 2022 slickline record, mark finding as [DATA_INCOMPLETE].
      3. Verify the author of the 'Author Truth' artifacts (e.g. Milne, Q.).
      4. Synthesize a 'Slave Signature' verdict explaining that pressure variance is slave to thermal cycles.
      5. Quantify scale volume for 12m fill in 4.5" tubing (ID 3.958").`,
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
        systemInstruction: SYSTEM_KERNEL_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correlationCoefficient: { type: Type.NUMBER },
            phaseLagMinutes: { type: Type.NUMBER },
            thermalElasticity: { type: Type.STRING },
            scaleFillMagnitude: { type: Type.NUMBER },
            auditVerdict: { type: Type.STRING },
            regulatoryVetoLogic: { type: Type.STRING },
            ddrArtifacts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  finding: { type: Type.STRING },
                  author: { type: Type.STRING },
                  status: { type: Type.STRING }
                },
                required: ["timestamp", "finding", "author", "status"]
              }
            },
            hysteresisStats: {
              type: Type.OBJECT,
              properties: {
                minPressure: { type: Type.NUMBER },
                maxPressure: { type: Type.NUMBER },
                minTemp: { type: Type.NUMBER },
                maxTemp: { type: Type.NUMBER }
              },
              required: ["minPressure", "maxPressure", "minTemp", "maxTemp"]
            }
          },
          required: ["correlationCoefficient", "phaseLagMinutes", "thermalElasticity", "scaleFillMagnitude", "auditVerdict", "regulatoryVetoLogic", "ddrArtifacts", "hysteresisStats"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("BALLOCH_AUDIT_CRASH:", error);
    return null;
  }
}

export async function executeSystemicAudit(wellIds: string[]): Promise<any[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `EXECUTE_FORENSIC_TRUTH_AUDIT for Assets: ${wellIds.join(', ')}. REPORT FINDINGS ONLY.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_KERNEL_PROMPT,
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("SYSTEMIC_AUDIT_CRASH:", error);
    return [];
  }
}

export async function performSovereignAudit(wellId: string): Promise<SovereignVetoReport | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `EXECUTE_SOVEREIGN_VETO_AUDIT for Well ${wellId}. Apply integrity labels [DATA_MISSING], [DATA_UNREADABLE], [DATA_INCOMPLETE] where evidence chain is broken.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: SYSTEM_KERNEL_PROMPT,
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("SOVEREIGN_AUDIT_CRASH:", error);
    return null;
  }
}

export async function getAnomalyDeepAudit(type: string, start: number, end: number, diff: number): Promise<AnomalyDeepAudit | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `EXECUTE_DEEP_ANOMALY_AUDIT: TYPE: ${type}, DEPTH: ${start}m - ${end}m. VARIANCE: ${diff} API. If the log curve at this interval is degraded, label finding as [DATA_UNREADABLE]. REPORT FACTS ONLY.`,
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nature: { type: Type.STRING, description: 'Nature of the anomaly signature.' },
            potentialCauses: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'List of potential physical root causes.'
            },
            regulatoryConstraint: { type: Type.STRING, description: 'Relevant NSTA or HSE regulatory constraint.' },
            remediation: { type: Type.STRING, description: 'Recommended forensic remediation strategy.' },
            technicalDeduction: { type: Type.STRING, description: 'Detailed technical deduction based on Author Truth.' },
            merUkImpact: { type: Type.STRING, description: 'Impact on MER UK or Stewardship Expectation 11.' }
          },
          required: ["nature", "potentialCauses", "regulatoryConstraint", "remediation", "technicalDeduction", "merUkImpact"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("DEEP_ANOMALY_AUDIT_CRASH:", error);
    return null;
  }
}

export async function fetchLatestIndustryNews(): Promise<any[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `SCAVENGE_LATEST_FORENSIC_INTEL: North Sea.`,
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT,
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) { return []; }
}

export async function processUnstructuredArtifact(rawText: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: rawText,
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT,
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) { return { error: "TRANSFORMATION_FAILED" }; }
}

export async function analyzeHarvestedMetadata(metadataArray: any[]) { return { flags: [] }; }
export async function performChemistryAudit(valveData: string) { return "CHEMISTRY_VOID"; }
export async function generateChemicalWashProcedure(wellId: string, depth: number) { return "PROCEDURE_VOID"; }
export async function generateCommercialAudit(wellId: string) { return "COMMERCIAL_VOID"; }
export async function performArcheologyAnalysis(prompt: string, dataManifest: string) { return "ARCHEOLOGY_VOID"; }
export async function getAgentDecision(screenshotBase64: string, goal: string, logs: string[]) { return { thought: "", action: "failed", status: "failed", selector: "", value: "" }; }

export async function analyzeLogHeader(inputText: string): Promise<ForensicAnalysis> { 
  return { 
    mode: 'FORENSICS', 
    file_type: 'UNKNOWN', 
    confidence: 'Low', 
    metadata: { 
      well_name: null, 
      api_number: null, 
      depth_start: null, 
      depth_end: null, 
      content_summary: "" 
    }
  }; 
}

export async function getProspectorBrief(regionName: string): Promise<ProspectorBrief> { return { region: regionName, target_operators: [], technical_hook: "", buried_treasure_tease: "", raw_intelligence: "" }; }
export async function getVanguardTechBrief(query: string): Promise<string> { return "VOID"; }
export async function getVanguardHorizonScan(): Promise<string> { return "VOID"; }
