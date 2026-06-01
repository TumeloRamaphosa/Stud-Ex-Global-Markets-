"""
Tests for ResearchAgent Netlify Function
"""

import json
import pytest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'functions'))

from research_agent import handler, run_research


class TestResearchAgentHandler:
    """Test the Netlify function handler."""

    def test_method_not_allowed(self):
        """Test that non-POST requests are rejected."""
        event = {"httpMethod": "GET"}
        context = {}

        response = handler(event, context)

        assert response["statusCode"] == 405
        body = json.loads(response["body"])
        assert body["error"] == "Method not allowed"

    def test_invalid_json(self):
        """Test that invalid JSON is rejected."""
        event = {
            "httpMethod": "POST",
            "body": "invalid json"
        }
        context = {}

        response = handler(event, context)

        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert body["error"] == "Invalid JSON"

    def test_valid_request(self):
        """Test a valid research request."""
        event = {
            "httpMethod": "POST",
            "body": json.dumps({
                "topic": "AI trends",
                "keywords": ["generative AI", "agents"]
            })
        }
        context = {}

        response = handler(event, context)

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["topic"] == "AI trends"
        assert body["status"] == "completed"
        assert "findings" in body
        assert "recommendations" in body

    def test_default_topic(self):
        """Test that default topic is used when not provided."""
        event = {
            "httpMethod": "POST",
            "body": json.dumps({})
        }
        context = {}

        response = handler(event, context)

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["topic"] == "AI trends"


class TestRunResearch:
    """Test the run_research function."""

    @patch('research_agent.requests.post')
    def test_calls_local_backend(self, mock_post):
        """Test that local backend is called when available."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "status": "completed",
            "findings": [{"title": "Test finding"}]
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        result = run_research("Test topic", ["keyword"])

        mock_post.assert_called_once()
        assert result["source"] == "local_backend"

    def test_fallback_to_mock(self):
        """Test that mock response is used when backend unavailable."""
        with patch('research_agent.requests.post') as mock_post:
            mock_post.side_effect = Exception("Connection refused")

            result = run_research("Test topic", ["keyword"])

            assert len(result["findings"]) == 1
            assert result.get("fallback") is True

    def test_research_structure(self):
        """Test that research result has correct structure."""
        result = run_research("Test topic", [])

        assert "topic" in result
        assert "keywords" in result
        assert "status" in result
        assert "timestamp" in result
        assert "findings" in result
        assert "recommendations" in result

    def test_keywords_handling(self):
        """Test that keywords are properly handled."""
        keywords = ["AI", "content", "social media"]
        result = run_research("Test topic", keywords)

        assert result["keywords"] == keywords

    def test_empty_keywords(self):
        """Test handling of empty keywords list."""
        result = run_research("Test topic", [])
        assert result["keywords"] == []

    def test_none_keywords(self):
        """Test handling of None keywords."""
        result = run_research("Test topic", None)
        assert result["keywords"] == []


class TestResearchTopics:
    """Test different research topic scenarios."""

    def test_short_topic(self):
        """Test handling of short topic."""
        result = run_research("AI", [])
        assert result["status"] == "completed"

    def test_long_topic(self):
        """Test handling of long topic."""
        long_topic = "AI " * 50
        result = run_research(long_topic, [])
        assert result["status"] == "completed"

    def test_special_characters(self):
        """Test handling of special characters in topic."""
        result = run_research("AI/ML & Data Science", [])
        assert result["status"] == "completed"
