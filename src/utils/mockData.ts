import { Alert, GlucoseReading, InsulinPumpStatus, SecurityThreat } from '../types';

export const generateGlucoseData = (hours: number = 24): GlucoseReading[] => {
  const data: GlucoseReading[] = [];
  const now = new Date();
  for (let i = hours * 12; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
    const baseValue = 120 + Math.sin((i / 12) * Math.PI) * 30;
    const noise = (Math.random() - 0.5) * 20;
    const value = Math.max(50, Math.min(400, baseValue + noise));
    let trend: 'rising' | 'stable' | 'falling' = 'stable';
    if (data.length > 0) {
      const diff = value - data[data.length - 1].value;
      if (diff > 5) trend = 'rising';
      else if (diff < -5) trend = 'falling';
    }
    data.push({
      timestamp,
      value: Math.round(value),
      trend
    });
  }
  return data.reverse();
};

export const mockInsulinPumpStatus: InsulinPumpStatus = {
  batteryLevel: 78,
  activeInsulin: 2.4,
  reservoirLevel: 156,
  connectionStatus: 'connected',
  lastSync: new Date(Date.now() - 5 * 60 * 1000),
  isDelivering: true
};

export const mockSecurityThreats: SecurityThreat[] = [
  {
    id: '1',
    type: 'replay_attack',
    severity: 'critical',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    description: 'Malicious packet detected: Insulin delivery command blocked',
    status: 'blocked',
    source: '192.168.1.105'
  },
  {
    id: '2',
    type: 'bluetooth_spoofing',
    severity: 'warning',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    description: 'Unusual Bluetooth activity from unknown device',
    status: 'resolved',
    source: 'Unknown MAC: AA:BB:CC:DD:EE:FF'
  },
  {
    id: '3',
    type: 'unauthorized_bolus',
    severity: 'critical',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: 'Unauthorized bolus command attempt blocked',
    status: 'blocked'
  }
];

const makeAlert = (id: string, type: string, severity: 'critical'|'warning'|'info'|'default', title: string, message: string, timestamp: Date, dismissed = false): Alert => ({
  id,
  type,
  severity,
  title,
  message,
  timestamp,
  dismissed
});

export const generateMockAlerts = (glucoseData: GlucoseReading[]): Alert[] => {
  const out: Alert[] = [];
  const now = new Date();
  const latest = glucoseData[glucoseData.length - 1];
  out.push(makeAlert(
    `current-${now.getTime()}`,
    'current-glucose',
    'info',
    'Current Glucose',
    `Current glucose: ${latest.value} mg/dL`,
    new Date(now.getTime()),
    false
  ));

  const lowThreshold = 70;
  const highThreshold = 180;

  let createdLow = false;
  let createdHigh = false;

  for (let i = glucoseData.length - 1; i >= 0 && out.length < 8; i--) {
    const r = glucoseData[i];
    if (!createdLow && r.value < lowThreshold) {
      out.push(makeAlert(
        `sim-low-${r.timestamp.getTime()}`,
        'glucose',
        'critical',
        'Low Glucose Alert',
        `Simulated: glucose ${r.value} mg/dL — take action`,
        new Date(r.timestamp),
        false
      ));
      createdLow = true;
    }
    if (!createdHigh && r.value > highThreshold) {
      out.push(makeAlert(
        `sim-high-${r.timestamp.getTime()}`,
        'glucose',
        'warning',
        'High Glucose Alert',
        `Simulated: glucose ${r.value} mg/dL — consider follow-up`,
        new Date(r.timestamp),
        false
      ));
      createdHigh = true;
    }
    if (createdLow && createdHigh) break;
  }

  if (latest.value < lowThreshold && !out.some(a => a.type === 'glucose' && a.title.toLowerCase().includes('low'))) {
    out.unshift(makeAlert(
      `active-low-${now.getTime()}`,
      'glucose',
      'critical',
      'Low Glucose Alert',
      `Current glucose: ${latest.value} mg/dL - Take action immediately`,
      new Date(now.getTime()),
      false
    ));
  } else if (latest.value > highThreshold && !out.some(a => a.type === 'glucose' && a.title.toLowerCase().includes('high'))) {
    out.unshift(makeAlert(
      `active-high-${now.getTime()}`,
      'glucose',
      'warning',
      'High Glucose Alert',
      `Current glucose: ${latest.value} mg/dL - Consider follow-up`,
      new Date(now.getTime()),
      false
    ));
  }

  out.push(makeAlert(
    'device-1',
    'device',
    'warning',
    'Low Battery Warning',
    'Insulin pump battery at 20% - Consider charging soon',
    new Date(Date.now() - 30 * 60 * 1000),
    true
  ));

  mockSecurityThreats.slice(0,2).forEach(s => {
    out.push(makeAlert(
      `sec-${s.id}`,
      'security',
      s.severity === 'critical' ? 'critical' : 'warning',
      s.severity === 'critical' ? 'Security Threat Blocked' : 'Security Notice',
      s.description,
      new Date(s.timestamp),
      s.status !== 'blocked'
    ));
  });

  out.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
  return out;
};

export const mockAlerts: Alert[] = generateMockAlerts(generateGlucoseData());
