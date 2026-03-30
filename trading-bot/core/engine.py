"""
Core Trading Engine - The Brain
Orchestrates all trading strategies, risk management, and order execution.
Inspired by Claude Trading Skills' systematic approach.
"""

import asyncio
from datetime import datetime, timedelta
from typing import Optional

import pytz
from loguru import logger

from core.models import (
    AssetClass,
    MarketRegime,
    Order,
    OrderSide,
    OrderStatus,
    OrderType,
    PortfolioState,
    Position,
    Signal,
    SignalType,
)
from core.risk_manager import RiskManager
from core.position_manager import PositionManager


class TradingEngine:
    """
    Main trading engine that coordinates:
    1. Market regime detection (macro-first, Druckenmiller-style)
    2. Strategy signal generation
    3. Risk management & position sizing
    4. Order execution via exchange connectors
    5. Portfolio monitoring & exposure management
    """

    def __init__(self, config: dict):
        self.config = config
        self.risk_manager = RiskManager(config.get("risk", {}))
        self.position_manager = PositionManager()
        self.strategies: dict = {}
        self.connectors: dict = {}
        self.current_regime = MarketRegime.TRANSITIONAL
        self.is_running = False
        self.signals_queue: asyncio.Queue = asyncio.Queue()
        self.tz = pytz.timezone(config.get("app", {}).get("timezone", "Africa/Johannesburg"))
        self._daily_pnl = 0.0
        self._trading_paused = False
        logger.info("Trading Engine initialized")

    def register_strategy(self, name: str, strategy):
        """Register a trading strategy with the engine."""
        self.strategies[name] = strategy
        logger.info(f"Strategy registered: {name}")

    def register_connector(self, name: str, connector):
        """Register an exchange connector."""
        self.connectors[name] = connector
        logger.info(f"Connector registered: {name}")

    async def start(self):
        """Start the trading engine main loop."""
        self.is_running = True
        logger.info("Trading Engine starting...")

        # Start all tasks concurrently
        tasks = [
            asyncio.create_task(self._signal_processing_loop()),
            asyncio.create_task(self._portfolio_monitoring_loop()),
            asyncio.create_task(self._risk_monitoring_loop()),
            asyncio.create_task(self._strategy_execution_loop()),
        ]

        try:
            await asyncio.gather(*tasks)
        except asyncio.CancelledError:
            logger.info("Trading Engine shutting down...")
        finally:
            self.is_running = False

    async def stop(self):
        """Gracefully stop the trading engine."""
        logger.info("Stopping Trading Engine...")
        self.is_running = False

    async def _strategy_execution_loop(self):
        """Run all registered strategies on their schedules."""
        while self.is_running:
            if self._trading_paused:
                logger.warning("Trading paused due to risk limits")
                await asyncio.sleep(60)
                continue

            for name, strategy in self.strategies.items():
                try:
                    if strategy.should_run():
                        signals = await strategy.generate_signals()
                        for signal in signals:
                            await self.signals_queue.put(signal)
                            logger.info(
                                f"Signal from {name}: {signal.signal_type.value} "
                                f"{signal.symbol} @ confidence {signal.confidence:.2f}"
                            )
                except Exception as e:
                    logger.error(f"Strategy {name} error: {e}")

            await asyncio.sleep(10)  # Check strategies every 10 seconds

    async def _signal_processing_loop(self):
        """Process signals from the queue, apply risk management, and execute."""
        while self.is_running:
            try:
                signal = await asyncio.wait_for(self.signals_queue.get(), timeout=5.0)
                await self._process_signal(signal)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Signal processing error: {e}")

    async def _process_signal(self, signal: Signal):
        """
        Process a trading signal through the risk management pipeline.
        Follows Claude Trading Skills' Exposure Coach methodology:
        1. Check regime allows new entries
        2. Check portfolio risk limits
        3. Calculate position size
        4. Execute order
        """
        logger.info(f"Processing signal: {signal.strategy_name} → {signal.signal_type.value} {signal.symbol}")

        # Step 1: Regime filter - don't open new positions in contraction
        if signal.signal_type == SignalType.BUY:
            if self.current_regime == MarketRegime.CONTRACTION:
                logger.warning(f"Signal rejected: Market in CONTRACTION regime")
                return

        # Step 2: Check risk limits
        portfolio = self.position_manager.get_portfolio_state()
        risk_check = self.risk_manager.check_signal(signal, portfolio)

        if not risk_check["allowed"]:
            logger.warning(f"Signal rejected by risk manager: {risk_check['reason']}")
            return

        # Step 3: Calculate position size
        position_size = self.risk_manager.calculate_position_size(
            signal=signal,
            portfolio=portfolio,
            method=self.config.get("risk", {}).get("position_sizing", {}).get("method", "fixed_fractional"),
        )

        if position_size <= 0:
            logger.warning("Position size is 0, skipping signal")
            return

        # Step 4: Determine which connector to use
        connector = self._get_connector_for_asset(signal.asset_class)
        if not connector:
            logger.error(f"No connector available for {signal.asset_class.value}")
            return

        # Step 5: Execute order
        order = await self._execute_order(
            connector=connector,
            signal=signal,
            quantity=position_size,
        )

        if order and order.status in (OrderStatus.FILLED, OrderStatus.SUBMITTED):
            logger.info(
                f"Order executed: {order.side.value} {order.quantity} {signal.symbol} "
                f"via {order.exchange}"
            )

    async def _execute_order(
        self, connector, signal: Signal, quantity: float
    ) -> Optional[Order]:
        """Execute an order through the appropriate exchange connector."""
        try:
            side = OrderSide.BUY if signal.signal_type == SignalType.BUY else OrderSide.SELL

            # Use market orders for simplicity; limit orders for less liquid JSE stocks
            order_type = OrderType.MARKET
            if signal.asset_class == AssetClass.JSE_EQUITY:
                order_type = OrderType.LIMIT

            order = await connector.place_order(
                symbol=signal.symbol,
                side=side,
                order_type=order_type,
                quantity=quantity,
                price=signal.entry_price,
                stop_loss=signal.stop_loss,
                take_profit=signal.take_profit,
            )

            # Track position
            if order.status == OrderStatus.FILLED:
                self.position_manager.open_position(
                    symbol=signal.symbol,
                    side=side,
                    quantity=quantity,
                    entry_price=order.filled_price or signal.entry_price,
                    exchange=connector.name,
                    strategy_name=signal.strategy_name,
                    asset_class=signal.asset_class,
                    stop_loss=signal.stop_loss,
                    take_profit=signal.take_profit,
                )

            return order

        except Exception as e:
            logger.error(f"Order execution failed: {e}")
            return None

    def _get_connector_for_asset(self, asset_class: AssetClass):
        """Route to the correct exchange connector based on asset class."""
        if asset_class == AssetClass.CRYPTO:
            # Prefer LUNO for ZAR pairs, Binance for USDT pairs
            return self.connectors.get("luno") or self.connectors.get("binance")
        elif asset_class == AssetClass.JSE_EQUITY:
            return self.connectors.get("easyequities")
        elif asset_class == AssetClass.US_EQUITY:
            return self.connectors.get("binance")  # For tokenized stocks
        return None

    async def _portfolio_monitoring_loop(self):
        """Monitor portfolio and update positions with live prices."""
        while self.is_running:
            try:
                for name, connector in self.connectors.items():
                    positions = self.position_manager.get_positions_by_exchange(name)
                    for pos in positions:
                        try:
                            price = await connector.get_current_price(pos.symbol)
                            self.position_manager.update_price(pos.symbol, price)

                            # Check stop loss / take profit
                            if pos.stop_loss and price <= pos.stop_loss:
                                logger.warning(f"STOP LOSS triggered for {pos.symbol} @ {price}")
                                signal = Signal(
                                    strategy_name=pos.strategy_name,
                                    symbol=pos.symbol,
                                    signal_type=SignalType.CLOSE,
                                    confidence=1.0,
                                    timestamp=datetime.now(self.tz),
                                    timeframe=pos.asset_class,
                                    asset_class=pos.asset_class,
                                )
                                await self.signals_queue.put(signal)

                            if pos.take_profit and price >= pos.take_profit:
                                logger.info(f"TAKE PROFIT triggered for {pos.symbol} @ {price}")
                                signal = Signal(
                                    strategy_name=pos.strategy_name,
                                    symbol=pos.symbol,
                                    signal_type=SignalType.CLOSE,
                                    confidence=1.0,
                                    timestamp=datetime.now(self.tz),
                                    timeframe=pos.asset_class,
                                    asset_class=pos.asset_class,
                                )
                                await self.signals_queue.put(signal)
                        except Exception as e:
                            logger.error(f"Price update error for {pos.symbol}: {e}")

            except Exception as e:
                logger.error(f"Portfolio monitoring error: {e}")

            await asyncio.sleep(30)  # Update every 30 seconds

    async def _risk_monitoring_loop(self):
        """
        Continuous risk monitoring - the safety net.
        Implements Claude Trading Skills' risk management:
        - Daily loss limit
        - Max drawdown circuit breaker
        - Exposure limits
        """
        while self.is_running:
            try:
                portfolio = self.position_manager.get_portfolio_state()

                # Check daily loss limit
                daily_loss_limit = self.config.get("risk", {}).get("max_daily_loss_pct", 5.0)
                if portfolio.total_equity > 0:
                    daily_loss_pct = abs(portfolio.daily_pnl / portfolio.total_equity * 100)
                    if portfolio.daily_pnl < 0 and daily_loss_pct >= daily_loss_limit:
                        self._trading_paused = True
                        logger.critical(
                            f"DAILY LOSS LIMIT HIT: {daily_loss_pct:.2f}% "
                            f"(limit: {daily_loss_limit}%). Trading paused."
                        )

                # Check max drawdown
                max_dd = self.config.get("risk", {}).get("max_drawdown_pct", 15.0)
                if portfolio.max_drawdown >= max_dd:
                    self._trading_paused = True
                    logger.critical(
                        f"MAX DRAWDOWN BREACHED: {portfolio.max_drawdown:.2f}% "
                        f"(limit: {max_dd}%). All trading suspended."
                    )

                # Check exposure limits
                crypto_exposure = self._calculate_asset_exposure(portfolio, AssetClass.CRYPTO)
                max_crypto = self.config.get("risk", {}).get("exposure", {}).get("max_crypto_exposure", 30)
                if crypto_exposure > max_crypto:
                    logger.warning(
                        f"Crypto exposure {crypto_exposure:.1f}% exceeds limit {max_crypto}%"
                    )

                # Reset daily PnL at midnight SAST
                now = datetime.now(self.tz)
                if now.hour == 0 and now.minute < 2:
                    self._daily_pnl = 0.0
                    if self._trading_paused:
                        self._trading_paused = False
                        logger.info("Daily loss limit reset. Trading resumed.")

            except Exception as e:
                logger.error(f"Risk monitoring error: {e}")

            await asyncio.sleep(60)  # Check every minute

    def _calculate_asset_exposure(self, portfolio: PortfolioState, asset_class: AssetClass) -> float:
        """Calculate exposure percentage for a specific asset class."""
        if portfolio.total_equity == 0:
            return 0.0
        asset_value = sum(
            p.quantity * p.current_price
            for p in portfolio.positions
            if p.asset_class == asset_class
        )
        return (asset_value / portfolio.total_equity) * 100

    def update_regime(self, regime: MarketRegime):
        """Update current market regime (called by regime detection strategy)."""
        if regime != self.current_regime:
            logger.info(f"Market regime changed: {self.current_regime.value} → {regime.value}")
            self.current_regime = regime
