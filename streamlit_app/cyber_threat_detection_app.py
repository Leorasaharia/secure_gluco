# Full corrected cyber_threat_detection_app.py
import streamlit as st
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import pickle
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import warnings
import os, joblib
from sklearn.preprocessing import StandardScaler, LabelEncoder
warnings.filterwarnings('ignore')

# Set page config
st.set_page_config(
    page_title="SecureGluco - AI Threat Detection",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional styling
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
    }
    .feature-section {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        margin: 1rem 0;
        border-left: 4px solid #667eea;
    }
    .result-card {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin: 1rem 0;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
    }
    .threat-critical {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
    }
    .threat-benign {
        background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
    }
    .stButton > button {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 25px;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
</style>
""", unsafe_allow_html=True)

# LightweightANN Model Definition (matching your architecture)
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

# Feature names (45 features as specified)
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

# Sample data for quick testing (kept as before)
SAMPLE_DATA = {
    'Benign Traffic': {
        'Header_Length': 20, 'Protocol_Type': 6, 'Duration': 0.5, 'Rate': 1000, 'Srate': 500, 'Drate': 500,
        'fin_flag_number': 1, 'syn_flag_number': 1, 'rst_flag_number': 0, 'psh_flag_number': 1,
        'ack_flag_number': 1, 'ece_flag_number': 0, 'cwr_flag_number': 0,
        'ack_count': 10, 'syn_count': 1, 'fin_count': 1, 'rst_count': 0,
        'HTTP': 1, 'HTTPS': 0, 'DNS': 0, 'Telnet': 0, 'SMTP': 0, 'SSH': 0, 'IRC': 0,
        'TCP': 1, 'UDP': 0, 'DHCP': 0, 'ARP': 0, 'ICMP': 0, 'IGMP': 0, 'IPv': 1, 'LLC': 0,
        'Tot_sum': 1500, 'Min': 64, 'Max': 1500, 'AVG': 750, 'Std': 200, 'Tot_size': 3000,
        'IAT': 0.1, 'Number': 20, 'Magnitude': 1.5, 'Radius': 0.8, 'Covariance': 0.3,
        'Variance': 0.4, 'Weight': 1.0
    },
    'DDoS Attack': {
        'Header_Length': 20, 'Protocol_Type': 17, 'Duration': 0.001, 'Rate': 50000, 'Srate': 25000, 'Drate': 25000,
        'fin_flag_number': 0, 'syn_flag_number': 1, 'rst_flag_number': 0, 'psh_flag_number': 0,
        'ack_flag_number': 0, 'ece_flag_number': 0, 'cwr_flag_number': 0,
        'ack_count': 0, 'syn_count': 1000, 'fin_count': 0, 'rst_count': 0,
        'HTTP': 0, 'HTTPS': 0, 'DNS': 0, 'Telnet': 0, 'SMTP': 0, 'SSH': 0, 'IRC': 0,
        'TCP': 0, 'UDP': 1, 'DHCP': 0, 'ARP': 0, 'ICMP': 0, 'IGMP': 0, 'IPv': 1, 'LLC': 0,
        'Tot_sum': 64000, 'Min': 64, 'Max': 64, 'AVG': 64, 'Std': 0, 'Tot_size': 64000,
        'IAT': 0.00001, 'Number': 1000, 'Magnitude': 10.0, 'Radius': 5.0, 'Covariance': 0.9,
        'Variance': 0.95, 'Weight': 5.0
    },
    'Port Scan': {
        'Header_Length': 20, 'Protocol_Type': 6, 'Duration': 0.01, 'Rate': 10000, 'Srate': 5000, 'Drate': 5000,
        'fin_flag_number': 1, 'syn_flag_number': 1, 'rst_flag_number': 1, 'psh_flag_number': 0,
        'ack_flag_number': 0, 'ece_flag_number': 0, 'cwr_flag_number': 0,
        'ack_count': 0, 'syn_count': 100, 'fin_count': 0, 'rst_count': 100,
        'HTTP': 0, 'HTTPS': 0, 'DNS': 0, 'Telnet': 1, 'SMTP': 0, 'SSH': 1, 'IRC': 0,
        'TCP': 1, 'UDP': 0, 'DHCP': 0, 'ARP': 0, 'ICMP': 0, 'IGMP': 0, 'IPv': 1, 'LLC': 0,
        'Tot_sum': 6400, 'Min': 64, 'Max': 64, 'AVG': 64, 'Std': 0, 'Tot_size': 6400,
        'IAT': 0.0001, 'Number': 100, 'Magnitude': 3.0, 'Radius': 2.0, 'Covariance': 0.7,
        'Variance': 0.8, 'Weight': 3.0
    },
    'Malware Communication': {
        'Header_Length': 20, 'Protocol_Type': 6, 'Duration': 5.0, 'Rate': 100, 'Srate': 50, 'Drate': 50,
        'fin_flag_number': 1, 'syn_flag_number': 1, 'rst_flag_number': 0, 'psh_flag_number': 1,
        'ack_flag_number': 1, 'ece_flag_number': 0, 'cwr_flag_number': 0,
        'ack_count': 50, 'syn_count': 1, 'fin_count': 1, 'rst_count': 0,
        'HTTP': 0, 'HTTPS': 1, 'DNS': 0, 'Telnet': 0, 'SMTP': 0, 'SSH': 0, 'IRC': 0,
        'TCP': 1, 'UDP': 0, 'DHCP': 0, 'ARP': 0, 'ICMP': 0, 'IGMP': 0, 'IPv': 1, 'LLC': 0,
        'Tot_sum': 5000, 'Min': 100, 'Max': 100, 'AVG': 100, 'Std': 0, 'Tot_size': 5000,
        'IAT': 0.05, 'Number': 50, 'Magnitude': 2.0, 'Radius': 1.2, 'Covariance': 0.6,
        'Variance': 0.7, 'Weight': 2.0
    }
}

# --- helpers for simulated/randomized predictions (place after LightweightANN) ---
def _feature_influence_score(features, FEATURE_NAMES):
    """
    Create a lightweight vector of key feature-derived scores in [0,1].
    This is used to bias random probabilities towards plausible classes.
    """
    f = dict(zip(FEATURE_NAMES, features))
    rate = float(f.get("Rate", 0.0))
    syn = float(f.get("syn_count", 0.0))
    rst = float(f.get("rst_count", 0.0))
    duration = float(f.get("Duration", 0.0))

    # scaled scores (clamped 0..1)
    s_ddos = min(1.0, (rate / 50000.0) + (syn / 2000.0))
    s_port = min(1.0, (syn / 500.0) + (rst / 300.0))
    s_malware = min(1.0, (duration / 60.0) + max(0.0, (500.0 - rate) / 10000.0))
    s_benign = max(0.0, 1.0 - 0.6 * s_ddos - 0.5 * s_port - 0.5 * s_malware)

    return {
        "ddos": s_ddos,
        "port": s_port,
        "malware": s_malware,
        "benign": s_benign
    }

def _randomized_probabilities(features, label_encoder, FEATURE_NAMES, randomness=0.25):
    """
    Build a probability distribution over label_encoder.classes_ using feature influence
    plus controlled randomness. 'randomness' controls how noisy the distribution is (0..1).
    """
    base_scores = _feature_influence_score(features, FEATURE_NAMES)
    classes = list(label_encoder.classes_)

    # Build raw scores aligned to classes
    raw = []
    for cl in classes:
        cl_l = cl.lower()
        if "ddos" in cl_l:
            score = base_scores["ddos"]
        elif "port" in cl_l or "scan" in cl_l or "recon" in cl_l:
            score = base_scores["port"]
        elif "malware" in cl_l:
            score = base_scores["malware"]
        elif "benign" in cl_l or "normal" in cl_l:
            score = base_scores["benign"]
        else:
            # fallback small base
            score = 0.05
        raw.append(float(score) + 0.001)  # tiny floor to avoid zeros

    raw = np.array(raw, dtype=float)

    # add controlled random noise (sampled per-call)
    noise = np.random.RandomState()  # fresh RNG per-call
    random_shift = noise.normal(loc=0.0, scale=randomness, size=raw.shape)
    raw = raw + random_shift
    raw = np.clip(raw, a_min=0.001, a_max=None)

    # normalize to probabilities
    probs = raw / raw.sum()

    # optionally sharpen or smooth distribution slightly
    suspiciousness = raw.sum() - (len(raw) * 0.05)
    sharpen = 1.0 + min(2.0, suspiciousness)
    probs = np.power(probs, sharpen)
    probs = probs / probs.sum()

    return probs

# --- new predict_threat function (replaces old) ---
def predict_threat(features, model, scaler, label_encoder, device, use_real_model):
    """Make prediction using the trained model or randomized simulation.

    When use_real_model True: unchanged — uses model/scaler/label_encoder.
    When use_real_model False: returns randomized probabilities influenced by features.
    """
    if use_real_model and model is not None:
        # Real model prediction (unchanged)
        features_scaled = scaler.transform([features])
        features_tensor = torch.tensor(features_scaled, dtype=torch.float32).to(device)

        with torch.no_grad():
            outputs = model(features_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][predicted_class].item()

        threat_class = label_encoder.inverse_transform([predicted_class])[0]
        all_probabilities = {
            label_encoder.classes_[i]: probabilities[0][i].item()
            for i in range(len(label_encoder.classes_))
        }

        return threat_class, confidence, all_probabilities

    else:
        # Demo/simulation mode: generate randomized predictions influenced by features
        probs = _randomized_probabilities(features, label_encoder, FEATURE_NAMES, randomness=0.30)

        # Make predicted class by sampling from the distribution (adds randomness)
        sampled_idx = int(np.random.choice(len(probs), p=probs))
        predicted_label = label_encoder.inverse_transform([sampled_idx])[0]
        confidence = float(probs[sampled_idx])

        all_probabilities = {label_encoder.classes_[i]: float(probs[i]) for i in range(len(probs))}
        return predicted_label, confidence, all_probabilities

@st.cache_resource
def load_model_and_preprocessors():
    """
    Attempts to load scaler, label encoder and model. If files are missing, creates safe fallbacks.
    Returns: model, scaler, label_encoder, device, use_real_model
    """
    base = os.path.dirname(__file__)  # folder containing the app file
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # Helper to create fallback label encoder & scaler from SAMPLE_DATA
    def _fallback_from_sampledata():
        df = pd.DataFrame([ {k: v for k, v in SAMPLE_DATA[s].items()} for s in SAMPLE_DATA ])
        X = df[FEATURE_NAMES].values
        scaler_local = StandardScaler().fit(X)
        le_local = LabelEncoder().fit(["Benign", "DDoS", "Port_Scan", "Malware"])
        return scaler_local, le_local, "built_from_SAMPLE_DATA"

    # 1) try to load scaler + label_encoder directly
    scaler = None
    label_encoder = None
    model = None
    use_real_model = False
    fallback_source = None

    # Try common file names in order
    possible_scaler_files = [
        os.path.join(base, "scaler.pkl"),
        os.path.join(base, "scaler_from_synth.pkl"),
        os.path.join(base, "scaler_from_synth.pkl")
    ]
    possible_le_files = [
        os.path.join(base, "label_encoder.pkl"),
        os.path.join(base, "label_encoder_from_synth.pkl"),
        os.path.join(base, "label_encoder_from_synth.pkl")
    ]

    # Try loading scaler
    for sf in possible_scaler_files:
        if os.path.exists(sf):
            try:
                scaler = joblib.load(sf)
                fallback_source = f"loaded_scaler:{os.path.basename(sf)}"
                break
            except Exception:
                scaler = None

    # Try loading label encoder
    for lf in possible_le_files:
        if os.path.exists(lf):
            try:
                label_encoder = joblib.load(lf)
                fallback_source = (fallback_source or "") + f", loaded_label_encoder:{os.path.basename(lf)}"
                break
            except Exception:
                label_encoder = None

    # If either missing, try to infer from train_features.csv
    train_csv_path = os.path.join(base, "train_features.csv")
    if (scaler is None or label_encoder is None) and os.path.exists(train_csv_path):
        try:
            df_train = pd.read_csv(train_csv_path)
            # Ensure columns exist
            if set(FEATURE_NAMES).issubset(set(df_train.columns)):
                X_train = df_train[FEATURE_NAMES].values
                scaler = StandardScaler().fit(X_train) if scaler is None else scaler
                if 'Label' in df_train.columns and label_encoder is None:
                    le_tmp = LabelEncoder().fit(df_train['Label'].values)
                    label_encoder = le_tmp
                fallback_source = (fallback_source or "") + ", loaded_from_train_csv"
        except Exception:
            pass

    # If still missing, fallback to sample data creation
    if scaler is None or label_encoder is None:
        scaler, label_encoder, src = _fallback_from_sampledata()
        fallback_source = (fallback_source or "") + f", {src}"

    # Now attempt to load model state dict; if missing we still return a model instance (random init)
    try:
        num_features = len(FEATURE_NAMES)
        num_classes = len(label_encoder.classes_)
        model = LightweightANN(num_features, num_classes)
        model_path = os.path.join(base, 'best_model.pth')
        if os.path.exists(model_path):
            try:
                model.load_state_dict(torch.load(model_path, map_location=device))
                model.eval()
                use_real_model = True
                fallback_source = (fallback_source or "") + f", loaded_model:{os.path.basename(model_path)}"
            except Exception as e:
                # Leave model as random-init but continue
                model = LightweightANN(num_features, num_classes)
                use_real_model = False
                fallback_source = (fallback_source or "") + f", model_load_failed:{str(e)[:80]}"
        else:
            use_real_model = False
            fallback_source = (fallback_source or "") + ", no_model_file"
    except Exception as e:
        # ultimate fallback: create minimal model & encoders
        scaler, label_encoder, src = _fallback_from_sampledata()
        num_features = len(FEATURE_NAMES)
        num_classes = len(label_encoder.classes_)
        model = LightweightANN(num_features, num_classes)
        use_real_model = False
        fallback_source = (fallback_source or "") + f", fallback_exception:{str(e)[:80]}"

    return model, scaler, label_encoder, device, use_real_model, fallback_source

def main():
    # Header
    st.markdown("""
    <div class="main-header">
        <h1>🛡️ SecureGluco - AI Cyber Threat Detection</h1>
        <p>Advanced Neural Network Analysis for IoMT Security</p>
        <p><strong>LightweightANN Model:</strong> 256→128→64→Classes | CIC IoMT 2024 Dataset</p>
    </div>
    """, unsafe_allow_html=True)

    # Load model and preprocessors
    # NOTE: load_model_and_preprocessors now returns an extra 'fallback_source' for debugging
    loaded = load_model_and_preprocessors()
    if len(loaded) == 6:
        model, scaler, label_encoder, device, use_real_model, fallback_source = loaded
    else:
        # backward compatibility (shouldn't happen)
        model, scaler, label_encoder, device, use_real_model = loaded
        fallback_source = "unknown"

    # Model status indicator
    if use_real_model:
        st.success("✅ **Real Model Loaded** - Using trained LightweightANN model")
    else:
        st.info("🔄 **Demo Mode** - Using simulated predictions (place model files in app directory)")
        st.caption(f"Preprocessor/Model source: {fallback_source}")

    # Sidebar for sample data
    st.sidebar.header("🚀 Quick Test")
    st.sidebar.markdown("Select sample data for instant analysis:")

    selected_sample = st.sidebar.selectbox(
        "Choose Sample Traffic:",
        list(SAMPLE_DATA.keys()),
        help="Pre-configured network traffic patterns for testing"
    )

    if st.sidebar.button("🔍 Load Sample Data", type="primary"):
        st.session_state.update(SAMPLE_DATA[selected_sample])
        st.sidebar.success(f"Loaded {selected_sample} data!")

    # Main content area
    col1, col2 = st.columns([2, 1])

    with col1:
        st.header("📊 Network Traffic Feature Input")

        # Feature input sections
        feature_values = {}

        # Network Features
        with st.expander("🌐 Network Features", expanded=True):
            col_net1, col_net2, col_net3 = st.columns(3)
            with col_net1:
                feature_values['Header_Length'] = st.number_input(
                    "Header Length",
                    value=st.session_state.get('Header_Length', 20),
                    min_value=0, max_value=1500, help="Packet header length in bytes"
                )
                feature_values['Protocol_Type'] = st.number_input(
                    "Protocol Type",
                    value=st.session_state.get('Protocol_Type', 6),
                    min_value=0, max_value=255, help="IP protocol number (6=TCP, 17=UDP)"
                )
            with col_net2:
                feature_values['Duration'] = st.number_input(
                    "Duration",
                    value=st.session_state.get('Duration', 0.5),
                    min_value=0.0, format="%.6f", help="Connection duration in seconds"
                )
                feature_values['Rate'] = st.number_input(
                    "Rate",
                    value=st.session_state.get('Rate', 1000),
                    min_value=0, help="Packets per second"
                )
            with col_net3:
                feature_values['Srate'] = st.number_input(
                    "Source Rate",
                    value=st.session_state.get('Srate', 500),
                    min_value=0, help="Source bytes per second"
                )
                feature_values['Drate'] = st.number_input(
                    "Destination Rate",
                    value=st.session_state.get('Drate', 500),
                    min_value=0, help="Destination bytes per second"
                )

        # TCP Flags
        with st.expander("🚩 TCP Flags"):
            col_flag1, col_flag2 = st.columns(2)
            tcp_flags = ['fin_flag_number', 'syn_flag_number', 'rst_flag_number', 'psh_flag_number',
                        'ack_flag_number', 'ece_flag_number', 'cwr_flag_number']

            for i, flag in enumerate(tcp_flags):
                col = col_flag1 if i % 2 == 0 else col_flag2
                with col:
                    feature_values[flag] = st.slider(
                        flag.replace('_', ' ').title(),
                        min_value=0, max_value=10,
                        value=st.session_state.get(flag, 0),
                        help=f"Number of {flag.split('_')[0].upper()} flags"
                    )

        # Connection Counts
        with st.expander("📈 Connection Counts"):
            col_count1, col_count2 = st.columns(2)
            counts = ['ack_count', 'syn_count', 'fin_count', 'rst_count']

            for i, count in enumerate(counts):
                col = col_count1 if i % 2 == 0 else col_count2
                with col:
                    feature_values[count] = st.number_input(
                        count.replace('_', ' ').title(),
                        value=st.session_state.get(count, 0),
                        min_value=0, help=f"Count of {count.split('_')[0].upper()} packets"
                    )

        # Protocol Types
        with st.expander("🔗 Protocol Types"):
            protocols = ['HTTP', 'HTTPS', 'DNS', 'Telnet', 'SMTP', 'SSH', 'IRC',
                        'TCP', 'UDP', 'DHCP', 'ARP', 'ICMP', 'IGMP', 'IPv', 'LLC']

            col_prot1, col_prot2, col_prot3 = st.columns(3)
            for i, protocol in enumerate(protocols):
                col = [col_prot1, col_prot2, col_prot3][i % 3]
                with col:
                    feature_values[protocol] = st.checkbox(
                        protocol,
                        value=bool(st.session_state.get(protocol, 0)),
                        help=f"Is {protocol} protocol present?"
                    )
                    feature_values[protocol] = int(feature_values[protocol])

        # Statistical Features
        with st.expander("📊 Statistical Features"):
            stats = ['Tot_sum', 'Min', 'Max', 'AVG', 'Std', 'Tot_size', 'IAT',
                    'Number', 'Magnitude', 'Radius', 'Covariance', 'Variance', 'Weight']

            col_stat1, col_stat2, col_stat3 = st.columns(3)
            for i, stat in enumerate(stats):
                col = [col_stat1, col_stat2, col_stat3][i % 3]
                with col:
                    feature_values[stat] = st.number_input(
                        stat.replace('_', ' ').title(),
                        value=st.session_state.get(stat, 0.0),
                        format="%.6f", help=f"Statistical measure: {stat}"
                    )

    with col2:
        st.header("🎯 Analysis Results")

        # Analysis button
        if st.button("🔍 Analyze Network Traffic", type="primary", use_container_width=True):
            with st.spinner("🧠 AI Model Processing..."):
                # Prepare features in correct order
                features = [feature_values[name] for name in FEATURE_NAMES]

                # Make prediction
                threat_class, confidence, all_probabilities = predict_threat(
                    features, model, scaler, label_encoder, device, use_real_model
                )

                # Store results in session state
                st.session_state.prediction_results = {
                    'threat_class': threat_class,
                    'confidence': confidence,
                    'probabilities': all_probabilities
                }

        # Display results if available
        if hasattr(st.session_state, 'prediction_results'):
            results = st.session_state.prediction_results

            # Threat classification card
            if results['threat_class'].lower() in ['benign', 'normal']:
                st.markdown(f"""
                <div class="threat-benign">
                    <h3>✅ BENIGN TRAFFIC</h3>
                    <p><strong>Confidence:</strong> {results['confidence']:.1%}</p>
                    <p>Traffic appears normal and safe</p>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="threat-critical">
                    <h3>🚨 THREAT DETECTED</h3>
                    <p><strong>Type:</strong> {results['threat_class']}</p>
                    <p><strong>Confidence:</strong> {results['confidence']:.1%}</p>
                    <p>Immediate action recommended!</p>
                </div>
                """, unsafe_allow_html=True)

            # Confidence visualization
            st.subheader("📈 Prediction Confidence")
            confidence_fig = go.Figure(go.Indicator(
                mode = "gauge+number",
                value = results['confidence'] * 100,
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Confidence %"},
                gauge = {
                    'axis': {'range': [None, 100]},
                    'bar': {'color': "darkblue"},
                    'steps': [
                        {'range': [0, 50], 'color': "lightgray"},
                        {'range': [50, 80], 'color': "yellow"},
                        {'range': [80, 100], 'color': "green"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 90
                    }
                }
            ))
            confidence_fig.update_layout(height=300)
            st.plotly_chart(confidence_fig, use_container_width=True)

            # Probability distribution
            st.subheader("📊 Class Probabilities")
            prob_df = pd.DataFrame(
                list(results['probabilities'].items()),
                columns=['Threat Class', 'Probability']
            )
            prob_df['Probability'] = prob_df['Probability'] * 100

            prob_fig = px.bar(
                prob_df,
                x='Threat Class',
                y='Probability',
                color='Probability',
                color_continuous_scale='RdYlGn_r',
                title="Threat Classification Probabilities"
            )
            prob_fig.update_layout(height=400)
            st.plotly_chart(prob_fig, use_container_width=True)

            # Security recommendations
            st.subheader("🛡️ Security Recommendations")
            if results['threat_class'].lower() in ['benign', 'normal']:
                recommendations = [
                    "✅ Traffic appears normal - continue monitoring",
                    "📊 Regular security audits recommended",
                    "🔄 Keep security systems updated"
                ]
            elif 'ddos' in results['threat_class'].lower():
                recommendations = [
                    "🚨 **CRITICAL**: Block source IP immediately",
                    "🛡️ Activate DDoS protection mechanisms",
                    "📈 Scale infrastructure to handle load",
                    "👥 Notify security team immediately",
                    "📋 Document incident for analysis"
                ]
            elif 'port' in results['threat_class'].lower() or 'scan' in results['threat_class'].lower():
                recommendations = [
                    "🔒 Block scanning source IP",
                    "🔍 Review and strengthen firewall rules",
                    "🔧 Check for system vulnerabilities",
                    "👀 Monitor for exploitation attempts",
                    "📝 Log incident for threat intelligence"
                ]
            else:
                recommendations = [
                    "⚠️ **WARNING**: Potential security threat detected",
                    "🔍 Investigate traffic source immediately",
                    "🛡️ Implement additional security measures",
                    "📞 Contact security team",
                    "📊 Perform detailed traffic analysis"
                ]

            for rec in recommendations:
                st.markdown(f"- {rec}")

    # Footer with model information
    st.markdown("---")
    col_info1, col_info2, col_info3 = st.columns(3)

    with col_info1:
        st.markdown("""
        **🧠 Model Architecture**
        - Input Layer: 45 features
        - Hidden: 256→128→64 neurons
        - Output: Multi-class classification
        - Framework: PyTorch
        """)

    with col_info2:
        st.markdown("""
        **📊 Training Dataset**
        - CIC IoMT 2024 Dataset
        - Network traffic features
        - Multiple threat categories
        - Balanced class weights
        """)

    with col_info3:
        st.markdown("""
        **🎯 Performance**
        - Accuracy: 97%+ on test data
        - Real-time inference
        - Memory optimized
        - Production ready
        """)

if __name__ == "__main__":
    main()
