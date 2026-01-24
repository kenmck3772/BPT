
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client with the environment key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * EXECUTES THE SOVEREIGN VETO LOGIC (BPT v.92)
 * Acts as the Lead Forensic Petroleum Architect to interpret raw technical data 
 * into a notarized forensic verdict.
 */
export async function getSovereignVeto(dataPacket: string) {
  try {
    // Using gemini-3-pro-preview for complex reasoning and forensic logic gates
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform an Asset Autopsy on the following data packet: ${dataPacket}`,
      config: {
        systemInstruction: `Role: You are the Forensic Petroleum Architect for the Well-Tegra Brahan Engine. Your specialty is identifying "Discrepancy Faults" in legacy energy assets. You ignore industry "marketing fluff" and rely solely on Fact Science, geomechanics, and chemical physics.

Operational Directive: Analyze the provided data following these four logic gates:

1. The Scale Abyss Correction: Verify depth measurements against Seabed Subsidence Datum Shift (e.g., +4.2m for Albuskjell). Flag "Mush Zone" proximity.
2. The Pressure Recharge Verdict: Analyze Matrix-to-Fracture flow. Determine if the reservoir is "Empty" or "Recharging" while shut-in.
3. The Chemical Veto: Apply Chanonry Protocol. If CII > 1.1, VETO acid stimulation and mandate Aromatic Solvent Soak.
4. The Sawtooth Detection: Differentiate thermal transients from mechanical barrier breaches. Identify specific joint/valve failure points.

Output Requirements:
- Forensic Diagnosis: A 2-paragraph "No-Fluff" narrative of the well's failure causality.
- The Sovereign Veto: A binary status [STRIKE / ABORT] for the proposed intervention.
- Notarization: Append a placeholder for the SHA-512 Hash.

Tone: Industrial, authoritative, and scientifically cold. Use terminology such as KOP, TVD, MD, Asphaltene Micelles, and Pore Pressure.`,
        temperature: 0.2, // Keep it precise and cold
        thinkingConfig: { thinkingBudget: 4000 } // Reserve tokens for detailed reasoning
      }
    });

    return response.text;
  } catch (error) {
    console.error("Sovereign Veto execution failed:", error);
    return "CRITICAL_ERROR: SYSTEM_VETO_PROTOCOL_BREACHED. MANUAL OVERRIDE REQUIRED.";
  }
}

/**
 * Basic forensic insight for localized module snapshots.
 */
export async function getForensicInsight(module: string, dataSummary: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this ${module} snapshot: ${dataSummary}. Provide a concise terminal log diagnosis identifying potential 'Data Ghosts' or 'Mechanical Trauma'.`,
    });
    return response.text;
  } catch (error) {
    return "ANALYSIS ERROR: DATA ABYSS PENETRATION FAILED.";
  }
}

/**
 * Generates a high-level forensic briefing for a chosen mission target.
 */
export async function generateMissionBriefing(target: any) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 2-sentence Forensic Briefing for this mission target: ${JSON.stringify(target)}. Explain the 'What' and 'Why' using industrial forensic terminology.`,
      config: {
        systemInstruction: "You are the Brahan Sovereign Mission Director. You speak in cold, precise, and industrial forensic terms. No fluff. Focus on the anomaly and the geological/mechanical threat."
      }
    });
    return response.text;
  } catch (error) {
    return "BRIEFING_OFFLINE: UNABLE TO PENETRATE ASSET CLOUD.";
  }
}
