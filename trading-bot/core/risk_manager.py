"""
Risk Manager - Portfolio risk management and position sizing.
Implements methodologies from Claude Trading Skills:
- Fixed Fractional sizing
- ATR-based sizing
- Kelly Criterion
- Exposure Coach limits
"""

import math
from loguru import logger

from core.models import (
    AssetClass,
    PortfolioState,
    Signal,
    SignalType,
)


class RiskManager:
    """Manages portfolio risk, position sizing, and exposure limits."""

    def __init__(self, config: dict):
        self.max_portfolio_risk_pct = config.get("max_portfolio_risk_pct", 2.0)
        self.max_daily_loss_pct = config.get("max_daily_loss_pct", 5.0)
        self.max_open_positions = config.get("max_open_positions", 10)
        self.max_correlated = config.get("max_correlated_positions", 3)
        self.max_drawdown_pct = config.get("max_drawdown_pct", 15.0)

        exposure = config.get("exposure", {})
        self.max_equity_exposure = exposure.get("max_equity_exposure", 80)
        self.max_crypto_exposure = exposure.get("max_crypto_exposure", 30)
        self.min_cash_reserve = exposure.get("min_cash_reserve", 10)

        sizing = config.get("position_sizing", {})
        self.sizing_method = sizing.get("method", "fixed_fractional")
        self.fixed_risk_pct = sizing.get("fixed_risk_pct", 1.0)
        self.kelly_fraction = sizing.get("kelly_fraction", 0.25)

    def check_signal(self, signal: Signal, portfolio: PortfolioState) -> dict:
        """
        Run all risk checks on a signal before allowing execution.
        Returns dict with 'allowed' bool and 'reason' string.
        """
        # Close signals always allowed
        if signal.signal_type in (SignalType.SELL, SignalType.CLOSE):
            return {"allowed": True, "reason": "close/sell always allowed"}

        # Check max open positions
        if len(portfolio.positions) >= self.max_open_positions:
            return {"allowed": False, "reason": f"Max open positions ({self.max_open_positions}) reached"}

        # Check if already holding this symbol
        for pos in portfolio.positions:
            if pos.symbol == signal.symbol:
                return {"allowed": False, "reason": f"Already holding position in {signal.symbol}"}

        # Check cash reserve
        if portfolio.total_equity > 0:
            cash_pct = (portfolio.cash / portfolio.total_equity) * 100
            if cash_pct <= self.min_cash_reserve:
                return {"allowed": False, "reason": f"Cash reserve too low ({cash_pct:.1f}%)"}

        # Check asset class exposure limits
        exposure = self._get_asset_exposure(portfolio, signal.asset_class)
        max_exposure = self._get_max_exposure(signal.asset_class)
        if exposure >= max_exposure:
            return {
                "allowed": False,
                "reason": f"{signal.asset_class.value} exposure ({exposure:.1f}%) at limit ({max_exposure}%)",
            }

        # Check max drawdown
        if portfolio.max_drawdown >= self.max_drawdown_pct:
            return {"allowed": False, "reason": f"Max drawdown ({portfolio.max_drawdown:.1f}%) breached"}

        # Check daily loss
        if portfolio.total_equity > 0 and portfolio.daily_pnl < 0:
            daily_loss_pct = abs(portfolio.daily_pnl / portfolio.total_equity * 100)
            if daily_loss_pct >= self.max_daily_loss_pct:
                return {"allowed": False, "reason": f"Daily loss limit ({daily_loss_pct:.1f}%) reached"}

        # Minimum confidence threshold
        if signal.confidence < 0.5:
            return {"allowed": False, "reason": f"Signal confidence too low ({signal.confidence:.2f})"}

        return {"allowed": True, "reason": "all checks passed"}

    def calculate_position_size(
        self,
        signal: Signal,
        portfolio: PortfolioState,
        method: str = None,
    ) -> float:
        """
        Calculate position size based on the selected method.

        Methods:
        - fixed_fractional: Risk a fixed % of portfolio per trade
        - atr: Size based on ATR for volatility-adjusted risk
        - kelly: Kelly Criterion (fraction for safety)
        """
        method = method or self.sizing_method

        if method == "fixed_fractional":
            return self._fixed_fractional_size(signal, portfolio)
        elif method == "atr":
            return self._atr_based_size(signal, portfolio)
        elif method == "kelly":
            return self._kelly_size(signal, portfolio)
        else:
            return self._fixed_fractional_size(signal, portfolio)

    def _fixed_fractional_size(self, signal: Signal, portfolio: PortfolioState) -> float:
        """
        Fixed fractional position sizing.
        Risk amount = portfolio * risk_pct
        Position size = risk_amount / (entry - stop_loss)
        """
        risk_amount = portfolio.total_equity * (self.fixed_risk_pct / 100)

        if signal.entry_price and signal.stop_loss and signal.entry_price != signal.stop_loss:
            risk_per_unit = abs(signal.entry_price - signal.stop_loss)
            size = risk_amount / risk_per_unit
        else:
            # Default to risking fixed_risk_pct of equity at entry price
            if signal.entry_price and signal.entry_price > 0:
                size = risk_amount / signal.entry_price
            else:
                size = 0.0

        return self._apply_position_limits(size, signal, portfolio)

    def _atr_based_size(self, signal: Signal, portfolio: PortfolioState) -> float:
        """
        ATR-based position sizing.
        Uses ATR from signal metadata for volatility-adjusted sizing.
        Position size = risk_amount / (ATR * multiplier)
        """
        atr = signal.metadata.get("atr", 0)
        atr_multiplier = signal.metadata.get("atr_multiplier", 2.0)

        if atr <= 0:
            return self._fixed_fractional_size(signal, portfolio)

        risk_amount = portfolio.total_equity * (self.fixed_risk_pct / 100)
        risk_per_unit = atr * atr_multiplier
        size = risk_amount / risk_per_unit

        return self._apply_position_limits(size, signal, portfolio)

    def _kelly_size(self, signal: Signal, portfolio: PortfolioState) -> float:
        """
        Kelly Criterion position sizing (quarter-Kelly for safety).
        f* = (bp - q) / b
        where: b = win/loss ratio, p = win probability, q = 1-p
        """
        win_rate = signal.metadata.get("win_rate", 0.5)
        avg_win = signal.metadata.get("avg_win", 1.0)
        avg_loss = signal.metadata.get("avg_loss", 1.0)

        if avg_loss == 0:
            return self._fixed_fractional_size(signal, portfolio)

        b = avg_win / avg_loss  # Payoff ratio
        p = win_rate
        q = 1 - p

        kelly_pct = (b * p - q) / b

        if kelly_pct <= 0:
            return 0.0  # Negative Kelly = don't trade

        # Apply fraction (quarter-Kelly)
        adjusted_pct = kelly_pct * self.kelly_fraction
        risk_amount = portfolio.total_equity * adjusted_pct

        if signal.entry_price and signal.entry_price > 0:
            size = risk_amount / signal.entry_price
        else:
            size = 0.0

        return self._apply_position_limits(size, signal, portfolio)

    def _apply_position_limits(
        self, size: float, signal: Signal, portfolio: PortfolioState
    ) -> float:
        """Apply maximum position size limits."""
        if size <= 0 or not signal.entry_price:
            return 0.0

        position_value = size * signal.entry_price
        max_position_pct = signal.metadata.get("max_position_pct", 5.0)
        max_position_value = portfolio.total_equity * (max_position_pct / 100)

        if position_value > max_position_value:
            size = max_position_value / signal.entry_price

        # Ensure we have enough cash
        if position_value > portfolio.cash:
            size = portfolio.cash / signal.entry_price * 0.95  # 95% of available cash

        return max(0.0, math.floor(size * 100000) / 100000)  # Round down to 5 decimal places

    def _get_asset_exposure(self, portfolio: PortfolioState, asset_class: AssetClass) -> float:
        if portfolio.total_equity == 0:
            return 0.0
        value = sum(
            p.quantity * p.current_price
            for p in portfolio.positions
            if p.asset_class == asset_class
        )
        return (value / portfolio.total_equity) * 100

    def _get_max_exposure(self, asset_class: AssetClass) -> float:
        if asset_class == AssetClass.CRYPTO:
            return self.max_crypto_exposure
        return self.max_equity_exposure
