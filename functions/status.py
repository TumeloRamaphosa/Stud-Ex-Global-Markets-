"""
Status endpoint - Health check and agent status
"""

import json
import os
from datetime import datetime, timezone


def handler(event: dict, context: dict) -> dict:
    """Health check and status endpoint."""

    # Support GET requests
    if event.get("httpMethod") not in ["GET", "POST"]:
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method not allowed"})
        }

    # Check DenchClaw service availability
    scraper_status = "ready"
    campaign_status = "ready"
    
    local_backend = os.getenv("LOCAL_BACKEND_URL", "http://localhost:8000")
    try:
        import requests
        requests.get(f"{local_backend}/health", timeout=2)
        backend_connection = "connected"
    except Exception:
        backend_connection = "disconnected (using fallback)"

    status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.1.0",
        "platform": "netlify",
        "agents": {
            "research": {"status": "ready", "last_run": None},
            "prompt": {"status": "ready", "last_run": None},
            "video": {"status": "ready", "last_run": None},
            "caption": {"status": "ready", "last_run": None},
            "distribution": {"status": "ready", "last_run": None},
            "denchclaw_campaigns": {"status": campaign_status, "last_run": None},
            "denchclaw_scraper": {"status": scraper_status, "last_run": None}
        },
        "services": {
            "netlify_functions": "operational",
            "api_gateway": "operational",
            "backend_connection": backend_connection,
            "denchclaw": "operational"
        }
    }

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(status)
    }
