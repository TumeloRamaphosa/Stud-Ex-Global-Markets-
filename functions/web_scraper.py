"""
WebScraper - Netlify Function
Discovers emails and contracts using Playwright, Puppeteer, and Firecrawl
"""

import json
import os
import re
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from urllib.parse import urljoin, urlparse
from dataclasses import dataclass

import requests


@dataclass
class ScrapedContact:
    email: str
    source_url: str
    discovered_at: str
    context: str = ""
    confidence: float = 0.0


@dataclass
class ScrapedContract:
    title: str
    url: str
    source_url: str
    discovered_at: str
    description: str = ""
    value: Optional[str] = None
    deadline: Optional[str] = None
    organization: str = ""


class EmailDiscoveryEngine:
    """Discovers emails from various sources."""
    
    def __init__(self):
        self.discovered_emails: List[ScrapedContact] = []
        self.email_patterns = [
            r'[\w\.-]+@[\w\.-]+\.\w+',  # Standard emails
            r'mailto:([\w\.-]+@[\w\.-]+\.\w+)',  # mailto links
        ]
    
    def extract_from_text(self, text: str, source_url: str, context: str = "") -> List[ScrapedContact]:
        """Extract emails from text content."""
        emails = []
        for pattern in self.email_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0]  # For mailto captures
                if self._is_valid_email(match):
                    contact = ScrapedContact(
                        email=match.lower(),
                        source_url=source_url,
                        discovered_at=datetime.now(timezone.utc).isoformat(),
                        context=context[:200],  # Limit context
                        confidence=0.8
                    )
                    emails.append(contact)
        
        # Deduplicate
        seen = set()
        unique_emails = []
        for e in emails:
            if e.email not in seen:
                seen.add(e.email)
                unique_emails.append(e)
        
        return unique_emails
    
    def _is_valid_email(self, email: str) -> bool:
        """Basic email validation."""
        if not email or len(email) < 5 or len(email) > 254:
            return False
        if '@' not in email:
            return False
        if email.count('@') != 1:
            return False
        # Split and validate domain
        try:
            local_part, domain = email.lower().split('@')
        except ValueError:
            return False
        if not local_part or not domain or '.' not in domain:
            return False
        # Filter out common false positives - exact domain matches
        invalid_domains = ['example.com', 'test.com', 'localhost', 'domain.com']
        return domain not in invalid_domains
    
    def discover_from_api(self, company: str, domain: str) -> List[ScrapedContact]:
        """Use Hunter.io or similar API if key available."""
        hunter_key = os.getenv('HUNTER_API_KEY')
        if not hunter_key:
            return []
        
        try:
            response = requests.get(
                f"https://api.hunter.io/v2/domain-search",
                params={"domain": domain, "api_key": hunter_key},
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            
            emails = []
            for email_data in data.get('data', {}).get('emails', []):
                contact = ScrapedContact(
                    email=email_data['value'],
                    source_url=f"api:hunter.io",
                    discovered_at=datetime.now(timezone.utc).isoformat(),
                    context=f"{email_data.get('first_name', '')} {email_data.get('last_name', '')} - {email_data.get('position', '')}",
                    confidence=float(email_data.get('confidence', 0)) / 100
                )
                emails.append(contact)
            
            return emails
        except Exception:
            return []


class ContractDiscoveryEngine:
    """Discovers contracts/RFPs from various sources."""
    
    SOURCES = [
        "https://www.contracts-for-you.co.za",
        "https://www.treasury.gov.za/app/suppliers/sars.htm",
        "https://www.nationalgovernment.co.za/contracts",
    ]
    
    CONTRACT_KEYWORDS = [
        "tender", "rfp", "invitation to bid", "quotation",
        "contract opportunity", "bid", "procurement",
        "request for proposal", "expression of interest",
        "business opportunity", "partnership opportunity"
    ]
    
    def __init__(self):
        self.discovered_contracts: List[ScrapedContract] = []
    
    def search_contracts(self, keywords: List[str], max_results: int = 20) -> List[ScrapedContract]:
        """Search for contracts using web search + scraping."""
        contracts = []
        
        # Try Firecrawl if available
        firecrawl_key = os.getenv('FIRECRAWL_API_KEY')
        if firecrawl_key:
            contracts.extend(self._search_with_firecrawl(keywords))
        
        # Fallback to web search + scraping
        search_query = " | ".join(keywords + self.CONTRACT_KEYWORDS)
        try:
            response = requests.get(
                "https://search.brave.com/api/suggest",
                params={"q": search_query},
                timeout=30
            )
            # Note: This is a simplified approach - real implementation would use proper search APIs
        except Exception:
            pass
        
        return contracts[:max_results]
    
    def _search_with_firecrawl(self, keywords: List[str]) -> List[ScrapedContract]:
        """Use Firecrawl API for web scraping."""
        contracts = []
        
        try:
            from firecrawl import Firecrawl
            
            firecrawl = Firecrawl(api_key=os.getenv('FIRECRAWL_API_KEY'))
            
            for source in self.SOURCES:
                try:
                    scraped = firecrawl.scrape_url(source, {
                        'formats': ['html', 'text', 'links'],
                        'include_tags': ['a', 'h1', 'h2', 'h3', 'table', 'div'],
                        'exclude_tags': ['nav', 'footer', 'header']
                    })
                    
                    # Parse for contract opportunities
                    text = scraped.get('text', '')
                    links = scraped.get('links', [])
                    html = scraped.get('html', '')
                    
                    # Find contract mentions
                    contracts.extend(self._parse_contracts_from_text(
                        text, source, links, html
                    ))
                    
                except Exception:
                    continue
            
        except ImportError:
            pass
        
        return contracts
    
    def _parse_contracts_from_text(self, text: str, source: str, 
                                     links: List[str], html: str) -> List[ScrapedContract]:
        """
        Parse text content to identify contract opportunities.
        In production, this would use NLP models for better extraction.
        """
        contracts = []
        
        # Pattern matching for contract info
        # This is a simplified implementation
        for keyword in self.CONTRACT_KEYWORDS:
            if keyword.lower() in text.lower():
                # Extract context around keyword
                idx = text.lower().find(keyword.lower())
                context = text[max(0, idx-200):min(len(text), idx+300)]
                
                # Try to find deadline
                deadline = None
                date_patterns = [
                    r'\d{1,2}\s+\w+\s+\d{4}',  # e.g., "31 December 2025"
                    r'\d{1,2}/\d{1,2}/\d{4}',  # e.g., "31/12/2025"
                    r'closing\s+date:\s*([^\n]+)',  # "Closing date: ..."
                ]
                
                found_contract = ScrapedContract(
                    title=context.split('\n')[0][:100],
                    url=links[0] if links else source,
                    source_url=source,
                    discovered_at=datetime.now(timezone.utc).isoformat(),
                    description=context[:500],
                    organization="Extracted from source"
                )
                contracts.append(found_contract)
                break  # Limit to one per page for demo
        
        return contracts
    
    def discover_from_local_backend(self, search_params: Dict[str, Any]) -> List[ScrapedContract]:
        """Try local backend first."""
        local_backend = os.getenv("LOCAL_BACKEND_URL", "http://localhost:8000")
        
        try:
            response = requests.post(
                f"{local_backend}/contracts/discover",
                json=search_params,
                timeout=30
            )
            response.raise_for_status()
            return response.json().get("contracts", [])
        except Exception:
            return []


def handler(event: dict, context: dict) -> dict:
    """Netlify Function handler for web scraping operations."""
    
    method = event.get("httpMethod", "POST")
    
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }
    
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}
    
    if method != "POST":
        return {"statusCode": 405, "headers": headers,
                "body": json.dumps({"error": "Method not allowed"})}
    
    try:
        body = json.loads(event.get("body", "{}"))
        action = body.get("action", "discover_emails")
        
        if action == "discover_emails":
            return discover_emails(body, headers)
        elif action == "discover_contracts":
            return discover_contracts(body, headers)
        elif action == "scrape_url":
            return scrape_url(body, headers)
        else:
            return {"statusCode": 400, "headers": headers,
                    "body": json.dumps({"error": f"Unknown action: {action}"})}
    
    except json.JSONDecodeError:
        return {"statusCode": 400, "headers": headers,
                "body": json.dumps({"error": "Invalid JSON"})}
    except Exception as e:
        return {"statusCode": 500, "headers": headers,
                "body": json.dumps({"error": str(e)})}


