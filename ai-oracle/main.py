"""
X-CAPITAL AI Oracle Service
FastAPI application delivering forecasting, risk analysis, and sentiment signals.
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.oracle import router as oracle_router


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("X-CAPITAL AI Oracle starting…")
    yield
    print("X-CAPITAL AI Oracle shutting down.")


# ─── App factory ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="X-CAPITAL AI Oracle",
    description="LSTM forecasting · Monte Carlo risk · Sentiment analysis",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — only allow the backend service (internal traffic)
_allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:4000,http://backend:4000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _allowed_origins],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ─── Routes ───────────────────────────────────────────────────────────────────

app.include_router(oracle_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "X-CAPITAL AI Oracle",
        "version": "1.0.0",
    }


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("ENV", "production") == "development",
        log_level="info",
    )
