#!/bin/bash
echo "🧪 Testing Frontend Routes on localhost:5174"
echo "=============================================="
echo ""

routes=("/" "/about" "/events" "/contact")

for route in "${routes[@]}"; do
  echo "Testing: http://localhost:5174$route"
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5174$route")
  if [ "$status" = "200" ]; then
    echo "✅ $route - OK"
  else
    echo "❌ $route - Failed (Status: $status)"
  fi
  echo ""
done

echo "=============================================="
echo "✅ All routes tested!"
