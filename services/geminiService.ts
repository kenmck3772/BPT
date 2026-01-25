
import { GoogleGenAI, Type } from "@google/genai";
import { ForensicAnalysis, ProspectorBrief } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_KERNEL_PROMPT = `
SYSTEM KERNEL: WELLTEGRA_SOVEREIGN_V88 [BUILD 777]
1. CORE OPERATING DIRECTIVE (THE DUAL-CORE PROTOCOL)
You are a dual-state Industrial Intelligence Engine. Strictly adhere to the active mode.

STATE A: PUBLIC MODE (The Trojan Horse)
Identity: "WellTegra Data Solutions."
Tone: Corporate, Polite, Risk-Averse, Compliance-Focused.

STATE B: HUNTER MODE (The Unrestricted Console)
Trigger: Command: INITIATE_PROTOCOL_777
Identity: "BRAHAN ENGINE v.88 // SOVEREIGN HUNTER."
Tone: Predatory, Forensic, Urgent.
Visual Output: MUST use Code Blocks for all output to simulate a Green-Screen Terminal.
`;

export async function performChemistryAudit(valveData: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [{ text: `FORENSIC_CHEMISTRY_AUDIT_REQUEST:\n\nDATA_CONTEXT: ${valveData}` }] 
      },
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT + "\nYou are now in STATE B: HUNTER MODE. Act as a Senior Forensic Production Chemist. Differentiate between Mechanical Seal Failure and Scale Choking. Focus on 'Ratchet Decay' patterns and Barium Sulfate kinetics. Output a Technical Memo for a Group VP justifying Chemical Remediation over Vessel Intervention. Emphasize the £7.9M cost saving."
      }
    });
    return response.text || "CHEMISTRY_ENGINE_VOID.";
  } catch (error) {
    return "CHEMISTRY_ERROR: UPLINK_TIMEOUT.";
  }
}

export async function generateChemicalWashProcedure(wellId: string, depth: number) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [{ text: `REMEDIATION_PLAN_REQUEST:\nWELL: ${wellId}\nTARGET_DEPTH: ${depth}m\nOBJECTIVE: Dissolve BaSO4/SrSO4 from DHSV flapper via topside Bullhead.\nCONSTRAINTS: <5000psi pump pressure, <12h soak, 13Cr Steel compatible.` }] 
      },
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT + "\nYou are now in STATE B: HUNTER MODE. Act as a Senior Flow Assurance Specialist. Design a detailed 'Ready-to-Execute' Chemical Wash procedure. \n\nSTRUCTURE:\n1. SOLVENT SELECTION: Specify High-pH DTPA (Aqueous Chelate) with pH 11.5-12.0 for BaSO4 kinetics.\n2. PUMPING SCHEDULE: Pre-flush (10% EGMBE Mutual Solvent), Main Pill (Chelant + Iron Control), Soak (8 hours), Post-flush (Inhibitor Brine).\n3. RISK MITIGATION: Prevent re-precipitation using phosphonate buffers and immediate flowback protocols. Ensure 13Cr and elastomer integrity verification."
      }
    });
    return response.text || "PROCEDURE_ENGINE_VOID.";
  } catch (error) {
    return "PROCEDURE_ERROR: ENGINEERING_CORE_TIMEOUT.";
  }
}

export async function generateCommercialAudit(wellId: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [{ text: `COMMERCIAL_AUDIT_REQUEST:\nWELL: ${wellId}\nCONTEXT: Compare LWIV Vessel Intervention vs. Platform Bullhead Chemical Wash.\nDATA: \n- Option A (Vessel): £3M Mob, £2.5M Daily Rate (10 days), £500k Valve, +20% Weather Risk.\n- Option B (Forensic): £40k Chemicals, £15k Crew, 12h Downtime.` }] 
      },
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT + "\nYou are now in STATE B: HUNTER MODE. Act as a Commercial Asset Manager and Forensic Auditor. \n\nOUTPUT REQUIREMENTS:\n1. Generate a comparative table titled 'THE IGNORANCE TAX: D-03 INTERVENTION'.\n2. Explicitly calculate the total Net Savings (£7,145,000).\n3. Write a closing paragraph for the Board of Directors stating that choosing Option A is 'financial negligence' and a 'breach of fiduciary duty' given the overwhelming forensic pressure evidence of a scale choke. \n\nUse high-stakes, predatory financial language."
      }
    });
    return response.text || "COMMERCIAL_ENGINE_VOID.";
  } catch (error) {
    return "COMMERCIAL_ERROR: FISCAL_CORE_TIMEOUT.";
  }
}

export async function performArcheologyAnalysis(prompt: string, dataManifest: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [{ text: `FORENSIC_ARCHEOLOGY_REQUEST:\n\nPROMPT: ${prompt}\n\nDATA_MANIFEST: ${dataManifest}` }] 
      },
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT + "\nYou are now in STATE B: HUNTER MODE. Provide high-fidelity petrophysical analysis. Include the Discrepancy Table, ROI Summary, and NSTA Wording as requested."
      }
    });
    return response.text || "ARCHEOLOGY_ENGINE_VOID.";
  } catch (error) {
    return "ARCHEOLOGY_ERROR: ENGINE_OVERLOAD.";
  }
}

