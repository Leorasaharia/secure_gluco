// React Hook for using threat analysis data
import { useState, useEffect, useCallback } from 'react';
import { ThreatAnalysisData, threatAnalysisService } from '../services/threatAnalysisService';

export const useThreatAnalysis = (autoUpdate: boolean = true) => {
  const [latestAnalysis, setLatestAnalysis] = useState<ThreatAnalysisData | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<ThreatAnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealthy, setApiHealthy] = useState(false);

  // Fetch latest analysis
  const fetchLatestAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await threatAnalysisService.getLatestAnalysis();
      setLatestAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch analysis history
  const fetchAnalysisHistory = useCallback(async () => {
    try {
      const history = await threatAnalysisService.getAnalysisHistory();
      setAnalysisHistory(history);
    } catch (err) {
      console.error('Failed to fetch analysis history:', err);
    }
  }, []);

  // Check API health
  const checkApiHealth = useCallback(async () => {
    const healthy = await threatAnalysisService.checkHealth();
    setApiHealthy(healthy);
  }, []);

  useEffect(() => {
    // Initial data fetch
    fetchLatestAnalysis();
    fetchAnalysisHistory();
    checkApiHealth();

    if (autoUpdate) {
      // Subscribe to real-time updates
      const unsubscribe = threatAnalysisService.subscribe((data) => {
        setLatestAnalysis(data);
        // Refresh history when new data arrives
        if (data) {
          fetchAnalysisHistory();
        }
      });

      // Start polling
      threatAnalysisService.startPolling(3000); // Poll every 3 seconds

      // Health check interval
      const healthInterval = setInterval(checkApiHealth, 30000); // Check every 30 seconds

      return () => {
        unsubscribe();
        threatAnalysisService.stopPolling();
        clearInterval(healthInterval);
      };
    }
  }, [autoUpdate, fetchLatestAnalysis, fetchAnalysisHistory, checkApiHealth]);

  return {
    latestAnalysis,
    analysisHistory,
    isLoading,
    error,
    apiHealthy,
    refreshData: fetchLatestAnalysis,
    refreshHistory: fetchAnalysisHistory
  };
};