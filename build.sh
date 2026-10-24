#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Installing Python Backend Dependencies ---"
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "--- Building Frontend React Application ---"
cd frontend
npm install
npm run build
cd ..

echo "--- Build Completed Successfully! ---"
