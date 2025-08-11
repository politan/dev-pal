# GitHub Actions Workflows

This directory contains automated workflows for the DevPal project with a **dependent pipeline architecture**.

## Workflow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CI Workflow   │───▶│ Deploy Preview   │    │ Deploy Production │
│  (All Branches) │    │  (Development)   │    │      (Main)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Preview Site   │    │ Production Site │
                       └─────────────────┘    └─────────────────┘
```

## Available Workflows

### 🧪 CI - Build and Test (`ci.yml`)

**Triggers:** Push to any branch (excluding pull requests)

**What it does:**
- 🔧 Sets up Node.js 20.x environment
- 📦 Installs dependencies with `npm ci`
- 🧹 Runs linting with `npm run lint`
- ✅ Runs type checking with `npm run type-check`
- 🧪 Executes all tests with `npm run test:run`
- 🏗️ Builds the project with `npm run build`
- 📤 Uploads build artifacts (optional, 7-day retention)
- 📊 Provides a summary of results

**Role:** Gate-keeper - All deployment workflows depend on this passing first.

### 🚀 Deploy to Production (`deploy-production.yml`)

**Triggers:** 
- ✅ After CI workflow **succeeds** on `main` branch
- 🔧 Manual dispatch (`workflow_dispatch`)

**Dependencies:** Requires CI workflow to pass first

**What it does:**
- ⏳ Waits for CI workflow completion
- ✅ Only runs if CI succeeded
- 🏗️ Rebuilds project for production
- 🚀 Deploys to Vercel production environment

### 🔍 Deploy Preview (`deploy-preview.yml`)

**Triggers:**
- ✅ After CI workflow **succeeds** on `development` branch
- 📋 Direct trigger on pull requests to `main` (includes CI steps)
- 🔧 Manual dispatch (`workflow_dispatch`)

**Dependencies:** 
- For `development` pushes: Requires CI workflow to pass first
- For pull requests: Runs independently (includes own CI steps)

**What it does:**
- ⏳ Waits for CI workflow completion (development branch only)
- ✅ Only runs if CI succeeded or is a PR
- 🧪 Runs build/test steps for PRs (since CI doesn't run on PRs)
- 🏗️ Builds project for preview
- 🔍 Deploys to Vercel preview environment
- 💬 Comments on PRs with preview URL

## Workflow Execution Matrix

| Event Type | Branch | CI Runs | Deploy Preview | Deploy Production |
|------------|--------|---------|----------------|-------------------|
| Push | `main` | ✅ | ❌ | ✅ (after CI) |
| Push | `development` | ✅ | ✅ (after CI) | ❌ |
| Push | `feature/*` | ✅ | ❌ | ❌ |
| Pull Request | `main` | ❌ | ✅ (with CI steps) | ❌ |
| Manual | Any | 🔧 | 🔧 | 🔧 |

## Benefits

### 🛡️ Quality Gate
- **No deployment without passing CI**: Ensures all code meets quality standards
- **Fail fast**: Issues caught early in the pipeline
- **Consistent testing**: Same test suite runs for all branches

### ⚡ Efficiency  
- **No duplicate work**: CI runs once, deployments reuse results
- **Faster deployments**: Skip redundant build/test steps
- **Resource optimization**: Reduce GitHub Actions minutes usage

### 🔒 Safety
- **Atomic deployments**: Deploy only after full validation
- **Branch protection**: Main branch deployments are always tested
- **Manual override**: Emergency deployments still possible

## Usage

1. **Development workflow**: Push to feature branch → CI runs → feedback
2. **Preview workflow**: Push to development → CI runs → Preview deploys  
3. **Production workflow**: Push to main → CI runs → Production deploys
4. **PR workflow**: Create PR → Preview deploys (with testing)