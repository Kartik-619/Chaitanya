#!/bin/bash

# Update IndividualSetup.jsx
sed -i '' "1s/^/import { API_ENDPOINTS } from '..\/..\/config\/api';\n/" src/components/registration/IndividualSetup.jsx 2>/dev/null || true
sed -i '' "s|https://chaitanya-4r5f.onrender.com/api/register/setup-individual|API_ENDPOINTS.SETUP_INDIVIDUAL|g" src/components/registration/IndividualSetup.jsx

# Update TeamSetup.jsx  
sed -i '' "1s/^/import { API_ENDPOINTS } from '..\/..\/config\/api';\n/" src/components/registration/TeamSetup.jsx 2>/dev/null || true
sed -i '' "s|https://chaitanya-4r5f.onrender.com/api/register/setup-team|API_ENDPOINTS.SETUP_TEAM|g" src/components/registration/TeamSetup.jsx

# Update ReviewRegistration.jsx
sed -i '' "1s/^/import { API_ENDPOINTS } from '..\/..\/config\/api';\n/" src/components/registration/ReviewRegistration.jsx 2>/dev/null || true
sed -i '' "s|https://chaitanya-4r5f.onrender.com/api/register/review|API_ENDPOINTS.REVIEW|g" src/components/registration/ReviewRegistration.jsx

# Update DirectUPIPayment.jsx
sed -i '' "1s/^/import { API_ENDPOINTS } from '..\/..\/config\/api';\n/" src/components/registration/DirectUPIPayment.jsx 2>/dev/null || true
sed -i '' "s|https://chaitanya-4r5f.onrender.com/api/payment/verify-payment|API_ENDPOINTS.VERIFY_PAYMENT|g" src/components/registration/DirectUPIPayment.jsx

echo "✅ All API URLs updated to use localhost"