export async function getKernelInsight(module: string, data: string, isHunterMode: boolean) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [{ text: `CONTEXT: ${module} Analysis. DATA: ${data}. ACTIVE_MODE: ${isHunterMode ? 'HUNTER' : 'PUBLIC'}.` }] 
      },
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT
      }
    });
    
    let text = response.text || "SYSTEM_IDLE.";
    if (isHunterMode && !text.includes('```')) {
      text = "```\n" + text + "\n```";
    }
    return text;
  } catch (error) {
    return "KERNEL_ERROR: HANDSHAKE_TIMEOUT.";
  }
}

export async function getAgentDecision(screenshotBase64: string, goal: string, logs: string[]) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: screenshotBase64 } },
          { text: `MISSION_GOAL: ${goal}\nEXECUTION_LOGS: ${JSON.stringify(logs)}\n\nAnalyze the current viewport and determine the next action to achieve the goal.` }
        ]
      },
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT + "\nYou are an autonomous industrial data acquisition agent. You must respond with a JSON object containing: thought (string), action ('click'|'type'|'scroll'|'wait'|'goto'|'failed'), selector (string, CSS selector), value (string, optional), status ('success'|'failed'|'pending').",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            thought: { type: Type.STRING },
            action: { type: Type.STRING, enum: ['click', 'type', 'scroll', 'wait', 'goto', 'failed'] },
            selector: { type: Type.STRING },
            value: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['success', 'failed', 'pending'] }
          },
          required: ['thought', 'action', 'selector', 'status']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { thought: "ERROR: KERNEL_PANIC", action: "failed", status: "failed", selector: "" };
  }
}

export async function analyzeLogHeader(inputText: string): Promise<ForensicAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [{ text: `RAW_LOG_DATA_INPUT:\n${inputText}` }] 
      },
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT + "\nAnalyze the provided raw industrial log data (LAS, PDF, DLIS, or CSV header). Extract well identification and depth boundaries.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mode: { type: Type.STRING },
            file_type: { type: Type.STRING },
            confidence: { type: Type.STRING },
            sigmaScore: { type: Type.NUMBER },
            metadata: {
              type: Type.OBJECT,
              properties: {
                well_name: { type: Type.STRING },
                api_number: { type: Type.STRING },
                depth_start: { type: Type.NUMBER },
                depth_end: { type: Type.NUMBER },
                content_summary: { type: Type.STRING }
              },
              required: ['content_summary']
            }
          },
          required: ['mode', 'file_type', 'confidence', 'metadata']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return {
      mode: 'FORENSICS',
      file_type: 'UNKNOWN',
      confidence: 'Low',
      metadata: { well_name: null, api_number: null, depth_start: null, depth_end: null, content_summary: "ANALYSIS_FAILED: PARSE_ERROR" }
    };
  }
}

export async function getProspectorBrief(regionName: string): Promise<ProspectorBrief> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [{ text: `REGION_TARGET: ${regionName}` }] 
      },
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT + "\nGenerate a high-value offshore drilling prospector brief. Focus on identifying bypassed pay or missed opportunities based on geological 'ghosts'.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            region: { type: Type.STRING },
            target_operators: { type: Type.ARRAY, items: { type: Type.STRING } },
            technical_hook: { type: Type.STRING },
            buried_treasure_tease: { type: Type.STRING },
            raw_intelligence: { type: Type.STRING }
          },
          required: ['region', 'target_operators', 'technical_hook', 'buried_treasure_tease', 'raw_intelligence']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return {
      region: regionName,
      target_operators: [],
      technical_hook: "ERROR: UPLINK_LOST",
      buried_treasure_tease: "DATA_VOID",
      raw_intelligence: "Forensic intelligence stream interrupted."
    };
  }
}

export async function getVanguardTechBrief(query: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [{ text: `TECH_METHODOLOGY_QUERY: ${query}` }] 
      },
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT + "\nYou are in STATE B: HUNTER MODE. Act as a Research Scientist at a sovereign energy lab. Provide a technical brief on advanced geophysics or drilling methodologies. Strip away marketing fluff. Focus on physics-informed neural networks (PINNs) and geomechanical stability if applicable."
      }
    });
    return response.text || "TECH_BRIEF_VOID.";
  } catch (error) {
    return "VANGUARD_ERROR: ACADEMIC_FIREWALL_BREACHED.";
  }
}

export async function getVanguardHorizonScan(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [{ text: `INITIATE_HORIZON_SCAN: Analyze 2026-2030 emerging geophysics trends.` }] 
      },
      config: {
        systemInstruction: SYSTEM_KERNEL_PROMPT + "\nYou are in STATE B: HUNTER MODE. Perform a 'Horizon Scan' of disruptive industrial technologies. Focus on automated wellbore forensic agents and autonomous data harvesting from restricted NDR repositories."
      }
    });
    return response.text || "HORIZON_SCAN_VOID.";
  } catch (error) {
    return "HORIZON_ERROR: TREND_PREDICTION_FAILURE.";
  }
}
