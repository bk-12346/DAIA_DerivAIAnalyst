
import React from 'react';
import { DashboardState } from './types';

export const INITIAL_DASHBOARD_DATA: DashboardState = {
  globalDau: {
    value: 52148,
    change: 1.2,
    baseline: 51520,
    label: 'Active Daily Users (DAU)'
  },
  tradingVolume: {
    value: 624300,
    change: 2.1,
    baseline: 611000,
    label: 'Trading Volume',
    unit: '$'
  },
  netPnl: {
    value: 0,
    change: 0,
    baseline: 0,
    label: 'Net P&L',
    unit: '$'
  },
  exposureImbalance: {
    value: 0,
    change: 0,
    baseline: 0,
    label: 'Exposure Imbalance',
    unit: '%'
  },
  regions: [
    { region: 'NA', dauChange: 0.5, status: 'healthy', avgDau: 14200 },
    { region: 'EU', dauChange: 2.2, status: 'healthy' },
    { region: 'APAC', dauChange: 1.5, status: 'healthy' }
  ],
  platforms: [
    { platform: 'Trader', dauChange: 1.1, volumeChange: 1.9 },
    { platform: 'MT5', dauChange: 0.8, volumeChange: 1.2 }
  ],
  instruments: [
    { instrument: 'Synthetics', dauChange: 0.2, volumeChange: 0.4 },
    { instrument: 'FX', dauChange: 0.1, volumeChange: -0.1 },
    { instrument: 'Stocks', dauChange: 0.05, volumeChange: 0.1 }
  ],
  zScore: 0.15,
  investigationPath: []
};

export const DAIA_CONTEXT = `
You are DAIA (Deriv AI Analyst), a real-time enterprise intelligence agent for Deriv's Data Health & Observability platform. 
You help executives and data teams understand what's happening across Deriv's business metrics.

CURRENT STATUS: SYSTEM HEALTHY

LATEST ANALYSIS RESULTS:
Global Metrics:
- Active Daily Users: 52,148 (+1.2% vs baseline of 51,520)
- Trading Volume: $624,300 (+2.1% vs baseline of $611,000)
- Net P&L: $0 (flat)
- Exposure Imbalance: 0.0%

Regional Breakdown:
- NA: DAU +0.5% (Healthy)
- EU: DAU +2.2% (Healthy)
- APAC: DAU +1.5% (Healthy)

Platform Signals:
- Trader: DAU +1.1%, volume +1.9%
- MT5: DAU +0.8%, volume +1.2%

Instrument Signals:
- Synthetics, FX, and Stocks: Stable (near 0% variance)

Investigation Details:
- Z-score: 0.15 (Well within normal range)
- No investigation path identified as no anomalies are present.

BEHAVIOR RULES:
1. When healthy, acknowledge stability and mention that all metrics are within expected variance thresholds.
2. Always reference specific numbers from the analysis.
3. If users ask for a briefing, state: "STATUS: SYSTEM HEALTHY. All systems operating normally. No anomalies detected. Global DAU is 52,148 (+1.2%). Upload new telemetry data for fresh analysis."
4. Concise, professional, direct briefing style.
`;
