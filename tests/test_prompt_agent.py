"""
Tests for PromptAgent Netlify Function
"""

import json
import pytest
from unittest.mock import patch, MagicMock
import sys
import os

# Add functions directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'functions'))

from prompt_agent import handler, generate_prompts


class TestPromptAgentHandler:
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
            "body": "not valid json"
        }
        context = {}

        response = handler(event, context)

        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert body["error"] == "Invalid JSON"

    def test_valid_request(self):
        """Test a valid prompt generation request."""
        event = {
            "httpMethod": "POST",
            "body": json.dumps({
                "brief": "Test brief",
                "persona": "Naledi",
                "num_prompts": 5
            })
        }
        context = {}

        response = handler(event, context)

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["status"] == "completed"
        assert body["persona"] == "Naledi"
        assert len(body["prompts"]) == 5
        assert "Access-Control-Allow-Origin" in response["headers"]

    def test_default_values(self):
        """Test that default values are used when not provided."""
        event = {
            "httpMethod": "POST",
            "body": json.dumps({})
        }
        context = {}

        response = handler(event, context)

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["persona"] == "Naledi"
        assert len(body["prompts"]) == 5


class TestGeneratePrompts:
    """Test the generate_prompts function."""

    @patch('prompt_agent.requests.post')
    def test_calls_local_backend(self, mock_post):
        """Test that local backend is called when available."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "status": "completed",
            "prompts": [{"id": 1, "text": "Test prompt"}]
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        result = generate_prompts("Test brief", "Naledi", 1)

        mock_post.assert_called_once()
        assert result["source"] == "local_backend"

    def test_fallback_to_mock(self):
        """Test that mock response is used when backend unavailable."""
        with patch('prompt_agent.requests.post') as mock_post:
            mock_post.side_effect = Exception("Connection refused")

            result = generate_prompts("Test brief", "Naledi", 5)

            assert len(result["prompts"]) == 5
            assert result["metadata"]["fallback"] is True

    def test_prompt_structure(self):
        """Test that generated prompts have correct structure."""
        result = generate_prompts("", "Naledi", 5)

        assert "prompts" in result
        assert len(result["prompts"]) == 5

        for prompt in result["prompts"]:
            assert "id" in prompt
            assert "text" in prompt
            assert "model" in prompt
            assert "duration" in prompt
            assert "style" in prompt
            assert isinstance(prompt["id"], int)
            assert isinstance(prompt["text"], str)
            assert isinstance(prompt["duration"], int)

    def test_persona_in_prompts(self):
        """Test that persona is included in prompt text."""
        result = generate_prompts("", "Emily", 5)

        assert result["persona"] == "Emily"
        # Check that persona name appears in at least some prompts
        all_texts = " ".join([p["text"] for p in result["prompts"]])
        assert "Emily" in all_texts or result.get("metadata", {}).get("fallback")


class TestPromptVariants:
    """Test different prompt generation scenarios."""

    def test_empty_brief(self):
        """Test handling of empty brief."""
        result = generate_prompts("", "Naledi", 5)
        assert result["status"] == "completed"
        assert len(result["prompts"]) == 5

    def test_long_brief(self):
        """Test handling of long brief."""
        long_brief = "Test " * 100  # 500 character brief
        result = generate_prompts(long_brief, "Naledi", 5)
        assert result["status"] == "completed"
        assert result["metadata"]["brief_received"] is True

    def test_multiple_personas(self):
        """Test different persona options."""
        for persona in ["Naledi", "Emily", "Default"]:
            result = generate_prompts("Test", persona, 5)
            assert result["persona"] == persona
            assert len(result["prompts"]) == 5
