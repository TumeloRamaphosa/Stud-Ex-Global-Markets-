"""Tests for campaign_runner function."""

import json
import pytest
from functions.campaign_runner import (
    handler, create_campaign, run_campaign, CampaignStore, Campaign
)


class TestCampaignRunner:
    """Test campaign runner operations."""

    def test_create_campaign(self):
        """Test creating a new campaign."""
        body = {
            "action": "create",
            "name": "Test Campaign",
            "target_audience": "developers",
            "templates": [{"name": "welcome", "subject": "Welcome!"}],
            "contacts": [{"email": "test@example.com", "name": "Test"}]
        }

        response = handler({
            "httpMethod": "POST",
            "body": json.dumps(body)
        }, {})

        assert response["statusCode"] == 201
        data = json.loads(response["body"])
        assert data["message"] == "Campaign created"
        assert data["campaign"]["name"] == "Test Campaign"
        assert data["campaign"]["status"] == "draft"

    def test_list_campaigns(self):
        """Test listing campaigns."""
        # Create a campaign first
        body = {
            "action": "create",
            "name": "List Test Campaign",
            "contacts": [{"email": "list@test.com"}]
        }
        handler({
            "httpMethod": "POST",
            "body": json.dumps(body)
        }, {})

        # List campaigns
        response = handler({
            "httpMethod": "GET",
            "queryStringParameters": {}
        }, {})

        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert "campaigns" in data

    def test_run_campaign(self):
        """Test running a campaign."""
        # Create campaign
        create_body = {
            "action": "create",
            "name": "Run Test Campaign",
            "contacts": [
                {"email": "user1@example.com"},
                {"email": "user2@example.com"},
                {"email": "user3@example.com"}
            ]
        }
        create_response = handler({
            "httpMethod": "POST",
            "body": json.dumps(create_body)
        }, {})

        campaign_id = json.loads(create_response["body"])["campaign"]["id"]

        # Run campaign
        run_body = {
            "action": "run",
            "campaign_id": campaign_id
        }
        run_response = handler({
            "httpMethod": "POST",
            "body": json.dumps(run_body)
        }, {})

        assert run_response["statusCode"] == 200
        data = json.loads(run_response["body"])
        assert data["status"] == "completed"
        assert "results" in data

    def test_generate_report(self):
        """Test generating campaign report."""
        # Create and run a campaign
        create_body = {
            "action": "create",
            "name": "Report Test Campaign",
            "contacts": [{"email": "report@test.com"} for _ in range(10)]
        }
        create_response = handler({
            "httpMethod": "POST",
            "body": json.dumps(create_body)
        }, {})
        campaign_id = json.loads(create_response["body"])["campaign"]["id"]

        # Run it
        handler({
            "httpMethod": "POST",
            "body": json.dumps({"action": "run", "campaign_id": campaign_id})
        }, {})

        # Generate report
        report_body = {
            "action": "generate_report",
            "campaign_id": campaign_id
        }
        report_response = handler({
            "httpMethod": "POST",
            "body": json.dumps(report_body)
        }, {})

        assert report_response["statusCode"] == 200
        data = json.loads(report_response["body"])
        assert "summary" in data
        assert "campaigns_analyzed" in data
        assert "rates" in data

    def test_cors_preflight(self):
        """Test CORS preflight request."""
        response = handler({
            "httpMethod": "OPTIONS"
        }, {})

        assert response["statusCode"] == 200
        headers = response.get("headers", {})
        assert "Access-Control-Allow-Origin" in headers

    def test_invalid_method(self):
        """Test handling invalid HTTP method."""
        response = handler({
            "httpMethod": "PUT",
            "body": json.dumps({})
        }, {})

        assert response["statusCode"] == 405

    def test_invalid_json(self):
        """Test handling invalid JSON."""
        response = handler({
            "httpMethod": "POST",
            "body": "not valid json"
        }, {})

        assert response["statusCode"] == 400


class TestCampaignStore:
    """Test CampaignStore operations."""

    def test_save_and_get(self):
        """Test saving and retrieving a campaign."""
        campaign = Campaign(
            id="test-id",
            name="Test",
            target_audience="dev",
            status="draft",
            created_at="2025-01-01",
            updated_at="2025-01-01",
            templates=[],
            contacts=[],
            results={}
        )

        CampaignStore.save(campaign)
        retrieved = CampaignStore.get("test-id")

        assert retrieved is not None
        assert retrieved.name == "Test"

    def test_delete(self):
        """Test deleting a campaign."""
        campaign = Campaign(
            id="delete-test",
            name="To Delete",
            target_audience="dev",
            status="draft",
            created_at="2025-01-01",
            updated_at="2025-01-01",
            templates=[],
            contacts=[],
            results={}
        )

        CampaignStore.save(campaign)
        CampaignStore.delete("delete-test")

        assert CampaignStore.get("delete-test") is None

    def test_list_with_filter(self):
        """Test listing with status filter."""
        # Create campaigns with different statuses
        for status in ["draft", "running", "completed", "draft"]:
            c = Campaign(
                id=f"list-{status}-{hash(status + str(__import__('random').randint(0, 10000)))}",
                name=f"{status} Campaign",
                target_audience="dev",
                status=status,
                created_at="2025-01-01",
                updated_at="2025-01-01",
                templates=[],
                contacts=[],
                results={}
            )
            CampaignStore.save(c)

        drafts = CampaignStore.list(status="draft")
        assert len(drafts) >= 2

        completed = CampaignStore.list(status="completed")
        assert len(completed) >= 1
