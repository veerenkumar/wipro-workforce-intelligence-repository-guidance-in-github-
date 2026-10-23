#!/bin/bash
# Startup script for Vite React frontend on macOS
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR/frontend"

# Ensure modern Node.js v20 from NVM is in PATH if present
if [ -d "$HOME/.nvm/versions/node/v20.20.2/bin" ]; then
  export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
fi

echo "=========================================================="
echo "Starting Wipro Workforce Intelligence Frontend (React)..."
echo "Application UI will be available at: http://localhost:5173"
echo "=========================================================="

npm run dev
