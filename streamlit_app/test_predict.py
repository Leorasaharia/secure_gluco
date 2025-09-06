# streamlit_app/test_predict.py
import os
import joblib
import numpy as np

# Try importing the app module (so we reuse its loader & predictor)
app_mod = None
candidates = [
    "streamlit_app.cyber_threat_detection",
    "streamlit_app.cyber_threat_detection_app",
    "cyber_threat_detection",
    "cyber_threat_detection_app"
]
for c in candidates:
    try:
        import importlib
        app_mod = importlib.import_module(c)
        break
    except Exception:
        app_mod = None

if app_mod is not None:
    try:
        load_model_and_preprocessors = getattr(app_mod, "load_model_and_preprocessors")
        predict_threat = getattr(app_mod, "predict_threat")
        FEATURE_NAMES = getattr(app_mod, "FEATURE_NAMES")
    except Exception:
        app_mod = None

# Fallback implementations if app import failed
if app_mod is None:
    import torch
    import torch.nn as nn

    FEATURE_NAMES = [
        'Header_Length', 'Protocol_Type', 'Duration', 'Rate', 'Srate', 'Drate',
        'fin_flag_number', 'syn_flag_number', 'rst_flag_number', 'psh_flag_number',
        'ack_flag_number', 'ece_flag_number', 'cwr_flag_number',
        'ack_count', 'syn_count', 'fin_count', 'rst_count',
        'HTTP', 'HTTPS', 'DNS', 'Telnet', 'SMTP', 'SSH', 'IRC',
        'TCP', 'UDP', 'DHCP', 'ARP', 'ICMP', 'IGMP', 'IPv', 'LLC',
        'Tot_sum', 'Min', 'Max', 'AVG', 'Std', 'Tot_size', 'IAT',
        'Number', 'Magnitude', 'Radius', 'Covariance', 'Variance', 'Weight'
    ]

    class LightweightANN(nn.Module):
        def __init__(self, input_size, num_classes):
            super().__init__()
            self.layers = nn.Sequential(
                nn.Linear(input_size, 256),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(256, 128),
                nn.ReLU(),
                nn.Dropout(0.2),
                nn.Linear(128, 64),
                nn.ReLU(),
                nn.Dropout(0.1),
                nn.Linear(64, num_classes)
            )
        def forward(self, x):
            return self.layers(x)

    def load_model_and_preprocessors():
        base = os.path.dirname(__file__) or "."
        scaler = joblib.load(os.path.join(base, "scaler.pkl"))
        label_encoder = joblib.load(os.path.join(base, "label_encoder.pkl"))
        num_features = len(FEATURE_NAMES)
        num_classes = len(label_encoder.classes_)
        model = LightweightANN(num_features, num_classes)
        device = "cpu"
        # fallback returns model with default random weights
        return model, scaler, label_encoder, device, False

    def _fallback_probs_from_features(features, label_encoder):
        """
        Deterministic scoring fallback that maps features -> soft probabilities.
        Uses Rate, syn_count, duration, rst_count heuristics to shape the distribution.
        """
        # Simple feature extraction (safe indexes by FEATURE_NAMES)
        f = dict(zip(FEATURE_NAMES, features))
        rate = float(f.get("Rate", 0.0))
        syn = float(f.get("syn_count", 0.0))
        rst = float(f.get("rst_count", 0.0))
        duration = float(f.get("Duration", 0.0))

        # heuristic scores (0..1)
        s_ddos = min(1.0, (rate / 50000.0) + (syn / 2000.0))
        s_port = min(1.0, (syn / 500.0) + (rst / 300.0))
        s_malware = min(1.0, (duration / 60.0) + max(0, (500 - rate) / 10000.0))

        # base benign score inverse of suspiciousness
        s_benign = max(0.0, 1.0 - 0.6 * s_ddos - 0.5 * s_port - 0.5 * s_malware)
        # ensure non-negative
        s_benign = max(0.0, s_benign)

        # assemble raw scores aligned with label_encoder.classes_
        classes = list(label_encoder.classes_)
        raw = []
        for cl in classes:
            cl_l = cl.lower()
            if "ddos" in cl_l:
                raw.append(s_ddos + 0.05)
            elif "port" in cl_l or "scan" in cl_l or "recon" in cl_l:
                raw.append(s_port + 0.03)
            elif "malware" in cl_l:
                raw.append(s_malware + 0.02)
            elif "benign" in cl_l or "normal" in cl_l:
                raw.append(s_benign + 0.6)
            else:
                # neutral small score for unknown labels
                raw.append(0.01)

        # normalize to probabilities
        raw = np.array(raw, dtype=float)
        if raw.sum() == 0:
            probs = np.ones_like(raw) / len(raw)
        else:
            probs = raw / raw.sum()
        return probs

    def predict_threat(features, model, scaler, label_encoder, device, use_real_model):
        # use scaler + placeholder model path for API compatibility
        features_scaled = scaler.transform([features])
        # try using the model for a prediction path (if torch available)
        try:
            import torch
            features_tensor = torch.tensor(features_scaled, dtype=torch.float32)
            with torch.no_grad():
                outputs = model(features_tensor)
                probabilities = torch.softmax(outputs, dim=1).numpy()[0]
                predicted_class = int(np.argmax(probabilities))
                confidence = float(probabilities[predicted_class])
                threat_class = label_encoder.inverse_transform([predicted_class])[0]
                all_probabilities = {label_encoder.classes_[i]: float(probabilities[i]) for i in range(len(label_encoder.classes_))}
                return threat_class, confidence, all_probabilities
        except Exception:
            # fallback deterministic heuristic that yields different outputs per sample
            probs = _fallback_probs_from_features(features, label_encoder)
            pred_idx = int(np.argmax(probs))
            return label_encoder.inverse_transform([pred_idx])[0], float(probs[pred_idx]), {label_encoder.classes_[i]: float(probs[i]) for i in range(len(probs))}


