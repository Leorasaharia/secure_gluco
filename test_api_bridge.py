#!/usr/bin/env python3
"""
Test script to verify API bridge connectivity and data flow
"""

import requests
import json
from datetime import datetime

def test_api_health():
    """Test if the API bridge is healthy"""
    try:
        response = requests.get("https://secure-gluco.onrender.com/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ API Bridge is healthy")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API health check error: {e}")
        return False

def test_send_analysis():
    """Test sending analysis data to the API bridge"""
    try:
        # Sample analysis data
        payload = {
            "threat_class": "DDoS Attack",
            "confidence": 0.85,
            "probabilities": {
                "benign": 0.05,
                "ddos_attack": 0.85,
                "port_scan": 0.08,
                "malware": 0.02
            },
            "features": {
                "packet_size": 1024,
                "flow_duration": 5.2,
                "protocol": 6,
                "flags": 2
            },
            "recommendations": ["🚨 Block suspicious IP", "🔍 Investigate traffic patterns", "📈 Scale DDoS protection"],
            "risk_level": "Critical",
            "timestamp": datetime.now().isoformat(),
            "model_used": "test"
        }
        
        response = requests.post(
            "https://secure-gluco.onrender.com/api/threat-analysis",
            json=payload,
            timeout=5
        )
        
        if response.status_code == 200:
            print("✅ Successfully sent test analysis data")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Failed to send analysis data: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error sending analysis data: {e}")
        return False

def test_get_analysis():
    """Test retrieving analysis data from the API bridge"""
    try:
        response = requests.get("https://secure-gluco.onrender.com/api/threat-analysis", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Successfully retrieved analysis data")
            if data.get('data'):
                print(f"Latest analysis: {data['data']['threat_class']} (Confidence: {data['data']['confidence']:.2f})")
            else:
                print("No analysis data available yet")
            return True
        else:
            print(f"❌ Failed to retrieve analysis data: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error retrieving analysis data: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing API Bridge Integration")
    print("=" * 50)
    
    # Test sequence
    health_ok = test_api_health()
    print()
    
    if health_ok:
        send_ok = test_send_analysis()
        print()
        
        if send_ok:
            get_ok = test_get_analysis()
            print()
            
            if health_ok and send_ok and get_ok:
                print("🎉 All tests passed! API bridge is working correctly.")
            else:
                print("⚠️ Some tests failed. Check the API bridge configuration.")
        else:
            print("⚠️ Cannot test data retrieval - sending failed.")
    else:
        print("⚠️ Cannot proceed - API bridge is not healthy.")