# Naledi Platform - Netlify Deployment

Full-stack deployment on Netlify with local backend integration.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Netlify Functions   │────▶│  Local Backend  │
│   (frontend/)   │     │  (functions/)        │     │  localhost:8000 │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
                                │
                                ▼
                         (Fallback to mock
                          if backend offline)
```

## Quick Start

### 1. Install Dependencies

```bash
# Python functions
pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

### 2. Run Tests

```bash
pytest
```

### 3. Local Development

```bash
# Use the repo wrapper so Node 22 and a local npm cache are selected automatically
./scripts/dev-local.sh
```

### 4. Deploy

```bash
# Login first
netlify login

# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

## Project Structure

```
naledi-platform/
├── functions/           # Netlify Functions (Python backend)
│   ├── status.py        # Health check endpoint
│   ├── prompt_agent.py  # Prompt generation
│   └── research_agent.py # Research queries
├── frontend/            # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx      # Main dashboard
│   │   └── main.tsx     # Entry point
│   └── dist/            # Built assets
├── tests/               # Pytest tests
│   ├── test_status.py
│   ├── test_prompt_agent.py
│   └── test_research_agent.py
├── netlify.toml         # Netlify configuration
├── requirements.txt     # Python dependencies
└── .github/workflows/   # CI/CD pipeline
```

## Environment Variables

Set in Netlify dashboard or `.env`:

```bash
# Local backend URL (for development)
LOCAL_BACKEND_URL=http://localhost:8000

# API Keys (for production without local backend)
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
PERPLEXITY_API_KEY=

# Netlify (for CI/CD)
NETLIFY_SITE_ID=
NETLIFY_AUTH_TOKEN=
```

## API Endpoints

All endpoints are available at `/.netlify/functions/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | Health check, agent status |
| `/prompt_agent` | POST | Generate Higgsfield prompts |
| `/research_agent` | POST | Run research queries |

### Example Requests

```bash
# Health check
curl http://localhost:8888/.netlify/functions/status

# Generate prompts
curl -X POST http://localhost:8888/.netlify/functions/prompt_agent \
  -H "Content-Type: application/json" \
  -d '{"brief": "Easter campaign", "persona": "Naledi"}'

# Run research
curl -X POST http://localhost:8888/.netlify/functions/research_agent \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI trends", "keywords": ["agents", "automation"]}'
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=functions

# Run specific test file
pytest tests/test_prompt_agent.py -v

# Run specific test
pytest tests/test_prompt_agent.py::TestPromptAgentHandler::test_valid_request -v
```

## CI/CD Pipeline

GitHub Actions workflow:

1. **Test** - Run pytest on Python functions
2. **Build** - Build React frontend
3. **Deploy** - Deploy to Netlify (main branch only)

Secrets required in GitHub:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

## Local Backend Integration

Functions proxy to local backend when available:

```python
# In function
local_backend = os.getenv("LOCAL_BACKEND_URL", "http://localhost:8000")

try:
    response = requests.post(f"{local_backend}/agents/prompt/run", json=data)
    return response.json()
except requests.RequestException:
    # Fallback to mock/internal implementation
    return mock_response
```

This allows:
- Development with full backend features locally
- Production deployment with mock/internal fallbacks
- Easy migration to external APIs when ready

## Troubleshooting

### Functions not deploying
```bash
netlify functions:build
```

### CORS errors
Check `Access-Control-Allow-Origin` header in function response.

### Local backend not connecting
Ensure `LOCAL_BACKEND_URL` is set and backend is running.

### Build fails
```bash
cd frontend && npm run build
```

### Repeated npm setup failures
This repo now pins npm cache to `.npm-cache/` and expects Node `22.22.2` or compatible.
If your shell still picks up `/opt/homebrew/bin/node`, prepend the known-good Node install:
```bash
export PATH="$HOME/.local/node-v22.22.2-darwin-arm64/bin:$PATH"
```

## License

MIT
