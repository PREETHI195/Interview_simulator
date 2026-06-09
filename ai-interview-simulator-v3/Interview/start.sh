#!/bin/bash
echo "🤖 InterviewAI — Starting up..."
echo ""

# Check for .env
if [ ! -f "server/.env" ]; then
  echo "⚠️  server/.env not found. Creating from example..."
  cp server/.env.example server/.env
  echo "👉 Please edit server/.env and add your OPENAI_API_KEY, then run this script again."
  exit 1
fi

# Install backend deps
echo "📦 Installing backend dependencies..."
cd server && npm install --silent
cd ..

# Install frontend deps
echo "📦 Installing frontend dependencies..."
cd client && npm install --silent
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🚀 To start the app, open TWO terminals:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd server && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd client && npm run dev"
echo ""
echo "  Then visit: http://localhost:5173"
