"""
FastAPI Dashboard Server

Provides REST API and WebSocket endpoints for:
- Real-time portfolio monitoring
- Trade history and analytics
- Strategy performance metrics
- System health monitoring
- Manual trade execution

Runs on the desktop (port 8000) and is accessed from the laptop dashboard.
"""

import asyncio
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger


class ManualTradeRequest(BaseModel):
    symbol: str
    action: str  # buy, sell, close
    quantity: Optional[float] = None
    price: Optional[float] = None
    exchange: Optional[str] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None


class StrategyToggle(BaseModel):
    strategy_name: str
    enabled: bool


def create_app(engine, config: dict) -> FastAPI:
    """Create the FastAPI application with all routes."""

    app = FastAPI(
        title="Studex Trading Bot API",
        description="Automated Trading Bot Dashboard API",
        version="1.0.0",
    )

    # CORS - allow laptop to connect
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # WebSocket connections for real-time updates
    ws_connections: list[WebSocket] = []

    # ============================================================
    # Health & System
    # ============================================================

    @app.get("/api/health")
    async def health():
        return {
            "status": "running" if engine.is_running else "stopped",
            "regime": engine.current_regime.value,
            "trading_paused": engine._trading_paused,
            "strategies": len(engine.strategies),
            "connectors": len(engine.connectors),
            "timestamp": datetime.now().isoformat(),
        }

    @app.get("/api/system")
    async def system_info():
        return {
            "app_name": config.get("app", {}).get("name", "Studex Trading Bot"),
            "version": config.get("app", {}).get("version", "1.0.0"),
            "environment": config.get("app", {}).get("environment", "paper"),
            "timezone": config.get("app", {}).get("timezone", "Africa/Johannesburg"),
            "strategies": list(engine.strategies.keys()),
            "connectors": list(engine.connectors.keys()),
            "regime": engine.current_regime.value,
        }

    # ============================================================
    # Portfolio
    # ============================================================

    @app.get("/api/portfolio")
    async def get_portfolio():
        portfolio = engine.position_manager.get_portfolio_state()
        return {
            "total_equity": portfolio.total_equity,
            "cash": portfolio.cash,
            "unrealized_pnl": portfolio.unrealized_pnl,
            "realized_pnl": portfolio.realized_pnl,
            "daily_pnl": portfolio.daily_pnl,
            "max_drawdown": portfolio.max_drawdown,
            "exposure_pct": portfolio.exposure_pct,
            "position_count": len(portfolio.positions),
            "timestamp": portfolio.timestamp.isoformat(),
        }

    @app.get("/api/positions")
    async def get_positions():
        portfolio = engine.position_manager.get_portfolio_state()
        return [
            {
                "symbol": p.symbol,
                "side": p.side.value,
                "quantity": p.quantity,
                "entry_price": p.entry_price,
                "current_price": p.current_price,
                "unrealized_pnl": p.unrealized_pnl,
                "pnl_pct": p.pnl_pct,
                "exchange": p.exchange,
                "strategy": p.strategy_name,
                "asset_class": p.asset_class.value,
                "stop_loss": p.stop_loss,
                "take_profit": p.take_profit,
                "opened_at": p.opened_at.isoformat(),
            }
            for p in portfolio.positions
        ]

    # ============================================================
    # Trade History
    # ============================================================

    @app.get("/api/trades")
    async def get_trades(limit: int = 50):
        history = engine.position_manager.trade_history
        return history[-limit:]

    @app.get("/api/trades/stats")
    async def get_trade_stats():
        history = engine.position_manager.trade_history
        if not history:
            return {"total_trades": 0}

        wins = [t for t in history if t["pnl"] > 0]
        losses = [t for t in history if t["pnl"] < 0]

        return {
            "total_trades": len(history),
            "winning_trades": len(wins),
            "losing_trades": len(losses),
            "win_rate": len(wins) / len(history) * 100 if history else 0,
            "total_pnl": sum(t["pnl"] for t in history),
            "avg_win": sum(t["pnl"] for t in wins) / len(wins) if wins else 0,
            "avg_loss": sum(t["pnl"] for t in losses) / len(losses) if losses else 0,
            "best_trade": max(t["pnl"] for t in history) if history else 0,
            "worst_trade": min(t["pnl"] for t in history) if history else 0,
            "avg_hold_hours": sum(t.get("duration_hours", 0) for t in history) / len(history),
        }

    # ============================================================
    # Strategies
    # ============================================================

    @app.get("/api/strategies")
    async def get_strategies():
        return [
            {
                "name": name,
                "enabled": strategy.enabled,
                "last_run": strategy.last_run.isoformat() if strategy.last_run else None,
                "interval_seconds": strategy.run_interval_seconds,
            }
            for name, strategy in engine.strategies.items()
        ]

    @app.post("/api/strategies/toggle")
    async def toggle_strategy(req: StrategyToggle):
        if req.strategy_name not in engine.strategies:
            raise HTTPException(404, f"Strategy '{req.strategy_name}' not found")
        engine.strategies[req.strategy_name].enabled = req.enabled
        return {"status": "ok", "strategy": req.strategy_name, "enabled": req.enabled}

    # ============================================================
    # Manual Trading
    # ============================================================

    @app.post("/api/trade")
    async def manual_trade(req: ManualTradeRequest):
        """Execute a manual trade through the bot."""
        from core.models import Signal, SignalType, AssetClass, TimeFrame

        signal_type = {
            "buy": SignalType.BUY,
            "sell": SignalType.SELL,
            "close": SignalType.CLOSE,
        }.get(req.action.lower())

        if not signal_type:
            raise HTTPException(400, f"Invalid action: {req.action}")

        # Determine asset class
        asset_class = AssetClass.CRYPTO if "/" in req.symbol else AssetClass.JSE_EQUITY

        signal = Signal(
            strategy_name="manual",
            symbol=req.symbol,
            signal_type=signal_type,
            confidence=1.0,
            timestamp=datetime.now(),
            timeframe=TimeFrame.H1,
            asset_class=asset_class,
            entry_price=req.price,
            stop_loss=req.stop_loss,
            take_profit=req.take_profit,
            metadata={"source": "manual", "max_position_pct": 10.0},
        )

        await engine.signals_queue.put(signal)
        return {"status": "signal_submitted", "symbol": req.symbol, "action": req.action}

    # ============================================================
    # Market Data
    # ============================================================

    @app.get("/api/market/{symbol}")
    async def get_market_data(symbol: str, timeframe: str = "1h"):
        """Get market data for a symbol."""
        from core.models import TimeFrame

        tf = TimeFrame(timeframe)

        # Try each connector
        for name, connector in engine.connectors.items():
            try:
                candles = await connector.get_ohlcv(symbol, tf, limit=100)
                if candles:
                    return [
                        {
                            "timestamp": c.timestamp.isoformat(),
                            "open": c.open,
                            "high": c.high,
                            "low": c.low,
                            "close": c.close,
                            "volume": c.volume,
                        }
                        for c in candles
                    ]
            except Exception:
                continue

        raise HTTPException(404, f"No data available for {symbol}")

    # ============================================================
    # WebSocket for Real-time Updates
    # ============================================================

    @app.websocket("/ws")
    async def websocket_endpoint(ws: WebSocket):
        await ws.accept()
        ws_connections.append(ws)
        logger.info(f"[WS] Client connected. Total: {len(ws_connections)}")

        try:
            while True:
                # Send portfolio update every 5 seconds
                portfolio = engine.position_manager.get_portfolio_state()
                await ws.send_json({
                    "type": "portfolio_update",
                    "data": {
                        "total_equity": portfolio.total_equity,
                        "cash": portfolio.cash,
                        "unrealized_pnl": portfolio.unrealized_pnl,
                        "daily_pnl": portfolio.daily_pnl,
                        "position_count": len(portfolio.positions),
                        "regime": engine.current_regime.value,
                        "paused": engine._trading_paused,
                    },
                    "timestamp": datetime.now().isoformat(),
                })
                await asyncio.sleep(5)
        except WebSocketDisconnect:
            ws_connections.remove(ws)
            logger.info(f"[WS] Client disconnected. Total: {len(ws_connections)}")

    return app
