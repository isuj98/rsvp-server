# Deployment Guide - RSVP Server

This guide explains how to deploy the rsvp-server as a separate Vercel project.

## Prerequisites

- Vercel account
- MongoDB connection string
- Git repository access

## Deployment Steps

### Option 1: Deploy from Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Navigate to https://vercel.com/dashboard
   - Click "Add New Project"

2. **Import Repository**
   - Select your repository
   - **Important**: Set the **Root Directory** to `rsvp-server`
   - Or deploy from a monorepo and configure the root directory

3. **Configure Project**
   - Framework Preset: Other
   - Root Directory: `rsvp-server`
   - Build Command: (leave empty - no build needed)
   - Output Directory: (leave empty)

4. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add: `MONGODB_URI` = `mongodb+srv://justinejusi98_db_user:QMXbwUXOrYvXPHMo@rsvp.porkr0i.mongodb.net`
   - Apply to: Production, Preview, Development

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to rsvp-server directory**:
   ```bash
   cd rsvp-server
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   vercel
   ```

5. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   # Paste your MongoDB connection string when prompted
   ```

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## After Deployment

1. **Get Your Deployment URL**
   - Your API will be available at: `https://your-project-name.vercel.app`
   - API endpoints: `https://your-project-name.vercel.app/api/*`

2. **Update Frontend Configuration**
   - Update `utils/apiConfig.ts` in the frontend project
   - Set `VITE_API_URL` environment variable in frontend Vercel project
   - Or update the production URL in `apiConfig.ts`

3. **Test the API**
   - Visit: `https://your-project-name.vercel.app/api/health`
   - Should return: `{"status":"ok","database":"connected",...}`

## API Endpoints

Once deployed, your API will be available at:

- `https://your-project-name.vercel.app/api/submissions`
- `https://your-project-name.vercel.app/api/guestlist`
- `https://your-project-name.vercel.app/api/admin/login`
- `https://your-project-name.vercel.app/api/health`

## Troubleshooting

### Functions Not Found
- Ensure `api/` directory is in the root of `rsvp-server`
- Check that files have `.js` extension
- Verify `vercel.json` configuration

### MongoDB Connection Errors
- Verify `MONGODB_URI` environment variable is set correctly
- Check MongoDB network access (IP whitelist)
- Ensure MongoDB connection string includes database name

### CORS Errors
- All API functions include CORS headers
- If issues persist, check frontend API URL configuration

## Environment Variables

Required:
- `MONGODB_URI` - MongoDB connection string

Optional:
- `DB_NAME` - Database name (defaults to 'rsvp')

