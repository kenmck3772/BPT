
import { GhostWellRecord, AssetType, RiskProfile, BasinAuditNode, TraumaData, NDRProject, TubingItem, WellReport, NinianTallyEntry } from './types';

export const GHOST_HUNTER_MISSION = {
  TARGETS: [
    { ASSET: 'Harris_H1', PRIORITY: 'CRITICAL' as const, ANOMALY_TYPE: 'Datum Shift', DATA_PORTAL: 'NSTA_NDR', rig_site: 'Harris Alpha' },
    { ASSET: 'Heather_H12', PRIORITY: 'HIGH' as const, ANOMALY_TYPE: 'Metallurgy Conflict', DATA_PORTAL: 'NSTA_NDR', rig_site: 'Heather Alpha' },
    { ASSET: 'Balloch_B2', PRIORITY: 'HIGH' as const, ANOMALY_TYPE: 'Thermal Pulse', DATA_PORTAL: 'NSTA_NDR', rig_site: 'Balloch Subsea' },
    { ASSET: 'Culzean_C1', PRIORITY: 'HIGH' as const, ANOMALY_TYPE: 'HPHT Stress', DATA_PORTAL: 'VALLOUREC_VAM', rig_site: 'Culzean FSO' },
    { ASSET: 'Buzzard_P4', PRIORITY: 'CRITICAL' as const, ANOMALY_TYPE: 'Production Stress', DATA_PORTAL: 'TENARIS_BLUE', rig_site: 'Buzzard P1' }
  ]
};

export const MOCK_TRAUMA_DATA: TraumaData[] = Array.from({ length: 100 }, (_, i) => ({
  depth: 1200 + i * 0.5,
  fingerId: (i % 40) + 1,
  deviation: 2 + Math.random() * 2,
  temperature: 20 + Math.random() * 10,
  stress: 100 + Math.random() * 50,
  eyeruneTruth: Math.random(),
  vibration: Math.random()
}));

export const MOCK_PRESSURE_DATA = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${String(i).padStart(2, '0')}:00`,
  pressure: 800 + i * 5 + Math.random() * 10
}));

export const MOCK_HISTORICAL_BARRIER_LOGS = [];
export const MOCK_SCAVENGED_PRESSURE_TESTS = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${String(i).padStart(2, '0')}:00`,
  pressure: 750 + i * 4
}));

export const MOCK_BALLOCH_THERMAL_CORRELATION = Array.from({ length: 48 }, (_, i) => ({
  timestamp: `${String(Math.floor(i/2)).padStart(2, '0')}:${(i%2)*30}`,
  pressure: 850 + Math.sin(i * 0.2) * 50,
  temperature: 30 + Math.sin(i * 0.2 - 0.5) * 10,
  isAnchor: i % 12 === 0
}));

export const MOCK_NDR_PROJECTS: NDRProject[] = [
  { 
    projectId: 'PRJ-HARRIS-001', name: 'Harris_H1_Recon', quadrant: '210/24a', status: 'RELEASED', 
    releaseDate: '2023-11-15', type: 'WELL', wellboreType: 'VERTICAL', sizeGb: 2.4, 
    sha512: 'A9B8C7D6...', hasDatumShiftIssues: true, hasIntegrityRecords: true 
  },
  { 
    projectId: 'PRJ-HEATHER-012', name: 'Heather_H12_Audit', quadrant: '2/5', status: 'RELEASED', 
    releaseDate: '2023-10-12', type: 'WELL', wellboreType: 'DIRECTIONAL', sizeGb: 1.8, 
    sha512: 'F1E2D3C4...', hasDatumShiftIssues: false, hasIntegrityRecords: true 
  },
  { 
    projectId: 'PRJ-BALLOCH-002', name: 'Balloch_B2_Study', quadrant: '15/20a', status: 'RELEASED', 
    releaseDate: '2026-01-20', type: 'WELL', wellboreType: 'SUBSEA', sizeGb: 3.1, 
    sha512: 'E5D4C3B2...', hasDatumShiftIssues: false, hasIntegrityRecords: true 
  }
];

export const MOCK_TUBING_TALLY: TubingItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  type: 'Tubing',
  id_in: 3.958,
  grade: 'L-80',
  length_m: 9.5 + Math.random() * 0.2,
  cumulative_m: (i + 1) * 9.6,
  status: i === 4 ? 'DISCREPANT' as const : 'VALID' as const
}));

export const MOCK_INTERVENTION_REPORTS: WellReport[] = [
  { reportId: 'EOWR-2013-001', date: '2013-05-12', summary: 'End of Well Report - Ninian', eodDepth_m: 2450.5 },
  { reportId: 'DDR-2024-042', date: '2024-01-20', summary: 'Daily Drilling Report - Harris', eodDepth_m: 1250.0 }
];

export const MOCK_BASE_LOG = Array.from({ length: 200 }, (_, i) => ({
  depth: 1200 + i * 0.5,
  gr: 40 + Math.sin(i * 0.1) * 30 + Math.random() * 5
}));

export const MOCK_GHOST_LOG = Array.from({ length: 200 }, (_, i) => ({
  depth: 1200 + i * 0.5 + 4.05,
  gr: 40 + Math.sin(i * 0.1) * 30 + Math.random() * 5
}));

export const MOCK_ELEVATION_DATA = Array.from({ length: 200 }, (_, i) => ({
  depth: 1200 + i * 0.5,
  elevation: -1150 + Math.sin(i * 0.05) * 20
}));

export const MOCK_BALLOCH_LOG = Array.from({ length: 100 }, (_, i) => ({
  depth: 2800 + i * 0.5,
  gr: 60 + Math.cos(i * 0.2) * 20
}));

