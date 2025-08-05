#!/bin/bash

# Vyapar Pragati Admin Dashboard Deployment Script

echo "🚀 Starting deployment of Vyapar Pragati Admin Dashboard..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t vyapar-pragati-admin .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
else
    echo "❌ Docker build failed!"
    exit 1
fi

# Stop any existing container
echo "🛑 Stopping existing container..."
docker stop vyapar-pragati-admin 2>/dev/null || true
docker rm vyapar-pragati-admin 2>/dev/null || true

# Run the container
echo "🚀 Starting container..."
docker run -d \
  --name vyapar-pragati-admin \
  -p 3000:3000 \
  -e NODE_ENV=production \
  vyapar-pragati-admin

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Application is running at: http://localhost:3000"
    echo "📊 Container status:"
    docker ps | grep vyapar-pragati-admin
else
    echo "❌ Deployment failed!"
    exit 1
fi 