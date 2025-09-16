import { AlertCircle, AlertTriangle, Clock, Info, X } from 'lucide-react';
import React from 'react';
import { Alert } from '../types';
import { formatDate } from '../utils/glucoseUtils';

interface AlertPanelProps {
  alerts: Alert[];
  isOpen: boolean;
  onClose: () => void;
  onDismissAlert: (alertId: string) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  isOpen,
  onClose,
  onDismissAlert
}) => {
  if (!isOpen) return null;

  const getIcon = (severity: string) =>
    severity === 'critical'
      ? <AlertTriangle className="h-5 w-5 text-red-600" />
      : severity === 'warning'
      ? <AlertCircle className="h-5 w-5 text-yellow-600" />
      : <Info className="h-5 w-5 text-blue-600" />;

  const getColor = (s: string) => {
    switch (s) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'info': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const current = alerts.find(a => a.type === 'current-glucose');
  const active = alerts.filter(a => !a.dismissed && a.type !== 'current-glucose');
  const recent = alerts.filter(a => a.dismissed);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50">
      <div className="bg-white w-full max-w-md h-full shadow-xl overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Alerts & Notifications</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Alerts ({active.length + (current && !current.dismissed ? 1 : 0)})</h3>

            {/* pinned current glucose */}
            {current && !current.dismissed && (
              <div className={`border-l-4 p-4 rounded-r-lg ${getColor(current.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getIcon(current.severity)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{current.title}</h4>
                      <p className="text-gray-700 text-sm mb-2">{current.message}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(current.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  {/* pinned: no dismiss button */}
                </div>
              </div>
            )}

            {/* other active alerts */}
            {active.length === 0 ? (
              !current || current.dismissed ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-500">No active alerts</p>
                </div>
              ) : null
            ) : (
              <div className="space-y-3">
                {active.map(a => (
                  <div key={a.id} className={`border-l-4 p-4 rounded-r-lg ${getColor(a.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getIcon(a.severity)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{a.title}</h4>
                          <p className="text-gray-700 text-sm mb-2">{a.message}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => onDismissAlert(a.id)} className="ml-3 text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recent.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Alerts ({recent.length})</h3>
              <div className="space-y-3">
                {recent.slice(0, 5).map(a => (
                  <div key={a.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50 opacity-75">
                    <div className="flex items-start space-x-3">
                      {getIcon(a.severity)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-700 mb-1">{a.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{a.message}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(a.timestamp)}</span>
                          <span>• Dismissed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
