"""Tests for quote_agent function."""

import json
import pytest
from functions.quote_agent import handler, generate_quote


class TestQuoteAgent:
    """Test quote agent operations."""

    def test_generate_quote_basic(self):
        """Test basic quote generation."""
        requirements = [
            {"feature": "landing_page", "complexity": "simple"},
            {"feature": "auth", "complexity": "medium"}
        ]
        
        quote = generate_quote(requirements)
        
        assert quote["status"] == "generated"
        assert quote["total_price_zar"] == 2500 + 1500 + 4000
        assert len(quote["line_items"]) == 2
        assert quote["currency"] == "ZAR"

    def test_generate_quote_rush(self):
        """Test quote generation with rush fee."""
        requirements = [
            {"feature": "landing_page", "complexity": "simple"}
        ]
        
        quote = generate_quote(requirements, is_rush=True)
        
        base_price = 2500 + 1500
        rush_fee = int(base_price * 0.3)
        assert quote["total_price_zar"] == base_price + rush_fee
        assert any(item["feature"] == "Rush Fee (30%)" for item in quote["line_items"])

    def test_handler_post(self):
        """Test handler with valid POST request."""
        body = {
            "requirements": [
                {"feature": "landing_page", "complexity": "simple"}
            ],
            "is_rush": False
        }
        
        event = {
            "httpMethod": "POST",
            "body": json.dumps(body)
        }
        
        response = handler(event, {})
        
        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert data["status"] == "generated"
        assert "quote_id" in data

    def test_handler_options(self):
        """Test handler with OPTIONS request (CORS)."""
        event = {
            "httpMethod": "OPTIONS"
        }
        
        response = handler(event, {})
        
        assert response["statusCode"] == 200
        assert response["headers"]["Access-Control-Allow-Origin"] == "*"

    def test_handler_invalid_method(self):
        """Test handler with invalid method."""
        event = {
            "httpMethod": "GET"
        }
        
        response = handler(event, {})
        
        assert response["statusCode"] == 405

    def test_handler_invalid_json(self):
        """Test handler with invalid JSON body."""
        event = {
            "httpMethod": "POST",
            "body": "invalid json"
        }
        
        response = handler(event, {})
        
        assert response["statusCode"] == 400
