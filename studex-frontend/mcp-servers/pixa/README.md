# StudEx Pixa MCP Server

MCP server for AI image generation, editing, and background removal. Generate product photos, promotional images, and social media graphics directly in Claude Desktop.

## Capabilities

- **text-to-image** — generate images from text prompts (SDXL)
- **image-edit** — modify existing images with AI
- **background-remove** — clean product photo backgrounds
- **upscale** — increase image resolution
- **style-transfer** — apply StudEx brand style to any image

## Claude Desktop Config (`~/.claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "studex-pixa": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-pixa"],
      "env": {
        "PIXA_API_KEY": "your_key_here",
        "COMFYUI_URL": "http://localhost:8188",
        "OUTPUT_DIR": "./generated/images"
      }
    }
  }
}
```

**Brand defaults:** Gold (#D4A017) on cream (#FFF8F0), premium-serif font, luxury-meat-brand tone.