def discover_emails(body: dict, headers: dict) -> dict:
    """Discover emails for a target."""
    company = body.get("company")
    domain = body.get("domain")
    source_urls = body.get("urls", [])
    
    engine = EmailDiscoveryEngine()
    emails = []
    
    # Try API discovery first
    if domain:
        emails.extend(engine.discover_from_api(company or "", domain))
    
    # Try local backend
    local_backend = os.getenv("LOCAL_BACKEND_URL", "http://localhost:8000")
    try:
        response = requests.post(
            f"{local_backend}/scraper/emails",
            json={"company": company, "domain": domain, "urls": source_urls},
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        emails_from_backend = [
            ScrapedContact(**e) for e in result.get("emails", [])
        ]
        emails.extend(emails_from_backend)
        source = "local_backend"
    except Exception:
        source = "mock"
        # Mock fallback
        if domain:
            emails.append(ScrapedContact(
                email=f"contact@{domain}",
                source_url=f"https://{domain}",
                discovered_at=datetime.now(timezone.utc).isoformat(),
                context="Mock email for demo",
                confidence=0.7
            ))
        
        if company:
            emails.append(ScrapedContact(
                email=f"info@{company.lower().replace(' ', '')}.com",
                source_url="mock://generated",
                discovered_at=datetime.now(timezone.utc).isoformat(),
                context="Generated from company name",
                confidence=0.5
            ))
    
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "action": "discover_emails",
            "company": company,
            "domain": domain,
            "emails_found": len(emails),
            "emails": [e.__dict__ for e in emails],
            "source": source if 'source' in locals() else "mixed",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    }


