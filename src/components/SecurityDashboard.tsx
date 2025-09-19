import { Activity, AlertTriangle, CheckCircle, Clock, Eye, Lock, Shield, XCircle, Zap } from 'lucide-react';
import React from 'react';
import { SecurityThreat } from '../types';
import { formatDate } from '../utils/glucoseUtils';

interface SecurityDashboardProps {
  threats: SecurityThreat[];
  onBlockThreat: (threatId: string) => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ 
  threats, 
  onBlockThreat 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-red-100';
      case 'warning':
        return 'text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 shadow-amber-100';
      case 'info':
        return 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-blue-100';
      default:
        return 'text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 shadow-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'blocked':
        return <XCircle className="h-5 w-5 text-red-600 drop-shadow-sm" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-emerald-600 drop-shadow-sm" />;
      case 'active':
        return <AlertTriangle className="h-5 w-5 text-amber-600 drop-shadow-sm animate-pulse" />;
      default:
        return <Activity className="h-5 w-5 text-slate-500 drop-shadow-sm" />;
    }
  };

  const getThreatTypeLabel = (type: string) => {
    switch (type) {
      case 'replay_attack':
        return 'Replay Attack';
      case 'unauthorized_bolus':
        return 'Unauthorized Bolus';
      case 'bluetooth_spoofing':
        return 'Bluetooth Spoofing';
      case 'wifi_interception':
        return 'WiFi Interception';
      case 'device_manipulation':
        return 'Device Manipulation';
      default:
        return 'Unknown Threat';
    }
  };

  const activeThreatCount = threats.filter(t => t.status === 'active').length;
  const blockedThreatCount = threats.filter(t => t.status === 'blocked').length;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 backdrop-blur-sm">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Security Command Center</h2>
            <p className="text-gray-600 text-sm">Real-time threat monitoring & protection</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full border border-red-100">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-700 font-semibold text-sm">{activeThreatCount} Active</span>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-emerald-700 font-semibold text-sm">{blockedThreatCount} Blocked</span>
          </div>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-50 via-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-emerald-500 p-2 rounded-lg shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-emerald-800">System Status</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mb-1">Secure</p>
          <p className="text-xs text-emerald-600 opacity-75">All systems operational</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-blue-500 p-2 rounded-lg shadow-sm">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-blue-800">ML Detection</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-1">Active</p>
          <p className="text-xs text-blue-600 opacity-75">AI monitoring enabled</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-purple-500 p-2 rounded-lg shadow-sm">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-purple-800">Last Scan</p>
          </div>
          <p className="text-2xl font-bold text-purple-600 mb-1">2m ago</p>
          <p className="text-xs text-purple-600 opacity-75">Continuous monitoring</p>
        </div>
      </div>

      {/* Threat Log */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h3 className="text-xl font-bold text-gray-900">Threat Intelligence Log</h3>
          <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1 ml-4"></div>
        </div>
        
        {threats.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h4 className="text-lg font-semibold text-emerald-800 mb-2">All Clear</h4>
            <p className="text-emerald-600">No security threats detected in your system</p>
          </div>
        ) : (
          <div className="space-y-3">
            {threats.map((threat) => (
              <div 
                key={threat.id}
                className={`border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm ${getSeverityColor(threat.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="bg-white bg-opacity-60 p-2 rounded-lg backdrop-blur-sm">
                        {getStatusIcon(threat.status)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">
                          {getThreatTypeLabel(threat.type)}
                        </h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          threat.severity === 'critical' ? 'bg-red-200 text-red-800 shadow-sm' :
                          threat.severity === 'warning' ? 'bg-amber-200 text-amber-800 shadow-sm' :
                          'bg-blue-200 text-blue-800 shadow-sm'
                        }`}>
                          {threat.severity}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed font-medium">{threat.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2 bg-white bg-opacity-50 px-3 py-1 rounded-lg">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{formatDate(threat.timestamp)}</span>
                      </div>
                      {threat.source && (
                        <div className="flex items-center space-x-2 bg-white bg-opacity-50 px-3 py-1 rounded-lg">
                          <Lock className="h-4 w-4" />
                          <span className="font-medium">Source: {threat.source}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 bg-white bg-opacity-50 px-3 py-1 rounded-lg">
                        <Activity className="h-4 w-4" />
                        <span className="font-medium capitalize">Status: {threat.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  {threat.status === 'active' && (
                    <button
                      onClick={() => onBlockThreat(threat.id)}
                      className="ml-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Block Threat</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ML Security Status */}
      <div className="mt-8 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-indigo-500 p-3 rounded-xl shadow-sm">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900 text-lg">AI-Powered Security Engine</h4>
            <p className="text-indigo-700 text-sm">TensorFlow Lite neural network with CIC IoMT dataset</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-indigo-800 font-semibold text-sm">Replay Detection</span>
            </div>
            <span className="text-emerald-600 text-xs font-medium">Active & Learning</span>
          </div>
          
          <div className="bg-white bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-indigo-800 font-semibold text-sm">Bluetooth Monitor</span>
            </div>
            <span className="text-emerald-600 text-xs font-medium">Real-time Scanning</span>
          </div>
          
          <div className="bg-white bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-indigo-800 font-semibold text-sm">Command Validation</span>
            </div>
            <span className="text-emerald-600 text-xs font-medium">ML Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};