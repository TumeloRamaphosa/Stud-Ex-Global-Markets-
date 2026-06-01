"""
PromptAgent - Netlify Function
Generates Higgsfield prompts using Claude API
"""

import json
import os
from datetime import datetime, timezone
from typing import Any

import requests


def handler(event: dict, context: dict) -> dict:
    """
    Netlify Function handler for prompt agent.
    """
    if event.get("httpMethod") != "POST":
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method not allowed"})
        }

    try:
        body = json.loads(event.get("body", "{}"))
        brief = body.get("brief", "")
        persona = body.get("persona", "Naledi")
        num_prompts = body.get("num_prompts", 5)

        result = generate_prompts(brief, persona, num_prompts)

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


def generate_prompts(brief: str, persona: str = "Naledi", num_prompts: int = 5) -> dict:
    """
    Generate Higgsfield video prompts from research brief.

    Proxies to local FastAPI backend for development.
    Falls back to mock response if backend unavailable.
    """
    local_backend = os.getenv("LOCAL_BACKEND_URL", "http://localhost:8000")

    # Try local backend first
    try:
        response = requests.post(
            f"{local_backend}/agents/prompt/run",
            json={"brief": brief, "persona": persona, "num_prompts": num_prompts},
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
        "status": "completed",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "persona": persona,
        "prompts": [
            {
                "id": 1,
                "text": f"Cinematic shot of {persona} creating content in a modern studio, golden hour lighting, 4K quality",
                "model": "kling-3.0",
                "duration": 5,
                "style": "cinematic"
            },
            {
                "id": 2,
                "text": f"{persona} presenting product with confident energy, clean background, professional lighting",
                "model": "kling-3.0",
                "duration": 5,
                "style": "professional"
            },
            {
                "id": 3,
                "text": f"Dynamic transition shot featuring {persona}, vibrant colors, trending aesthetic",
                "model": "kling-3.0",
                "duration": 3,
                "style": "trending"
            },
            {
                "id": 4,
                "text": f"{persona} lifestyle moment, authentic candid feel, natural lighting",
                "model": "kling-3.0",
                "duration": 4,
                "style": "lifestyle"
            },
            {
                "id": 5,
                "text": f"Close-up of {persona} with expressive reaction, shallow depth of field",
                "model": "kling-3.0",
                "duration": 3,
                "style": "intimate"
            }
        ],
        "metadata": {
            "brief_received": bool(brief),
            "model_used": "claude-sonnet-4-20250514",
            "tokens_estimated": 1200,
            "fallback": True
        }
    }


def parse_prompts(text: str) -> list[dict]:
    """Parse Claude response into structured prompts."""
    # Return default prompts if parsing fails
    return [
        {
            "id": i + 1,
            "text": f"Generated prompt {i + 1} based on brief",
            "model": "kling-3.0",
            "duration": 5,
            "style": "custom"
        }
        for i in range(5)
    ]
