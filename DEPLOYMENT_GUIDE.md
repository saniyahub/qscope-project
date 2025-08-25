# 🚀 QScope Quantum Visualizer - Deployment Guide

## Netlify + Render Deployment Strategy

This guide walks you through deploying your quantum simulator using:
- **Netlify**: Frontend hosting (React/Vite app)
- **Render**: Backend hosting (Flask/Python API)

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Render Account**: Sign up at [render.com](https://render.com)

## 🎯 Step 1: Deploy Backend to Render

### 1.1 Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `qscope-backend`
   - **Branch**: `main`
   - **Root Directory**: `qscope-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --config gunicorn.conf.py app:app`

### 1.2 Environment Variables
Add these environment variables in Render:

```bash
FLASK_ENV=production
DEBUG=False
SECRET_KEY=your-super-secret-production-key-change-this-12345
CORS_ORIGINS=https://your-netlify-app.netlify.app
MAX_QUBITS=8
MAX_GATES_PER_CIRCUIT=50
SIMULATION_TIMEOUT=15
DEFAULT_DIFFICULTY_LEVEL=beginner
ENABLE_DETAILED_EXPLANATIONS=True
```

### 1.3 Important Notes
- **SECRET_KEY**: Generate a secure random string (32+ characters)
- **CORS_ORIGINS**: Will be updated after Netlify deployment
- **Free Tier**: Render free tier spins down after 15 minutes of inactivity

### 1.4 Expected Result
Your backend will be available at: `https://your-service-name.onrender.com`

## 🎯 Step 2: Deploy Frontend to Netlify

### 2.1 Create New Site
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: `/` (root)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 2.2 Environment Variables
Add this environment variable in Netlify:

```bash
VITE_BACKEND_URL=https://your-render-service.onrender.com
```

Replace `your-render-service` with your actual Render service name.

### 2.3 Build & Deploy
Netlify will automatically build and deploy your app.

## 🔄 Step 3: Update CORS Configuration

### 3.1 Get Your Netlify URL
After deployment, note your Netlify URL (e.g., `https://amazing-app-123456.netlify.app`)

### 3.2 Update Render Environment Variables
Go back to Render and update the `CORS_ORIGINS` variable:

```bash
CORS_ORIGINS=https://amazing-app-123456.netlify.app,https://your-custom-domain.com
```

### 3.3 Redeploy Backend
Render will automatically redeploy when you change environment variables.

## 🎯 Step 4: Custom Domain (Optional)

### 4.1 Netlify Custom Domain
1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Add your domain and configure DNS

### 4.2 Update CORS Again
Update the `CORS_ORIGINS` in Render to include your custom domain.

## 🔧 Configuration Files Overview

### `netlify.toml`
- Configures Netlify build and routing
- Sets security headers
- Handles SPA routing redirects

### `render.yaml`
- Defines Render service configuration
- Specifies build and start commands
- Sets environment variables

### `.env.production`
- Contains production environment variables
- Must be configured with actual URLs

### `gunicorn.conf.py`
- Production WSGI server configuration
- Optimized for Render's infrastructure

## 🚀 Deployment Commands

### Frontend (Local Testing)
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend (Local Testing)
```bash
# Install production dependencies
pip install -r requirements.txt

# Run with gunicorn (production-like)
cd qscope-backend
gunicorn --config gunicorn.conf.py app:app
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGINS` environment variable in Render
   - Ensure it matches your Netlify URL exactly

2. **Backend Not Responding**
   - Check Render service logs
   - Verify environment variables
   - Ensure `gunicorn` is installed

3. **Frontend Build Fails**
   - Check Node.js version (should be 18+)
   - Verify `VITE_BACKEND_URL` environment variable

4. **Educational Content Not Loading**
   - Check browser console for API errors
   - Verify backend health endpoint: `https://your-backend.onrender.com/health`

### Health Check URLs

- **Backend Health**: `https://your-backend.onrender.com/health`
- **Frontend**: `https://your-frontend.netlify.app`

## 💰 Cost Considerations

### Netlify (Free Tier)
- 100GB bandwidth/month
- Unlimited personal projects
- 300 build minutes/month

### Render (Free Tier)
- 750 hours/month (enough for 1 service)
- 512MB RAM, 0.1 CPU
- Services spin down after 15 minutes of inactivity

### Recommendations
- Start with free tiers
- Monitor usage and upgrade as needed
- Consider upgrading Render for better performance

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use strong, unique SECRET_KEY
   - Rotate keys regularly

2. **CORS Configuration**
   - Only allow trusted domains
   - Avoid wildcard origins in production

3. **API Rate Limiting**
   - Consider implementing rate limiting
   - Monitor for abuse

## 📈 Monitoring & Maintenance

### Render Monitoring
- Check service logs regularly
- Monitor response times
- Set up health check alerts

### Netlify Monitoring
- Monitor build success rate
- Check Core Web Vitals
- Review function usage

## 🎉 Success Checklist

- [ ] Backend deployed and responding at `/health`
- [ ] Frontend built and deployed successfully
- [ ] CORS configured correctly
- [ ] Educational content loading
- [ ] Quantum simulations working
- [ ] Matrices displaying properly
- [ ] Custom domain configured (if applicable)

## 📞 Support

If you encounter issues:
1. Check service logs in Render/Netlify dashboards
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors

Your quantum simulator should now be live and accessible worldwide! 🌍