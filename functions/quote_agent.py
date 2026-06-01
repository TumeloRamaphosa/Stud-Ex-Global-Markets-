"""
QuoteAgent - Netlify Function
Generates instant quotes for Naledi AI Software Factory
"""

import json
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any

import requests

# Pricing table from doc/ai-software-factory-workflow.md
PRICING_TABLE = {
    "landing_page": {"simple": 1500, "medium": 3000, "complex": 6000},
    "auth": {"simple": 2000, "medium": 4000, "complex": 8000},
    "dashboard": {"simple": 3000, "medium": 6000, "complex": 12000},
    "payment_gateway": {"simple": 2500, "medium": 5000, "complex": 10000},
    "booking": {"simple": 2000, "medium": 4500, "complex": 9000},
    "cms": {"simple": 1500, "medium": 3500, "complex": 7000},
    "ecommerce": {"simple": 3000, "medium": 7000, "complex": 15000},
    "mobile_app": {"simple": 4000, "medium": 10000, "complex": 25000},
    "ai_chatbot": {"simple": 2000, "medium": 5000, "complex": 12000},
    "api_webhooks": {"simple": 1500, "medium": 4000, "complex": 9000},
}

BASE_PLATFORM_FEE = 2500


def handler(event: dict, context: dict) -> dict:
    """Netlify Function handler for quote agent."""
    
    method = event.get("httpMethod", "GET")
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }
    
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}
        
    if method != "POST":
        return {
            "statusCode": 405,
            "headers": headers,
            "body": json.dumps({"error": "Method not allowed"})
        }

    try:
        body = json.loads(event.get("body", "{}"))
        requirements = body.get("requirements", [])
        is_rush = body.get("is_rush", False)
        
        result = generate_quote(requirements, is_rush)

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(result)
        }

    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Invalid JSON"})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)})
        }


def generate_quote(requirements: List[Dict[str, Any]], is_rush: bool = False) -> dict:
    """
    Generate a structured quote based on requirements.
    
    Proxies to local backend if available, otherwise calculates locally.
    """
    local_backend = os.getenv("LOCAL_BACKEND_URL", "http://localhost:8000")

    try:
        response = requests.post(
            f"{local_backend}/agents/quote/run",
            json={"requirements": requirements, "is_rush": is_rush},
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        result["source"] = "local_backend"
        return result
    except Exception:
        # Fallback to local calculation
        pass

    line_items = []
    total_price = BASE_PLATFORM_FEE
    total_days = 2 # Base setup days

    for req in requirements:
        feature = req.get("feature")
        complexity = req.get("complexity", "medium")
        
        if feature in PRICING_TABLE:
            price = PRICING_TABLE[feature].get(complexity, PRICING_TABLE[feature]["medium"])
            
            # Days estimate (rough approximation)
            days = 1
            if complexity == "medium": days = 2
            if complexity == "complex": days = 4
            
            line_items.append({
                "feature": feature.replace("_", " ").title(),
                "complexity": complexity,
                "price": price,
                "estimated_days": days
            })
            total_price += price
            total_days += days

    if is_rush:
        rush_fee = int(total_price * 0.3)
        line_items.append({
            "feature": "Rush Fee (30%)",
            "complexity": "n/a",
            "price": rush_fee,
            "estimated_days": -1 # Reduces timeline
        })
        total_price += rush_fee
        total_days = max(2, int(total_days * 0.7))

    return {
        "quote_id": str(uuid.uuid4()),
        "status": "generated",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_price_zar": total_price,
        "estimated_delivery_days": total_days,
        "line_items": line_items,
        "currency": "ZAR",
        "milestones": [
            {"name": "Deposit (30%)", "amount": int(total_price * 0.3)},
            {"name": "Build Complete (40%)", "amount": int(total_price * 0.4)},
            {"name": "Final Delivery (30%)", "amount": int(total_price * 0.3)}
        ],
        "metadata": {
            "source": "mock_engine",
            "version": "1.0.0"
        }
    }
