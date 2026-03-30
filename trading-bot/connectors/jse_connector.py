"""
JSE (Johannesburg Stock Exchange) Connector.
Uses EasyEquities API for trading South African stocks.

Note: EasyEquities doesn't have an official public API.
This connector uses web scraping / unofficial API endpoints.
For production, consider Interactive Brokers or a licensed JSE broker API.
"""

import asyncio
from datetime import datetime
from typing import Optional
import uuid

import httpx
import yfinance as yf
from loguru import logger

from connectors.base import BaseConnector
from core.models import (
    AssetClass,
    MarketData,
    Order,
    OrderSide,
    OrderStatus,
    OrderType,
    TimeFrame,
)


# JSE symbols need .JO suffix for Yahoo Finance
JSE_SUFFIX = ".JO"

YF_TIMEFRAME_MAP = {
    TimeFrame.M1: "1m",
    TimeFrame.M5: "5m",
    TimeFrame.M15: "15m",
    TimeFrame.M30: "30m",
    TimeFrame.H1: "1h",
    TimeFrame.D1: "1d",
    TimeFrame.W1: "1wk",
    TimeFrame.MN: "1mo",
}


class JSEConnector(BaseConnector):
    """
    JSE trading connector.

    Market data: Yahoo Finance (free, reliable for daily data)
    Order execution: EasyEquities unofficial API or paper trading

    For live trading, recommended alternatives:
    - Interactive Brokers (supports JSE via API)
    - Saxo Bank (supports JSE)
    - Standard Bank Online Share Trading API
    """

    def __init__(self, config: dict):
        super().__init__("easyequities", config)
        self.session: Optional[httpx.AsyncClient] = None
        self.authenticated = False
        self._paper_positions: dict = {}
        self._paper_balance = config.get("paper_balance", 100000.0)  # R100,000 paper

    async def connect(self):
        """Connect to EasyEquities (or initialize paper trading)."""
        self.session = httpx.AsyncClient(timeout=30.0)

        if self.sandbox:
            logger.info("[JSE] Paper trading mode enabled")
            self.authenticated = True
            return

        # EasyEquities authentication (unofficial)
        try:
            login_url = "https://platform.easyequities.io/Account/SignIn"
            response = await self.session.post(
                login_url,
                data={
                    "Username": self.config.get("username", ""),
                    "Password": self.config.get("password", ""),
                },
            )
            if response.status_code == 200:
                self.authenticated = True
                logger.info("[JSE] Connected to EasyEquities")
            else:
                logger.warning("[JSE] Auth failed, falling back to paper trading")
                self.sandbox = True
        except Exception as e:
            logger.warning(f"[JSE] Connection failed: {e}. Using paper trading.")
            self.sandbox = True

    async def disconnect(self):
        if self.session:
            await self.session.aclose()
        logger.info("[JSE] Disconnected")

    async def get_balance(self) -> dict:
        if self.sandbox:
            position_value = sum(
                p["quantity"] * p["current_price"]
                for p in self._paper_positions.values()
            )
            return {
                "total": {"ZAR": self._paper_balance + position_value},
                "free": {"ZAR": self._paper_balance},
                "used": {"ZAR": position_value},
            }
        return {"total": {}, "free": {}, "used": {}}

    async def get_current_price(self, symbol: str) -> float:
        """Get current JSE stock price via Yahoo Finance."""
        yf_symbol = symbol if symbol.endswith(JSE_SUFFIX) else f"{symbol}{JSE_SUFFIX}"
        try:
            ticker = yf.Ticker(yf_symbol)
            info = ticker.fast_info
            return info.get("lastPrice", 0.0) or info.get("previousClose", 0.0)
        except Exception as e:
            logger.error(f"[JSE] Price fetch failed for {symbol}: {e}")
            return 0.0

    async def get_ohlcv(
        self, symbol: str, timeframe: TimeFrame, limit: int = 100
    ) -> list[MarketData]:
        """Get OHLCV data from Yahoo Finance for JSE stocks."""
        yf_symbol = symbol if symbol.endswith(JSE_SUFFIX) else f"{symbol}{JSE_SUFFIX}"
        yf_tf = YF_TIMEFRAME_MAP.get(timeframe, "1d")

        # Determine period based on timeframe and limit
        if timeframe in (TimeFrame.M1, TimeFrame.M5, TimeFrame.M15, TimeFrame.M30):
            period = "7d"
        elif timeframe == TimeFrame.H1:
            period = "30d"
        elif timeframe == TimeFrame.D1:
            period = "1y"
        elif timeframe == TimeFrame.W1:
            period = "2y"
        else:
            period = "5y"

        try:
            ticker = yf.Ticker(yf_symbol)
            df = ticker.history(period=period, interval=yf_tf)

            candles = []
            for idx, row in df.tail(limit).iterrows():
                candles.append(
                    MarketData(
                        symbol=symbol,
                        timeframe=timeframe,
                        timestamp=idx.to_pydatetime(),
                        open=row["Open"],
                        high=row["High"],
                        low=row["Low"],
                        close=row["Close"],
                        volume=row["Volume"],
                        asset_class=AssetClass.JSE_EQUITY,
                    )
                )
            return candles
        except Exception as e:
            logger.error(f"[JSE] OHLCV fetch failed for {symbol}: {e}")
            return []

    async def place_order(
        self,
        symbol: str,
        side: OrderSide,
        order_type: OrderType,
        quantity: float,
        price: Optional[float] = None,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None,
    ) -> Order:
        """Place a JSE order (paper trading or EasyEquities)."""
        if self.sandbox:
            return await self._paper_order(symbol, side, order_type, quantity, price)

        # For live EasyEquities trading (when API becomes available)
        logger.warning("[JSE] Live trading not yet implemented. Use paper mode.")
        return Order(
            id=str(uuid.uuid4()),
            symbol=symbol,
            side=side,
            order_type=order_type,
            quantity=quantity,
            price=price,
            status=OrderStatus.REJECTED,
            exchange="easyequities",
            strategy_name="",
            timestamp=datetime.now(),
        )

    async def _paper_order(
        self,
        symbol: str,
        side: OrderSide,
        order_type: OrderType,
        quantity: float,
        price: Optional[float] = None,
    ) -> Order:
        """Execute a paper trade."""
        current_price = await self.get_current_price(symbol)
        if current_price <= 0:
            return Order(
                id=str(uuid.uuid4()),
                symbol=symbol,
                side=side,
                order_type=order_type,
                quantity=quantity,
                price=price,
                status=OrderStatus.REJECTED,
                exchange="easyequities",
                strategy_name="",
                timestamp=datetime.now(),
            )

        fill_price = price or current_price
        cost = quantity * fill_price

        if side == OrderSide.BUY:
            if cost > self._paper_balance:
                return Order(
                    id=str(uuid.uuid4()),
                    symbol=symbol,
                    side=side,
                    order_type=order_type,
                    quantity=quantity,
                    price=fill_price,
                    status=OrderStatus.REJECTED,
                    exchange="easyequities",
                    strategy_name="",
                    timestamp=datetime.now(),
                )
            self._paper_balance -= cost
            self._paper_positions[symbol] = {
                "quantity": quantity,
                "entry_price": fill_price,
                "current_price": fill_price,
            }
        else:
            if symbol in self._paper_positions:
                pos = self._paper_positions[symbol]
                proceeds = pos["quantity"] * fill_price
                self._paper_balance += proceeds
                del self._paper_positions[symbol]

        order_id = str(uuid.uuid4())
        logger.info(f"[JSE Paper] {side.value} {quantity} {symbol} @ R{fill_price:.2f}")

        return Order(
            id=order_id,
            symbol=symbol,
            side=side,
            order_type=order_type,
            quantity=quantity,
            price=fill_price,
            status=OrderStatus.FILLED,
            exchange="easyequities",
            strategy_name="",
            timestamp=datetime.now(),
            filled_price=fill_price,
            filled_quantity=quantity,
            commission=cost * 0.001,  # 0.1% estimated commission
        )

    async def cancel_order(self, order_id: str) -> bool:
        return True  # Paper trades are instant

    async def get_open_orders(self, symbol: Optional[str] = None) -> list[Order]:
        return []  # Paper trades fill instantly

    async def get_jse_top40(self) -> list[dict]:
        """Get JSE Top 40 index constituents with basic data."""
        top40_symbols = [
            "NPN", "ANG", "SOL", "SBK", "FSR", "BHP", "MTN", "VOD",
            "SHP", "ABG", "AMS", "CFR", "CPI", "DSY", "EXX", "GFI",
            "GLN", "GRT", "IMP", "INP", "KIO", "MNP", "MRP", "NED",
            "OLG", "PRX", "REM", "RNI", "SLM", "SNT", "TBS", "TFG",
            "TKG", "WHL",
        ]

        results = []
        for sym in top40_symbols:
            try:
                price = await self.get_current_price(sym)
                results.append({"symbol": sym, "price": price})
            except Exception:
                pass
        return results
