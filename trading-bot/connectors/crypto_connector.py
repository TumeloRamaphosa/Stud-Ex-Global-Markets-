"""
Unified Crypto Exchange Connector using CCXT.
Supports LUNO (South African ZAR pairs) and Binance (global USDT pairs).
"""

import asyncio
from datetime import datetime
from typing import Optional
import uuid

import ccxt.async_support as ccxt
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


TIMEFRAME_MAP = {
    TimeFrame.M1: "1m",
    TimeFrame.M5: "5m",
    TimeFrame.M15: "15m",
    TimeFrame.M30: "30m",
    TimeFrame.H1: "1h",
    TimeFrame.H4: "4h",
    TimeFrame.D1: "1d",
    TimeFrame.W1: "1w",
    TimeFrame.MN: "1M",
}


class CryptoConnector(BaseConnector):
    """
    Crypto exchange connector using CCXT library.
    Supports both LUNO and Binance through a unified interface.
    """

    def __init__(self, exchange_id: str, config: dict):
        super().__init__(exchange_id, config)
        self.exchange_id = exchange_id
        self.exchange: Optional[ccxt.Exchange] = None

    async def connect(self):
        """Initialize the CCXT exchange connection."""
        exchange_class = getattr(ccxt, self.exchange_id, None)
        if not exchange_class:
            raise ValueError(f"Exchange '{self.exchange_id}' not supported by CCXT")

        exchange_config = {
            "apiKey": self.config.get("api_key", ""),
            "secret": self.config.get("api_secret", ""),
            "enableRateLimit": True,
        }

        if self.sandbox:
            exchange_config["sandbox"] = True
            logger.info(f"[{self.exchange_id}] Running in SANDBOX mode")

        self.exchange = exchange_class(exchange_config)

        # Load markets
        await self.exchange.load_markets()
        logger.info(
            f"[{self.exchange_id}] Connected. "
            f"{len(self.exchange.markets)} markets available."
        )

    async def disconnect(self):
        if self.exchange:
            await self.exchange.close()
            logger.info(f"[{self.exchange_id}] Disconnected")

    async def get_balance(self) -> dict:
        if not self.exchange:
            raise ConnectionError("Exchange not connected")
        balance = await self.exchange.fetch_balance()
        return {
            "total": balance.get("total", {}),
            "free": balance.get("free", {}),
            "used": balance.get("used", {}),
        }

    async def get_current_price(self, symbol: str) -> float:
        if not self.exchange:
            raise ConnectionError("Exchange not connected")
        ticker = await self.exchange.fetch_ticker(symbol)
        return ticker["last"]

    async def get_ohlcv(
        self, symbol: str, timeframe: TimeFrame, limit: int = 100
    ) -> list[MarketData]:
        if not self.exchange:
            raise ConnectionError("Exchange not connected")

        tf_str = TIMEFRAME_MAP.get(timeframe, "1h")
        raw = await self.exchange.fetch_ohlcv(symbol, tf_str, limit=limit)

        candles = []
        for candle in raw:
            candles.append(
                MarketData(
                    symbol=symbol,
                    timeframe=timeframe,
                    timestamp=datetime.fromtimestamp(candle[0] / 1000),
                    open=candle[1],
                    high=candle[2],
                    low=candle[3],
                    close=candle[4],
                    volume=candle[5],
                    asset_class=AssetClass.CRYPTO,
                )
            )
        return candles

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
        if not self.exchange:
            raise ConnectionError("Exchange not connected")

        ccxt_side = "buy" if side == OrderSide.BUY else "sell"
        ccxt_type = "market" if order_type == OrderType.MARKET else "limit"

        params = {}

        # Add stop loss and take profit if supported
        if stop_loss:
            params["stopLoss"] = {"triggerPrice": stop_loss}
        if take_profit:
            params["takeProfit"] = {"triggerPrice": take_profit}

        try:
            result = await self.exchange.create_order(
                symbol=symbol,
                type=ccxt_type,
                side=ccxt_side,
                amount=quantity,
                price=price if ccxt_type == "limit" else None,
                params=params if params else None,
            )

            status = OrderStatus.FILLED if result.get("status") == "closed" else OrderStatus.SUBMITTED

            order = Order(
                id=result.get("id", str(uuid.uuid4())),
                symbol=symbol,
                side=side,
                order_type=order_type,
                quantity=quantity,
                price=price,
                status=status,
                exchange=self.exchange_id,
                strategy_name="",
                timestamp=datetime.now(),
                filled_price=result.get("average") or result.get("price"),
                filled_quantity=result.get("filled"),
                commission=result.get("fee", {}).get("cost"),
            )

            logger.info(
                f"[{self.exchange_id}] Order placed: {ccxt_side} {quantity} {symbol} "
                f"@ {order.filled_price or price} | Status: {status.value}"
            )
            return order

        except ccxt.InsufficientFunds as e:
            logger.error(f"[{self.exchange_id}] Insufficient funds: {e}")
            return Order(
                id=str(uuid.uuid4()),
                symbol=symbol,
                side=side,
                order_type=order_type,
                quantity=quantity,
                price=price,
                status=OrderStatus.REJECTED,
                exchange=self.exchange_id,
                strategy_name="",
                timestamp=datetime.now(),
            )

        except Exception as e:
            logger.error(f"[{self.exchange_id}] Order failed: {e}")
            return Order(
                id=str(uuid.uuid4()),
                symbol=symbol,
                side=side,
                order_type=order_type,
                quantity=quantity,
                price=price,
                status=OrderStatus.REJECTED,
                exchange=self.exchange_id,
                strategy_name="",
                timestamp=datetime.now(),
            )

    async def cancel_order(self, order_id: str) -> bool:
        if not self.exchange:
            return False
        try:
            await self.exchange.cancel_order(order_id)
            return True
        except Exception as e:
            logger.error(f"Cancel order failed: {e}")
            return False

    async def get_open_orders(self, symbol: Optional[str] = None) -> list[Order]:
        if not self.exchange:
            return []
        raw_orders = await self.exchange.fetch_open_orders(symbol)
        return [
            Order(
                id=o["id"],
                symbol=o["symbol"],
                side=OrderSide.BUY if o["side"] == "buy" else OrderSide.SELL,
                order_type=OrderType.LIMIT if o["type"] == "limit" else OrderType.MARKET,
                quantity=o["amount"],
                price=o.get("price"),
                status=OrderStatus.SUBMITTED,
                exchange=self.exchange_id,
                strategy_name="",
                timestamp=datetime.fromtimestamp(o["timestamp"] / 1000) if o.get("timestamp") else datetime.now(),
            )
            for o in raw_orders
        ]

    async def get_order_book(self, symbol: str, limit: int = 10) -> dict:
        """Get order book for a symbol."""
        if not self.exchange:
            raise ConnectionError("Exchange not connected")
        return await self.exchange.fetch_order_book(symbol, limit)
