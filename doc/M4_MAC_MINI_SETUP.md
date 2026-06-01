# M4 Mac Mini — Local Agent Node Setup Guide

**Machine:** Mac Mini M4 (Mac16,10)  
**Chip:** Apple M4 (10-core: 4P + 6E)  
**RAM:** 16GB Unified Memory  
**OS:** macOS 26.4 (Darwin 25.4.0)  
**Ollama:** v0.21.2 (installed, sandbox-restricted)  
**Homebrew:** 5.1.6  
**Python:** 3.13.12 (miniconda3)  
**Node.js:** v22.22.2  

---

## RAM Budget for 16GB M4

With 16GB unified memory, you can run **one 14B model OR two 7B models simultaneously**.

| Model | Parameters | RAM Needed | Speed | Best For |
|-------|-----------|------------|-------|----------|
| qwen2.5-coder:7b | 7B | ~5.5GB | Very Fast | Daily coding, fast completions |
| qwen2.5-coder:14b | 14B | ~10GB | Fast | Complex generation, architecture |
| deepseek-coder:6.7b | 6.7B | ~5GB | Very Fast | Code review, refactoring |
| codellama:7b | 7B | ~5.5GB | Fast | General coding, documentation |
| llama3.1:8b | 8B | ~6GB | Fast | General purpose, reasoning |
| hermes3:8b | 8B | ~6GB | Fast | Tool use, agent workflows |
| phi4:14b | 14B | ~10GB | Fast | Reasoning, analysis |

**Recommended Setup for 16GB:**
- Primary: `qwen2.5-coder:14b` (complex tasks)
- Secondary: `qwen2.5-coder:7b` (fast completions, switch as needed)
- Review: `deepseek-coder:6.7b` (code review)
- Agent: `hermes3:8b` (tool-calling, agent workflows)

---

## Step 1: Start Ollama

Ollama is already installed. To start it:

```bash
ollama serve
```

Or run as a background service:

```bash
brew services start ollama
```

Verify:
```bash
ollama list
```

---

## Step 2: Pull Recommended Models

```bash
# Primary coding model (14B — best quality for 16GB)
ollama pull qwen2.5-coder:14b

# Fast coding model (7B — keep loaded for quick tasks)
ollama pull qwen2.5-coder:7b

# Code review specialist
ollama pull deepseek-coder:6.7b

# Agent/tool-calling model
ollama pull hermes3:8b

# General reasoning
ollama pull llama3.1:8b
```

---

## Step 3: Create Model Switcher Script

Since you can only run one large model at a time on 16GB, create a switcher:

```bash
cat > ~/naledi-model-switcher.sh << 'SCRIPT'
#!/bin/bash
# Naledi Model Switcher for 16GB M4

MODEL=$1

if [ -z "$MODEL" ]; then
  echo "Usage: ./naledi-model-switcher.sh [qwen14|qwen7|deepseek|hermes|llama3]"
  exit 1
fi

case $MODEL in
  qwen14)
    ollama run qwen2.5-coder:14b
    ;;
  qwen7)
    ollama run qwen2.5-coder:7b
    ;;
  deepseek)
    ollama run deepseek-coder:6.7b
    ;;
  hermes)
    ollama run hermes3:8b
    ;;
  llama3)
    ollama run llama3.1:8b
    ;;
  *)
    echo "Unknown model. Use: qwen14, qwen7, deepseek, hermes, llama3"
    exit 1
    ;;
esac
SCRIPT
chmod +x ~/naledi-model-switcher.sh
```

---

## Step 4: Install LM Studio

```bash
brew install --cask lm-studio
```

Launch LM Studio, download models via the UI, and start the API server on port `1234`.

---

## Step 5: Install OpenClaw

```bash
cd ~
git clone https://github.com/openclaw/openclaw.git 2>/dev/null || echo "Repo may not exist — check GitHub for current URL"
cd openclaw
pip install -e .
```

