
export interface LogEntry {
  depth: number;
  gr: number;
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
}

export interface TraumaData {
  fingerId: number;
  depth: number;
  deviation: number;
  corrosion: number;
  temperature: number;
  wallLoss: number;
  waterLeakage: number;
  stress: number;
  bendingStress: number;
  hoopStress: number;
  ici: number;
  metalLoss: number;
  ovality: number;
  uvIndex: number;
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
  CHANONRY_PROTOCOL = 'CHANONRY_PROTOCOL',
  PROTOCOL_MANUAL = 'PROTOCOL_MANUAL',
  LOG_ROUTER = 'LOG_ROUTER',
  PROSPECTOR = 'PROSPECTOR',
  CERBERUS = 'CERBERUS',
  GATEKEEPER = 'GATEKEEPER',
  VANGUARD = 'VANGUARD',
  FORENSIC_ARCHEOLOGY = 'FORENSIC_ARCHEOLOGY',
  CHEMISTRY_FORENSICS = 'CHEMISTRY_FORENSICS'
}

export enum TraumaLayer {
  DEVIATION = 'DEVIATION',
  CORROSION = 'CORROSION',
  TEMPERATURE = 'TEMPERATURE',
  WALL_LOSS = 'WALL_LOSS',
  WATER_LEAKAGE = 'WATER_LEAKAGE',
  STRESS = 'STRESS',
  BENDING_STRESS = 'BENDING_STRESS',
  HOOP_STRESS = 'HOOP_STRESS',
  ICI = 'ICI',
  METAL_LOSS = 'METAL_LOSS',
  OVALITY = 'OVALITY',
  UV_INDEX = 'UV_INDEX'
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

export interface ForensicAnalysis {
  mode: 'FORENSICS';
  file_type: 'LAS' | 'PDF' | 'DLIS' | 'CSV' | 'UNKNOWN';
  confidence: 'High' | 'Low';
  sigmaScore?: number;
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

// Added missing types for constants.tsx and other components
export interface PressureData {
  timestamp: string;
  pressure: number;
  isHistorical?: boolean;
}

export interface TubingItem {
  id: number;
  type: string;
  od_in: number;
  id_in: number;
  weight_lbft: number;
  grade: string;
  length_m: number;
  cumulative_m: number;
  status: 'VALID' | 'DISCREPANT';
}

export interface WellReport {
  reportId: string;
  date: string;
  opType: string;
  summary: string;
  eodDepth_m: number;
}

export interface BarrierEvent {
  id: string;
  date: string;
  type: 'SQUEEZE' | 'TEST' | 'TOPUP' | 'BREACH';
  annulus: string;
  summary: string;
  severity: 'INFO' | 'MAINTENANCE' | 'CRITICAL';
  volume?: number;
  unit?: string;
}

export interface MissionTarget {
  REGION: string;
  ASSET: string;
  rig_site: string;
  BLOCKS: string[];
  WELLS?: string[];
  ANOMALY_TYPE: string;
  DATA_PORTAL: string;
  PRIORITY: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MissionConfig {
  MISSION_ID: string;
  STATUS: string;
  TIMESTAMP: string;
  OPERATOR: string;
  TARGETS: MissionTarget[];
}

export interface TraumaEvent {
  timestamp: string;
  layer: TraumaLayer;
  depth: number;
  value: number;
  unit: string;
  severity: 'CRITICAL' | 'WARNING';
  description: string;
}
