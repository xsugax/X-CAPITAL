"""
X-CAPITAL AI Oracle — API Routes
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query

from models.forecasting import (
    Forecast,
    RiskMetrics,
    monte_carlo_risk,
    optimal_allocation,
    trend_forecast,
)

router = APIRouter(prefix="/oracle", tags=["oracle"])


# ─── Forecast ─────────────────────────────────────────────────────────────────

@router.get("/forecast/{symbol}", response_model=dict[str, Any])
def get_forecast(
    symbol: str,
    horizon: str = Query(default="30d", pattern=r"^\d+d$"),
):
    """Get price forecast for a single symbol."""
    symbol = symbol.upper()
    horizon_days = int(horizon.rstrip("d"))
    if horizon_days < 1 or horizon_days > 365:
        raise HTTPException(status_code=400, detail="Horizon must be between 1 and 365 days")

    fc: Forecast = trend_forecast(symbol, horizon_days)
    return {
        "success": True,
        "data": {
            "symbol": fc.symbol,
            "currentPrice": fc.current_price,
            "predictedPrice": fc.predicted_price,
            "expectedReturn": fc.expected_return,
            "horizon": fc.horizon,
            "confidence": fc.confidence,
            "signal": fc.signal,
        },
    }


# ─── Batch forecasts ──────────────────────────────────────────────────────────

@router.get("/forecasts", response_model=dict[str, Any])
def get_batch_forecasts(
    symbols: str = Query(description="Comma-separated symbols, e.g. TSLA,NVDA,AAPL"),
    horizon: str = Query(default="30d", pattern=r"^\d+d$"),
):
    """Get forecasts for multiple symbols at once."""
    syms = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    if not syms:
        raise HTTPException(status_code=400, detail="At least one symbol required")
    if len(syms) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 symbols per request")

    horizon_days = int(horizon.rstrip("d"))
    forecasts = []
    for sym in syms:
        fc = trend_forecast(sym, horizon_days)
        forecasts.append({
            "symbol": fc.symbol,
            "currentPrice": fc.current_price,
            "predictedPrice": fc.predicted_price,
            "expectedReturn": fc.expected_return,
            "horizon": fc.horizon,
            "confidence": fc.confidence,
            "signal": fc.signal,
        })

    return {"success": True, "data": {"forecasts": forecasts}}


# ─── Optimal allocation ───────────────────────────────────────────────────────

@router.get("/allocation", response_model=dict[str, Any])
def get_allocation(
    risk_tolerance: str = Query(default="moderate", pattern="^(conservative|moderate|aggressive)$"),
):
    """Get AI-recommended portfolio allocation."""
    alloc = optimal_allocation(risk_tolerance)
    return {
        "success": True,
        "data": {
            **alloc,
            "rationale": (
                f"Based on current market conditions, a {risk_tolerance} allocation "
                "is recommended with emphasis on AI infrastructure and energy transition assets."
            ),
        },
    }


# ─── Risk assessment ──────────────────────────────────────────────────────────

@router.post("/risk", response_model=dict[str, Any])
def assess_risk(body: dict[str, Any]):
    """Run Monte Carlo risk simulation for a portfolio."""
    symbols: list[str] = body.get("symbols", [])
    if not symbols:
        raise HTTPException(status_code=400, detail="symbols array required")
    if len(symbols) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 symbols")

    metrics: RiskMetrics = monte_carlo_risk([s.upper() for s in symbols])
    return {
        "success": True,
        "data": {
            "portfolioVaR": metrics.portfolio_var,
            "maxDrawdown": metrics.max_drawdown,
            "sharpeRatio": metrics.sharpe_ratio,
            "volatility": metrics.volatility,
            "riskScore": metrics.risk_score,
            "simulationCount": 10000,
        },
    }


# ─── Sentiment (mock) ─────────────────────────────────────────────────────────

_SENTIMENT_SEED: dict[str, float] = {
    "TSLA": 0.68, "NVDA": 0.82, "AAPL": 0.71, "AMZN": 0.58,
    "META": 0.63, "MSFT": 0.74, "GOOGL": 0.66, "PLTR": 0.59,
    "XSPACE": 0.77, "XINFRA": 0.65, "XENERGY": 0.60,
}


@router.get("/sentiment/{symbol}", response_model=dict[str, Any])
def get_sentiment(symbol: str):
    """Get aggregated market sentiment for a symbol."""
    symbol = symbol.upper()
    import random
    base = _SENTIMENT_SEED.get(symbol, 0.55)
    score = max(0.0, min(1.0, base + random.uniform(-0.05, 0.05)))

    if score >= 0.65:
        label = "Bullish"
    elif score >= 0.45:
        label = "Neutral"
    else:
        label = "Bearish"

    return {
        "success": True,
        "data": {
            "symbol": symbol,
            "score": round(score, 3),
            "label": label,
            "sources": random.randint(150, 400),
            "breakdown": {
                "news": round(score + random.uniform(-0.08, 0.08), 3),
                "social": round(score + random.uniform(-0.10, 0.10), 3),
                "analyst": round(score + random.uniform(-0.06, 0.06), 3),
            },
        },
    }
