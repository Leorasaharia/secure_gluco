# Deployment Guide for SecureGluco API Bridge

## 🚀 **Deployment Options**

### **Option 1: Heroku (Free Tier Available)**

#### **Step 1: Prepare for Heroku**
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login
```

#### **Step 2: Create Heroku App**
```bash
cd api_bridge
heroku create securgluco-api-bridge
```

#### **Step 3: Deploy**
```bash
git add .
git commit -m "Deploy API bridge"
git push heroku main
```

#### **Step 4: Update Frontend URL**
Update your React app to use the deployed URL:
```typescript
// In src/utils/streamlitAPI.ts
private baseUrl = 'https://securgluco-api-bridge.herokuapp.com/api';
```

---

### **Option 2: Railway (Modern Alternative)**

#### **Step 1: Create Railway Project**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### **Step 2: Configure Environment**
- Add your GitHub repo
- Set build command: `pip install -r requirements.txt`
- Set start command: `python app.py`

---

### **Option 3: Vercel (Serverless)**

#### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

#### **Step 2: Create vercel.json**
```json
{
  "functions": {
    "api_bridge/app.py": {
      "runtime": "@vercel/python"
    }
  },
  "routes": [
    { "src": "/api/(.*)", "dest": "/api_bridge/app.py" }
  ]
}
```

#### **Step 3: Deploy**
```bash
vercel --prod
```

---

### **Option 4: Google Cloud Run**

#### **Step 1: Create Dockerfile**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8080

CMD ["python", "app.py"]
```

#### **Step 2: Deploy**
```bash
gcloud run deploy securgluco-api --source .
```

---

### **Option 5: DigitalOcean App Platform**

#### **Step 1: Create App Spec**
```yaml
name: securgluco-api
services:
- name: api-bridge
  source_dir: /api_bridge
  github:
    repo: Prayash007/secure_gluco
    branch: main
  run_command: python app.py
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
```

---

## 🔧 **Configuration for Deployment**

### **Environment Variables**
Create a `.env` file for different environments:

```bash
# Production
API_BASE_URL=https://your-deployed-api.com/api
STREAMLIT_URL=https://your-streamlit-app.com
REACT_URL=https://your-react-app.com

# Development
API_BASE_URL=http://localhost:5000/api
STREAMLIT_URL=http://localhost:8501
REACT_URL=http://localhost:5173
```

### **CORS Configuration**
Update CORS for production:

```python
# In app.py
from flask_cors import CORS

app = Flask(__name__)

# Production CORS settings
if os.environ.get('FLASK_ENV') == 'production':
    CORS(app, origins=[
        "https://your-react-app.com",
        "https://your-streamlit-app.com"
    ])
else:
    CORS(app)  # Allow all origins in development
```

---

## 📦 **Repository Structure Recommendation**

### **Keep Everything in One Repo:**
```
secure_gluco/
├── api_bridge/              # Flask API server
│   ├── app.py
│   ├── requirements.txt
│   ├── Procfile            # Heroku
│   └── Dockerfile          # Docker/Cloud Run
├── streamlit_app/          # Streamlit app
├── src/                    # React frontend
├── deployment/
│   ├── heroku.yml
│   ├── railway.json
│   └── vercel.json
└── README.md
```

### **Separate Deployment Commands:**
```bash
# Deploy API Bridge
git subtree push --prefix=api_bridge heroku main

# Deploy Streamlit App
streamlit deploy streamlit_app/cyber_threat_detection_app.py

# Deploy React Frontend
vercel --prod
```

---

## 🎯 **Recommended Approach**

### **For Development/Testing:**
- **Heroku** (free tier, easy setup)
- **Railway** (modern, developer-friendly)

### **For Production:**
- **Google Cloud Run** (pay-per-use, scalable)
- **DigitalOcean App Platform** (predictable pricing)

### **For High Traffic:**
- **AWS Lambda + API Gateway** (serverless)
- **Google Cloud Functions** (serverless)

---

## 🔄 **Update Frontend URLs**

After deployment, update these files:

### **React Frontend:**
```typescript
// src/utils/streamlitAPI.ts
private baseUrl = 'https://your-api-bridge.herokuapp.com/api';
```

### **Streamlit App:**
```python
# streamlit_app/cyber_threat_detection_app.py
API_BRIDGE_URL = "https://your-api-bridge.herokuapp.com"
```

---

## 🚀 **Quick Start with Heroku**

1. **Create Heroku account**: https://heroku.com
2. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli
3. **Deploy with one command**:
   ```bash
   cd api_bridge
   heroku create your-app-name
   git init
   git add .
   git commit -m "Initial deploy"
   heroku git:remote -a your-app-name
   git push heroku main
   ```

The API bridge will be available at: `https://your-app-name.herokuapp.com`