
export interface MetricData {
  value: number;
  change: number;
  baseline: number;
  label: string;
  unit?: string;
}

export interface RegionalPerformance {
  region: string;
  dauChange: number;
  status: 'healthy' | 'anomaly';
  avgDau?: number;
}

export interface PlatformSignal {
  platform: string;
  dauChange: number;
  volumeChange: number;
}

export interface InstrumentSignal {
  instrument: string;
  dauChange: number;
  volumeChange: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DashboardState {
  globalDau: MetricData;
  tradingVolume: MetricData;
  netPnl: MetricData;
  exposureImbalance: MetricData;
  regions: RegionalPerformance[];
  platforms: PlatformSignal[];
  instruments: InstrumentSignal[];
  zScore: number;
  investigationPath: string[];
}
