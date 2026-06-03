# StudEx Zernio MCP Server

MCP server for AI-powered caption writing and direct publishing to Instagram and Facebook. Completes the content pipeline: Higgsfield generates video, Zernio writes the caption and posts it live.

## Capabilities

- **caption-generation** — AI-written captions in premium brand voice
- **instagram-post** — publish directly to Instagram via API
- **facebook-post** — publish directly to Facebook Page
- **schedule-post** — schedule posts for optimal engagement times

## Claude Desktop Config (`~/.claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "studex-zernio": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-zernio"],
      "env": {
        "ZERNIO_API_KEY": "your_key_here",
        "INSTAGRAM_ACCESS_TOKEN": "your_token_here",
        "FACEBOOK_PAGE_TOKEN": "your_token_here"
      }
    }
  }
}
```

**Fallback:** If Zernio API is down, posts route through Composio at `/api/composio/post`.
