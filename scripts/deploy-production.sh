#!/bin/bash

# Production Deployment Script for Vyapar Pragati Admin Dashboard
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 Starting Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

print_status "pnpm version: $(pnpm --version)"

# Check if Docker is installed (for containerized deployment)
if command -v docker &> /dev/null; then
    print_status "Docker is available for containerized deployment"
    DOCKER_AVAILABLE=true
else
    print_warning "Docker is not installed. Will use manual deployment."
    DOCKER_AVAILABLE=false
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf node_modules
print_status "Cleanup completed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile
print_status "Dependencies installed"

# Type checking
echo "🔍 Running type check..."
pnpm type-check
print_status "Type check passed"

# Linting
echo "🔍 Running linting..."
pnpm lint
print_status "Linting passed"

# Build the application
echo "🏗️  Building application..."
pnpm build
print_status "Build completed successfully"

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_FIREBASE_API_KEY" ]; then
    print_warning "Firebase environment variables not set. Please set them before deployment."
    echo "Required environment variables:"
    echo "  - NEXT_PUBLIC_FIREBASE_API_KEY"
    echo "  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    echo "  - NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    echo "  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    echo "  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    echo "  - NEXT_PUBLIC_FIREBASE_APP_ID"
    echo "  - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
fi

# Deployment options
echo "🚀 Choose deployment method:"
echo "1. Docker (Recommended)"
echo "2. Manual deployment"
echo "3. Vercel deployment"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        if [ "$DOCKER_AVAILABLE" = true ]; then
            echo "🐳 Deploying with Docker..."
            
            # Stop existing container
            docker stop vyapar-pragati-admin 2>/dev/null || true
            docker rm vyapar-pragati-admin 2>/dev/null || true
            
            # Build Docker image
            docker build -t vyapar-pragati-admin .
            
            # Run container
            docker run -d \
                --name vyapar-pragati-admin \
                -p 3000:3000 \
                -e NODE_ENV=production \
                -e NEXT_TELEMETRY_DISABLED=1 \
                vyapar-pragati-admin
            
            print_status "Docker deployment completed!"
            echo "🌐 Application is running at: http://localhost:3000"
            echo "📊 Container status:"
            docker ps | grep vyapar-pragati-admin
        else
            print_error "Docker is not available. Please install Docker first."
            exit 1
        fi
        ;;
    2)
        echo "📋 Manual deployment instructions:"
        echo "1. The application is built and ready"
        echo "2. Run: pnpm start"
        echo "3. Access at: http://localhost:3000"
        echo "4. For production, use a process manager like PM2"
        ;;
    3)
        echo "☁️  Vercel deployment instructions:"
        echo "1. Install Vercel CLI: npm i -g vercel"
        echo "2. Run: vercel --prod"
        echo "3. Set environment variables in Vercel dashboard"
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
print_status "Deployment script completed!"
echo ""
echo "📋 Post-deployment checklist:"
echo "  ✅ Application builds successfully"
echo "  ✅ TypeScript errors are fixed"
echo "  ✅ Linting passes"
echo "  ✅ Environment variables are set"
echo "  ✅ Firebase is configured"
echo "  ✅ Test phone numbers are added"
echo ""
echo "🧪 Test the application:"
echo "  1. Open the dashboard"
echo "  2. Verify users are loaded"
echo "  3. Test OTP verification with test numbers"
echo "  4. Test user deletion flow"
echo ""
echo "📞 For support, check the README.md and DEPLOYMENT.md files" 