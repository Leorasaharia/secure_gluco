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
  private baseUrl = 'https://secure-gluco.onrender.com'; // Replace with your actual Render URL

  async getLatestAnalysis(): Promise<StreamlitAnalysisData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/threat-analysis`);
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
      const response = await fetch(`${this.baseUrl}/health`);
      const result = await response.json();
      return result.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new SimpleAPIService();