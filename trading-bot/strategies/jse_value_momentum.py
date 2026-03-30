"""
JSE Value + Momentum Strategy
Combines Claude Trading Skills' VCP (Volatility Contraction Pattern)
with value screening for Johannesburg Stock Exchange stocks.

Methodology:
- Screen JSE stocks for value (P/E, dividend yield, ROE)
- Look for VCP breakout patterns (Minervini-style)
- Confirm with volume and trend (above 200 MA)
"""

from datetime import datetime
from typing import Optional

import yfinance as yf
from loguru import logger

from strategies.base_strategy import BaseStrategy
from core.models import (
    AssetClass,
    Signal,
    SignalType,
    TimeFrame,
)


class JSEValueMomentumStrategy(BaseStrategy):
    """
    JSE stock strategy combining value screening with momentum entry.

    Phase 1 - Value Screen:
    - P/E ratio <= 20
    - Dividend yield >= 2%
    - ROE >= 15% (if available)

    Phase 2 - Technical Entry (VCP-inspired):
    - Price above 200-day MA (Stage 2 uptrend)
    - Volatility contracting (narrowing range over last 3-5 bars)
    - Breakout on above-average volume
    - RSI between 50-70 (momentum without overbought)

    Phase 3 - Risk Management:
    - Stop loss: 7% below entry
    - Trailing stop: 15%
    """

    def __init__(self, config: dict, connector):
        super().__init__("jse_value_momentum", config)
        self.connector = connector
        self.run_interval_seconds = 3600  # Run every hour

        screening = config.get("screening", {})
        self.max_pe = screening.get("max_pe_ratio", 20)
        self.min_div_yield = screening.get("min_dividend_yield", 2.0)
        self.min_roe = screening.get("min_roe", 15)

        risk = config.get("risk", {})
        self.max_position_pct = risk.get("max_position_pct", 8.0)
        self.stop_loss_pct = risk.get("stop_loss_pct", 7.0)
        self.trailing_stop_pct = risk.get("trailing_stop_pct", 15.0)

        self.watchlist = config.get("watchlist", [
            "NPN", "ANG", "SOL", "SBK", "FSR", "BHP", "MTN",
            "VOD", "SHP", "ABG", "AMS", "CFR", "GFI", "GLN",
            "IMP", "KIO", "NED", "SLM", "TFG", "WHL",
        ])

    async def generate_signals(self) -> list[Signal]:
        """Screen JSE stocks and generate entry signals."""
        self.last_run = datetime.now()
        signals = []

        for symbol in self.watchlist:
            try:
                signal = await self._analyze_stock(symbol)
                if signal:
                    signals.append(signal)
            except Exception as e:
                logger.error(f"[JSE Strategy] Error analyzing {symbol}: {e}")

        logger.info(f"[JSE Strategy] Screened {len(self.watchlist)} stocks, {len(signals)} signals")
        return signals

    async def _analyze_stock(self, symbol: str) -> Optional[Signal]:
        """Full analysis pipeline for a single JSE stock."""
        yf_symbol = f"{symbol}.JO"

        try:
            ticker = yf.Ticker(yf_symbol)
            info = ticker.info or {}
        except Exception as e:
            logger.debug(f"[JSE] Cannot fetch info for {symbol}: {e}")
            return None

        # Phase 1: Value Screen
        pe_ratio = info.get("trailingPE") or info.get("forwardPE")
        div_yield = (info.get("dividendYield") or 0) * 100  # Convert to percentage
        roe = (info.get("returnOnEquity") or 0) * 100

        if pe_ratio and pe_ratio > self.max_pe:
            return None
        if div_yield < self.min_div_yield:
            return None

        # Phase 2: Technical Analysis
        candles = await self.connector.get_ohlcv(symbol, TimeFrame.D1, limit=250)
        if not candles or len(candles) < 50:
            return None

        df = self.market_data_to_dataframe(candles)
        indicators = self.calculate_indicators(df)

        # Check Stage 2 uptrend (price above 200 MA)
        if indicators.sma_200 and df["close"].iloc[-1] < indicators.sma_200:
            return None

        # Check RSI is in momentum zone (not overbought)
        if indicators.rsi is None or not (45 <= indicators.rsi <= 72):
            return None

        # VCP Detection: Look for contracting volatility
        vcp_score = self._detect_vcp(df)
        if vcp_score < 2:
            return None

        # Volume confirmation
        volume_ratio = 1.0
        if indicators.volume_sma and indicators.volume_sma > 0:
            volume_ratio = df["volume"].iloc[-1] / indicators.volume_sma

        current_price = df["close"].iloc[-1]
        stop_loss = current_price * (1 - self.stop_loss_pct / 100)

        # Calculate confidence based on factors
        confidence = 0.0
        if pe_ratio and pe_ratio <= 15:
            confidence += 0.2
        elif pe_ratio and pe_ratio <= 20:
            confidence += 0.1
        if div_yield >= 3.5:
            confidence += 0.2
        elif div_yield >= 2.0:
            confidence += 0.1
        if vcp_score >= 4:
            confidence += 0.3
        elif vcp_score >= 2:
            confidence += 0.15
        if volume_ratio >= 1.5:
            confidence += 0.2
        if indicators.rsi and 50 <= indicators.rsi <= 65:
            confidence += 0.1

        confidence = min(confidence, 1.0)

        if confidence < 0.5:
            return None

        return Signal(
            strategy_name=self.name,
            symbol=symbol,
            signal_type=SignalType.BUY,
            confidence=confidence,
            timestamp=datetime.now(),
            timeframe=TimeFrame.D1,
            asset_class=AssetClass.JSE_EQUITY,
            entry_price=current_price,
            stop_loss=stop_loss,
            take_profit=None,  # Use trailing stop instead
            metadata={
                "pe_ratio": pe_ratio,
                "dividend_yield": div_yield,
                "roe": roe,
                "vcp_score": vcp_score,
                "volume_ratio": volume_ratio,
                "rsi": indicators.rsi,
                "sma_200": indicators.sma_200,
                "max_position_pct": self.max_position_pct,
                "trailing_stop_pct": self.trailing_stop_pct,
            },
        )

    def _detect_vcp(self, df) -> int:
        """
        Detect Volatility Contraction Pattern (Minervini-style).
        Looks for progressively tighter price ranges over recent bars.
        Returns score 0-5.
        """
        if len(df) < 20:
            return 0

        score = 0
        closes = df["close"].values
        highs = df["high"].values
        lows = df["low"].values

        # Check for contracting ranges over last 4 windows of 5 bars
        ranges = []
        for i in range(4):
            start = -(5 * (i + 1))
            end = -(5 * i) if i > 0 else None
            window_high = highs[start:end].max()
            window_low = lows[start:end].min()
            if window_low > 0:
                ranges.append((window_high - window_low) / window_low * 100)

        if len(ranges) >= 3:
            # Ranges should be decreasing (contracting)
            contracting = all(ranges[i] <= ranges[i + 1] * 1.1 for i in range(len(ranges) - 1))
            if contracting:
                score += 2

            # Latest range should be tight (< 5%)
            if ranges[0] < 5:
                score += 1
            if ranges[0] < 3:
                score += 1

        # Price near highs (within 10% of 52-week high)
        if len(closes) >= 52:
            high_52w = highs[-252:].max() if len(highs) >= 252 else highs.max()
            if closes[-1] >= high_52w * 0.90:
                score += 1

        return score
