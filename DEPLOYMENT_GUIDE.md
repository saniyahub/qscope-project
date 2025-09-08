# QScope Quantum Visualizer - Deployment Guide

This guide provides step-by-step instructions for deploying the QScope Quantum Visualizer to Netlify (frontend) and Render (backend).

## Prerequisites

1. Git repository with the QScope project
2. Netlify account (for frontend deployment)
3. Render account (for backend deployment)
4. OpenRouter API key (for QChat functionality)

## Deployment Overview

The QScope application consists of two components:
- **Frontend**: React application deployed to Netlify
- **Backend**: Flask API deployed to Render

## Frontend Deployment (Netlify)

### 1. Connect Repository to Netlify

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your QScope repository
5. Configure the deployment settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: Leave empty

### 2. Set Environment Variables

In Netlify dashboard:
1. Go to your site settings
2. Navigate to "Environment variables"
3. Add the following variable:
   ```
   VITE_BACKEND_URL = https://your-render-app-name.onrender.com
   ```

### 3. Deploy

Netlify will automatically build and deploy your site. The first build may take a few minutes.

## Backend Deployment (Render)

### 1. Connect Repository to Render

1. Go to [Render](https://render.com) and sign in
2. Click "New Web Service"
3. Connect your Git provider
4. Select your QScope repository
5. Configure the service:
   - **Name**: qscope-backend (or your preferred name)
   - **Runtime**: Python 3
   - **Build command**: 
     ```
     cd qscope-backend && pip install --upgrade pip && pip install -r requirements.txt
     ```
   - **Start command**: 
     ```
     cd qscope-backend && gunicorn --bind 0.0.0.0:$PORT run:app
     ```
   - **Plan**: Free (or select your preferred plan)

### 2. Set Environment Variables

In Render dashboard:
1. Go to your web service settings
2. Navigate to "Environment variables"
3. Add the following variables:
   ```
   FLASK_ENV = production
   DEBUG = False
   SECRET_KEY = your-super-secret-key-here
   CORS_ORIGINS = https://your-netlify-app.netlify.app
   OPENROUTER_API_KEY = your-openrouter-api-key-here
   ```

### 3. Deploy

Render will automatically build and deploy your backend service. The first build may take a few minutes.

## Configuration After Deployment

### 1. Update Netlify Environment Variable

Once your Render backend is deployed:
1. Get your Render app URL (e.g., https://qscope-backend.onrender.com)
2. Update the `VITE_BACKEND_URL` environment variable in Netlify with this URL
3. Trigger a new build in Netlify

### 2. Update Render Environment Variable

Once your Netlify frontend is deployed:
1. Get your Netlify app URL (e.g., https://qscope-quantum.netlify.app)
2. Update the `CORS_ORIGINS` environment variable in Render with this URL
3. Restart your Render service

## Environment Variables Summary

### Frontend (Netlify)
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_BACKEND_URL` | Backend API URL | https://qscope-backend.onrender.com |

### Backend (Render)
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `FLASK_ENV` | Flask environment | production |
| `DEBUG` | Debug mode | False |
| `SECRET_KEY` | Flask secret key | your-super-secret-key |
| `CORS_ORIGINS` | Allowed origins | https://your-netlify-app.netlify.app |
| `OPENROUTER_API_KEY` | OpenRouter API key | sk-or-v1-... |
| `MAX_QUBITS` | Max qubits allowed | 8 |
| `MAX_GATES_PER_CIRCUIT` | Max gates per circuit | 50 |
| `SIMULATION_TIMEOUT` | Simulation timeout (seconds) | 15 |
| `QCHAT_MAX_RETRIES` | QChat max retries | 5 |
| `QCHAT_TIMEOUT` | QChat timeout (seconds) | 60 |
| `QCHAT_CIRCUIT_BREAKER_THRESHOLD` | Circuit breaker threshold | 3 |
| `QCHAT_CIRCUIT_BREAKER_TIMEOUT` | Circuit breaker timeout (seconds) | 60 |

## Troubleshooting

### Frontend Issues

1. **Blank page after deployment**:
   - Check browser console for errors
   - Verify `VITE_BACKEND_URL` is correctly set
   - Ensure CORS is properly configured on backend

2. **API connection errors**:
   - Verify backend URL is accessible
   - Check CORS configuration
   - Ensure backend is running

### Backend Issues

1. **Application fails to start**:
   - Check build logs in Render dashboard
   - Verify all required environment variables are set
   - Ensure requirements.txt is up to date

2. **CORS errors**:
   - Verify `CORS_ORIGINS` includes your frontend URL
   - Check that the URL doesn't have trailing slashes

3. **QChat not working**:
   - Verify `OPENROUTER_API_KEY` is correctly set
   - Check OpenRouter API status

## Monitoring and Maintenance

### Health Checks

Both frontend and backend have health check endpoints:
- Frontend: Visit your deployed site URL
- Backend: Visit `https://your-render-app-name.onrender.com/health`

### Performance Monitoring

- Monitor Render logs for backend errors
- Check Netlify analytics for frontend performance
- Set up alerts for downtime

### Updates

To update your deployment:
1. Push changes to your Git repository
2. Netlify and Render will automatically redeploy
3. For environment variable changes, manually redeploy the affected service

## Scaling Considerations

### Free Tier Limitations

- **Netlify**: 100GB bandwidth/month, 300 build minutes/month
- **Render**: 512MB RAM, 100GB bandwidth/month

### Production Considerations

For production deployment, consider:
- Upgrading to paid plans for better performance
- Adding a custom domain
- Setting up SSL certificates
- Implementing monitoring and alerting
- Adding a CDN for better global performance

## Support

For issues with deployment:
1. Check the documentation and this guide
2. Review deployment logs
3. Contact support for your deployment platform
4. File issues in the project repository

## Security Notes

- Never commit secrets to your repository
- Use environment variables for sensitive data
- Regularly rotate API keys
- Keep dependencies updated