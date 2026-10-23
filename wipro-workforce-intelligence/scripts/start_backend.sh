#!/bin/bash
# Startup script for FastAPI backend on macOS
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "=========================================================="
echo "Starting Wipro Workforce Intelligence Backend (FastAPI)..."
echo "API Docs will be available at: http://127.0.0.1:8000/docs"
echo "=========================================================="

python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
