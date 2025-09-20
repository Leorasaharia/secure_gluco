import React, { useState, useEffect } from 'react';
import { Brain, Zap, AlertTriangle, CheckCircle, BarChart3, Network, Wifi, WifiOff } from 'lucide-react';
import { ThreatAnalysisData, threatAnalysisService } from '../services/threatAnalysisService';

interface ThreatDetectionPanelProps {
  onThreatDetected: (threat: any) => void;
}

export const EnhancedThreatDetectionPanel: React.FC<ThreatDetectionPanelProps> = ({ onThreatDetected }) => {
  const [streamlitData, setStreamlitData] = useState<ThreatAnalysisData | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<ThreatAnalysisData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API bridge
  const fetchStreamlitData = async () => {
    try {
      const data = await threatAnalysisService.getLatestAnalysis();
      if (data) {
        setStreamlitData(data);
        setLastUpdate(new Date(data.timestamp));
        
        // Trigger threat in main dashboard if it's a malicious threat
        if (data.threat_class.toLowerCase() !== 'benign' && data.threat_class.toLowerCase() !== 'normal') {
          onThreatDetected({
            id: data.id,
            type: data.threat_class.toLowerCase().includes('ddos') ? 'ddos_attack' : 'port_scan',
            severity: data.risk_level.toLowerCase() === 'critical' ? 'critical' : 'warning',
            timestamp: new Date(data.timestamp),
            description: `${data.threat_class} detected via Streamlit AI analysis - Confidence: ${(data.confidence * 100).toFixed(1)}%`,
            status: 'active',
            source: 'Streamlit AI Analysis'
          });
        }
      }
      
      const history = await threatAnalysisService.getAnalysisHistory();
      setAnalysisHistory(history);
      
      setIsConnected(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch Streamlit data:', error);
      setIsConnected(false);
      setIsLoading(false);
    }
  };

  // Check API health
  const checkConnection = async () => {
    const healthy = await threatAnalysisService.checkHealth();
    setIsConnected(healthy);
  };

  useEffect(() => {
    // Initial fetch
    fetchStreamlitData();
    checkConnection();

    // Set up polling for new data
    const dataInterval = setInterval(fetchStreamlitData, 3000); // Check every 3 seconds
    const healthInterval = setInterval(checkConnection, 30000); // Health check every 30 seconds

    return () => {
      clearInterval(dataInterval);
      clearInterval(healthInterval);
    };
  }, []);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Live Streamlit AI Analysis</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">Real-time Analysis</span>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && !isLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h4 className="font-semibold text-yellow-800">API Bridge Disconnected</h4>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Cannot connect to Streamlit API bridge. Check the API connection.
          </p>
          <button 
            onClick={checkConnection}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Latest Analysis Results */}
      {streamlitData && (
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Latest Analysis</h3>
              <span className="text-sm text-gray-500">
                {lastUpdate && `Updated: ${lastUpdate.toLocaleTimeString()}`}
              </span>
            </div>
            
            {/* Main Result Card */}
            <div className={`rounded-lg border-2 p-4 ${getRiskColor(streamlitData.risk_level)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {streamlitData.threat_class.toLowerCase().includes('benign') ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  )}
                  <h4 className="font-semibold text-lg">
                    {streamlitData.threat_class}
                  </h4>
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
                  <p className="text-sm font-medium">Model Used</p>
                  <p className="text-lg font-semibold">{streamlitData.model_used || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Probability Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Class Probabilities</h4>
              <div className="space-y-2">
                {Object.entries(streamlitData.probabilities).map(([className, probability]) => (
                  <div key={className} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{className}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${probability * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {(probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {streamlitData.recommendations && streamlitData.recommendations.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-3">AI Recommendations</h4>
                <ul className="space-y-2">
                  {streamlitData.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-purple-600 mt-1">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Network Features Preview */}
            {streamlitData.features && Object.keys(streamlitData.features).length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-900 mb-3">Network Features (Top 8)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {Object.entries(streamlitData.features).slice(0, 8).map(([feature, value]) => (
                    <div key={feature} className="flex justify-between">
                      <span className="text-blue-700">{feature}:</span>
                      <span className="font-mono text-blue-900">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Showing 8 of {Object.keys(streamlitData.features).length} features from Streamlit analysis
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analysis History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analysisHistory.slice(0, 10).map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {analysis.threat_class.toLowerCase().includes('benign') ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm text-gray-900">{analysis.threat_class}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(analysis.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {(analysis.confidence * 100).toFixed(1)}%
                  </p>
                  <p className={`text-xs px-2 py-1 rounded-full ${getRiskColor(analysis.risk_level)}`}>
                    {analysis.risk_level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!streamlitData && !isLoading && isConnected && (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Data</h3>
          <p className="text-gray-600">
            Run an analysis in the Streamlit app to see results here
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis data...</p>
        </div>
      )}
    </div>
  );
};