#!/bin/bash
# Test runner for both Backend (pytest) and Frontend (Vitest)
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "=========================================================="
echo "1. Running Backend Pytest Test Suite..."
echo "=========================================================="
python3 -m pytest backend/tests/test_api.py -v

echo ""
echo "=========================================================="
echo "2. Running Frontend Vitest & React Testing Library Suite..."
echo "=========================================================="
if [ -d "$HOME/.nvm/versions/node/v20.20.2/bin" ]; then
  export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
fi
cd frontend
npm run test

echo ""
echo "=========================================================="
echo "All Backend and Frontend Test Suites Completed Successfully!"
echo "=========================================================="
