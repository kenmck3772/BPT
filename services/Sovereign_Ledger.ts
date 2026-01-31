
import { MetallurgySpec } from '../types';

/**
 * BRAHAN_SEER: SOVEREIGN_LEDGER v2.6
 * Multi-Vendor Integrity Manifold (Firebase-Free Version)
 * ARL-Tuned for 0.11ms Latency using Local O(1) Cache.
 * 
 * BARE BONES RECONSTRUCTION: Sovereign Five
 */

export interface SovereignAsset {
  id: string;
  ndr_id: string;
  name: string;
  vendor: string;
  material: string;
  skeleton: string;
  the_bone: string;
  the_build: string;
  focus: string;
  status: 'Verified' | 'Monitoring' | 'Active' | 'Staged';
  shift?: string;
  press_limit?: string;
}

export const INITIAL_ASSETS: SovereignAsset[] = [
  { 
    id: 'H1', 
    ndr_id: 'NDR-WELL-H1-GEO-882',
    name: 'Harris H1', 
    vendor: 'APEX', 
    material: 'Carbon Steel', 
    skeleton: '9-5/8" Casing (47 lb/ft) | 7" Liner (29 lb/ft)',
    the_bone: 'Missed entry point at 3,452.5m MD corrected by 4.05m',
    the_build: 'Precise re-entry through existing 13Cr casing window',
    focus: '4.05m Vertical Datum Audit', 
    status: 'Verified', 
    shift: '4.05m' 
  },
  { 
    id: 'H12', 
    ndr_id: 'NDR-WELL-H12-MAT-451',
    name: 'Heather H12', 
    vendor: 'APEX', 
    material: '13Cr L80', 
    skeleton: '13Cr L80 Production Tubing | VAM-TOP Connections',
    the_bone: 'Zero corrosion detected in 2025 sonar wall-thickness audit',
    the_build: 'Ready for immediate CO2 injection; no new steel required',
    focus: '13Cr Metallurgy Audit', 
    status: 'Verified' 
  },
  { 
    id: 'P4', 
    ndr_id: 'NDR-WELL-P4-FAT-119',
    name: 'Buzzard P4', 
    vendor: 'Tenaris', 
    material: 'TenarisBlue', 
    skeleton: 'High-Torque TenarisBlue Series',
    the_bone: 'Cumulative fatigue usage factor: 0.16 (84% life remaining)',
    the_build: 'Structural integrity confirmed for high-deviation sidetrack',
    focus: 'High-Yield Fatigue Sync', 
    status: 'Active' 
  },
  { 
    id: 'C1', 
    ndr_id: 'NDR-WELL-C1-SEAL-902',
    name: 'Culzean C1', 
    vendor: 'Vallourec', 
    material: 'VAM-21 HPHT', 
    skeleton: 'Heavy-wall P-110 Casing | VAM-21 Metal-to-Metal Seals',
    the_bone: 'Pressure test verified at 15,000 psi',
    the_build: 'Safe secondary recovery in high-pressure Lower Cretaceous zone',
    focus: 'HPHT Integrity Lock', 
    status: 'Monitoring',
    press_limit: '15,000 PSI'
  },
  { 
    id: 'R2', 
    ndr_id: 'NDR-WELL-R2-THERM-334',
    name: 'Clair Ridge R2', 
    vendor: 'Sumitomo', 
    material: 'Sumitomo SM2535', 
    skeleton: 'Sumitomo SM2535 Alloy',
    the_bone: 'Thermal cycling tolerance verified for -10°C to +120°C',
    the_build: 'Long-term water injection viability confirmed',
    focus: 'Thermal Fatigue Sync', 
    status: 'Staged' 
  }
];

export const METALLURGY_CACHE: Record<string, MetallurgySpec> = {
  'VAM-21': {
    vendor: 'Vallourec',
    connection: 'VAM-21',
    grade: 'CRA_25Cr_SD',
    yieldStrength: 125000,
    gasTight: true,
    thermalLimit: 450,
    stressLimit: 0.95
  },
  'TenarisBlue': {
    vendor: 'Tenaris',
    connection: 'TenarisBlue',
    grade: '13Cr-S110',
    yieldStrength: 110000,
    gasTight: true,
    thermalLimit: 380,
    stressLimit: 0.92
  },
  'APEX-H': {
    vendor: 'Apex',
    connection: 'Premium-Flush',
    grade: '13Cr-L80',
    yieldStrength: 80000,
    gasTight: true,
    thermalLimit: 350,
    stressLimit: 0.85
  },
  'SM2535': {
    vendor: 'Sumitomo',
    connection: 'VAM-TOP',
    grade: 'SM2535 (Cr-Ni-Mo)',
    yieldStrength: 110000,
    gasTight: true,
    thermalLimit: 500,
    stressLimit: 0.90
  }
};

/**
 * Retrieves metallurgy specifications with O(1) complexity.
 */
export function getMetallurgySpec(name: string): MetallurgySpec | null {
  return METALLURGY_CACHE[name] || null;
}

export const ARREARS_DEFICIT_BASELINE = 153;
