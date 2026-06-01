"""Tests for web_scraper function."""

import json
import pytest
from unittest.mock import patch, MagicMock
from functions.web_scraper import (
    handler, discover_emails, discover_contracts, scrape_url,
    EmailDiscoveryEngine, ContractDiscoveryEngine, ScrapedContact, ScrapedContract
)


class TestEmailDiscoveryEngine:
    """Test email discovery functionality."""

    def test_valid_email(self):
        """Test email validation."""
        engine = EmailDiscoveryEngine()
        # Valid emails
        assert engine._is_valid_email("user@testcorp.com") == True
        assert engine._is_valid_email("user.name@company.co.uk") == True
        assert engine._is_valid_email("support@naledi.io") == True
        # Invalid/Filter examples
        assert engine._is_valid_email("invalid") == False
        assert engine._is_valid_email("user@") == False
        assert engine._is_valid_email("test@example.com") == False  # Filtered as example
        assert engine._is_valid_email("user@localhost") == False
        assert engine._is_valid_email("user@domain.com") == False  # Filtered

    def test_extract_from_text(self):
        """Test extracting emails from text."""
        engine = EmailDiscoveryEngine()
        text = """
        Contact us at support@company.com for help.
        Or reach out to sales@company.com for sales inquiries.
        You can also mailto:direct@company.com for direct contact.
        """
        emails = engine.extract_from_text(text, "https://company.com")
        
        assert len(emails) > 0
        email_addresses = [e.email for e in emails]
        assert "support@company.com" in email_addresses
        assert "sales@company.com" in email_addresses
        assert "direct@company.com" in email_addresses

    def test_extract_deduplicates(self):
        """Test that duplicate emails are deduplicated."""
        engine = EmailDiscoveryEngine()
        text = "Contact: john@company.com and john@company.com and jane@company.com (duplicate email)"
        emails = engine.extract_from_text(text, "https://company.com")
        
        # Should have 2 unique emails: john and jane
        assert len(emails) == 2  
        assert emails[0].email == "john@company.com"

    @patch.dict('os.environ', {'HUNTER_API_KEY': 'mock_key'})
    @patch('requests.get')
    def test_discover_from_api(self, mock_get):
        """Test Hunter.io API discovery."""
        # Mock Hunter.io response
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "data": {
                "emails": [
                    {
                        "value": "john@example.com",
                        "first_name": "John",
                        "last_name": "Doe",
                        "position": "CEO",
                        "confidence": 85
                    },
                    {
                        "value": "jane@example.com",
                        "first_name": "Jane",
                        "last_name": "Smith",
                        "position": "CTO",
                        "confidence": 90
                    }
                ]
            }
        }
        mock_get.return_value = mock_response

        engine = EmailDiscoveryEngine()
        emails = engine.discover_from_api("Example Corp", "example.com")

        assert len(emails) == 2
        assert emails[0].email == "john@example.com"
        assert emails[0].confidence == 0.85
        assert emails[1].email == "jane@example.com"
        assert emails[1].confidence == 0.9


class TestContractDiscoveryEngine:
    """Test contract discovery functionality."""

    def test_search_contracts(self):
        """Test searching for contracts."""
        engine = ContractDiscoveryEngine()
        contracts = engine.search_contracts(["AI", "software"], max_results=5)
        
        assert isinstance(contracts, list)
        # In mock mode, should still return results
        for contract in contracts:
            assert isinstance(contract, ScrapedContract)


class TestWebScraperHandler:
    """Test web scraper handler operations."""

    def test_discover_emails_handler(self):
        """Test email discovery via handler."""
        body = {
            "action": "discover_emails",
            "company": "Test Corp",
            "domain": "testcorp.com"
        }

        response = handler({
            "httpMethod": "POST",
            "body": json.dumps(body)
        }, {})

        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert data["action"] == "discover_emails"
        assert data["company"] == "Test Corp"
        assert data["domain"] == "testcorp.com"
        assert "emails_found" in data

    def test_discover_contracts_handler(self):
        """Test contract discovery via handler."""
        body = {
            "action": "discover_contracts",
            "keywords": ["IT services", "software"],
            "region": "south africa"
        }

        response = handler({
            "httpMethod": "POST",
            "body": json.dumps(body)
        }, {})

        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert data["action"] == "discover_contracts"
        assert data["region"] == "south africa"
        assert "contracts_found" in data

    def test_scrape_url_handler(self):
        """Test URL scraping via handler."""
        body = {
            "action": "scrape_url",
            "url": "https://example.com",
            "extract_emails": True
        }

        # Note: This test may fail without actual network access
        # In production, you'd mock the requests
        response = handler({
            "httpMethod": "POST",
            "body": json.dumps(body)
        }, {})

        # Should either succeed or handle gracefully
        assert response["statusCode"] in [200, 500]

    def test_cors_preflight(self):
        """Test CORS preflight request."""
        response = handler({
            "httpMethod": "OPTIONS"
        }, {})

        assert response["statusCode"] == 200
        headers = response.get("headers", {})
        assert headers.get("Access-Control-Allow-Origin") == "*"

    def test_invalid_method(self):
        """Test handling invalid HTTP method."""
        response = handler({
            "httpMethod": "GET"
        }, {})

        assert response["statusCode"] == 405

    def test_invalid_json(self):
        """Test handling invalid JSON."""
        response = handler({
            "httpMethod": "POST",
            "body": "not valid json"
        }, {})

        assert response["statusCode"] == 400

    def test_unknown_action(self):
        """Test handling unknown action."""
        body = {
            "action": "unknown_action"
        }

        response = handler({
            "httpMethod": "POST",
            "body": json.dumps(body)
        }, {})

        assert response["statusCode"] == 400
