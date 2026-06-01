# StudEx Facebook MCP Server

MCP (Model Context Protocol) server that gives Claude Code direct access to StudEx Meat's Facebook Page data.

## Setup

```bash
cd studex-frontend/mcp-servers/facebook
npm install
npm run build
```

## Environment Variables

```env
META_ACCESS_TOKEN=your_page_access_token_here
FB_PAGE_ID=108934711902801
```

**Get a token:** [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)  
App: **Studex Content Analyser** (ID: 1649681979685968)  
Required permissions: `pages_read_engagement`, `pages_show_list`, `ads_read`

## Claude Desktop Config (`~/.claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "studex-facebook": {
      "command": "node",
      "args": ["/path/to/studex-frontend/mcp-servers/facebook/dist/index.js"],
      "env": {
        "META_ACCESS_TOKEN": "your_token_here",
        "FB_PAGE_ID": "108934711902801"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_page_info` | Page fans, followers, category, verification |
| `get_page_insights` | Reach, impressions, engagement (day/week/28d) |
| `list_posts` | Recent posts with like/comment/share counts |
| `get_post_engagement` | Detailed engagement for a specific post |
| `check_token_status` | Validate token + list permissions |
| `get_ad_account_summary` | Ad account spend, impressions, reach |

## Ad Account

- Account ID: `act_560666565541381`
- Customer ID (Google Ads): `2234319068`

## Page Info

- Page ID: `108934711902801`
- Fans: 2,551 (as of 2026-05-31)
- Status: Token expired ~May 27 — refresh needed
