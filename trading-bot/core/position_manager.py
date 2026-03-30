"""
Position Manager - Track and manage all open positions.
"""

from datetime import datetime
from typing import Optional
from loguru import logger

from core.models import (
    AssetClass,
    OrderSide,
    Position,
    PortfolioState,
)


class PositionManager:
    """Manages all open positions and portfolio state."""

    def __init__(self, initial_capital: float = 100000.0):
        self.positions: dict[str, Position] = {}
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.realized_pnl = 0.0
        self.peak_equity = initial_capital
        self.daily_start_equity = initial_capital
        self._trade_history: list[dict] = []

    def open_position(
        self,
        symbol: str,
        side: OrderSide,
        quantity: float,
        entry_price: float,
        exchange: str,
        strategy_name: str,
        asset_class: AssetClass,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None,
    ) -> Position:
        """Open a new position."""
        cost = quantity * entry_price
        if cost > self.cash:
            logger.warning(f"Insufficient cash for {symbol}: need {cost}, have {self.cash}")
            quantity = self.cash / entry_price * 0.95
            cost = quantity * entry_price

        self.cash -= cost

        position = Position(
            symbol=symbol,
            side=side,
            quantity=quantity,
            entry_price=entry_price,
            current_price=entry_price,
            unrealized_pnl=0.0,
            realized_pnl=0.0,
            exchange=exchange,
            strategy_name=strategy_name,
            asset_class=asset_class,
            stop_loss=stop_loss,
            take_profit=take_profit,
        )

        self.positions[symbol] = position
        logger.info(
            f"Position opened: {side.value} {quantity:.6f} {symbol} @ {entry_price} "
            f"(SL: {stop_loss}, TP: {take_profit})"
        )
        return position

    def close_position(self, symbol: str, exit_price: float) -> Optional[dict]:
        """Close a position and record the trade."""
        if symbol not in self.positions:
            logger.warning(f"No open position for {symbol}")
            return None

        pos = self.positions[symbol]
        proceeds = pos.quantity * exit_price

        if pos.side == OrderSide.BUY:
            pnl = (exit_price - pos.entry_price) * pos.quantity
        else:
            pnl = (pos.entry_price - exit_price) * pos.quantity

        self.cash += proceeds
        self.realized_pnl += pnl

        trade_record = {
            "symbol": symbol,
            "side": pos.side.value,
            "quantity": pos.quantity,
            "entry_price": pos.entry_price,
            "exit_price": exit_price,
            "pnl": pnl,
            "pnl_pct": pos.pnl_pct,
            "strategy": pos.strategy_name,
            "exchange": pos.exchange,
            "opened_at": pos.opened_at.isoformat(),
            "closed_at": datetime.now().isoformat(),
            "duration_hours": (datetime.now() - pos.opened_at).total_seconds() / 3600,
        }
        self._trade_history.append(trade_record)

        del self.positions[symbol]
        logger.info(
            f"Position closed: {symbol} @ {exit_price} | PnL: {pnl:+.2f} ({pos.pnl_pct:+.2f}%)"
        )
        return trade_record

    def update_price(self, symbol: str, current_price: float):
        """Update the current price for a position."""
        if symbol in self.positions:
            pos = self.positions[symbol]
            pos.current_price = current_price
            if pos.side == OrderSide.BUY:
                pos.unrealized_pnl = (current_price - pos.entry_price) * pos.quantity
            else:
                pos.unrealized_pnl = (pos.entry_price - current_price) * pos.quantity

    def get_positions_by_exchange(self, exchange: str) -> list[Position]:
        return [p for p in self.positions.values() if p.exchange == exchange]

    def get_positions_by_strategy(self, strategy: str) -> list[Position]:
        return [p for p in self.positions.values() if p.strategy_name == strategy]

    def get_portfolio_state(self) -> PortfolioState:
        """Get current portfolio state snapshot."""
        unrealized = sum(p.unrealized_pnl for p in self.positions.values())
        position_value = sum(p.quantity * p.current_price for p in self.positions.values())
        total_equity = self.cash + position_value

        # Track peak for drawdown calculation
        if total_equity > self.peak_equity:
            self.peak_equity = total_equity

        max_drawdown = 0.0
        if self.peak_equity > 0:
            max_drawdown = ((self.peak_equity - total_equity) / self.peak_equity) * 100

        daily_pnl = total_equity - self.daily_start_equity

        return PortfolioState(
            total_equity=total_equity,
            cash=self.cash,
            positions=list(self.positions.values()),
            unrealized_pnl=unrealized,
            realized_pnl=self.realized_pnl,
            daily_pnl=daily_pnl,
            max_drawdown=max_drawdown,
            timestamp=datetime.now(),
        )

    def reset_daily_pnl(self):
        """Reset daily P&L tracking (call at market open)."""
        portfolio = self.get_portfolio_state()
        self.daily_start_equity = portfolio.total_equity

    @property
    def trade_history(self) -> list[dict]:
        return self._trade_history
