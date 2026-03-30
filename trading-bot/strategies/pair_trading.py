"""
Pair Trading (Statistical Arbitrage) Strategy
From Claude Trading Skills methodology.

Identifies cointegrated pairs and trades mean-reversion
of their spread using z-score signals.
"""

from datetime import datetime
from typing import Optional

import numpy as np
import pandas as pd
from loguru import logger

from strategies.base_strategy import BaseStrategy
from core.models import (
    AssetClass,
    Signal,
    SignalType,
    TimeFrame,
)


class PairTradingStrategy(BaseStrategy):
    """
    Statistical arbitrage pair trading.

    Methodology:
    1. Test pairs for cointegration (Engle-Granger)
    2. Calculate hedge ratio via OLS regression
    3. Monitor spread z-score
    4. Enter when z-score > threshold (long cheap / short expensive)
    5. Exit when z-score returns to mean (0)
    """

    def __init__(self, config: dict, connectors: dict):
        super().__init__("pair_trading", config)
        self.connectors = connectors
        self.run_interval_seconds = 1800  # 30 minutes

        self.pairs = config.get("pairs", [
            ["BTC/USDT", "ETH/USDT"],
        ])
        self.lookback = config.get("lookback_period", 60)
        self.zscore_entry = config.get("zscore_entry", 2.0)
        self.zscore_exit = config.get("zscore_exit", 0.5)

    async def generate_signals(self) -> list[Signal]:
        """Analyze all pairs for trading opportunities."""
        self.last_run = datetime.now()
        signals = []

        for pair in self.pairs:
            try:
                pair_signals = await self._analyze_pair(pair[0], pair[1])
                signals.extend(pair_signals)
            except Exception as e:
                logger.error(f"[PairTrading] Error analyzing {pair}: {e}")

        return signals

    async def _analyze_pair(self, symbol_a: str, symbol_b: str) -> list[Signal]:
        """Analyze a pair for cointegration and trading signals."""
        # Determine which connector to use
        connector = self._get_connector(symbol_a)
        if not connector:
            return []

        # Fetch historical data
        candles_a = await connector.get_ohlcv(symbol_a, TimeFrame.D1, limit=self.lookback)
        candles_b = await connector.get_ohlcv(symbol_b, TimeFrame.D1, limit=self.lookback)

        if not candles_a or not candles_b:
            return []

        df_a = self.market_data_to_dataframe(candles_a)
        df_b = self.market_data_to_dataframe(candles_b)

        # Align timestamps
        min_len = min(len(df_a), len(df_b))
        prices_a = df_a["close"].values[-min_len:]
        prices_b = df_b["close"].values[-min_len:]

        if min_len < 30:
            return []

        # Test cointegration (simplified Engle-Granger)
        is_cointegrated, hedge_ratio = self._test_cointegration(prices_a, prices_b)

        if not is_cointegrated:
            logger.debug(f"[PairTrading] {symbol_a}/{symbol_b} not cointegrated")
            return []

        # Calculate spread and z-score
        spread = prices_a - hedge_ratio * prices_b
        spread_mean = np.mean(spread)
        spread_std = np.std(spread)

        if spread_std == 0:
            return []

        current_zscore = (spread[-1] - spread_mean) / spread_std

        signals = []
        price_a = prices_a[-1]
        price_b = prices_b[-1]
        asset_class = self._get_asset_class(symbol_a)

        # Entry signals
        if current_zscore > self.zscore_entry:
            # Spread is too wide (A overpriced vs B): Short A, Long B
            confidence = min(abs(current_zscore) / (self.zscore_entry * 2), 1.0)

            signals.append(Signal(
                strategy_name=self.name,
                symbol=symbol_a,
                signal_type=SignalType.SELL,
                confidence=confidence,
                timestamp=datetime.now(),
                timeframe=TimeFrame.D1,
                asset_class=asset_class,
                entry_price=price_a,
                metadata={
                    "pair": f"{symbol_a}/{symbol_b}",
                    "zscore": current_zscore,
                    "hedge_ratio": hedge_ratio,
                    "side": "short_A",
                },
            ))
            signals.append(Signal(
                strategy_name=self.name,
                symbol=symbol_b,
                signal_type=SignalType.BUY,
                confidence=confidence,
                timestamp=datetime.now(),
                timeframe=TimeFrame.D1,
                asset_class=asset_class,
                entry_price=price_b,
                metadata={
                    "pair": f"{symbol_a}/{symbol_b}",
                    "zscore": current_zscore,
                    "hedge_ratio": hedge_ratio,
                    "side": "long_B",
                    "max_position_pct": 3.0,
                },
            ))

        elif current_zscore < -self.zscore_entry:
            # Spread is too narrow (A underpriced vs B): Long A, Short B
            confidence = min(abs(current_zscore) / (self.zscore_entry * 2), 1.0)

            signals.append(Signal(
                strategy_name=self.name,
                symbol=symbol_a,
                signal_type=SignalType.BUY,
                confidence=confidence,
                timestamp=datetime.now(),
                timeframe=TimeFrame.D1,
                asset_class=asset_class,
                entry_price=price_a,
                metadata={
                    "pair": f"{symbol_a}/{symbol_b}",
                    "zscore": current_zscore,
                    "hedge_ratio": hedge_ratio,
                    "side": "long_A",
                    "max_position_pct": 3.0,
                },
            ))

        # Exit signals (z-score returning to mean)
        elif abs(current_zscore) < self.zscore_exit:
            signals.append(Signal(
                strategy_name=self.name,
                symbol=symbol_a,
                signal_type=SignalType.CLOSE,
                confidence=0.8,
                timestamp=datetime.now(),
                timeframe=TimeFrame.D1,
                asset_class=asset_class,
                entry_price=price_a,
                metadata={"zscore": current_zscore, "reason": "mean_reversion_complete"},
            ))
            signals.append(Signal(
                strategy_name=self.name,
                symbol=symbol_b,
                signal_type=SignalType.CLOSE,
                confidence=0.8,
                timestamp=datetime.now(),
                timeframe=TimeFrame.D1,
                asset_class=asset_class,
                entry_price=price_b,
                metadata={"zscore": current_zscore, "reason": "mean_reversion_complete"},
            ))

        return signals

    def _test_cointegration(self, prices_a: np.ndarray, prices_b: np.ndarray) -> tuple[bool, float]:
        """
        Simplified cointegration test using OLS regression + ADF on residuals.
        Returns (is_cointegrated, hedge_ratio).
        """
        # OLS regression: A = beta * B + epsilon
        # hedge_ratio = cov(A,B) / var(B)
        cov_ab = np.cov(prices_a, prices_b)[0][1]
        var_b = np.var(prices_b)

        if var_b == 0:
            return False, 0.0

        hedge_ratio = cov_ab / var_b

        # Calculate spread (residuals)
        spread = prices_a - hedge_ratio * prices_b

        # Simplified ADF test: check if spread is mean-reverting
        # by checking autocorrelation of first differences
        diff = np.diff(spread)
        if len(diff) < 10:
            return False, hedge_ratio

        # Check if lagged spread predicts changes (negative coefficient = mean-reverting)
        lagged = spread[:-1]
        correlation = np.corrcoef(lagged, diff)[0][1]

        # Negative correlation suggests mean-reversion (cointegrated)
        is_cointegrated = correlation < -0.3

        # Also check spread stationarity via variance ratio
        half = len(spread) // 2
        var_first = np.var(spread[:half])
        var_second = np.var(spread[half:])
        if var_first > 0:
            variance_ratio = var_second / var_first
            # Stationary spread should have similar variance in both halves
            if variance_ratio > 3.0 or variance_ratio < 0.33:
                is_cointegrated = False

        return is_cointegrated, hedge_ratio

    def _get_connector(self, symbol: str):
        """Get appropriate connector for a symbol."""
        if "/" in symbol:
            return self.connectors.get("binance") or self.connectors.get("luno")
        return self.connectors.get("easyequities")

    def _get_asset_class(self, symbol: str) -> AssetClass:
        if "/" in symbol:
            return AssetClass.CRYPTO
        return AssetClass.JSE_EQUITY
