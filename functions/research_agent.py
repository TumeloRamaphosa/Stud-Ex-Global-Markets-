"""
ResearchAgent - Netlify Function
Runs research queries using Gemini API
"""

import json
import os
from datetime import datetime, timezone
from typing import Any

import requests


def handler(event: dict, context: dict) -> dict:
    """
    Netlify Function handler for research agent.

    Args:
        event: HTTP event with method, headers, body
        context: Runtime context

    Returns:
        HTTP response dict
    """
    # Only handle POST requests
    if event.get("httpMethod") != "POST":
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method not allowed"})
        }

    try:
        # Parse request body
        body = json.loads(event.get("body", "{}"))
        topic = body.get("topic", "AI trends")
        keywords = body.get("keywords", [])

        # Run research
        result = run_research(topic, keywords)

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(result)
        }

    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid JSON"})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }


def run_research(topic: str, keywords: list[str] = None) -> dict:
    """
    Run research using local FastAPI backend.

    Proxies to local backend for development.
    Falls back to mock response if backend unavailable.
    """
    local_backend = os.getenv("LOCAL_BACKEND_URL", "http://localhost:8000")

    # Try local backend first
    try:
        response = requests.post(
            f"{local_backend}/agents/research/run",
            json={"topic": topic, "keywords": keywords or []},
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        result["source"] = "local_backend"
        return result
    except Exception:
        # Backend not available, use mock
        pass

    # Mock response for development/testing
    return {
        "topic": topic,
        "keywords": keywords or [],
        "status": "completed",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "findings": [
            {
                "title": f"Research on {topic}",
                "summary": "Mock finding - start local backend at localhost:8000 for real results",
                "sources": [],
                "relevance_score": 0.95
            }
        ],
        "recommendations": [
            "Create content around this topic",
            "Check competitor activity",
            "Monitor engagement metrics"
        ],
        "fallback": True
    }


def parse_findings(text: str) -> list[dict]:
    """Parse Gemini response into structured findings."""
    # Simple parsing - in production use proper JSON extraction
    return [
        {
            "title": "AI Content Trends 2026",
            "summary": text[:500] + "..." if len(text) > 500 else text,
            "sources": [],
            "relevance_score": 0.9
        }
    ]
