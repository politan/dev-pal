# GitHub Actions Workflows

This directory contains automated workflows for the DevPal project.

## Available Workflows

### CI - Build and Test (`ci.yml`)

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

**Requirements:**
- All steps must pass for the workflow to succeed
- Runs on Ubuntu latest with Node.js 20.x

## Usage

The CI workflow runs automatically on every push to any branch. You can view the results in the GitHub Actions tab of the repository.

The workflow ensures code quality by:
1. Verifying linting standards
2. Checking TypeScript types
3. Running the full test suite (79+ tests)
4. Confirming the project builds successfully