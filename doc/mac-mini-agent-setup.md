# Mac Mini Autonomous AI Coding Agent Stack

A concise, copy-paste ready guide for building a local-first, autonomous coding agent on Apple Silicon.

---

## 1. Hardware

**Recommended:** Mac Mini **M2 Pro** or **M4 Pro**
- **RAM:** 32 GB minimum (64 GB preferred)
- **Storage:** 1 TB SSD minimum

**Why:** Apple Silicon unified memory lets the GPU/Neural Engine share RAM with the CPU—critical for running multiple large models side-by-side. 32 GB fits a 14B Qwen2.5-Coder + smaller specialist models simultaneously. 1 TB SSD holds ~10–15 medium models (7B–14B) or 3–4 large models plus project data.

---

## 2. Ollama

### Install

```bash
brew install ollama
# Or
curl -fsSL https://ollama.com/install.sh | sh
```

### Pull Recommended Coding Models

```bash
ollama pull qwen2.5-coder:14b
ollama pull qwen2.5-coder:7b
ollama pull deepseek-coder:6.7b
ollama pull codellama:7b
```

### Run the API Server

```bash
# Foreground
ollama serve

# Background
nohup ollama serve > /tmp/ollama.log 2>&1 &
```

Test it:
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder:14b",
  "prompt": "Write a Python function to flatten a nested list."
}'
```

---

## 3. LM Studio

### Install

```bash
brew install --cask lm-studio
```

Or download from [lmstudio.ai](https://lmstudio.ai).

### Load Models & Run Local API

1. Open LM Studio → **Discover** → download a GGUF model (e.g., `Qwen2.5-Coder-14B-GGUF`).
2. **Developer** → **Local Inference Server**
3. Set **Port** to `1234` (different from Ollama)
4. Click **Start Server**

Test it:
```bash
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5-coder-14b","messages":[{"role":"user","content":"Hello"}]}'
```

**Strategy:** Ollama for fast coding queries; LM Studio for heavier reasoning tasks.

---

## 4. OpenClaw

OpenClaw is a lightweight agent orchestrator that routes tasks between local and remote LLMs.

### Install

```bash
git clone https://github.com/josefrichter/openclaw.git /opt/openclaw
cd /opt/openclaw && pip install -r requirements.txt
```

### Configure

Create `/opt/openclaw/config.yaml`:

```yaml
openclaw:
  port: 8080
  log_level: info

providers:
  ollama:
    base_url: http://localhost:11434
    default_model: qwen2.5-coder:14b
    timeout: 120
  lmstudio:
    base_url: http://localhost:1234/v1
    default_model: qwen2.5-coder-14b
    timeout: 180
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}
    default_model: claude-3-5-sonnet-20241022
    timeout: 120

routing:
  code_generation:
    provider: ollama
    model: qwen2.5-coder:14b
  refactoring:
    provider: lmstudio
    model: qwen2.5-coder-14b
  complex_reasoning:
    provider: anthropic
    model: claude-3-5-sonnet-20241022
```

### Run as Persistent Service

```bash
cd /opt/openclaw
nohup python -m openclaw.server --config config.yaml > /tmp/openclaw.log 2>&1 &
```

---

## 5. ProjectGoose (Block)

Goose is an open-source autonomous coding agent by Block.

### Install

```bash
brew install goose
# Or
npm install -g goose-ai
```

### Configure

Create `~/.config/goose/config.yaml`:

```yaml
goose:
  default_provider: openclaw
  auto_confirm: true
  max_iterations: 50
  working_dir: ~/workspace

providers:
  openclaw:
    type: openai_compatible
    base_url: http://localhost:8080/v1
    api_key: dummy
    model: qwen2.5-coder:14b
  ollama_direct:
    type: openai_compatible
    base_url: http://localhost:11434/v1
    api_key: dummy
    model: qwen2.5-coder:14b
  anthropic:
    type: anthropic
    api_key: ${ANTHROPIC_API_KEY}
    model: claude-3-5-sonnet-20241022

extensions:
  - mcp
  - git
  - file_system
  - shell
  - web_search
