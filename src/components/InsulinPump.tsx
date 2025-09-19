import {
  Activity,
  AlertTriangle,
  Battery,
  Bluetooth,
  CheckCircle,
  Droplets,
  Pause,
  Play,
  Signal,
  Wifi,
  XCircle,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { InsulinPumpStatus } from '../types';
import { formatTime } from '../utils/glucoseUtils';

interface InsulinPumpProps {
  status: InsulinPumpStatus;
  onSuspendDelivery: () => void;
  onResumeDelivery: () => void;
}

export const InsulinPump: React.FC<InsulinPumpProps> = ({ 
  status, 
  onSuspendDelivery, 
  onResumeDelivery 
}) => {
  const [showConfirmSuspend, setShowConfirmSuspend] = useState(false);

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-emerald-600 bg-emerald-100';
    if (level > 20) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getBatteryGradient = (level: number) => {
    if (level > 50) return 'from-emerald-500 to-emerald-600';
    if (level > 20) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  const getConnectionIcon = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-emerald-600 drop-shadow-sm" />;
      case 'weak':
        return <AlertTriangle className="h-5 w-5 text-amber-600 drop-shadow-sm animate-pulse" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-600 drop-shadow-sm" />;
      default:
        return <XCircle className="h-5 w-5 text-slate-400 drop-shadow-sm" />;
    }
  };

  const getConnectionStatusColor = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'weak':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'disconnected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const handleSuspendClick = () => {
    if (status.isDelivering) {
      setShowConfirmSuspend(true);
    } else {
      onResumeDelivery();
    }
  };

  const confirmSuspend = () => {
    onSuspendDelivery();
    setShowConfirmSuspend(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 backdrop-blur-sm">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Insulin Pump Monitor</h2>
            <p className="text-gray-600 text-sm">Real-time device status & control</p>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm border-2 ${
          status.isDelivering 
            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800' 
            : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              status.isDelivering ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span>{status.isDelivering ? 'Active Delivery' : 'Delivery Suspended'}</span>
          </div>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">Battery Level</p>
            <div className={`p-2 rounded-lg ${getBatteryColor(status.batteryLevel)}`}>
              <Battery className={`h-5 w-5 ${getBatteryColor(status.batteryLevel).split(' ')[0]}`} />
            </div>
          </div>
          <div className="space-y-2">
            <p className={`text-3xl font-bold ${getBatteryColor(status.batteryLevel).split(' ')[0]}`}>
              {status.batteryLevel}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getBatteryGradient(status.batteryLevel)} transition-all duration-500`}
                style={{ width: `${status.batteryLevel}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-blue-700">Active Insulin</p>
            <div className="bg-blue-500 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-blue-600">
              {status.activeInsulin} U
            </p>
            <p className="text-xs text-blue-600 opacity-75">Currently active</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-cyan-700">Reservoir</p>
            <div className="bg-cyan-500 p-2 rounded-lg">
              <Droplets className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-cyan-600">
              {status.reservoirLevel} U
            </p>
            <p className="text-xs text-cyan-600 opacity-75">Remaining insulin</p>
          </div>
        </div>

        <div className={`rounded-xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 ${getConnectionStatusColor(status.connectionStatus)}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">Connection Status</p>
            <div className="bg-white bg-opacity-60 p-2 rounded-lg backdrop-blur-sm">
              {getConnectionIcon(status.connectionStatus)}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold capitalize">
              {status.connectionStatus}
            </p>
            <div className="flex items-center space-x-2">
              <Signal className="h-3 w-3" />
              <p className="text-xs opacity-75">Signal strength</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Details */}
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-indigo-500 p-2 rounded-lg shadow-sm">
            <Bluetooth className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900">Device Connectivity</h4>
            <p className="text-indigo-700 text-sm">Wireless communication status</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Bluetooth className="h-4 w-4 text-indigo-600" />
              <span className="text-indigo-800 font-semibold text-sm">Bluetooth</span>
            </div>
            <span className="text-emerald-600 text-xs font-medium">Connected</span>
          </div>
          
          <div className="bg-white bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Wifi className="h-4 w-4 text-indigo-600" />
              <span className="text-indigo-800 font-semibold text-sm">WiFi Sync</span>
            </div>
            <span className="text-emerald-600 text-xs font-medium">Last: {formatTime(status.lastSync)}</span>
          </div>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="border-2 border-red-200 rounded-xl p-6 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-red-500 p-2 rounded-lg shadow-sm">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-800">Emergency Control Center</h3>
            <p className="text-red-700 text-sm">Critical delivery management</p>
          </div>
        </div>
        
        <p className="text-sm text-red-700 mb-6 leading-relaxed font-medium bg-white bg-opacity-50 p-3 rounded-lg">
          Use this control to immediately suspend insulin delivery in case of security threats or medical emergencies. 
          Always consult with your healthcare provider before making changes.
        </p>
        
        {!showConfirmSuspend ? (
          <button
            onClick={handleSuspendClick}
            className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
              status.isDelivering
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
            }`}
          >
            {status.isDelivering ? (
              <>
                <Pause className="h-6 w-6" />
                <span>Emergency Suspend Delivery</span>
              </>
            ) : (
              <>
                <Play className="h-6 w-6" />
                <span>Resume Insulin Delivery</span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="text-lg font-bold text-red-800">
                    Confirm Emergency Suspension
                  </p>
                  <p className="text-sm text-red-700">
                    This will immediately stop all insulin delivery. Are you sure?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={confirmSuspend}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Pause className="h-5 w-5" />
                <span>Yes, Suspend Now</span>
              </button>
              <button
                onClick={() => setShowConfirmSuspend(false)}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};