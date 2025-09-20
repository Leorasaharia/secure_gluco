import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface StreamlitData {
  id: string;
  timestamp: string;
  threat_class: string;
  confidence: number;
  probabilities: Record<string, number>;
  features: Record<string, number>;
  recommendations: string[];
  risk_level: string;
  model_used?: string;
}

interface StreamlitDataPanelProps {
  onThreatDetected: (threat: any) => void;
}

export const StreamlitDataPanel: React.FC<StreamlitDataPanelProps> = ({ onThreatDetected }) => {
  const [streamlitData, setStreamlitData] = useState<StreamlitData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch data from API bridge
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/threat-analysis');
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        setStreamlitData(result.data);
        setLastUpdate(new Date(result.data.timestamp));
        setIsConnected(true);
        
        // Trigger threat alert if malicious
        if (result.data.threat_class.toLowerCase() !== 'benign') {
          onThreatDetected({
            id: result.data.id,
            type: result.data.threat_class.toLowerCase().includes('ddos') ? 'ddos_attack' : 'port_scan',
            severity: result.data.risk_level.toLowerCase() === 'critical' ? 'critical' : 'warning',
            timestamp: new Date(result.data.timestamp),
            description: `${result.data.threat_class} detected - Confidence: ${(result.data.confidence * 100).toFixed(1)}%`,
            status: 'active' as const,
            source: 'Streamlit AI Analysis'
          });
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
      console.error('Failed to fetch Streamlit data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">🧠 Live Streamlit Analysis</h2>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <Wifi className="h-5 w-5 text-green-500" />
              <span className="text-green-600 text-sm">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-red-500" />
              <span className="text-red-600 text-sm">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">No Streamlit Data</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Run an analysis in Streamlit to see results here. Make sure API bridge is running on port 5000.
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {streamlitData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Latest Analysis</h3>
            <span className="text-sm text-gray-500">
              {lastUpdate && `Updated: ${lastUpdate.toLocaleTimeString()}`}
            </span>
          </div>
          
          {/* Main Result */}
          <div className={`rounded-lg border-2 p-4 ${getRiskColor(streamlitData.risk_level)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {streamlitData.threat_class.toLowerCase().includes('benign') ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
                <h4 className="font-semibold text-lg">{streamlitData.threat_class}</h4>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Confidence</p>
                <p className="text-xl font-bold">{(streamlitData.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium">Risk Level</p>
                <p className="text-lg font-semibold">{streamlitData.risk_level}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Model</p>
                <p className="text-lg font-semibold">{streamlitData.model_used || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {streamlitData.recommendations && streamlitData.recommendations.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🎯 AI Recommendations</h4>
              <ul className="space-y-1">
                {streamlitData.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700">• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Probabilities */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">📊 Class Probabilities</h4>
            <div className="space-y-2">
              {Object.entries(streamlitData.probabilities || {}).map(([className, probability]) => (
                <div key={className} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{className}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${probability * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12">
                      {(probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};