```

### Connect to Local + Cloud LLMs

```bash
goose --provider openclaw
goose --provider ollama_direct
goose --provider anthropic
```

---

## 6. IDE Setup

### Option A: VS Code + Continue.dev

```bash
code --install-extension Continue.continue
```

`~/.continue/config.json`:

```json
{
  "models": [
    {
      "title": "Ollama Qwen 14B",
      "provider": "ollama",
      "model": "qwen2.5-coder:14b",
      "apiBase": "http://localhost:11434"
    },
    {
      "title": "LM Studio",
      "provider": "lmstudio",
      "model": "qwen2.5-coder-14b",
      "apiBase": "http://localhost:1234/v1"
    },
    {
      "title": "Claude Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "apiKey": "${ANTHROPIC_API_KEY}"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Ollama 7B Fast",
    "provider": "ollama",
    "model": "qwen2.5-coder:7b",
    "apiBase": "http://localhost:11434"
  },
  "contextProviders": [
    { "name": "code" },
    { "name": "docs" },
    { "name": "diff" },
    { "name": "terminal" }
  ],
  "slashCommands": [
    { "name": "edit", "description": "Edit selected code" },
    { "name": "comment", "description": "Write comments for code" }
  ],
  "mcpServers": {
    "goose": {
      "command": "goose",
      "args": ["mcp"],
      "env": { "GOOSE_PROVIDER": "openclaw" }
    }
  }
}
```

### Option B: Cursor

1. Download from [cursor.com](https://cursor.com)
2. **Settings** → **Models** → Add OpenAI-compatible provider:
   - **Name:** Ollama
   - **Base URL:** `http://localhost:11434/v1`
   - **Model:** `qwen2.5-coder:14b`
   - **API Key:** `ollama` (dummy string)
3. Add LM Studio provider on port `1234`

**Agent Mode:** `Cmd + I` (Composer Agent). Enable *Yolo mode* (auto-run terminal commands) in Settings → Features.

---

## 7. Autonomous Operation

### LaunchAgent plist (Auto-Restart)

Create `~/Library/LaunchAgents/com.ai-agent.stack.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.ai-agent.stack</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-c</string>
    <string>export PATH="/opt/homebrew/bin:$PATH";
nohup ollama serve > /tmp/ollama.log 2>&1 &amp;;
sleep 2;
cd /opt/openclaw &amp;&amp; nohup python -m openclaw.server --config config.yaml > /tmp/openclaw.log 2>&1 &amp;;
sleep 2;
nohup goose daemon > /tmp/goose.log 2>&1 &amp;</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key>
  <dict>
    <key>SuccessfulExit</key><false/>
  </dict>
  <key>StandardOutPath</key><string>/tmp/agent-stack.out</string>
  <key>StandardErrorPath</key><string>/tmp/agent-stack.err</string>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.ai-agent.stack.plist
launchctl start com.ai-agent.stack
launchctl list | grep com.ai-agent
```

### Tailscale for Remote Access

```bash
brew install tailscale
sudo tailscale up --ssh
```

Note your Tailscale IP (`100.x.x.x`). Access from anywhere:
```bash
ssh <user>@<tailscale-ip>
# Forward ports
ssh -L 11434:localhost:11434 <user>@<tailscale-ip>
```

### Log Rotation

```bash
sudo tee /etc/newsyslog.d/ai-agent.conf << EOF
/tmp/ollama.log        644  5  5000 *  J
/tmp/openclaw.log      644  5  5000 *  J
/tmp/goose.log         644  5  5000 *  J
/tmp/agent-stack.out   644  5  1000 *  J
/tmp/agent-stack.err   644  5  1000 *  J
EOF
```

Or with Homebrew `logrotate`:
```bash
brew install logrotate
mkdir -p ~/.logrotate
cat > ~/.logrotate/ai-agent << EOF
/tmp/ollama.log
/tmp/openclaw.log
/tmp/goose.log
/tmp/agent-stack.out
/tmp/agent-stack.err
{
    daily
    rotate 7
    compress
    missingok
    notifempty
}
EOF
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/homebrew/sbin/logrotate ~/.logrotate/ai-agent") | crontab -
```

---

## Quick Start Checklist

```bash
ollama serve &
cd /opt/openclaw && python -m openclaw.server --config config.yaml &
goose daemon &

# Verify
curl http://localhost:11434/api/tags
curl http://localhost:8080/health
curl http://localhost:1234/v1/models  # if LM Studio running
```

Open IDE, point to localhost endpoints, enable agent mode.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port already in use | `lsof -i :<port>` then `kill -9 <PID>` |
| Model not found | `ollama pull <model>` or re-download in LM Studio |
| Permission denied on `/opt` | `sudo chown -R $(whoami) /opt/openclaw` |
| LaunchAgent not loading | `launchctl unload` then `launchctl load` |
| Tailscale not connecting | `sudo tailscale up --reset` |

---

*Last updated: 2026-04-24*