export const MOCK_BALLOCH_GHOST_LOG = Array.from({ length: 100 }, (_, i) => ({
  depth: 2800 + i * 0.5 + 2.1,
  gr: 60 + Math.cos(i * 0.2) * 20
}));

export const IRON_TRUTH_REGISTRY = [
  { 
    id: 'HARRIS_H1', 
    description: 'Harris H1 Primary Artifacts', 
    entries: [
      { parameter: 'KB_ELEVATION', value: '31.2m', source: 'EOWR_1994' },
      { parameter: 'DATUM_REF', value: 'Kelly Bushing', source: 'EOWR_1994' }
    ] 
  },
  { 
    id: 'HEATHER_H12', 
    description: 'Heather H12 Metallurgy Audit', 
    entries: [
      { parameter: 'CHROME_TARGET', value: '13%', source: 'APEX_MANIFEST_4459' }
    ] 
  }
];

export const MOCK_HEATHER_13CR_TALLY = Array.from({ length: 15 }, (_, i) => ({
  jointNumber: i + 1,
  heatNumber: `HT-${1000 + i}`,
  nominalGrade: '13Cr',
  measuredChromePercent: i === 7 || i === 8 ? 8.5 : 12.8 + Math.random() * 0.5,
  apexVerified: true,
  status: i === 7 || i === 8 ? 'DISCORDANT' as const : 'OPTIMAL' as const,
  alphaScore: i === 7 || i === 8 ? 0.42 : 0.98
}));

export const MOCK_BASIN_AUDIT_DATA: BasinAuditNode[] = [
  {
    region: "Northern North Sea",
    assets: [
      {
        type: "Platform-Based",
        riskProfiles: [
          {
            profile: "ARREARS_CRITICAL",
            wells: [
              {
                uwi: "2/5-H12", 
                operator: "EnQuest", 
                assetType: "Platform-Based", 
                riskProfile: "ARREARS_CRITICAL",
                status: "Heather Alpha", 
                suspensionExpiry: "2020-05-12", 
                lastIntegrityCheck: "2019-11-04",
                verticalDatum: "13Cr L-80 Modified", 
                arrearsDays: 1350, 
                technicalRisk: "Trace 13Cr metallurgy joints recovery required.", 
                isArrearsCritical: true,
                scrapedSource: "APEX_TALLY_OCR_1991", 
                sitp: "450 PSI"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    region: "Central North Sea",
    assets: [
      {
        type: "Subsea Ghost",
        riskProfiles: [
          {
            profile: "ARREARS_CRITICAL",
            wells: [
              {
                uwi: "22/25a-C1", 
                operator: "TotalEnergies", 
                assetType: "Subsea Ghost", 
                riskProfile: "ARREARS_CRITICAL",
                status: "Culzean Field", 
                suspensionExpiry: "2025-01-15", 
                lastIntegrityCheck: "2024-06-20",
                verticalDatum: "VAM-21 HPHT Seal Locked", 
                arrearsDays: 12, 
                technicalRisk: "HPHT 15k PSI Seal Verification Required.", 
                isArrearsCritical: true,
                scrapedSource: "VALLOUREC_VAM_CERT_2024", 
                sitp: "14800 PSI"
              },
              {
                uwi: "20/6-P4", 
                operator: "CNOOC", 
                assetType: "Subsea Ghost", 
                riskProfile: "ARREARS_CRITICAL",
                status: "Buzzard Field", 
                suspensionExpiry: "2023-11-12", 
                lastIntegrityCheck: "2022-10-04",
                verticalDatum: "TenarisBlue High-Stress", 
                arrearsDays: 412, 
                technicalRisk: "Sustained B-Annulus recharge in H2S service.", 
                isArrearsCritical: true,
                scrapedSource: "TENARIS_BLUE_MANIFEST_2022", 
                sitp: "3200 PSI"
              },
              {
                uwi: "15/20a-B2", 
                operator: "EnQuest", 
                assetType: "Subsea Ghost", 
                riskProfile: "ARREARS_CRITICAL",
                status: "Balloch Field", 
                suspensionExpiry: "2026-06-30", 
                lastIntegrityCheck: "2025-11-01",
                verticalDatum: "Balloch Special", 
                arrearsDays: 0, 
                technicalRisk: "Diurnal thermal phase-lock detected.", 
                isArrearsCritical: false,
                scrapedSource: "BALLOCH_DDR_2026", 
                sitp: "850 PSI"
              }
            ]
          }
        ]
      }
    ]
  }
];

export const MOCK_NINIAN_TALLY: NinianTallyEntry[] = [
  { slot: "N14", type: "Suspended", casingGrade: "Q-125", weight: 65.7, linerGrade: "13Cr-L80", ndrRefId: "NDR-NIN-N14", apexScore: 9 },
  { slot: "N18", type: "Producer", casingGrade: "P-110", weight: 47.0, linerGrade: "13Cr-110", ndrRefId: "NDR-NIN-N18", apexScore: 5 },
  { slot: "N21", type: "Injector", casingGrade: "P-110", weight: 60.7, linerGrade: "13Cr-80", ndrRefId: "NDR-NIN-N21", apexScore: 3 },
  { slot: "N24", type: "Suspended", casingGrade: "P-110", weight: 53.5, linerGrade: "13Cr-S110", ndrRefId: "NDR-NIN-N24", apexScore: 10 },
  { slot: "N29", type: "Producer", casingGrade: "P-110", weight: 47.0, linerGrade: "13Cr-L80", ndrRefId: "NDR-NIN-N29", apexScore: 6 }
];
