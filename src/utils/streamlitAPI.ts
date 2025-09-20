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
  private baseUrl = this.getApiBaseUrl();
  
  private getApiBaseUrl(): string {
    // Use Vite environment variable if available
    if (import.meta.env.VITE_API_BASE_URL) {
      console.log('Using env var API URL:', import.meta.env.VITE_API_BASE_URL);
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Fallback: Check if we're in production (Vercel deployment)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      console.log('Current hostname:', hostname);
      if (hostname.includes('vercel.app') || hostname.includes('secure-gluco')) {
        console.log('Detected production environment, using Render URL');
        return 'https://secure-gluco.onrender.com';
      }
    }
    
    // Default to localhost for development
    console.log('Using localhost for development');
    return 'http://localhost:5000';
  }

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