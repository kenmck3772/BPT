
export interface LogEntry {
  depth: number;
  gr: number;
  caliper?: number;
}

export interface Task {
  id: string;
  label: string;
  module: string;
  detail: string;
  completed: boolean;
  dueDate?: string;
}

export type ForensicStatus = 'VERIFIED' | '[DATA_MISSING]' | '[DATA_UNREADABLE]' | '[DATA_INCOMPLETE]';

export interface ForensicAuditEntry {
  parameter: string;
  value: string | ForensicStatus;
  source: string;
}

export interface MetallurgySpec {
  vendor: 'Vallourec' | 'Tenaris' | 'Sumitomo' | 'Apex';
  connection: string;
  grade: string;
  yieldStrength: number;
  gasTight: boolean;
  thermalLimit: number;
  stressLimit: number;
}

export interface ChromiumAudit {
  jointNumber: number;
  heatNumber: string;
  nominalGrade: string;
  measuredChromePercent: number;
  apexVerified: boolean;
  status: 'OPTIMAL' | 'DEGRADED' | 'DISCORDANT';
  alphaScore: number;
  vendorSpec?: MetallurgySpec;
}

export interface NDRProject {
  projectId: string;
  name: string;
  quadrant: string;
  status: string;
  releaseDate: string;
  type: string;
  wellboreType: string;
  sizeGb: number;
  sha512: string;
  hasDatumShiftIssues: boolean;
  hasIntegrityRecords: boolean;
  drillstringJoints?: number;
  drillstringGrade?: string;
  bAnnulusPressure?: string;
  bAnnulusTemperature?: string;
  bAnnulusPressureHistory?: number[];
  bAnnulusTemperatureHistory?: number[];
  bAnnulusLogs?: any[];
}

export enum ActiveModule {
  MISSION_CONTROL = 'MISSION_CONTROL',
  GHOST_SYNC = 'GHOST_SYNC',
  TRAUMA_NODE = 'TRAUMA_NODE',
  PULSE_ANALYZER = 'PULSE_ANALYZER',
  REPORTS_SCANNER = 'REPORTS_SCANNER',
  VAULT = 'VAULT',
  LEGACY_RECOVERY = 'LEGACY_RECOVERY',
  NORWAY_SOVEREIGN = 'NORWAY_SOVEREIGN',
  BASIN_AUDIT = 'BASIN_AUDIT',
  BALLOCH_AUDIT = 'BALLOCH_AUDIT',
  FORENSIC_AUDITOR = 'FORENSIC_AUDITOR',
  SOVEREIGN_LEDGER = 'SOVEREIGN_LEDGER',
  NEWS_HUB = 'NEWS_HUB',
  FORENSIC_HARVESTER = 'FORENSIC_HARVESTER',
  CERBERUS = 'CERBERUS',
  FORENSIC_LAB = 'FORENSIC_LAB',
  FORENSIC_ARCHEOLOGY = 'FORENSIC_ARCHEOLOGY',
  CHEMISTRY_FORENSICS = 'CHEMISTRY_FORENSICS',
  CARDIO_FORENSICS = 'CARDIO_FORENSICS',
  LOG_ROUTER = 'LOG_ROUTER',
  GATEKEEPER = 'GATEKEEPER',
  CHANONRY_PROTOCOL = 'CHANONRY_PROTOCOL',
  PROSPECTOR = 'PROSPECTOR',
  VANGUARD = 'VANGUARD',
  PROTOCOL_MANUAL = 'PROTOCOL_MANUAL',
  FORENSIC_VISION = 'FORENSIC_VISION',
  NINIAN_TALLY = 'NINIAN_TALLY'
}

export enum TraumaLayer {
  PRESSURE = 'PRESSURE',
  THERMAL = 'THERMAL',
  EYERUNE_TRUTH = 'EYERUNE_TRUTH',
  DEVIATION = 'DEVIATION',
  VIBRATION = 'VIBRATION'
}

export interface TraumaData {
  depth: number;
  fingerId: number;
  stress: number;
  temperature: number;
  eyeruneTruth: number;
  deviation: number;
  vibration: number;
}