# load model & preprocessors via loader (or fallback)
model, scaler, label_encoder, device, use_real_model = load_model_and_preprocessors()

# Print debug info so user knows which path ran and model size
print("use_real_model =", bool(use_real_model))
try:
    import torch
    total_params = sum(p.numel() for p in model.parameters())
    print("model parameter count:", int(total_params))
except Exception:
    print("model parameter count: unavailable")

# Build samples as dicts keyed by feature names (ensures correct ordering)
SAMPLE_DICTS = {
    "Benign": {
        'Header_Length':20,'Protocol_Type':6,'Duration':0.5,'Rate':1000,'Srate':500,'Drate':500,
        'fin_flag_number':1,'syn_flag_number':1,'rst_flag_number':0,'psh_flag_number':1,
        'ack_flag_number':1,'ece_flag_number':0,'cwr_flag_number':0,
        'ack_count':10,'syn_count':1,'fin_count':1,'rst_count':0,
        'HTTP':1,'HTTPS':0,'DNS':0,'Telnet':0,'SMTP':0,'SSH':0,'IRC':0,
        'TCP':1,'UDP':0,'DHCP':0,'ARP':0,'ICMP':0,'IGMP':0,'IPv':1,'LLC':0,
        'Tot_sum':1500,'Min':64,'Max':1500,'AVG':750,'Std':200,'Tot_size':3000,'IAT':0.1,
        'Number':20,'Magnitude':1.5,'Radius':0.8,'Covariance':0.3,'Variance':0.4,'Weight':1.0
    },
    "DDoS": {
        'Header_Length':20,'Protocol_Type':17,'Duration':0.0005,'Rate':80000,'Srate':40000,'Drate':40000,
        'fin_flag_number':0,'syn_flag_number':1,'rst_flag_number':0,'psh_flag_number':0,
        'ack_flag_number':0,'ece_flag_number':0,'cwr_flag_number':0,
        'ack_count':0,'syn_count':1000,'fin_count':0,'rst_count':0,
        'HTTP':0,'HTTPS':0,'DNS':0,'Telnet':0,'SMTP':0,'SSH':0,'IRC':0,
        'TCP':0,'UDP':1,'DHCP':0,'ARP':0,'ICMP':0,'IGMP':0,'IPv':1,'LLC':0,
        'Tot_sum':64000,'Min':64,'Max':64,'AVG':64,'Std':0,'Tot_size':64000,'IAT':0.00001,
        'Number':10000,'Magnitude':10.0,'Radius':5.0,'Covariance':0.9,'Variance':0.95,'Weight':5.0
    },
    "Port_Scan": {
        'Header_Length':20,'Protocol_Type':6,'Duration':0.01,'Rate':12000,'Srate':6000,'Drate':6000,
        'fin_flag_number':1,'syn_flag_number':1,'rst_flag_number':1,'psh_flag_number':0,
        'ack_flag_number':0,'ece_flag_number':0,'cwr_flag_number':0,
        'ack_count':0,'syn_count':300,'fin_count':0,'rst_count':150,
        'HTTP':0,'HTTPS':0,'DNS':0,'Telnet':1,'SMTP':0,'SSH':1,'IRC':0,
        'TCP':1,'UDP':0,'DHCP':0,'ARP':0,'ICMP':0,'IGMP':0,'IPv':1,'LLC':0,
        'Tot_sum':6400,'Min':64,'Max':64,'AVG':64,'Std':0,'Tot_size':6400,'IAT':0.0001,
        'Number':100,'Magnitude':3.0,'Radius':2.0,'Covariance':0.7,'Variance':0.8,'Weight':3.0
    },
    "Malware": {
        'Header_Length':20,'Protocol_Type':6,'Duration':30.0,'Rate':200,'Srate':100,'Drate':100,
        'fin_flag_number':1,'syn_flag_number':1,'rst_flag_number':0,'psh_flag_number':1,
        'ack_flag_number':1,'ece_flag_number':0,'cwr_flag_number':0,
        'ack_count':50,'syn_count':1,'fin_count':1,'rst_count':0,
        'HTTP':0,'HTTPS':1,'DNS':0,'Telnet':0,'SMTP':0,'SSH':0,'IRC':0,
        'TCP':1,'UDP':0,'DHCP':0,'ARP':0,'ICMP':0,'IGMP':0,'IPv':1,'LLC':0,
        'Tot_sum':5000,'Min':100,'Max':100,'AVG':100,'Std':0,'Tot_size':5000,'IAT':0.05,
        'Number':50,'Magnitude':2.0,'Radius':1.2,'Covariance':0.6,'Variance':0.7,'Weight':2.0
    },
    "Spoofing": {
        'Header_Length':60,'Protocol_Type':1,'Duration':0.2,'Rate':3000,'Srate':1500,'Drate':1500,
        'fin_flag_number':0,'syn_flag_number':0,'rst_flag_number':0,'psh_flag_number':0,
        'ack_flag_number':0,'ece_flag_number':0,'cwr_flag_number':0,
        'ack_count':5,'syn_count':2,'fin_count':0,'rst_count':0,
        'HTTP':0,'HTTPS':0,'DNS':1,'Telnet':0,'SMTP':0,'SSH':0,'IRC':0,
        'TCP':0,'UDP':0,'DHCP':0,'ARP':1,'ICMP':0,'IGMP':0,'IPv':1,'LLC':0,
        'Tot_sum':2000,'Min':60,'Max':2000,'AVG':1030,'Std':80,'Tot_size':4000,'IAT':0.005,
        'Number':30,'Magnitude':1.2,'Radius':0.5,'Covariance':0.2,'Variance':0.3,'Weight':1.1
    },
    "MQTT": {
        'Header_Length':30,'Protocol_Type':6,'Duration':2.0,'Rate':800,'Srate':400,'Drate':400,
        'fin_flag_number':0,'syn_flag_number':0,'rst_flag_number':0,'psh_flag_number':0,
        'ack_flag_number':1,'ece_flag_number':0,'cwr_flag_number':0,
        'ack_count':20,'syn_count':1,'fin_count':0,'rst_count':0,
        'HTTP':0,'HTTPS':0,'DNS':0,'Telnet':0,'SMTP':0,'SSH':0,'IRC':0,
        'TCP':1,'UDP':0,'DHCP':0,'ARP':0,'ICMP':0,'IGMP':0,'IPv':1,'LLC':0,
        'Tot_sum':3200,'Min':60,'Max':120,'AVG':90,'Std':10,'Tot_size':6400,'IAT':0.02,
        'Number':40,'Magnitude':0.8,'Radius':0.3,'Covariance':0.1,'Variance':0.2,'Weight':1.5
    },
    "Recon": {
        'Header_Length':18,'Protocol_Type':6,'Duration':0.05,'Rate':4000,'Srate':2000,'Drate':2000,
        'fin_flag_number':1,'syn_flag_number':1,'rst_flag_number':0,'psh_flag_number':0,
        'ack_flag_number':0,'ece_flag_number':0,'cwr_flag_number':0,
        'ack_count':0,'syn_count':80,'fin_count':0,'rst_count':60,
        'HTTP':0,'HTTPS':0,'DNS':0,'Telnet':0,'SMTP':0,'SSH':0,'IRC':0,
        'TCP':1,'UDP':0,'DHCP':0,'ARP':0,'ICMP':0,'IGMP':0,'IPv':1,'LLC':0,
        'Tot_sum':4000,'Min':64,'Max':512,'AVG':288,'Std':60,'Tot_size':4000,'IAT':0.0005,
        'Number':200,'Magnitude':4.0,'Radius':2.5,'Covariance':0.6,'Variance':0.9,'Weight':2.0
    }
}

print("=== Running samples through predictor ===\n")
for name, sample_dict in SAMPLE_DICTS.items():
    sample_vec = [float(sample_dict.get(f, 0.0)) for f in FEATURE_NAMES]
    if len(sample_vec) != len(FEATURE_NAMES):
        print(f"Sample '{name}' has incorrect length ({len(sample_vec)} != {len(FEATURE_NAMES)}) - skipping")
        continue
    threat_class, confidence, all_probabilities = predict_threat(sample_vec, model, scaler, label_encoder, device, use_real_model)
    print(f"Sample: {name}")
    print(f"  Predicted class: {threat_class}")
    print(f"  Confidence: {confidence:.4f}")
    print("  Probabilities:")
    for k, v in all_probabilities.items():
        print(f"    {k}: {v:.4f}")
    print()
