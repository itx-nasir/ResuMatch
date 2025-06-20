# Multi-stage build for React frontend and FastAPI backend

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

# Build the frontend for production
RUN npm run build

# Stage 2: Setup Python backend
FROM python:3.11-slim AS backend

# Install system dependencies for PDF processing and curl for healthcheck
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Create uploads and data directories
RUN mkdir -p /app/uploads /app/data && chmod 755 /app/uploads /app/data

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production

# Create startup script
RUN echo '#!/bin/bash\ncd /app && python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000' > /app/start.sh
RUN chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/test || exit 1

# Start the application
CMD ["/app/start.sh"]