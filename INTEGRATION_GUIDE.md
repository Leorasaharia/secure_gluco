# Instructions to integrate Streamlit data with React frontend

## Setup Overview

You have several options to get Streamlit parameter data into your React frontend:

### 🎯 **Option 1: API Bridge (Recommended)**

1. **Start the API Bridge Server**:
   ```bash
   cd api_bridge
   pip install -r requirements.txt
   python app.py
   ```

2. **Update your Streamlit app** to send data to the bridge by adding this to your prediction function:

   ```python
   # Add to streamlit_app/cyber_threat_detection_app.py after line 200 (in predict_threat function)
   
   import requests
   
   def send_to_frontend(threat_class, confidence, all_probabilities, features):
       try:
           payload = {
               "threat_class": threat_class,
               "confidence": float(confidence),
               "probabilities": {k: float(v) for k, v in all_probabilities.items()},
               "features": dict(zip(FEATURE_NAMES, features)),
               "timestamp": datetime.now().isoformat()
           }
           
           requests.post("http://localhost:5000/api/threat-analysis", json=payload, timeout=2)
       except:
           pass  # Fail silently if frontend not available
   
   # Add this call at the end of predict_threat function:
   send_to_frontend(threat_class, confidence, all_probabilities, features)
   ```

3. **Use the enhanced component** in your React app:
   ```tsx
   // In App.tsx, replace ThreatDetectionPanel with:
   import { EnhancedThreatDetectionPanel } from './components/EnhancedThreatDetectionPanel';
   
   // Then use:
   <EnhancedThreatDetectionPanel onThreatDetected={handleThreatDetected} />
   ```

### 🎯 **Option 2: Direct File Sharing**

Create a shared JSON file that both apps can read/write:

```python
# In streamlit app, save results to file:
import json
import os

def save_analysis_to_file(analysis_data):
    shared_file = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'latest_analysis.json')
    os.makedirs(os.path.dirname(shared_file), exist_ok=True)
    
    with open(shared_file, 'w') as f:
        json.dump(analysis_data, f)
```

```tsx
// In React, read the file:
useEffect(() => {
  const readAnalysisFile = async () => {
    try {
      const response = await fetch('/data/latest_analysis.json');
      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error('Failed to read analysis file:', error);
    }
  };
  
  const interval = setInterval(readAnalysisFile, 3000);
  return () => clearInterval(interval);
}, []);
```

### 🎯 **Option 3: WebSocket Real-time Communication**

For real-time updates, you can implement WebSocket communication:

1. **Add WebSocket to Streamlit** (using `streamlit-server-state`):
   ```python
   import websocket
   import json
   
   def send_websocket_update(data):
       try:
           ws = websocket.create_connection("ws://localhost:8080/ws")
           ws.send(json.dumps(data))
           ws.close()
       except:
           pass
   ```

2. **React WebSocket client**:
   ```tsx
   useEffect(() => {
     const ws = new WebSocket('ws://localhost:8080/ws');
     
     ws.onmessage = (event) => {
       const data = JSON.parse(event.data);
       setAnalysisData(data);
     };
     
     return () => ws.close();
   }, []);
   ```

### 🎯 **Option 4: Embedded Streamlit (iframe)**

Embed the Streamlit app directly in your React frontend:

```tsx
// Add this component to your React app:
export const StreamlitEmbed = () => {
  return (
    <div className="w-full h-screen">
      <iframe
        src="http://localhost:8501"
        width="100%"
        height="100%"
        frameBorder="0"
        title="Streamlit Threat Analysis"
      />
    </div>
  );
};
```

## 🚀 **Recommended Implementation Steps**

1. **Start with Option 1 (API Bridge)** - it's the most flexible
2. **Update your Streamlit app** to send data via HTTP POST
3. **Replace ThreatDetectionPanel** with the enhanced version
4. **Test the integration** by running both servers

## 📂 **File Structure After Setup**

```
secure_gluco/
├── api_bridge/
│   ├── app.py              # API bridge server
│   ├── requirements.txt    # Python dependencies
│   └── shared_analysis_data.json  # Persistent data store
├── streamlit_app/
│   └── cyber_threat_detection_app.py  # Updated with API calls
└── src/
    ├── services/
    │   └── threatAnalysisService.ts    # API client
    ├── components/
    │   └── EnhancedThreatDetectionPanel.tsx  # Real-time component
    └── hooks/
        └── useThreatAnalysis.ts        # React hook for data
```

## 🔧 **Testing the Integration**

1. Start API Bridge: `cd api_bridge && python app.py`
2. Start Streamlit: `cd streamlit_app && streamlit run cyber_threat_detection_app.py`
3. Start React: `npm run dev`
4. Run analysis in Streamlit → See results in React dashboard!

The API bridge approach is recommended because:
- ✅ **Real-time updates** between apps
- ✅ **Persistent data storage** 
- ✅ **Clean separation** of concerns
- ✅ **Easy to debug** and monitor
- ✅ **Scalable** for future features