export interface AnalysisResult {
  id: string;
  title: string;
  status: 'VERIFIED' | 'PENDING' | 'CRITICAL';
  timestamp: string;
  summary: string;
  isHighValue?: boolean;
  valueEst?: number;
  confidence?: number;
  sigmaScore?: number;
  hash: string;
  region?: string;
}

export interface AnnulusLogEntry {
  timestamp: string;
  pressure: number;
  temperature?: number;
  type: string;
}

export interface SovereignVetoReport {
  vetoSummary: string;
  authorTruth: string;
  digitalClaim: string;
  forensicDelta: string;
  forensicSnapshots: Array<{
    pageNumber: string;
    originalValue: string;
    modernClaim: string;
    variance: string;
  }>;
  vetoLogic: string;
  bAnnulusPressure?: string;
  bAnnulusTemperature?: string;
  bAnnulusLogs?: AnnulusLogEntry[];
}

export type RiskProfile = 'ARREARS_CRITICAL' | 'SUSPENDED_EXTENDED' | 'ORPHAN_ASSET';
export type AssetType = 'Platform-Based' | 'Subsea Ghost';

export interface GhostWellRecord {
  uwi: string;
  operator: string;
  assetType: AssetType;
  riskProfile: RiskProfile;
  status: string;
  suspensionExpiry: string | null;
  lastIntegrityCheck: string | null;
  verticalDatum: string | null;
  arrearsDays: number;
  technicalRisk: string;
  isArrearsCritical: boolean;
  scrapedSource?: string;
  sitp?: string;
  metallurgy?: MetallurgySpec;
}

export interface ForensicAnalysis {
  mode: string;
  file_type: string;
  confidence: string;
  metadata: {
    well_name: string | null;
    api_number: string | null;
    depth_start: number | null;
    depth_end: number | null;
    content_summary: string;
  };
}

export interface ProspectorBrief {
  region: string;
  target_operators: string[];
  technical_hook: string;
  buried_treasure_tease: string;
  raw_intelligence: string;
}

export interface FullForensicReportData {
  wellName: string;
  uwi: string;
  datumAudit: {
    legacyKB: string;
    modernMSL: string;
    delta: string;
    narrative: string;
  };
  octgTally: {
    summary: string;
    joints: Array<{
      id: number;
      nominalGrade: string;
      recoveredGrade: string;
      decayDetected: boolean;
      millCert: string;
    }>;
  };
  integrityLog: {
    chemicalHistory: Array<{
      date: string;
      operation: string;
      chemical: string;
    }>;
    pressureAnalysis: string;
  };
  verificationGate: {
    apexJobNumber: string;
    millCertIDs: string[];
    notary: string;
  };
}

export interface BarrierEvent {
  timestamp: string;
  type: 'TOPUP' | 'SQUEEZE' | 'TEST' | 'BREACH' | 'INFO';
  pressure: number;
  comment: string;
}

export interface VaultConfig {
  tenantId: string;
  clientId: string;
  siteId: string;
  listWellMetadata: string;
}

export interface TubingItem {
  id: number;
  type: string;
  id_in: number;
  grade: string;
  length_m: number;
  cumulative_m: number;
  status: 'VALID' | 'DISCREPANT';
}

export interface WellReport {
  reportId: string;
  date: string;
  summary: string;
  eodDepth_m: number;
}

export interface BasinAuditNode {
  region: string;
  assets: {
    type: AssetType;
    riskProfiles: {
      profile: RiskProfile;
      wells: GhostWellRecord[];
    }[];
  }[];
}

export interface BallochThermalAudit {
  correlationCoefficient: number;
  phaseLagMinutes: number;
  thermalElasticity: string;
  scaleFillMagnitude: number;
  auditVerdict: string;
  regulatoryVetoLogic: string;
  ddrArtifacts: Array<{
    timestamp: string;
    finding: string;
    author: string;
    status: string;
  }>;
  hysteresisStats: {
    minPressure: number;
    maxPressure: number;
    minTemp: number;
    maxTemp: number;
  };
}

export interface AnomalyDeepAudit {
  nature: string;
  potentialCauses: string[];
  regulatoryConstraint: string;
  remediation: string;
  technicalDeduction: string;
  merUkImpact: string;
}

export interface NinianTallyEntry {
  slot: string;
  type: string;
  casingGrade: string;
  weight: number;
  linerGrade: string;
  ndrRefId: string;
  apexScore: number;
}
