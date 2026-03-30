"""Data models for the trading bot."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class MarketRegime(Enum):
    CONCENTRATION = "concentration"
    BROADENING = "broadening"
    CONTRACTION = "contraction"
    INFLATIONARY = "inflationary"
    TRANSITIONAL = "transitional"


class SignalType(Enum):
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"
    CLOSE = "close"


class OrderType(Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"


class OrderSide(Enum):
    BUY = "buy"
    SELL = "sell"


class OrderStatus(Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class AssetClass(Enum):
    CRYPTO = "crypto"
    JSE_EQUITY = "jse_equity"
    US_EQUITY = "us_equity"


class TimeFrame(Enum):
    M1 = "1m"
    M5 = "5m"
    M15 = "15m"
    M30 = "30m"
    H1 = "1h"
    H4 = "4h"
    D1 = "1d"
    W1 = "1w"
    MN = "1M"


@dataclass
class MarketData:
    symbol: str
    timeframe: TimeFrame
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    asset_class: AssetClass


@dataclass
class TechnicalIndicators:
    symbol: str
    timestamp: datetime
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_histogram: Optional[float] = None
    ema_fast: Optional[float] = None
    ema_slow: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_middle: Optional[float] = None
    bb_lower: Optional[float] = None
    atr: Optional[float] = None
    vwap: Optional[float] = None
    obv: Optional[float] = None
    adx: Optional[float] = None
    stoch_k: Optional[float] = None
    stoch_d: Optional[float] = None
    volume_sma: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None


@dataclass
class Signal:
    strategy_name: str
    symbol: str
    signal_type: SignalType
    confidence: float  # 0.0 to 1.0
    timestamp: datetime
    timeframe: TimeFrame
    asset_class: AssetClass
    entry_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    metadata: dict = field(default_factory=dict)


@dataclass
class Order:
    id: str
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: float
    price: Optional[float]
    status: OrderStatus
    exchange: str
    strategy_name: str
    timestamp: datetime
    filled_price: Optional[float] = None
    filled_quantity: Optional[float] = None
    commission: Optional[float] = None


@dataclass
class Position:
    symbol: str
    side: OrderSide
    quantity: float
    entry_price: float
    current_price: float
    unrealized_pnl: float
    realized_pnl: float
    exchange: str
    strategy_name: str
    asset_class: AssetClass
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    opened_at: datetime = field(default_factory=datetime.now)

    @property
    def pnl_pct(self) -> float:
        if self.entry_price == 0:
            return 0.0
        if self.side == OrderSide.BUY:
            return ((self.current_price - self.entry_price) / self.entry_price) * 100
        return ((self.entry_price - self.current_price) / self.entry_price) * 100


@dataclass
class PortfolioState:
    total_equity: float
    cash: float
    positions: list[Position]
    unrealized_pnl: float
    realized_pnl: float
    daily_pnl: float
    max_drawdown: float
    timestamp: datetime

    @property
    def exposure_pct(self) -> float:
        if self.total_equity == 0:
            return 0.0
        position_value = sum(p.quantity * p.current_price for p in self.positions)
        return (position_value / self.total_equity) * 100


@dataclass
class BreadthData:
    """Market breadth composite score (Claude Trading Skills methodology)."""
    overall_breadth: float  # 0-100
    sector_participation: float
    sector_rotation_score: float
    momentum_score: float
    mean_reversion_risk: float
    historical_context: float
    composite_score: float  # Weighted aggregate 0-100
    regime: MarketRegime
    timestamp: datetime


@dataclass
class SentimentResult:
    """Result from MiroFish-inspired swarm sentiment analysis."""
    symbol: str
    bullish_pct: float  # 0-100
    bearish_pct: float
    neutral_pct: float
    consensus_strength: float  # 0-1
    agent_count: int
    key_themes: list[str]
    contrarian_signal: bool
    timestamp: datetime
