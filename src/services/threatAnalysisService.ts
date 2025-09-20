// API service for threat analysis data
export interface ThreatAnalysisData {
  id: string;
  timestamp: string;
  threat_class: string;
  confidence: number;
  probabilities: Record<string, number>;
  features: Record<string, number>;
  recommendations: string[];
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  model_used?: 'real' | 'demo';
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  last_updated?: string;
  count?: number;
}

class ThreatAnalysisService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://secure-gluco.onrender.com/api'
    : 'http://localhost:5000/api';
  private pollingInterval: number | null = null;
  private listeners: Array<(data: ThreatAnalysisData | null) => void> = [];

  // Get latest analysis
  async getLatestAnalysis(): Promise<ThreatAnalysisData | null> {
    try {
      console.log(`Fetching analysis from: ${this.baseUrl}/threat-analysis`);
      const response = await fetch(`${this.baseUrl}/threat-analysis`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      const result: ApiResponse<ThreatAnalysisData> = await response.json();
      
      if (result.status === 'success') {
        return result.data || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch latest analysis:', error);
      return null;
    }
  }

  // Get analysis history
  async getAnalysisHistory(): Promise<ThreatAnalysisData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/threat-analysis/history`);
      const result: ApiResponse<ThreatAnalysisData[]> = await response.json();
      
      if (result.status === 'success') {
        return result.data || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch analysis history:', error);
      return [];
    }
  }

  // Check API health
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const result = await response.json();
      return result.status === 'healthy';
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  // Start polling for new data
  startPolling(interval: number = 5000) {
    if (this.pollingInterval) {
      this.stopPolling();
    }

    this.pollingInterval = setInterval(async () => {
      const latestData = await this.getLatestAnalysis();
      this.notifyListeners(latestData);
    }, interval) as unknown as number;
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Subscribe to data updates
  subscribe(callback: (data: ThreatAnalysisData | null) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(data: ThreatAnalysisData | null) {
    this.listeners.forEach(callback => callback(data));
  }
}

// Create singleton instance
export const threatAnalysisService = new ThreatAnalysisService();

export default ThreatAnalysisService;