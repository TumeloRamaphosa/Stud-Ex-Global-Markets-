"""Base strategy class that all strategies inherit from."""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional

import pandas as pd
import numpy as np
import ta as ta_lib
from loguru import logger

from core.models import Signal, TimeFrame, MarketData, TechnicalIndicators


class BaseStrategy(ABC):
    """Abstract base class for all trading strategies."""

    def __init__(self, name: str, config: dict):
        self.name = name
        self.config = config
        self.enabled = config.get("enabled", True)
        self.last_run: Optional[datetime] = None
        self.run_interval_seconds = config.get("run_interval_seconds", 300)  # 5 min default

    def should_run(self) -> bool:
        """Check if the strategy should run based on its schedule."""
        if not self.enabled:
            return False
        if self.last_run is None:
            return True
        elapsed = (datetime.now() - self.last_run).total_seconds()
        return elapsed >= self.run_interval_seconds

    @abstractmethod
    async def generate_signals(self) -> list[Signal]:
        """Generate trading signals. Must be implemented by subclasses."""
        pass

    def calculate_indicators(self, df: pd.DataFrame) -> TechnicalIndicators:
        """Calculate technical indicators from OHLCV dataframe."""
        if df.empty or len(df) < 26:
            return TechnicalIndicators(symbol="", timestamp=datetime.now())

        close = df["close"]
        high = df["high"]
        low = df["low"]
        volume = df["volume"]

        # RSI
        rsi = ta_lib.momentum.RSIIndicator(close, window=14).rsi().iloc[-1]

        # MACD
        macd_ind = ta_lib.trend.MACD(close, window_slow=26, window_fast=12, window_sign=9)
        macd = macd_ind.macd().iloc[-1]
        macd_signal = macd_ind.macd_signal().iloc[-1]
        macd_hist = macd_ind.macd_diff().iloc[-1]

        # EMAs
        ema_fast = ta_lib.trend.EMAIndicator(close, window=12).ema_indicator().iloc[-1]
        ema_slow = ta_lib.trend.EMAIndicator(close, window=26).ema_indicator().iloc[-1]

        # Bollinger Bands
        bb = ta_lib.volatility.BollingerBands(close, window=20, window_dev=2)
        bb_upper = bb.bollinger_hband().iloc[-1]
        bb_middle = bb.bollinger_mavg().iloc[-1]
        bb_lower = bb.bollinger_lband().iloc[-1]

        # ATR
        atr = ta_lib.volatility.AverageTrueRange(high, low, close, window=14).average_true_range().iloc[-1]

        # ADX
        adx = ta_lib.trend.ADXIndicator(high, low, close, window=14).adx().iloc[-1]

        # Stochastic
        stoch = ta_lib.momentum.StochasticOscillator(high, low, close, window=14, smooth_window=3)
        stoch_k = stoch.stoch().iloc[-1]
        stoch_d = stoch.stoch_signal().iloc[-1]

        # SMAs
        sma_50 = close.rolling(window=min(50, len(close))).mean().iloc[-1]
        sma_200 = close.rolling(window=min(200, len(close))).mean().iloc[-1] if len(close) >= 200 else None

        # Volume SMA
        volume_sma = volume.rolling(window=20).mean().iloc[-1]

        # OBV
        obv = ta_lib.volume.OnBalanceVolumeIndicator(close, volume).on_balance_volume().iloc[-1]

        return TechnicalIndicators(
            symbol=df.attrs.get("symbol", ""),
            timestamp=datetime.now(),
            rsi=rsi,
            macd=macd,
            macd_signal=macd_signal,
            macd_histogram=macd_hist,
            ema_fast=ema_fast,
            ema_slow=ema_slow,
            bb_upper=bb_upper,
            bb_middle=bb_middle,
            bb_lower=bb_lower,
            atr=atr,
            adx=adx,
            stoch_k=stoch_k,
            stoch_d=stoch_d,
            sma_50=sma_50,
            sma_200=sma_200,
            volume_sma=volume_sma,
            obv=obv,
        )

    def market_data_to_dataframe(self, candles: list[MarketData]) -> pd.DataFrame:
        """Convert list of MarketData to pandas DataFrame."""
        if not candles:
            return pd.DataFrame()

        df = pd.DataFrame([
            {
                "timestamp": c.timestamp,
                "open": c.open,
                "high": c.high,
                "low": c.low,
                "close": c.close,
                "volume": c.volume,
            }
            for c in candles
        ])
        df.set_index("timestamp", inplace=True)
        df.attrs["symbol"] = candles[0].symbol
        return df