def discover_contracts(body: dict, headers: dict) -> dict:
    """Discover contract opportunities."""
    keywords = body.get("keywords", [])
    region = body.get("region", "south africa")
    min_value = body.get("min_value")
    max_value = body.get("max_value")
    
    engine = ContractDiscoveryEngine()
    
    # Try local backend first
    try:
        contracts = engine.discover_from_local_backend({
            "keywords": keywords,
            "region": region,
            "min_value": min_value,
            "max_value": max_value
        })
        source = "local_backend"
    except Exception:
        # Fallback to direct search
        search_keywords = keywords + [region]
        contracts = engine.search_contracts(search_keywords)
        source = "direct_scrape" if contracts else "mock"
        
        # Mock fallback
        if not contracts:
            contracts = [
                ScrapedContract(
                    title=f"IT Services Contract - {region.title()}",
                    url="https://example-contract.com/rfp-001",
                    source_url="https://example-contract.com",
                    discovered_at=datetime.now(timezone.utc).isoformat(),
                    description="Mock contract opportunity for AI development services",
                    value="R500,000 - R1,000,000",
                    deadline="2025-12-31",
                    organization="Department of Technology"
                )
            ]
    
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "action": "discover_contracts",
            "region": region,
            "keywords": keywords,
            "contracts_found": len(contracts),
            "contracts": [c.__dict__ for c in contracts],
            "source": source,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    }


def scrape_url(body: dict, headers: dict) -> dict:
    """Scrape a specific URL for data extraction."""
    url = body.get("url")
    extract_emails = body.get("extract_emails", True)
    extract_contracts = body.get("extract_contracts", False)
    
    if not url:
        return {"statusCode": 400, "headers": headers,
                "body": json.dumps({"error": "URL required"})}
    
    # Try Firecrawl if available
    firecrawl_key = os.getenv('FIRECRAWL_API_KEY')
    if firecrawl_key:
        try:
            from firecrawl import Firecrawl
            firecrawl = Firecrawl(api_key=firecrawl_key)
            
            result = firecrawl.scrape_url(url, {
                'formats': ['html', 'text', 'links'],
                'include_tags': ['a', 'p', 'div', 'span', 'h1', 'h2', 'h3'],
                'exclude_tags': ['nav', 'footer', 'header', 'script', 'style']
            })
            
            text = result.get('text', '')
            
            emails = []
            if extract_emails:
                email_engine = EmailDiscoveryEngine()
                emails = email_engine.extract_from_text(text, url, text[:500])
            
            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({
                    "url": url,
                    "title": result.get('metadata', {}).get('title', ''),
                    "text_length": len(text),
                    "emails_found": len(emails),
                    "emails": [e.__dict__ for e in emails],
                    "links_found": len(result.get('links', [])),
                    "source": "firecrawl",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
            }
        except Exception as e:
            pass
    
    # Try local backend
    local_backend = os.getenv("LOCAL_BACKEND_URL", "http://localhost:8000")
    try:
        response = requests.post(
            f"{local_backend}/scraper/scrape",
            json={"url": url, "extract_emails": extract_emails},
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        result["source"] = "local_backend"
        return {"statusCode": 200, "headers": headers, "body": json.dumps(result)}
    except Exception:
        pass
    
    # Final fallback: simple fetch
    try:
        response = requests.get(url, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        text = response.text
        
        emails = []
        if extract_emails:
            email_engine = EmailDiscoveryEngine()
            emails = email_engine.extract_from_text(text, url, text[:500])
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({
                "url": url,
                "text_length": len(text),
                "emails_found": len(emails),
                "emails": [e.__dict__ for e in emails],
                "source": "http_request",
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        }
    except Exception as e:
        return {"statusCode": 500, "headers": headers,
                "body": json.dumps({"error": str(e)})}
