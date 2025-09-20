// Simple integration service without complex TypeScript issues
export interface StreamlitAnalysisData {
  id: string;
  timestamp: string;
  threat_class: string;
  confidence: number;
  probabilities: Record<string, number>;
  features: Record<string, number>;
  recommendations: string[];
  risk_level: string;
}

class SimpleAPIService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://secure-gluco.onrender.com'  // Your Render URL
    : 'http://localhost:5000';             // Local development

  async getLatestAnalysis(): Promise<StreamlitAnalysisData | null> {
    try {
      console.log(`Fetching from: ${this.baseUrl}/api/threat-analysis`);
      const response = await fetch(`${this.baseUrl}/api/threat-analysis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('API call failed:', error);
      return null;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      console.log(`Health check: ${this.baseUrl}/api/health`);
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const apiService = new SimpleAPIService();