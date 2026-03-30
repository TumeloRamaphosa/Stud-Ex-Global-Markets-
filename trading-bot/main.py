"""
Studex Global Markets - Automated Trading Bot
Main Entry Point

Orchestrates all components:
1. Core Trading Engine with risk management
2. Exchange connectors (LUNO, Binance, JSE)
3. Trading strategies (Momentum, Value, Pair, Sentiment)
4. TradingView webhook receiver
5. MiroFish-inspired swarm sentiment analysis
6. Ollama LLM analyst (local GPU)
7. FastAPI dashboard server

Usage:
    python main.py                    # Start with default config
    python main.py --config custom.yaml  # Start with custom config
    python main.py --paper            # Force paper trading mode
    python main.py --dashboard-only   # Only start the dashboard API
"""

import argparse
import asyncio
import os
import signal
import sys
import threading
from pathlib import Path

import yaml
import uvicorn
from dotenv import load_dotenv
from loguru import logger

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from core.engine import TradingEngine
from core.models import AssetClass
from connectors.crypto_connector import CryptoConnector
from connectors.jse_connector import JSEConnector
from connectors.tradingview_webhook import TradingViewWebhook
from strategies.crypto_momentum import CryptoMomentumStrategy
from strategies.jse_value_momentum import JSEValueMomentumStrategy
from strategies.pair_trading import PairTradingStrategy
from sentiment.swarm_engine import SwarmSentimentEngine
from sentiment.llm_analyst import OllamaAnalyst
from api.server import create_app


# ============================================================
# Configuration
# ============================================================

def load_config(config_path: str = None) -> dict:
    """Load configuration from YAML file and environment variables."""
    if config_path is None:
        config_path = Path(__file__).parent / "config" / "settings.yaml"

    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    # Load environment variables
    load_dotenv(Path(__file__).parent / "config" / ".env")

    # Substitute environment variables in config
    _substitute_env_vars(config)

    return config


def _substitute_env_vars(obj):
    """Recursively substitute ${VAR} patterns with environment variables."""
    if isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(value, str) and value.startswith("${") and value.endswith("}"):
                env_var = value[2:-1]
                obj[key] = os.environ.get(env_var, "")
            elif isinstance(value, (dict, list)):
                _substitute_env_vars(value)
    elif isinstance(obj, list):
        for item in obj:
            if isinstance(item, (dict, list)):
                _substitute_env_vars(item)


# ============================================================
# Setup Logging
# ============================================================

def setup_logging(config: dict):
    """Configure loguru logging."""
    log_level = config.get("app", {}).get("log_level", "INFO")

    logger.remove()  # Remove default handler
    logger.add(
        sys.stderr,
        level=log_level,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan> - <level>{message}</level>",
    )

    # File logging
    log_dir = Path(__file__).parent / "data" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)

    logger.add(
        log_dir / "trading_bot_{time:YYYY-MM-DD}.log",
        rotation="1 day",
        retention="30 days",
        level="DEBUG",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name} - {message}",
    )

    logger.add(
        log_dir / "trades_{time:YYYY-MM-DD}.log",
        rotation="1 day",
        retention="90 days",
        level="INFO",
        filter=lambda record: "trade" in record["message"].lower() or "order" in record["message"].lower(),
        format="{time:YYYY-MM-DD HH:mm:ss} | {message}",
    )


# ============================================================
# Main Application
# ============================================================

