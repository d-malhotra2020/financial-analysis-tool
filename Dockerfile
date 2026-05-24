# Two-stage build: compile the Next.js static export, then bundle it into a
# Python runtime that serves both the API and the static frontend via FastAPI.
#
# Stage 1 produces /app/frontend/out/. Stage 2 copies that into the final image
# at the path app/routers/dashboard.py expects.

# ── Stage 1: Next.js build ────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python runtime ───────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Build dependencies that pip might compile (pandas/numpy wheels usually exist
# for slim, but keep gcc available just in case).
RUN apt-get update && apt-get install -y --no-install-recommends \
      gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy backend code (FastAPI app, data, ml_models)
COPY app/        ./app/
COPY data/       ./data/
COPY ml_models/  ./ml_models/

# Copy the built static export from stage 1 into the path FastAPI mounts
COPY --from=frontend-builder /app/frontend/out  ./frontend/out

EXPOSE 8080
ENV PORT=8080

# Procfile is ignored when a Dockerfile is present; declare the start command here.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
