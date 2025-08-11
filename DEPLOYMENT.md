# Deployment Guide

This document outlines the deployment setup for DevPal using Vercel and GitHub Actions.

## Prerequisites

1. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **GitHub Repository**: Push your code to a GitHub repository

## Setup Instructions

### 1. Create Vercel Project

```bash
# Login to Vercel
vercel login

# Link your project
vercel link
```

### 2. Get Required Secrets

Get these values from Vercel:
- **VERCEL_TOKEN**: From [Vercel Account Tokens](https://vercel.com/account/tokens)
- **VERCEL_ORG_ID**: From your project settings or `.vercel/project.json`
- **VERCEL_PROJECT_ID**: From your project settings or `.vercel/project.json`

### 3. Configure GitHub Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, then add:

- `VERCEL_TOKEN`: Your Vercel token
- `VERCEL_ORG_ID`: Your organization ID
- `VERCEL_PROJECT_ID`: Your project ID

### 4. Environment Setup

Create GitHub environment protection rules:
1. Go to Settings > Environments
2. Create `production` environment
3. Create `preview` environment
4. Configure branch protection rules as needed

## Deployment Workflows

### Production Deployment
- **Trigger**: Push to `main` branch or manual dispatch
- **Environment**: `production`
- **URL**: Your production Vercel domain
- **Workflow**: `.github/workflows/deploy-production.yml`

### Preview Deployment
- **Trigger**: Pull requests to `main` or pushes to `development`
- **Environment**: `preview`
- **URL**: Auto-generated preview URLs
- **Workflow**: `.github/workflows/deploy-preview.yml`
- **Features**: Automatic PR comments with preview links

## Workflow Features

Both workflows include:
- ✅ Dependency installation with caching
- ✅ TypeScript type checking
- ✅ ESLint code linting
- ✅ Test execution
- ✅ Build verification
- ✅ Automatic deployment to Vercel

Preview deployments additionally:
- 💬 Comment on PRs with preview URLs
- 🔗 Generate unique preview URLs for each branch/PR

## Manual Deployment

You can trigger deployments manually:
1. Go to Actions tab in your GitHub repository
2. Select the workflow you want to run
3. Click "Run workflow"

## Troubleshooting

### Common Issues
1. **Missing secrets**: Ensure all required secrets are configured in GitHub
2. **Build failures**: Check that all tests pass locally first
3. **Vercel connection**: Verify your tokens and IDs are correct

### Getting Help
- Check GitHub Actions logs for detailed error information
- Verify Vercel project settings match your configuration
- Ensure your project builds successfully with `npm run build`