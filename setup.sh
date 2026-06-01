#!/bin/bash
# ============================================
# System Sentinel - Quick Setup Script
# ============================================
echo "🛡️  System Sentinel Setup"
echo "=========================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "✅ Node.js v$(node -v) found"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found locally. Make sure to set MONGODB_URI in .env"
fi

# Setup backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created backend/.env from example"
    echo "⚠️  Please edit backend/.env and set your JWT_SECRET and MONGODB_URI"
fi
npm install
echo "✅ Backend dependencies installed"

# Setup frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

echo ""
echo "============================================"
echo "✅ Setup complete!"
echo "============================================"
echo ""
echo "To start the application:"
echo "  1. Start MongoDB: mongod"
echo "  2. Terminal 1:  cd backend && npm run dev"
echo "  3. Terminal 2:  cd frontend && npm run dev"
echo "  4. Open:        http://localhost:5173"
echo ""
echo "🛡️  System Sentinel is ready!"
