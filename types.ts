
export interface LogEntry {
  depth: number;
  gr: number;
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
}

export interface TraumaEvent {
  timestamp: string;
  layer: string;
  depth: number;
  value: number;
  unit: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
}

export interface PressureData {
  timestamp: string;
  pressure: number;
}

export interface AnalysisResult {
  id: string;
  title: string;
  status: 'VERIFIED' | 'PENDING' | 'CRITICAL';
  timestamp: string;
  summary: string;
}

export interface PulseDiagnosis {
  rSquared: number;
  slope: number;
  status: string;
  color: string;
  diagnosis: string;
}

export interface NDRProject {
  projectId: string;
  name: string;
  quadrant: string;
  status: 'RELEASED' | 'RESTRICTED' | 'ARCHIVED';
  releaseDate: string;
  type: 'well' | 'seismic' | 'survey';
  sizeGb: number;
  sha512: string;
  hasDatumShiftIssues?: boolean;
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
  opType: 'DRILLING' | 'INTERVENTION' | 'COMPLETION';
  summary: string;
  eodDepth_m: number;
}

export enum ActiveModule {
  GHOST_SYNC = 'GHOST_SYNC',
  TRAUMA_NODE = 'TRAUMA_NODE',
  PULSE_ANALYZER = 'PULSE_ANALYZER',
  REPORTS_SCANNER = 'REPORTS_SCANNER',
  VAULT = 'VAULT'
}

export enum TraumaLayer {
  DEVIATION = 'DEVIATION',
  CORROSION = 'CORROSION',
  TEMPERATURE = 'TEMPERATURE',
  WALL_LOSS = 'WALL_LOSS',
  WATER_LEAKAGE = 'WATER_LEAKAGE',
  STRESS = 'STRESS'
}
