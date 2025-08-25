# QScope Deployment Checklist

## ✅ Pre-deployment Setup
- [ ] Code committed and pushed to GitHub
- [ ] All placeholder URLs updated in environment files
- [ ] Frontend builds successfully locally (`npm run build`)
- [ ] Backend dependencies install without errors
- [ ] Run `python deploy_prepare.py` to validate setup

## 🎯 Step 1: Deploy Backend to Render

### Create Service
- [ ] Go to [Render Dashboard](https://dashboard.render.com)
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Name: `qscope-backend`
- [ ] Branch: `main`
- [ ] Root Directory: `qscope-backend`
- [ ] Runtime: `Python 3`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `gunicorn --config gunicorn.conf.py app:app`

### Environment Variables
Add these in Render dashboard:
- [ ] `FLASK_ENV=production`
- [ ] `DEBUG=False`
- [ ] `SECRET_KEY=` (generate secure 32+ character string)
- [ ] `CORS_ORIGINS=http://localhost:5173` (temporary, will update)
- [ ] `MAX_QUBITS=8`
- [ ] `MAX_GATES_PER_CIRCUIT=50`
- [ ] `SIMULATION_TIMEOUT=15`
- [ ] `DEFAULT_DIFFICULTY_LEVEL=beginner`
- [ ] `ENABLE_DETAILED_EXPLANATIONS=True`

### Verify Backend
- [ ] Deployment completes successfully
- [ ] Health check works: `https://your-service.onrender.com/health`
- [ ] Note your backend URL for next step

## 🎯 Step 2: Deploy Frontend to Netlify

### Create Site
- [ ] Go to [Netlify Dashboard](https://app.netlify.com)
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Connect your GitHub repository
- [ ] Base directory: `/` (root)
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`

### Environment Variables
Add this in Netlify dashboard:
- [ ] `VITE_BACKEND_URL=https://your-render-service.onrender.com`

### Verify Frontend
- [ ] Deployment completes successfully
- [ ] Site loads correctly
- [ ] Note your Netlify URL

## 🔄 Step 3: Connect Frontend & Backend

### Update CORS Configuration
- [ ] Go back to Render dashboard
- [ ] Update `CORS_ORIGINS` environment variable:
  ```
  CORS_ORIGINS=https://your-netlify-app.netlify.app
  ```
- [ ] Render will automatically redeploy

### Test Integration
- [ ] Frontend loads without errors
- [ ] Backend status shows "Connected ✅"
- [ ] Educational content appears when adding gates
- [ ] Quantum simulations work
- [ ] Matrices display properly
- [ ] Terminology section loads

## 🎯 Step 4: Optional Enhancements

### Custom Domain (Netlify)
- [ ] Add custom domain in Netlify settings
- [ ] Configure DNS records
- [ ] Update `CORS_ORIGINS` in Render to include custom domain

### Performance Monitoring
- [ ] Set up uptime monitoring for backend
- [ ] Monitor Netlify build times
- [ ] Check Core Web Vitals

## 🐛 Troubleshooting

### Common Issues & Solutions

**CORS Errors**
- [ ] Verify `CORS_ORIGINS` in Render matches Netlify URL exactly
- [ ] Check for typos in environment variables
- [ ] Ensure no trailing slashes in URLs

**Backend Not Responding**
- [ ] Check Render service logs
- [ ] Verify all environment variables are set
- [ ] Test health endpoint directly

**Frontend Build Fails**
- [ ] Check Node.js version (should be 18+)
- [ ] Verify `VITE_BACKEND_URL` is set correctly
- [ ] Check Netlify build logs for errors

**Educational Content Not Loading**
- [ ] Open browser developer tools → Console
- [ ] Check for API errors
- [ ] Verify backend health endpoint
- [ ] Test backend endpoints directly

### Health Check URLs
- Backend: `https://your-backend.onrender.com/health`
- Frontend: `https://your-frontend.netlify.app`

## 🎉 Success Criteria

Your deployment is successful when:
- [ ] Both services are live and accessible
- [ ] Educational panel shows content when circuits are built
- [ ] Quantum simulations execute without errors
- [ ] Density matrices display correctly with proper formatting
- [ ] Terminology section loads with quantum symbols
- [ ] No CORS errors in browser console
- [ ] Backend health check returns success
- [ ] Page loads in under 3 seconds

## 📝 Post-Deployment Notes

**Save These URLs:**
- Frontend: `https://your-app.netlify.app`
- Backend: `https://your-backend.onrender.com`
- Repository: `https://github.com/your-username/qscope-project-1`

**Free Tier Limitations:**
- Render: Services sleep after 15 minutes of inactivity
- Netlify: 100GB bandwidth/month, 300 build minutes/month

**Security:**
- [ ] Rotate SECRET_KEY if exposed
- [ ] Monitor for unusual traffic
- [ ] Keep dependencies updated

🚀 **Congratulations! Your quantum simulator is now live!** 🚀