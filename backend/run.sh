#!/bin/bash

# Table Order Service - Backend Run Script

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run uvicorn server
echo "Starting Table Order Service Backend..."
echo "Environment: ${ENVIRONMENT:-development}"
echo "Port: 8000"
echo ""

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
