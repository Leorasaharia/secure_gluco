# Add these functions to your streamlit_app/cyber_threat_detection_app.py

import requests
import json

# Add this configuration at the top
API_BRIDGE_URL = "http://localhost:5000"  # URL of the API bridge

def send_analysis_to_frontend(threat_class, confidence, all_probabilities, features, feature_names):
    """
    Send analysis results to the API bridge for React frontend consumption
    """
    try:
        # Prepare recommendations based on threat class
        recommendations = get_recommendations_for_threat(threat_class)
        
        # Determine risk level
        risk_level = determine_risk_level(threat_class, confidence)
        
        # Structure feature data
        feature_dict = dict(zip(feature_names, features))
        
        # Prepare payload
        payload = {
            "threat_class": threat_class,
            "confidence": float(confidence),
            "probabilities": {k: float(v) for k, v in all_probabilities.items()},
            "features": {k: float(v) for k, v in feature_dict.items()},
            "recommendations": recommendations,
            "risk_level": risk_level,
            "timestamp": datetime.now().isoformat(),
            "model_used": "real" if use_real_model else "demo"
        }
        
        # Send to API bridge
        response = requests.post(
            f"{API_BRIDGE_URL}/api/threat-analysis",
            json=payload,
            timeout=5
        )
        
        if response.status_code == 200:
            st.success("✅ Analysis sent to frontend dashboard")
        else:
            st.warning(f"⚠️ Failed to send to frontend: {response.status_code}")
            
    except Exception as e:
        st.warning(f"⚠️ Could not send to frontend: {str(e)}")

def get_recommendations_for_threat(threat_class):
    """Generate recommendations based on threat classification"""
    if threat_class.lower() in ['benign', 'normal']:
        return [
            "✅ Traffic appears normal - continue monitoring",
            "📊 Regular security audits recommended",
            "🔄 Keep security systems updated"
        ]
    elif 'ddos' in threat_class.lower():
        return [
            "🚨 **CRITICAL**: Block source IP immediately",
            "🛡️ Activate DDoS protection mechanisms", 
            "📈 Scale infrastructure to handle load",
            "👥 Notify security team immediately",
            "📋 Document incident for analysis"
        ]
    elif 'port' in threat_class.lower() or 'scan' in threat_class.lower():
        return [
            "🔒 Block scanning source IP",
            "🔍 Review and strengthen firewall rules",
            "🔧 Check for system vulnerabilities", 
            "👀 Monitor for exploitation attempts",
            "📝 Log incident for threat intelligence"
        ]
    else:
        return [
            "⚠️ **WARNING**: Potential security threat detected",
            "🔍 Investigate traffic source immediately",
            "🛡️ Implement additional security measures",
            "📞 Contact security team",
            "📊 Perform detailed traffic analysis"
        ]

def determine_risk_level(threat_class, confidence):
    """Determine risk level based on threat class and confidence"""
    if threat_class.lower() in ['benign', 'normal']:
        return "Low"
    elif 'ddos' in threat_class.lower():
        return "Critical" if confidence > 0.8 else "High"
    elif 'port' in threat_class.lower() or 'scan' in threat_class.lower():
        return "High" if confidence > 0.7 else "Medium"
    else:
        return "High" if confidence > 0.8 else "Medium"

# Import datetime at the top of the file
from datetime import datetime

# Add this to your requirements.txt
# requests