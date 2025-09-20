# 🚀 Render Deployment Instructions

## Quick Deploy to Render

1. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**:
   - **Name**: `securgluco-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Root Directory**: `backend`

3. **Environment Variables**:
   ```
   FLASK_ENV=production
   ```

4. **Auto-Deploy**:
   - Enable auto-deploy from main branch
   - Service will rebuild on every push

## Alternative: Manual Deploy

If you prefer to deploy manually:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Test locally first
python app.py

# 4. Deploy to Render using their CLI or web interface
```

## Troubleshooting

- **Service won't start**: Check logs in Render dashboard
- **CORS errors**: Verify the origins in app.py match your frontend URL
- **API not responding**: Ensure gunicorn is in requirements.txt
- **Build failures**: Check Python version compatibility

## Expected URLs After Deployment

- **API Base**: `https://your-service-name.onrender.com`
- **Health Check**: `https://your-service-name.onrender.com/api/health`
- **Threat Analysis**: `https://your-service-name.onrender.com/api/threat-analysis`