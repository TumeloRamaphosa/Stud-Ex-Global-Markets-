"""
Tests for Status Netlify Function
"""

import json
import pytest
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'functions'))

from status import handler


class TestStatusHandler:
    """Test the status function handler."""

    def test_get_request(self):
        """Test that GET requests return status."""
        event = {"httpMethod": "GET"}
        context = {}

        response = handler(event, context)

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["status"] == "healthy"
        assert "timestamp" in body
        assert "version" in body
        assert "agents" in body
        assert "services" in body

    def test_post_request(self):
        """Test that POST requests also return status."""
        event = {"httpMethod": "POST"}
        context = {}

        response = handler(event, context)

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["status"] == "healthy"

    def test_method_not_allowed(self):
        """Test that other methods are rejected."""
        for method in ["PUT", "DELETE", "PATCH"]:
            event = {"httpMethod": method}
            context = {}

            response = handler(event, context)

            assert response["statusCode"] == 405
            body = json.loads(response["body"])
            assert body["error"] == "Method not allowed"

    def test_status_structure(self):
        """Test that status response has correct structure."""
        event = {"httpMethod": "GET"}
        context = {}

        response = handler(event, context)
        body = json.loads(response["body"])

        # Required top-level fields
        assert "status" in body
        assert "timestamp" in body
        assert "version" in body
        assert "platform" in body
        assert "agents" in body
        assert "services" in body

        # Platform should be netlify
        assert body["platform"] == "netlify"

    def test_agents_status(self):
        """Test that all agents are reported."""
        event = {"httpMethod": "GET"}
        context = {}

        response = handler(event, context)
        body = json.loads(response["body"])

        expected_agents = ["research", "prompt", "video", "caption", "distribution"]

        for agent in expected_agents:
            assert agent in body["agents"]
            assert "status" in body["agents"][agent]
            assert "last_run" in body["agents"][agent]

    def test_services_status(self):
        """Test that services are reported as operational."""
        event = {"httpMethod": "GET"}
        context = {}

        response = handler(event, context)
        body = json.loads(response["body"])

        assert "netlify_functions" in body["services"]
        assert "api_gateway" in body["services"]
        assert body["services"]["netlify_functions"] == "operational"
        assert body["services"]["api_gateway"] == "operational"

    def test_cors_headers(self):
        """Test that CORS headers are present."""
        event = {"httpMethod": "GET"}
        context = {}

        response = handler(event, context)

        assert "Access-Control-Allow-Origin" in response["headers"]
        assert response["headers"]["Access-Control-Allow-Origin"] == "*"
        assert response["headers"]["Content-Type"] == "application/json"

    def test_timestamp_format(self):
        """Test that timestamp is valid ISO format."""
        event = {"httpMethod": "GET"}
        context = {}

        response = handler(event, context)
        body = json.loads(response["body"])

        # Should not raise
        datetime.fromisoformat(body["timestamp"])
