import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AboutPage from './components/AboutPage';
import { AlertPanel } from './components/AlertPanel';
import { GlucoseMonitor } from './components/GlucoseMonitor';
import { Header } from './components/Header';
import { HistoricalData } from './components/HistoricalData';
import { InsulinPump } from './components/InsulinPump';
import { IntroAnimation } from './components/IntroAnimation';
import { SecurityDashboard } from './components/SecurityDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { ThreatDetectionPanel } from './components/ThreatDetectionPanel';
import { Alert, GlucoseReading, InsulinPumpStatus, SecurityThreat } from './types';
import {
  generateGlucoseData,
  mockAlerts,
  mockInsulinPumpStatus,
  mockSecurityThreats
} from './utils/mockData';

function DashboardApp() {
  const [showIntro, setShowIntro] = useState(true);
  const [glucoseData, setGlucoseData] = useState<GlucoseReading[]>([]);
  const [pumpStatus, setPumpStatus] = useState<InsulinPumpStatus>(mockInsulinPumpStatus);
  const [threats, setThreats] = useState<SecurityThreat[]>(mockSecurityThreats);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [isAlertPanelOpen, setIsAlertPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [showThreatDetection, setShowThreatDetection] = useState(false);

  // Initialize glucose data
  useEffect(() => {
    if (!showIntro) {
      const data = generateGlucoseData(24);
      setGlucoseData(data);

      const interval = setInterval(() => {
        const lastReading = data[data.length - 1];
        const newValue = Math.max(50, Math.min(400, 
          lastReading.value + (Math.random() - 0.5) * 10
        ));
        
        const newReading: GlucoseReading = {
          timestamp: new Date(),
          value: Math.round(newValue),
          trend: newValue > lastReading.value + 2 ? 'rising' : 
                 newValue < lastReading.value - 2 ? 'falling' : 'stable'
        };

        setGlucoseData(prev => [...prev.slice(1), newReading]);

        if (newReading.value < 70 || newReading.value > 250) {
          const newAlert: Alert = {
            id: Date.now().toString(),
            type: 'glucose',
            severity: newReading.value < 54 || newReading.value > 300 ? 'critical' : 'warning',
            title: newReading.value < 70 ? 'Low Glucose Alert' : 'High Glucose Alert',
            message: `Current glucose: ${newReading.value} mg/dL - ${
              newReading.value < 70 ? 'Take action immediately' : 'Consider corrective action'
            }`,
            timestamp: new Date(),
            dismissed: false
          };
          
          setAlerts(prev => [newAlert, ...prev]);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [showIntro]);

  const handleSuspendDelivery = () => {
    setPumpStatus(prev => ({ ...prev, isDelivering: false }));
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'device',
      severity: 'warning',
      title: 'Insulin Delivery Suspended',
      message: 'Insulin delivery has been manually suspended',
      timestamp: new Date(),
      dismissed: false
    }, ...prev]);
  };

  const handleResumeDelivery = () => {
    setPumpStatus(prev => ({ ...prev, isDelivering: true }));
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'device',
      severity: 'info',
      title: 'Insulin Delivery Resumed',
      message: 'Insulin delivery has been resumed',
      timestamp: new Date(),
      dismissed: false
    }, ...prev]);
  };

  const handleBlockThreat = (threatId: string) => {
    setThreats(prev => 
      prev.map(threat => 
        threat.id === threatId ? { ...threat, status: 'blocked' as const } : threat
      )
    );
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'security',
      severity: 'info',
      title: 'Threat Blocked',
      message: 'Security threat has been successfully blocked',
      timestamp: new Date(),
      dismissed: false
    }, ...prev]);
  };

  const handleThreatDetected = (threat: Omit<SecurityThreat, 'id'>) => {
    const newThreat: SecurityThreat = { ...threat, id: Date.now().toString() };
    setThreats(prev => [newThreat, ...prev]);
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'ai_threat',
      severity: threat.severity,
      title: 'AI Threat Detection Alert',
      message: threat.description,
      timestamp: new Date(),
      dismissed: false
    }, ...prev]);
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, dismissed: true } : alert));
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const currentReading = glucoseData[glucoseData.length - 1];

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        activeAlerts={activeAlerts.length}
        onSettingsClick={() => setIsSettingsPanelOpen(true)}
        onAlertsClick={() => setIsAlertPanelOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {currentReading && <GlucoseMonitor currentReading={currentReading} data={glucoseData} />}
          <InsulinPump 
            status={pumpStatus}
            onSuspendDelivery={handleSuspendDelivery}
            onResumeDelivery={handleResumeDelivery}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SecurityDashboard threats={threats} onBlockThreat={handleBlockThreat} />
          <HistoricalData data={glucoseData} />
        </div>

        {showThreatDetection && (
          <div className="mb-8">
            <ThreatDetectionPanel onThreatDetected={handleThreatDetected} />
          </div>
        )}
      </main>

      <AlertPanel
        alerts={alerts}
        isOpen={isAlertPanelOpen}
        onClose={() => setIsAlertPanelOpen(false)}
        onDismissAlert={handleDismissAlert}
      />

      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
        onOpenThreatAnalysis={() => setShowThreatDetection(true)}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardApp />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
