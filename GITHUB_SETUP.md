# GitHub Repository Setup Instructions

## 🔄 Manual Git Setup (If Git locks exist)

If you encounter Git lock file issues, follow these steps:

### Step 1: Clean Git State
```bash
# Remove lock files if they exist
rm -f .git/index.lock
rm -f .git/config.lock
rm -f .git/refs/heads/main.lock

# Check git status
git status
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `intramural-sports-platform`
3. Description: "Comprehensive web-based intramural sports management platform"
4. Choose Public or Private
5. **Do NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 3: Push to GitHub
```bash
# Add all files to staging
git add .

# Create initial commit
git commit -m "feat: Complete intramural sports platform

- User authentication via Replit Auth
- Role-based access control (Admin, Captain, Referee, Player)
- Sports and team management
- Game scheduling with division restrictions
- Payment integration with Stripe
- Real-time analytics dashboard
- Mobile-responsive design
- Comprehensive onboarding flow"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/intramural-sports-platform.git

# Push to GitHub
git push -u origin main
```

## 📋 Repository Configuration

### Add GitHub Repository Topics
After creating the repository, add these topics for better discoverability:

```
intramural-sports, react, nodejs, typescript, postgresql, stripe, sports-management, 
university, college, team-management, authentication, payment-processing
```

### Create Repository Secrets
Go to Settings → Secrets and variables → Actions, then add:

```
DATABASE_URL
SESSION_SECRET
STRIPE_SECRET_KEY
VITE_STRIPE_PUBLIC_KEY
```

## 🚀 Quick Deploy Options

### Option 1: Replit Deployments
1. In your Replit project, go to "Deployments"
2. Connect your GitHub repository
3. Configure environment variables
4. Deploy automatically on push

### Option 2: Vercel Integration
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add environment variables
5. Deploy

### Option 3: Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add PostgreSQL database
5. Configure environment variables
6. Deploy

## 📝 Repository Structure

Your repository will include:

```
intramural-sports-platform/
├── README.md                   # Comprehensive project documentation
├── DEPLOYMENT.md              # Deployment instructions
├── GITHUB_SETUP.md           # This file
├── package.json              # Dependencies and scripts
├── client/                   # React frontend
├── server/                   # Express backend
├── shared/                   # Shared schemas and types
├── .gitignore               # Git ignore rules
└── replit.md                # Project context and preferences
```

## 🔧 GitHub Actions (Optional)

Create `.github/workflows/deploy.yml` for automated deployment:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        VITE_STRIPE_PUBLIC_KEY: ${{ secrets.VITE_STRIPE_PUBLIC_KEY }}
    
    - name: Deploy to production
      # Add your deployment step here
      run: echo "Deploy to your preferred platform"
```

## 📊 GitHub Features to Enable

### 1. Issues and Project Management
- Enable Issues for bug tracking
- Create project boards for feature planning
- Use labels: `bug`, `enhancement`, `documentation`, `good first issue`

### 2. Branch Protection
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date

### 3. Security
- Enable Dependabot alerts
- Enable secret scanning
- Add security policy (SECURITY.md)

## 🤝 Contributing Guidelines

Create `CONTRIBUTING.md`:

```markdown
# Contributing to Intramural Sports Platform

## Development Setup
1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## Pull Request Process
1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Update documentation
5. Submit pull request

## Code Style
- Use TypeScript for type safety
- Follow existing code patterns
- Use meaningful commit messages
- Add comments for complex logic
```

## 📱 Repository Badge Examples

Add these badges to your README.md:

```markdown
[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://your-app.replit.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
```

Follow these instructions to successfully push your intramural sports platform to GitHub and set up automated deployments!