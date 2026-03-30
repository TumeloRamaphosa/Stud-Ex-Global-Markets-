"""
TradingView Webhook Integration

Receives webhook alerts from TradingView Pine Script strategies
and converts them into trading signals for the bot.

Setup in TradingView:
1. Create an alert on your chart/strategy
2. Set webhook URL to: http://your-desktop-ip:8080/webhook
3. Set alert message format (JSON):
   {
     "symbol": "{{ticker}}",
     "action": "{{strategy.order.action}}",
     "price": {{close}},
     "volume": {{volume}},
     "timeframe": "{{interval}}",
     "exchange": "{{exchange}}",
     "secret": "your_webhook_secret"
   }
"""

import asyncio
import json
from datetime import datetime
from typing import Optional

from flask import Flask, request, jsonify
from loguru import logger

from core.models import (
    AssetClass,
    Signal,
    SignalType,
    TimeFrame,
)


class TradingViewWebhook:
    """
    HTTP server that receives TradingView webhook alerts
    and forwards them as signals to the trading engine.
    """

    def __init__(self, config: dict, signal_queue: asyncio.Queue):
        self.config = config
        self.signal_queue = signal_queue
        self.secret = config.get("webhook", {}).get("secret", "")
        self.port = config.get("webhook", {}).get("port", 8080)
        self.app = Flask(__name__)
        self._setup_routes()
        self.alert_count = 0

    def _setup_routes(self):
        """Set up Flask routes for webhook endpoints."""

        @self.app.route("/webhook", methods=["POST"])
        def handle_webhook():
            return self._process_webhook(request)

        @self.app.route("/health", methods=["GET"])
        def health():
            return jsonify({
                "status": "ok",
                "alerts_received": self.alert_count,
                "timestamp": datetime.now().isoformat(),
            })

        @self.app.route("/tradingview/test", methods=["POST"])
        def test_alert():
            """Test endpoint for verifying webhook setup."""
            data = request.get_json(silent=True) or {}
            logger.info(f"[TradingView] Test alert received: {data}")
            return jsonify({"status": "test_received", "data": data})

    def _process_webhook(self, req):
        """Process incoming TradingView webhook."""
        try:
            data = req.get_json(silent=True)

            if not data:
                # Try to parse as plain text (TradingView sometimes sends text)
                text = req.get_data(as_text=True)
                try:
                    data = json.loads(text)
                except json.JSONDecodeError:
                    data = self._parse_text_alert(text)

            if not data:
                return jsonify({"error": "no data received"}), 400

            # Verify secret
            if self.secret and data.get("secret") != self.secret:
                logger.warning("[TradingView] Invalid webhook secret")
                return jsonify({"error": "unauthorized"}), 401

            # Convert to trading signal
            signal = self._alert_to_signal(data)
            if signal:
                # Put signal on the async queue (thread-safe)
                asyncio.run_coroutine_threadsafe(
                    self.signal_queue.put(signal),
                    asyncio.get_event_loop(),
                )
                self.alert_count += 1
                logger.info(
                    f"[TradingView] Alert #{self.alert_count}: "
                    f"{signal.signal_type.value} {signal.symbol} @ {signal.entry_price}"
                )
                return jsonify({"status": "signal_created", "signal_id": self.alert_count})

            return jsonify({"status": "alert_ignored"}), 200

        except Exception as e:
            logger.error(f"[TradingView] Webhook error: {e}")
            return jsonify({"error": str(e)}), 500

    def _alert_to_signal(self, data: dict) -> Optional[Signal]:
        """Convert a TradingView alert to a Signal object."""
        action = data.get("action", "").lower()
        symbol = data.get("symbol", "")

        if not symbol or not action:
            return None

        # Map TradingView actions to signal types
        signal_type_map = {
            "buy": SignalType.BUY,
            "sell": SignalType.SELL,
            "close": SignalType.CLOSE,
            "closelong": SignalType.SELL,
            "closeshort": SignalType.BUY,
            "long": SignalType.BUY,
            "short": SignalType.SELL,
        }

        signal_type = signal_type_map.get(action)
        if not signal_type:
            logger.debug(f"[TradingView] Unknown action: {action}")
            return None

        # Determine asset class
        exchange = data.get("exchange", "").lower()
        asset_class = AssetClass.CRYPTO
        if "jse" in exchange or exchange in ("johannesburg", "jse"):
            asset_class = AssetClass.JSE_EQUITY

        # Parse timeframe
        tf_str = data.get("timeframe", "1h")
        timeframe = self._parse_timeframe(tf_str)

        return Signal(
            strategy_name="tradingview",
            symbol=symbol,
            signal_type=signal_type,
            confidence=data.get("confidence", 0.8),
            timestamp=datetime.now(),
            timeframe=timeframe,
            asset_class=asset_class,
            entry_price=data.get("price"),
            stop_loss=data.get("stop_loss"),
            take_profit=data.get("take_profit"),
            metadata={
                "source": "tradingview_webhook",
                "strategy_name": data.get("strategy_name", ""),
                "raw_data": data,
                "max_position_pct": data.get("position_pct", 5.0),
            },
        )

    def _parse_text_alert(self, text: str) -> Optional[dict]:
        """Parse plain text TradingView alerts."""
        text = text.strip()
        parts = text.split(",")

        if len(parts) >= 2:
            return {
                "symbol": parts[0].strip(),
                "action": parts[1].strip(),
                "price": float(parts[2].strip()) if len(parts) > 2 else None,
            }
        return None

    def _parse_timeframe(self, tf: str) -> TimeFrame:
        tf_map = {
            "1": TimeFrame.M1, "1m": TimeFrame.M1,
            "5": TimeFrame.M5, "5m": TimeFrame.M5,
            "15": TimeFrame.M15, "15m": TimeFrame.M15,
            "30": TimeFrame.M30, "30m": TimeFrame.M30,
            "60": TimeFrame.H1, "1h": TimeFrame.H1, "1H": TimeFrame.H1,
            "240": TimeFrame.H4, "4h": TimeFrame.H4, "4H": TimeFrame.H4,
            "D": TimeFrame.D1, "1d": TimeFrame.D1, "1D": TimeFrame.D1,
            "W": TimeFrame.W1, "1w": TimeFrame.W1, "1W": TimeFrame.W1,
            "M": TimeFrame.MN, "1M": TimeFrame.MN,
        }
        return tf_map.get(tf, TimeFrame.H1)

    def run(self):
        """Start the webhook server (blocking)."""
        logger.info(f"[TradingView] Webhook server starting on port {self.port}")
        self.app.run(host="0.0.0.0", port=self.port, debug=False)


