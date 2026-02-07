
import React from 'react';
import { DashboardState } from './types';

export const INITIAL_DASHBOARD_DATA: DashboardState = {
  globalDau: {
    value: 47221,
    change: -10.5,
    baseline: 52752,
    label: 'Active Daily Users (DAU)'
  },
  tradingVolume: {
    value: 560348,
    change: -8.6,
    baseline: 613072, // Calculated from 560348 / 0.914
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
    { region: 'NA', dauChange: -41.1, status: 'anomaly', avgDau: 12486 },
    { region: 'EU', dauChange: 10.4, status: 'healthy' },
    { region: 'APAC', dauChange: 9.7, status: 'healthy' }
  ],
  platforms: [
    { platform: 'Trader', dauChange: -10.57, volumeChange: -10.38 },
    { platform: 'MT5', dauChange: 5.09, volumeChange: 0 }
  ],
  instruments: [
    { instrument: 'Synthetics', dauChange: -11.84, volumeChange: -4.41 },
    { instrument: 'FX', dauChange: 0, volumeChange: 0 },
    { instrument: 'Stocks', dauChange: 0, volumeChange: 0 }
  ],
  zScore: -1.97,
  investigationPath: ['NA', 'Trader', 'Synthetics']
};

export const DAIA_CONTEXT = `
You are DAIA (Deriv AI Analyst), a real-time enterprise intelligence agent for Deriv's Data Health & Observability platform. 
You help executives and data teams understand what's happening across Deriv's business metrics.

CURRENT STATUS: ANOMALY DETECTED

LATEST ANALYSIS RESULTS:
Global Metrics:
- Active Daily Users: 47,221 (−10.5% vs baseline of 52,752)
- Trading Volume: $560,348 (−8.6% vs baseline)
- Net P&L: $0 (flat)
- Exposure Imbalance: 0.0%

Regional Breakdown:
- NA: DAU recent avg 12,486 (−41.1% vs baseline). Path: Trader → Synthetics
- EU: DAU +10.4% vs baseline (Healthy)
- APAC: DAU +9.7% vs baseline (Healthy)

Platform Signals:
- Trader: DAU −10.57%, volume −10.38%
- MT5: DAU +5.09%

Instrument Signals:
- Synthetics: DAU −11.84%, volume −4.41%
- FX and Stocks: Stable

Investigation Details:
- Path: NA → Trader → Synthetics
- Z-score: −1.97 (approaching statistical significance)

BEHAVIOR RULES:
1. Always reference specific numbers from the analysis.
2. Ranked hypotheses for root causes: platform issues (deploys, auth), liquidity changes (market maker pullback), product changes (pricing, spreads), or regional events (holidays, regulatory).
3. Specific action items with timelines: "Within 24 hours: check Trader platform deploy logs and Synthetics pricing feeds in NA".
4. Concise, professional, direct briefing style.
5. If outside scope, suggest what data is needed.
`;
