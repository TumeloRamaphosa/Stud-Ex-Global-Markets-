# StudEx Higgsfield MCP Server

MCP server for AI video generation using the Higgsfield WAN 2.5 engine. Generates short-form video (Reels, TikTok) from text prompts directly in Claude Desktop.

## Capabilities

- **text-to-video** — generate video from a text prompt
- **image-to-video** — animate a still image into a video clip
- **audio-overlay** — bake audio into the video file (required for IG Reels)

## Claude Desktop Config (`~/.claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "studex-higgsfield": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-higgsfield"],
      "env": {
        "HIGGSFIELD_API_KEY": "your_key_here",
        "OUTPUT_DIR": "./generated/videos"
      }
    }
  }
}
```

**Note:** Audio must be baked into the video file before posting to Instagram -- the IG API cannot select music from their library.
