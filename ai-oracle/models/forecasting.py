"""
X-CAPITAL AI Oracle — Forecasting Models
Uses simplified trend + Monte Carlo simulation (no heavy ML deps required for dev).
Replace with LSTM/Transformer when GPU resources are available.
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import Literal

import numpy as np


# ─── Types ────────────────────────────────────────────────────────────────────

Signal = Literal["BUY", "HOLD", "SELL"]


@dataclass
class Forecast:
    symbol: str
    current_price: float
    predicted_price: float
    expected_return: float        # as percentage, e.g. 18.4 means +18.4%
    horizon: str                  # e.g. "30d"
    confidence: int               # 0-100
    signal: Signal


@dataclass
class RiskMetrics:
    portfolio_var: float          # Value at Risk (95%)
    max_drawdown: float
    sharpe_ratio: float
    volatility: float
    risk_score: int               # 0-100 composite


# ─── Mock price histories (7-day) for dev ─────────────────────────────────────

MOCK_PRICES: dict[str, list[float]] = {
    "TSLA":    [230.1, 238.4, 235.7, 242.1, 240.5, 245.8, 248.42],
    "NVDA":    [820.0, 835.2, 842.5, 858.0, 864.3, 869.7, 875.39],
    "AAPL":    [204.5, 207.2, 209.1, 210.8, 211.5, 212.3, 213.07],
    "AMZN":    [198.2, 196.8, 197.5, 195.1, 196.9, 195.8, 196.25],
    "META":    [492.3, 498.7, 504.2, 508.9, 511.3, 512.8, 513.92],
    "MSFT":    [415.4, 417.8, 419.2, 421.0, 421.8, 422.1, 422.86],
    "GOOGL":   [168.4, 170.1, 172.3, 173.5, 174.8, 175.2, 175.89],
    "PLTR":    [21.3,  22.1,  22.8,  23.1,  23.4,  23.2,  23.47],
    "XSPACE":  [10.2,  10.8,  11.3,  11.8,  12.1,  12.3,  12.50],
    "XINFRA":  [7.9,   8.1,   8.3,   8.5,   8.6,   8.7,   8.75],
    "XENERGY": [6.5,   6.4,   6.3,   6.2,   6.1,   6.2,   6.20],
}

# Historical vol estimates (annualized)
VOLATILITY_MAP: dict[str, float] = {
    "TSLA": 0.65, "NVDA": 0.55, "AAPL": 0.28, "AMZN": 0.35,
    "META": 0.40, "MSFT": 0.27, "GOOGL": 0.30, "PLTR": 0.85,
    "XSPACE": 0.95, "XINFRA": 0.80, "XENERGY": 0.75,
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_prices(symbol: str) -> list[float]:
    """Return price series; generate plausible mock if unknown."""
    if symbol in MOCK_PRICES:
        return MOCK_PRICES[symbol]
    # Generic mock — start at $100, random walk
    seed = sum(ord(c) for c in symbol)
    rng = random.Random(seed)
    prices = [100.0]
    for _ in range(6):
        prices.append(prices[-1] * (1 + (rng.random() - 0.48) * 0.03))
    return prices


def compute_daily_returns(prices: list[float]) -> np.ndarray:
    arr = np.array(prices, dtype=float)
    return np.diff(arr) / arr[:-1]


def annualised_vol(prices: list[float]) -> float:
    daily_r = compute_daily_returns(prices)
    if len(daily_r) < 2:
        return 0.40
    return float(np.std(daily_r, ddof=1)) * math.sqrt(252)


# ─── Trend-regression forecast ────────────────────────────────────────────────

def trend_forecast(symbol: str, horizon_days: int = 30) -> Forecast:
    """
    Simple linear-trend extrapolation with noise injection.
    Suitable for demos; replace with LSTM in production.
    """
    prices = get_prices(symbol)
    current = prices[-1]

    # Fit linear trend on log prices
    n = len(prices)
    x = np.arange(n, dtype=float)
    log_p = np.log(prices)
    slope = np.polyfit(x, log_p, 1)[0]  # daily log-return trend

    # Annualized vol for confidence
    vol = VOLATILITY_MAP.get(symbol, annualised_vol(prices))

    # Predicted price (trend + small mean reversion)
    daily_drift = slope * 0.85  # slight mean reversion
    noise_std = vol / math.sqrt(252) * math.sqrt(horizon_days) * 0.3
    noise = random.gauss(0, noise_std)
    predicted = current * math.exp(daily_drift * horizon_days + noise)
    predicted = max(predicted, 0.01)

    expected_return = ((predicted - current) / current) * 100

    # Confidence inversely proportional to volatility
    base_conf = max(40, min(90, int(80 - vol * 40)))
    confidence = base_conf + random.randint(-5, 5)

    # Signal
    if expected_return > 5:
        signal: Signal = "BUY"
    elif expected_return < -5:
        signal = "SELL"
    else:
        signal = "HOLD"

    return Forecast(
        symbol=symbol,
        current_price=round(current, 2),
        predicted_price=round(predicted, 2),
        expected_return=round(expected_return, 2),
        horizon=f"{horizon_days}d",
        confidence=confidence,
        signal=signal,
    )


# ─── Monte Carlo risk engine ──────────────────────────────────────────────────

def monte_carlo_risk(symbols: list[str], num_simulations: int = 10_000) -> RiskMetrics:
    """
    Simulate portfolio value distribution using geometric Brownian motion.
    """
    n = len(symbols)
    if n == 0:
        return RiskMetrics(
            portfolio_var=0.0, max_drawdown=0.0,
            sharpe_ratio=0.0, volatility=0.0, risk_score=50,
        )

    vols = np.array([VOLATILITY_MAP.get(s, 0.40) for s in symbols], dtype=float)
    mean_vol = float(np.mean(vols))

    # Daily params
    daily_vol = mean_vol / math.sqrt(252)
    daily_drift = 0.0007  # ~18% annualized drift assumption

    horizon = 30
    rng = np.random.default_rng(42)

    # GBM simulations
    returns = rng.normal(daily_drift, daily_vol, (num_simulations, horizon))
    path_returns = returns.sum(axis=1)  # total horizon return per sim

    # VaR at 95%
    var_95 = float(np.percentile(path_returns, 5)) * -1  # positive = loss

    # Max drawdown approximation
    max_dd = float(np.percentile(path_returns, 2)) * -1

    # Sharpe (assume risk-free ~5%)
    rf_daily = 0.05 / 252
    excess_returns = returns - rf_daily
    sharpe = float(np.mean(excess_returns) / (np.std(excess_returns) + 1e-9) * math.sqrt(252))

    # Composite risk score 0-100
    risk_score = int(min(100, max(0, (mean_vol * 80 + var_95 * 50))))

    return RiskMetrics(
        portfolio_var=round(var_95 * 100, 2),
        max_drawdown=round(max_dd * 100, 2),
        sharpe_ratio=round(sharpe, 2),
        volatility=round(mean_vol * 100, 2),
        risk_score=risk_score,
    )


# ─── Optimal allocation (rule-based) ─────────────────────────────────────────

def optimal_allocation(risk_tolerance: str = "moderate") -> dict[str, int]:
    """
    Returns recommended portfolio allocation percentages.
    In production this would use mean-variance optimization (PyPortfolioOpt).
    """
    base = {
        "AI": 40,
        "Energy": 20,
        "Space": 15,
        "PrivateEquity": 15,
        "Cash": 10,
    }
    if risk_tolerance == "conservative":
        base = {"AI": 25, "Energy": 20, "Space": 5, "PrivateEquity": 10, "Cash": 40}
    elif risk_tolerance == "aggressive":
        base = {"AI": 50, "Energy": 15, "Space": 20, "PrivateEquity": 15, "Cash": 0}
    return base
