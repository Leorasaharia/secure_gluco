import { Bell, Droplets, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Helper functions and types to make the file self-contained.
// In a real app, these would be in separate files.

type GlucoseReading = {
  value: number;
  timestamp: Date;
  trend: 'stable' | 'rising' | 'falling';
};

type Alert = {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  dismissed: boolean;
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const getGlucoseBgColor = (value: number) => {
  if (value < 70 || value > 250) return 'bg-red-50';
  if (value >= 70 && value < 180) return 'bg-green-50';
  return 'bg-yellow-50';
};

const getGlucoseColor = (value: number) => {
  if (value < 70 || value > 250) return 'text-red-600';
  if (value >= 70 && value < 180) return 'text-green-600';
  return 'text-yellow-600';
};

interface AlertPanelProps {
  alerts: Alert[];
  isOpen: boolean;
  onClose: () => void;
  onDismissAlert: (id: string) => void;
}

const getAlertItemClasses = (severity: Alert['severity']) => {
  const baseClasses = 'flex items-start p-4 rounded-lg mb-4 transition-all duration-300 transform hover:scale-[1.01] shadow-sm';
  let severityClasses = '';
  switch (severity) {
    case 'critical':
      severityClasses = 'bg-red-100 border-red-200 text-red-800';
      break;
    case 'warning':
      severityClasses = 'bg-yellow-100 border-yellow-200 text-yellow-800';
      break;
    case 'info':
      severityClasses = 'bg-blue-100 border-blue-200 text-blue-800';
      break;
    default:
      severityClasses = '';
  }
  return `${baseClasses} ${severityClasses}`;
};

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, isOpen, onClose, onDismissAlert }) => {
  const [panelAlerts, setPanelAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Only show the latest 5 alerts
    setPanelAlerts(alerts.slice(0, 5));
  }, [alerts]);

  const panelClasses = `fixed inset-y-0 right-0 z-50 w-full md:w-96 bg-gray-50 border-l border-gray-200 p-6 shadow-2xl transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;

  return (
    <div className={panelClasses}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="h-6 w-6" /> Alerts
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        {panelAlerts.length > 0 ? (
          panelAlerts.map(alert => (
            <div key={alert.id} className={getAlertItemClasses(alert.severity)}>
              <div className="flex-1">
                <h4 className="font-semibold">{alert.title}</h4>
                <p className="text-sm">{alert.message}</p>
                <p className="text-xs text-gray-600 mt-1">{formatTime(alert.timestamp)}</p>
              </div>
              {!alert.dismissed && (
                <button
                  onClick={() => onDismissAlert(alert.id)}
                  className="ml-4 p-1 rounded-full text-white bg-gray-500 hover:bg-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No recent alerts.</p>
        )}
      </div>
    </div>
  );
};

// Main GlucoseMonitor component
interface GlucoseMonitorProps {
  currentReading: GlucoseReading;
  data: GlucoseReading[];
}

export const GlucoseMonitor: React.FC<GlucoseMonitorProps> = ({ currentReading, data }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const getTrendIcon = (trend: string) => {
    const iconClasses = 'h-5 w-5 transition-transform duration-300 group-hover:scale-125';
    switch (trend) {
      case 'rising':
        return <TrendingUp className={`text-red-500 ${iconClasses}`} />;
      case 'falling':
        return <TrendingDown className={`text-blue-500 ${iconClasses}`} />;
      case 'stable':
        return <Minus className={`text-gray-500 ${iconClasses}`} />;
      default:
        return <Minus className={`text-gray-500 ${iconClasses}`} />;
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

      return updated.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentReading.value]);

  const onDismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Droplets className="h-8 w-8 text-blue-600 animate-pulse-slow" />
          <h2 className="text-2xl font-bold text-gray-900">Glucose Monitor</h2>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-sm text-gray-500">Last reading</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatTime(currentReading.timestamp)}
            </p>
          </div>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Open alerts"
          >
            <Bell className="h-7 w-7 text-gray-600 animate-wiggle" />
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border-2 p-8 mb-8 ${getGlucoseBgColor(currentReading.value)} transition-colors duration-500`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Current Glucose</p>
            <div className="flex items-center space-x-4">
              <span className={`text-6xl font-extrabold ${getGlucoseColor(currentReading.value)} animate-pulse-slow`}>
                {currentReading.value}
              </span>
              <span className="text-xl text-gray-500 font-medium">mg/dL</span>
              <div className="group">
                {getTrendIcon(currentReading.trend)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 mb-2">Status</p>
            <p className={`text-lg font-bold ${getGlucoseColor(currentReading.value)}`}>
              {currentReading.value < 70 ? 'Low' :
                currentReading.value > 180 ? 'High' : 'In Range'}
            </p>
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              domain={['dataMin - 20', 'dataMax + 20']}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'Low', position: 'insideTopLeft', fill: '#ef4444' }} />
            <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'High', position: 'insideTopLeft', fill: '#f59e0b' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={4}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-between mt-6 text-xs gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-gray-600 font-medium">Critical (&lt;70, &gt;250)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-600 font-medium">Caution (180-250)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-gray-600 font-medium">In Range (70-180)</span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Overview</h3>
        <div className="flex flex-col gap-6">
          <div className="bg-green-50 p-6 rounded-2xl shadow-md border border-gray-100 transform transition-transform hover:scale-105">
            <h4 className="font-bold text-gray-800 mb-2">Trend Analysis</h4>
            <p className="text-sm text-gray-700">The system determines glucose trend based on the rate of change between readings. Values are classified as rising, falling, or stable.</p>
          </div>
          <div className="bg-blue-100 p-6 rounded-2xl shadow-md border border-gray-100 transform transition-transform hover:scale-105">
            <h4 className="font-bold text-gray-800 mb-2">Alert Thresholds</h4>
            <p className="text-sm text-gray-700">Alerts are triggered when the current glucose value falls below the critical low threshold (less than 70 mg/dL) or exceeds the high threshold (greater than 180 mg/dL), providing real-time health notifications.</p>
          </div>
          
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
