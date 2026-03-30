"""Base exchange connector interface."""

from abc import ABC, abstractmethod
from typing import Optional
from core.models import Order, OrderSide, OrderType, MarketData, TimeFrame


class BaseConnector(ABC):
    """Abstract base class for all exchange connectors."""

    def __init__(self, name: str, config: dict):
        self.name = name
        self.config = config
        self.sandbox = config.get("sandbox", True)

    @abstractmethod
    async def connect(self):
        """Establish connection to the exchange."""
        pass

    @abstractmethod
    async def disconnect(self):
        """Close connection to the exchange."""
        pass

    @abstractmethod
    async def get_balance(self) -> dict:
        """Get account balance."""
        pass

    @abstractmethod
    async def get_current_price(self, symbol: str) -> float:
        """Get current price for a symbol."""
        pass

    @abstractmethod
    async def get_ohlcv(
        self, symbol: str, timeframe: TimeFrame, limit: int = 100
    ) -> list[MarketData]:
        """Get OHLCV candlestick data."""
        pass

    @abstractmethod
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
        """Place an order on the exchange."""
        pass

    @abstractmethod
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an open order."""
        pass

    @abstractmethod
    async def get_open_orders(self, symbol: Optional[str] = None) -> list[Order]:
        """Get all open orders."""
        pass
