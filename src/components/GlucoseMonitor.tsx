import { Bell, Droplets, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Alert, GlucoseReading } from '../types';
import { formatTime, getGlucoseBgColor, getGlucoseColor } from '../utils/glucoseUtils';
import { AlertPanel } from './AlertPanel';

interface GlucoseMonitorProps {
  currentReading: GlucoseReading;
  data: GlucoseReading[];
}

export const GlucoseMonitor: React.FC<GlucoseMonitorProps> = ({ currentReading, data }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'falling':
        return <TrendingDown className="h-5 w-5 text-blue-500" />;
      case 'stable':
        return <Minus className="h-5 w-5 text-gray-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const chartData = data.map(reading => ({
    time: formatTime(reading.timestamp),
    value: reading.value,
    timestamp: reading.timestamp.getTime()
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-lg font-semibold text-blue-600">
            {payload[0].value} mg/dL
          </p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const v = currentReading.value;
    const now = new Date();

    setAlerts(prev => {
      // 1) Update any existing alerts' messages to reflect latest value (unless dismissed)
      const updated = prev.map(a => {
        if (a.dismissed) return a;
        if (a.type === 'low-glucose') {
          return { ...a, message: `Current glucose: ${v} mg/dL. ${v < 70 ? 'Take action immediately.' : 'Retest and monitor.'}`, timestamp: now };
        }
        if (a.type === 'high-glucose') {
          return { ...a, message: `Current glucose: ${v} mg/dL. ${v > 180 ? 'Consider follow-up.' : 'Retest and monitor.'}`, timestamp: now };
        }
        if (a.type === 'current-glucose') {
          return { ...a, message: `Current glucose: ${v} mg/dL`, timestamp: now };
        }
        return a;
      });

      // 2) Ensure a current-glucose info alert exists (unless user dismissed it)
      const hasCurrent = updated.some(a => a.type === 'current-glucose' && !a.dismissed);
      if (!hasCurrent) {
        updated.unshift({
          id: `${now.getTime()}-current`,
          type: 'current-glucose',
          title: 'Current Glucose',
          message: `Current glucose: ${v} mg/dL`,
          timestamp: now,
          severity: 'info',
          dismissed: false
        });
      }

      // 3) Add low/high if thresholds crossed and not already active
      const alreadyLow = updated.some(a => !a.dismissed && a.type === 'low-glucose');
      const alreadyHigh = updated.some(a => !a.dismissed && a.type === 'high-glucose');

      if (v < 70 && !alreadyLow) {
        updated.unshift({
          id: `${now.getTime()}-low`,
          type: 'low-glucose',
          title: 'Low Glucose Alert',
          message: `Current glucose: ${v} mg/dL. Take action immediately.`,
          timestamp: now,
          severity: 'critical',
          dismissed: false
        });
        setIsPanelOpen(true);
      } else if (v > 180 && !alreadyHigh) {
        updated.unshift({
          id: `${now.getTime()}-high`,
          type: 'high-glucose',
          title: 'High Glucose Alert',
          message: `Current glucose: ${v} mg/dL. Consider follow-up or insulin per plan.`,
          timestamp: now,
          severity: 'warning',
          dismissed: false
        });
        setIsPanelOpen(true);
      }

      // Keep order: newest first
      return updated;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentReading.value]);

  const onDismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Droplets className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Glucose Monitor</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Last reading</p>
            <p className="text-sm font-medium text-gray-900">
              {formatTime(currentReading.timestamp)}
            </p>
          </div>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Open alerts"
          >
            <Bell className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>

      <div className={`rounded-lg border-2 p-6 mb-6 ${getGlucoseBgColor(currentReading.value)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Current Glucose</p>
            <div className="flex items-center space-x-3">
              <span className={`text-4xl font-bold ${getGlucoseColor(currentReading.value)}`}>
                {currentReading.value}
              </span>
              <span className="text-lg text-gray-500">mg/dL</span>
              {getTrendIcon(currentReading.trend)}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
            <p className={`text-sm font-semibold ${getGlucoseColor(currentReading.value)}`}>
              {currentReading.value < 70 ? 'Low' : 
               currentReading.value > 180 ? 'High' : 'In Range'}
            </p>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['dataMin - 20', 'dataMax + 20']}
              tick={{ fontSize: 12 }}
            />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" label="Low" />
            <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="5 5" label="High" />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2563eb" 
              strokeWidth={3}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Critical (&lt;70, &gt;250)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-600">Caution (70-180, 180-250)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">In Range (70-180)</span>
        </div>
      </div>

      <AlertPanel
        alerts={alerts}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onDismissAlert={onDismissAlert}
      />
    </div>
  );
};