async def main(config: dict, args):
    """Main application entry point."""
    setup_logging(config)

    logger.info("=" * 60)
    logger.info("  STUDEX GLOBAL MARKETS - AUTOMATED TRADING BOT")
    logger.info(f"  Environment: {config.get('app', {}).get('environment', 'paper')}")
    logger.info(f"  Timezone: {config.get('app', {}).get('timezone', 'Africa/Johannesburg')}")
    logger.info("=" * 60)

    # Force paper trading if flag set
    if args.paper:
        config["app"]["environment"] = "paper"
        for exchange in config.get("exchanges", {}).values():
            if isinstance(exchange, dict):
                exchange["sandbox"] = True
        logger.info("PAPER TRADING MODE FORCED")

    # ---- Initialize Core Engine ----
    engine = TradingEngine(config)

    # ---- Initialize Exchange Connectors ----
    connectors = {}

    # LUNO (South African Crypto)
    luno_config = config.get("exchanges", {}).get("luno", {})
    if luno_config.get("enabled"):
        luno = CryptoConnector("luno", luno_config)
        try:
            await luno.connect()
            engine.register_connector("luno", luno)
            connectors["luno"] = luno
        except Exception as e:
            logger.error(f"LUNO connection failed: {e}")

    # Binance (Global Crypto)
    binance_config = config.get("exchanges", {}).get("binance", {})
    if binance_config.get("enabled"):
        binance = CryptoConnector("binance", binance_config)
        try:
            await binance.connect()
            engine.register_connector("binance", binance)
            connectors["binance"] = binance
        except Exception as e:
            logger.error(f"Binance connection failed: {e}")

    # JSE via EasyEquities
    jse_config = config.get("exchanges", {}).get("easyequities", {})
    if jse_config.get("enabled"):
        jse = JSEConnector(jse_config)
        try:
            await jse.connect()
            engine.register_connector("easyequities", jse)
            connectors["easyequities"] = jse
        except Exception as e:
            logger.error(f"JSE connection failed: {e}")

    # ---- Initialize Ollama LLM Analyst ----
    analyst = OllamaAnalyst(config)
    ollama_ok = await analyst.check_health()
    if ollama_ok:
        logger.info("Ollama LLM analyst connected")
    else:
        logger.warning("Ollama not available - LLM analysis disabled")

    # ---- Initialize Swarm Sentiment Engine ----
    swarm = SwarmSentimentEngine(config)

    # ---- Register Trading Strategies ----
    strategies_config = config.get("strategies", {})

    # Crypto Momentum Strategy
    if strategies_config.get("crypto_momentum", {}).get("enabled"):
        crypto_connector = connectors.get("binance") or connectors.get("luno")
        if crypto_connector:
            crypto_strategy = CryptoMomentumStrategy(
                config=strategies_config["crypto_momentum"],
                connector=crypto_connector,
            )
            # Override symbols based on connector
            if "binance" in connectors:
                crypto_strategy.symbols = config["exchanges"]["binance"].get("default_pairs", [])
            elif "luno" in connectors:
                crypto_strategy.symbols = config["exchanges"]["luno"].get("default_pairs", [])
            engine.register_strategy("crypto_momentum", crypto_strategy)

    # JSE Value + Momentum Strategy
    if strategies_config.get("jse_value_momentum", {}).get("enabled"):
        jse_connector = connectors.get("easyequities")
        if jse_connector:
            jse_strategy = JSEValueMomentumStrategy(
                config=strategies_config["jse_value_momentum"],
                connector=jse_connector,
            )
            engine.register_strategy("jse_value_momentum", jse_strategy)

    # Pair Trading Strategy
    if strategies_config.get("pair_trading", {}).get("enabled"):
        pair_strategy = PairTradingStrategy(
            config=strategies_config["pair_trading"],
            connectors=connectors,
        )
        engine.register_strategy("pair_trading", pair_strategy)

    # ---- Start TradingView Webhook Server ----
    tv_config = config.get("tradingview", {})
    if tv_config.get("webhook", {}).get("enabled"):
        tv_webhook = TradingViewWebhook(tv_config, engine.signals_queue)
        webhook_thread = threading.Thread(target=tv_webhook.run, daemon=True)
        webhook_thread.start()
        logger.info(f"TradingView webhook server running on port {tv_config['webhook']['port']}")

    # ---- Start FastAPI Dashboard Server ----
    if not args.dashboard_only:
        app = create_app(engine, config)
        api_port = config.get("hardware", {}).get("desktop", {}).get("api_port", 8000)

        api_config = uvicorn.Config(
            app,
            host="0.0.0.0",
            port=api_port,
            log_level="warning",
        )
        api_server = uvicorn.Server(api_config)
        api_task = asyncio.create_task(api_server.serve())
        logger.info(f"Dashboard API running on port {api_port}")

    # ---- Run Morning Briefing ----
    if ollama_ok:
        portfolio = engine.position_manager.get_portfolio_state()
        briefing = await analyst.generate_daily_briefing(
            portfolio={
                "total_equity": portfolio.total_equity,
                "cash": portfolio.cash,
                "position_count": len(portfolio.positions),
                "daily_pnl": portfolio.daily_pnl,
                "unrealized_pnl": portfolio.unrealized_pnl,
            },
            market_data={"note": "Initial startup - no market data yet"},
        )
        logger.info(f"\n{'='*60}\nMORNING BRIEFING:\n{briefing}\n{'='*60}")

    # ---- Start Trading Engine ----
    logger.info("Starting trading engine...")

    # Graceful shutdown handler
    def shutdown_handler(sig, frame):
        logger.info("Shutdown signal received...")
        asyncio.get_event_loop().create_task(engine.stop())

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    try:
        await engine.start()
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    finally:
        # Cleanup
        logger.info("Shutting down connectors...")
        for name, connector in connectors.items():
            try:
                await connector.disconnect()
            except Exception as e:
                logger.error(f"Error disconnecting {name}: {e}")

        logger.info("Studex Trading Bot stopped.")


# ============================================================
# Entry Point
# ============================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Studex Global Markets Trading Bot")
    parser.add_argument("--config", type=str, help="Path to config YAML file")
    parser.add_argument("--paper", action="store_true", help="Force paper trading mode")
    parser.add_argument("--dashboard-only", action="store_true", help="Only start dashboard API")
    args = parser.parse_args()

    config = load_config(args.config)
    asyncio.run(main(config, args))