Create config:
```bash
mkdir -p ~/.config/openclaw
cat > ~/.config/openclaw/config.yaml << 'CONFIG'
models:
  default:
    provider: ollama
    model: qwen2.5-coder:14b
    api_base: http://localhost:11434
  fast:
    provider: ollama
    model: qwen2.5-coder:7b
    api_base: http://localhost:11434
  review:
    provider: ollama
    model: deepseek-coder:6.7b
    api_base: http://localhost:11434

agents:
  coder:
    model: default
    tools: [file_read, file_write, shell, git]
  reviewer:
    model: review
    tools: [file_read, git_diff]
CONFIG
```

---

## Step 6: Install ProjectGoose (Block)

```bash
brew install goose
# OR: npm install -g @block/goose
```

Configure:
```bash
mkdir -p ~/.config/goose
cat > ~/.config/goose/config.yaml << 'GOOSE'
providers:
  ollama:
    type: ollama
    host: http://localhost:11434
    model: qwen2.5-coder:14b
  anthropic:
    type: anthropic
    api_key: ${ANTHROPIC_API_KEY}
    model: claude-3-5-sonnet-20241022

default_provider: ollama
GOOSE
```

---

## Step 7: Install VS Code + Continue.dev

```bash
brew install --cask visual-studio-code
code --install-extension Continue.continue
```

Configure Continue.dev for multi-model:
```bash
cat > ~/.continue/config.json << 'CONT'
{
  "models": [
    {
      "title": "Ollama Qwen 14B",
      "provider": "ollama",
      "model": "qwen2.5-coder:14b"
    },
    {
      "title": "Ollama Qwen 7B",
      "provider": "ollama",
      "model": "qwen2.5-coder:7b"
    },
    {
      "title": "LM Studio",
      "provider": "lmstudio",
      "model": "local-model"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Qwen 7B Fast",
    "provider": "ollama",
    "model": "qwen2.5-coder:7b"
  }
}
CONT
```

---

## Step 8: Auto-Start on Boot

```bash
mkdir -p ~/Library/LaunchAgents
cat > ~/Library/LaunchAgents/com.naledi.agent.plist << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.naledi.agent</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-c</string>
    <string>/opt/homebrew/bin/brew services start ollama &amp;&amp; sleep 5 &amp;&amp; echo "Ollama ready"</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <false/>
  <key>StandardOutPath</key>
  <string>/Users/project2571/.naledi/agent.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/project2571/.naledi/agent.error.log</string>
</dict>
</plist>
PLIST

launchctl load ~/Library/LaunchAgents/com.naledi.agent.plist
```

---

## Step 9: Tailscale for Remote Access

```bash
brew install tailscale
sudo tailscale up
```

Get your Tailscale IP and access the Mac Mini from anywhere securely.

---

## Quick Reference

```bash
# Check what's running
ollama ps

# Switch model
~/naledi-model-switcher.sh qwen14

# API test
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5-coder:14b",
  "prompt": "Write a Python function to calculate fibonacci",
  "stream": false
}'

# LM Studio API test
curl http://localhost:1234/v1/chat/completions -H "Content-Type: application/json" -d '{
  "model": "local-model",
  "messages": [{"role": "user", "content": "Hello"}]
}'
```

---

## Cloud Fallback Strategy for 16GB

Since 16GB limits you to one large model at a time, use this hybrid:

| Task | Local (Ollama) | Cloud (Vertex AI / Claude) |
|------|---------------|---------------------------|
| Fast autocomplete | Qwen 7B | — |
| Code review | DeepSeek 6.7B | — |
| Complex architecture | — | Claude 3.5 Sonnet |
| Multi-file refactoring | — | Claude 3.5 Sonnet |
| Agent orchestration | Hermes 3 8B | Claude 3 Haiku |
| Testing / linting | Local scripts | Cloud Build |

**Cost control:** Use local models for 80% of tasks. Only call cloud APIs for complex generation.
