"""
Crypto Momentum Strategy
Combines Claude Trading Skills' CANSLIM/VCP methodology adapted for crypto.
Multi-timeframe confirmation with volume and trend alignment.
"""

from datetime import datetime
from loguru import logger

from strategies.base_strategy import BaseStrategy
from core.models import (
    AssetClass,
    Signal,
    SignalType,
    TimeFrame,
)


class CryptoMomentumStrategy(BaseStrategy):
    """
    Crypto momentum strategy using multi-timeframe analysis.

    Entry conditions (ALL must align):
    1. Price above EMA(12) and EMA(26) — trend is up
    2. RSI between 40-70 — momentum without overbought
    3. MACD histogram positive and increasing
    4. Volume > 1.5x 20-period average
    5. ADX > 25 — trending market (not ranging)
    6. Price above Bollinger Band middle line

    Exit conditions:
    - Stop loss: 2 ATR below entry
    - Take profit: 4 ATR above entry (2:1 R:R)
    - RSI > 80 (overbought exit)
    - MACD histogram turns negative
    """

    def __init__(self, config: dict, connector):
        super().__init__("crypto_momentum", config)
        self.connector = connector
        self.symbols = config.get("symbols", ["BTC/USDT", "ETH/USDT", "SOL/USDT"])
        self.timeframes = [TimeFrame(tf) for tf in config.get("timeframes", ["1h", "4h", "1d"])]

        indicators = config.get("indicators", {})
        self.rsi_oversold = indicators.get("rsi_oversold", 30)
        self.rsi_overbought = indicators.get("rsi_overbought", 70)
        self.min_volume_ratio = config.get("entry_rules", {}).get("min_volume_ratio", 1.5)

        risk = config.get("risk", {})
        self.max_position_pct = risk.get("max_position_pct", 5.0)
        self.stop_loss_atr = risk.get("stop_loss_atr", 2.0)
        self.take_profit_atr = risk.get("take_profit_atr", 4.0)

    async def generate_signals(self) -> list[Signal]:
        """Generate momentum signals for all crypto pairs."""
        self.last_run = datetime.now()
        signals = []

        for symbol in self.symbols:
            try:
                signal = await self._analyze_symbol(symbol)
                if signal:
                    signals.append(signal)
            except Exception as e:
                logger.error(f"[CryptoMomentum] Error analyzing {symbol}: {e}")

        return signals

    async def _analyze_symbol(self, symbol: str):
        """Analyze a single symbol across multiple timeframes."""
        timeframe_scores = {}

        for tf in self.timeframes:
            candles = await self.connector.get_ohlcv(symbol, tf, limit=200)
            if not candles:
                continue

            df = self.market_data_to_dataframe(candles)
            indicators = self.calculate_indicators(df)

            score = self._score_timeframe(indicators, df)
            timeframe_scores[tf] = score

        if not timeframe_scores:
            return None

        # Multi-timeframe alignment: all timeframes must agree
        avg_score = sum(timeframe_scores.values()) / len(timeframe_scores)
        all_bullish = all(s > 0 for s in timeframe_scores.values())
        all_bearish = all(s < 0 for s in timeframe_scores.values())

        # Use the primary timeframe (first in list) for entry/exit levels
        primary_tf = self.timeframes[0]
        candles = await self.connector.get_ohlcv(symbol, primary_tf, limit=200)
        df = self.market_data_to_dataframe(candles)
        indicators = self.calculate_indicators(df)

        current_price = df["close"].iloc[-1] if not df.empty else 0

        if all_bullish and avg_score >= 3:
            atr = indicators.atr or current_price * 0.02  # fallback 2%

            return Signal(
                strategy_name=self.name,
                symbol=symbol,
                signal_type=SignalType.BUY,
                confidence=min(avg_score / 6.0, 1.0),
                timestamp=datetime.now(),
                timeframe=primary_tf,
                asset_class=AssetClass.CRYPTO,
                entry_price=current_price,
                stop_loss=current_price - (atr * self.stop_loss_atr),
                take_profit=current_price + (atr * self.take_profit_atr),
                metadata={
                    "atr": atr,
                    "avg_score": avg_score,
                    "timeframe_scores": {tf.value: s for tf, s in timeframe_scores.items()},
                    "max_position_pct": self.max_position_pct,
                    "rsi": indicators.rsi,
                    "macd_histogram": indicators.macd_histogram,
                },
            )

        elif all_bearish and avg_score <= -3:
            return Signal(
                strategy_name=self.name,
                symbol=symbol,
                signal_type=SignalType.SELL,
                confidence=min(abs(avg_score) / 6.0, 1.0),
                timestamp=datetime.now(),
                timeframe=primary_tf,
                asset_class=AssetClass.CRYPTO,
                entry_price=current_price,
                metadata={"avg_score": avg_score},
            )

        return None

    def _score_timeframe(self, indicators, df) -> float:
        """
        Score a timeframe from -6 to +6.
        Each condition adds +1 (bullish) or -1 (bearish).
        """
        score = 0
        close = df["close"].iloc[-1] if not df.empty else 0

        # 1. Trend: Price vs EMAs
        if indicators.ema_fast and indicators.ema_slow:
            if close > indicators.ema_fast > indicators.ema_slow:
                score += 1  # Strong uptrend
            elif close < indicators.ema_fast < indicators.ema_slow:
                score -= 1  # Strong downtrend

        # 2. RSI: Momentum zone
        if indicators.rsi is not None:
            if 40 <= indicators.rsi <= 70:
                score += 1  # Healthy momentum
            elif indicators.rsi > 80:
                score -= 1  # Overbought
            elif indicators.rsi < 25:
                score += 0.5  # Oversold bounce potential

        # 3. MACD histogram
        if indicators.macd_histogram is not None:
            if indicators.macd_histogram > 0:
                score += 1
            else:
                score -= 1

        # 4. Volume confirmation
        if indicators.volume_sma and not df.empty:
            current_vol = df["volume"].iloc[-1]
            if current_vol > indicators.volume_sma * self.min_volume_ratio:
                score += 1  # Volume confirms move
            elif current_vol < indicators.volume_sma * 0.5:
                score -= 0.5  # Low volume = weak move

        # 5. ADX trend strength
        if indicators.adx is not None:
            if indicators.adx > 25:
                score += 1  # Strong trend
            elif indicators.adx < 15:
                score -= 0.5  # No trend (ranging)

        # 6. Bollinger Band position
        if indicators.bb_middle is not None:
            if close > indicators.bb_middle:
                score += 0.5
            else:
                score -= 0.5

        return score
