import {
  Activity,
  AlertTriangle,
  Bluetooth,
  Brain,
  CheckCircle,
  ChevronRight,
  Info,
  Network,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Wifi,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenThreatAnalysis: () => void;
}

interface BioMEMSSettings {
  deviceId: string;
  firmwareVersion: string;
  batteryOptimization: boolean;
  dataTransmissionRate: number;
  encryptionLevel: 'standard' | 'high' | 'military';
  autoCalibration: boolean;
  emergencyMode: boolean;
  bluetoothPower: number;
  wifiPower: number;
  sensorSensitivity: number;
  dataRetention: number;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onOpenThreatAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<'device' | 'security' | 'network' | 'advanced'>('device');
  const [bioMEMSSettings, setBioMEMSSettings] = useState<BioMEMSSettings>({
    deviceId: 'BIOMEMS-CGM-2024-001',
    firmwareVersion: '4.2.1',
    batteryOptimization: true,
    dataTransmissionRate: 5, // minutes
    encryptionLevel: 'high',
    autoCalibration: true,
    emergencyMode: false,
    bluetoothPower: 75,
    wifiPower: 80,
    sensorSensitivity: 85,
    dataRetention: 90 // days
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(false);
  const [isUpdatingFirmware, setIsUpdatingFirmware] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof BioMEMSSettings, value: any) => {
    setBioMEMSSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // simulate async save
    setTimeout(() => {
      setHasUnsavedChanges(false);
      // potential: show toast
    }, 800);
  };

  const handleRefreshFirmware = () => {
    setIsUpdatingFirmware(true);
    setTimeout(() => {
      // bump version for demo
      const next = bioMEMSSettings.firmwareVersion.split('.').map(Number);
      next[2] = (next[2] || 0) + 1;
      const newVer = next.join('.');
      handleSettingChange('firmwareVersion', newVer);
      setIsUpdatingFirmware(false);
    }, 1200);
  };

  const handleToggleDiagnostics = () => {
    setDiagnosticsEnabled(e => !e);
    // pretend this toggles logging and sets unsaved changes
    setHasUnsavedChanges(true);
  };

  const handleFactoryReset = () => {
    const ok = confirm('Factory reset will erase custom settings. Continue?');
    if (!ok) return;
    // reset to defaults
    setBioMEMSSettings({
      deviceId: 'BIOMEMS-CGM-2024-001',
      firmwareVersion: bioMEMSSettings.firmwareVersion,
      batteryOptimization: true,
      dataTransmissionRate: 5,
      encryptionLevel: 'high',
      autoCalibration: true,
      emergencyMode: false,
      bluetoothPower: 75,
      wifiPower: 80,
      sensorSensitivity: 85,
      dataRetention: 90
    });
    setHasUnsavedChanges(true);
  };

  const handleCheckUpdates = () => {
    setIsCheckingUpdates(true);
    setTimeout(() => {
      setIsCheckingUpdates(false);
      alert('No critical firmware updates found. (Demo)');
    }, 1200);
  };

  const handleOpenThreatAnalysis = () => {
    // Call the parent's handler, then close the panel as requested
    try {
      onOpenThreatAnalysis();
    } finally {
      onClose();
    }
  };

  const tabs = [
    { id: 'device', label: 'BioMEMS Device', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-8"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={panelRef}
        className="bg-white w-full max-w-5xl max-h-[94vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-300 slide-in"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 md:p-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 rounded-xl p-2">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold">SecureGluco Settings</h2>
              <p className="text-sm md:text-base text-blue-100 mt-1">Configure your BioMEMS device and security settings</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { onClose(); }}
              aria-label="Close settings"
              title="Close"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col md:flex-row h-full min-h-[420px]">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-4 flex-shrink-0">
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap w-full ${
                      activeTab === tab.id
                        ? 'bg-white border border-blue-100 shadow-sm text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-pressed={activeTab === tab.id}
                    title={tab.label}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* AI Threat Analysis Button (visible on all widths) */}
            <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800 text-sm">AI Security</h4>
              </div>
              <p className="text-sm text-purple-700 mb-3">Advanced threat detection using neural network analysis</p>

              <button
                onClick={handleOpenThreatAnalysis}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all"
                title="Open Threat Analysis"
              >
                <span>Open Threat Analysis</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-5 md:p-6 overflow-y-auto min-h-0">
            {/* DEVICE TAB */}
            {activeTab === 'device' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">BioMEMS Device Configuration</h3>
                    <p className="text-sm text-gray-600">Manage your device connection, firmware and core sensor parameters.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600 text-right">
                      <div>Device: <span className="font-medium">{bioMEMSSettings.deviceId}</span></div>
                      <div className="mt-1">Firmware: <span className="font-medium">{bioMEMSSettings.firmwareVersion}</span></div>
                    </div>
                  </div>
                </div>

                {/* Device Status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800">Device Connected</h4>
                    <p className="text-sm text-green-700">BioMEMS CGM sensor is online and transmitting data</p>
                  </div>
                </div>

                {/* Device Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Device ID</label>
                    <input
                      type="text"
                      value={bioMEMSSettings.deviceId}
                      onChange={(e) => handleSettingChange('deviceId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Firmware Version</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bioMEMSSettings.firmwareVersion}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                      />
                      <button
                        onClick={handleRefreshFirmware}
                        title="Refresh firmware"
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition"
                      >
                        <RefreshCw className="h-4 w-4 text-sky-600" />
                      </button>
                      <button
                        onClick={handleCheckUpdates}
                        title="Check for updates"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isCheckingUpdates ? 'bg-gray-200' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                      >
                        {isCheckingUpdates ? 'Checking...' : 'Check Updates'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sensor Settings */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Sensor Configuration</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data Transmission Rate (minutes)</label>
                      <select
                        value={bioMEMSSettings.dataTransmissionRate}
                        onChange={(e) => handleSettingChange('dataTransmissionRate', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>1 minute</option>
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sensor Sensitivity: {bioMEMSSettings.sensorSensitivity}%</label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={bioMEMSSettings.sensorSensitivity}
                        onChange={(e) => handleSettingChange('sensorSensitivity', parseInt(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
                    <div>
                      <h5 className="font-medium text-gray-900">Auto Calibration</h5>
                      <p className="text-sm text-gray-600">Automatically calibrate sensor readings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-3 sm:mt-0">
                      <input
                        type="checkbox"
                        checked={bioMEMSSettings.autoCalibration}
                        onChange={(e) => handleSettingChange('autoCalibration', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition" />
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
                    <div>
                      <h5 className="font-medium text-red-900">Emergency Mode</h5>
                      <p className="text-sm text-red-700">Override normal operations in critical situations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-3 sm:mt-0">
                      <input
                        type="checkbox"
                        checked={bioMEMSSettings.emergencyMode}
                        onChange={(e) => handleSettingChange('emergencyMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-red-600 transition" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Security Configuration</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Security Status: Active</h4>
                        <p className="text-sm text-blue-700">All security protocols are enabled and functioning</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Encryption Level</label>
                      <select
                        value={bioMEMSSettings.encryptionLevel}
                        onChange={(e) => handleSettingChange('encryptionLevel', e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="standard">Standard (AES-128)</option>
                        <option value="high">High (AES-256)</option>
                        <option value="military">Military Grade (AES-256 + RSA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention Period: {bioMEMSSettings.dataRetention} days</label>
                      <input
                        type="range"
                        min="30"
                        max="365"
                        value={bioMEMSSettings.dataRetention}
                        onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>30 days</span>
                        <span>1 year</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
                      <div>
                        <h5 className="font-medium text-gray-900">Battery Optimization</h5>
                        <p className="text-sm text-gray-600">Optimize power consumption for extended battery life</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bioMEMSSettings.batteryOptimization}
                          onChange={(e) => handleSettingChange('batteryOptimization', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NETWORK TAB */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Network Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Bluetooth className="h-6 w-6 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Bluetooth</h4>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm text-gray-700">Signal Power: {bioMEMSSettings.bluetoothPower}%</label>
                      <input
                        type="range"
                        min="25"
                        max="100"
                        value={bioMEMSSettings.bluetoothPower}
                        onChange={(e) => handleSettingChange('bluetoothPower', parseInt(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                      <div className="text-sm text-gray-600 mt-2">
                        <p>Status: Connected</p>
                        <p>Range: ~10 meters</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Wifi className="h-6 w-6 text-green-600" />
                      <h4 className="font-semibold text-green-800">Wi-Fi</h4>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm text-gray-700">Signal Power: {bioMEMSSettings.wifiPower}%</label>
                      <input
                        type="range"
                        min="25"
                        max="100"
                        value={bioMEMSSettings.wifiPower}
                        onChange={(e) => handleSettingChange('wifiPower', parseInt(e.target.value))}
                        className="w-full accent-green-600"
                      />
                      <div className="text-sm text-gray-600 mt-2">
                        <p>Status: Connected</p>
                        <p>Network: SecureGluco_5G</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADVANCED TAB */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Advanced Settings</h3>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Caution</h4>
                      <p className="text-sm text-yellow-700">Advanced settings may affect device performance. Modify with care.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2">Diagnostic Mode</h5>
                    <p className="text-sm text-gray-600 mb-3">Enable detailed logging for troubleshooting</p>
                    <button
                      onClick={handleToggleDiagnostics}
                      className={`w-full px-3 py-2 rounded-lg font-medium transition ${diagnosticsEnabled ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
                    >
                      {diagnosticsEnabled ? 'Diagnostics Enabled' : 'Enable Diagnostics'}
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2">Factory Reset</h5>
                    <p className="text-sm text-gray-600 mb-3">Reset all settings to factory defaults</p>
                    <button
                      onClick={handleFactoryReset}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Factory Reset
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2">Firmware Update</h5>
                    <p className="text-sm text-gray-600 mb-3">Check for and install firmware updates</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRefreshFirmware}
                        className="flex-1 px-3 py-2 bg-white border rounded-lg hover:shadow-sm transition"
                      >
                        {isUpdatingFirmware ? 'Updating...' : 'Refresh Firmware'}
                      </button>
                      <button
                        onClick={handleCheckUpdates}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        {isCheckingUpdates ? 'Checking...' : 'Check'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              {hasUnsavedChanges && (
                <>
                  <Info className="h-4 w-4 text-blue-600 animate-pulse" />
                  <span>You have unsaved changes</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveSettings}
                disabled={!hasUnsavedChanges}
                className="px-5 py-2 inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* subtle slide-in animation */}
      <style jsx>{`
        .slide-in {
          animation: slideIn 220ms ease-out;
        }
        @keyframes slideIn {
          from { transform: translateY(8px) scale(0.995); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
