#!/bin/bash

echo "🔍 Checking Frontend Files on Local PC"
echo "========================================"
echo ""

echo "📁 Current Working Directory:"
pwd
echo ""

echo "📦 Package.json exists:"
ls -lh package.json 2>/dev/null && echo "✅ Found" || echo "❌ Missing"
echo ""

echo "📂 Source Directory:"
ls -lh src/ | head -10
echo ""

echo "🎨 Pages Available:"
ls -1 src/pages/*.jsx 2>/dev/null
echo ""

echo "🧩 Components:"
ls -1 src/component/*.jsx 2>/dev/null | head -10
echo ""

echo "🌐 Frontend Server:"
curl -s http://localhost:5174 > /dev/null && echo "✅ Running on http://localhost:5174" || echo "❌ Not running"
echo ""

echo "🔧 Backend Server:"
curl -s http://localhost:3000/health > /dev/null && echo "✅ Running on http://localhost:3000" || echo "❌ Not running"
echo ""

echo "========================================"
echo "✅ Frontend Check Complete!"