# ============================================================
# TradingView Pine Script Templates
# ============================================================

PINE_SCRIPT_WEBHOOK_TEMPLATE = '''
//@version=5
// ============================================================
// Studex Trading Bot - TradingView Webhook Strategy
// Sends automated alerts to your trading bot
// ============================================================
strategy("Studex Auto Trader", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=5)

// === INPUTS ===
fastEMA = input.int(12, "Fast EMA")
slowEMA = input.int(26, "Slow EMA")
rsiPeriod = input.int(14, "RSI Period")
rsiOB = input.int(70, "RSI Overbought")
rsiOS = input.int(30, "RSI Oversold")
atrPeriod = input.int(14, "ATR Period")
atrMultSL = input.float(2.0, "ATR Stop Loss Multiplier")
atrMultTP = input.float(4.0, "ATR Take Profit Multiplier")
webhookSecret = input.string("your_secret_here", "Webhook Secret")

// === CALCULATIONS ===
emaFast = ta.ema(close, fastEMA)
emaSlow = ta.ema(close, slowEMA)
rsi = ta.rsi(close, rsiPeriod)
atr = ta.atr(atrPeriod)
macd = ta.macd(close, fastEMA, slowEMA, 9)
[macdLine, signalLine, histLine] = ta.macd(close, fastEMA, slowEMA, 9)
volSMA = ta.sma(volume, 20)

// === ENTRY CONDITIONS ===
longCondition = emaFast > emaSlow and rsi > 40 and rsi < rsiOB and histLine > 0 and volume > volSMA * 1.5
shortCondition = emaFast < emaSlow and rsi < 60 and rsi > rsiOS and histLine < 0 and volume > volSMA * 1.5

// === STRATEGY EXECUTION ===
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long",
         stop=close - atr * atrMultSL,
         limit=close + atr * atrMultTP)

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short",
         stop=close + atr * atrMultSL,
         limit=close - atr * atrMultTP)

// === PLOTS ===
plot(emaFast, "Fast EMA", color.green)
plot(emaSlow, "Slow EMA", color.red)

// === ALERT MESSAGE FORMAT ===
// Set this as your alert message when creating alerts:
// {
//   "symbol": "{{ticker}}",
//   "action": "{{strategy.order.action}}",
//   "price": {{close}},
//   "volume": {{volume}},
//   "timeframe": "{{interval}}",
//   "exchange": "{{exchange}}",
//   "stop_loss": {{close}} - {{plot("ATR")}} * 2,
//   "take_profit": {{close}} + {{plot("ATR")}} * 4,
//   "strategy_name": "studex_momentum",
//   "secret": "your_secret_here"
// }
'''
