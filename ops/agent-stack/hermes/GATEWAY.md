# Hermes Desktop → factory gateway

Maps the Hermes Desktop **Settings → Gateways → Gateway Connection** page
(Local / Hermes Cloud / Remote gateway / Connect via SSH) onto this mesh.

Official docs:

- [Connecting to a remote backend](https://hermes-agent.nousresearch.com/docs/user-guide/desktop)
- [Many Hermes instances](https://hermes-agent.nousresearch.com/docs/user-guide/multi-connection-desktop)

A Claude Code frame
(`https://claude.ai/code/frame/e11f3522-a196-493c-b569-7faccb679995`) was sent
with the screenshot. This VM only got a Cloudflare challenge — no config inside.
If that frame has extra env or a different port, paste the text here and this
file updates. Until then the official Desktop Gateways page is the source.

---

## Pick one radio (MacBook Desktop)

| Radio in the screenshot | What it actually is | StudEx factory? |
| --- | --- | --- |
| **Local gateway** | This MacBook’s bundled `hermes serve`. MiniMax / Ollama on *this* disk. | Desk work only. Not the 24/7 loop. |
| **Hermes Cloud** | Nous Portal sign-in + hosted-agent discovery. No URL. Their machines, their keys. | **No.** Not MiniMax Token Plan, not Drive, not `dispatch-cursor.sh`. |
| **Remote gateway** | You paste a `hermes serve` URL and sign in. App attaches; it does **not** start the remote. | **Yes.** Mac Mini `:9119` over Tailscale. |
| **Connect via SSH** | App opens `user@host:22`, starts the remote dashboard for you. | Fallback when Fortinet still blocks Tailscale from the MacBook. |

Register the Mini as a named connection (device name e.g. `projects-mac-mini`).
Keep **This device** (Local) registered so the laptop still works when the Mini
is down. Make the Mini **Primary** only after `Test` returns Reachable.

Do **not** start a second OpenClaw on the Mini. OpenClaw stays `:18789` on the
MacBook until one Orgo cutover.

---

## Recommended layout

```
MacBook Hermes Desktop
        │
        │  Settings → Gateways → Remote gateway
        │  URL  http://100.112.109.40:9119
        │  (MagicDNS: http://projects-mac-mini:9119)
        ▼
Mac Mini  (always-on)
  hermes serve --host 0.0.0.0 --port 9119
  ~/.hermes/.env   MiniMax + optional CURSOR_API_KEY
  factory/run-line.sh + dispatch-cursor.sh
        │
        ├─ Drive Agent Bus  (jobs / results)
        └─ one Cursor Cloud Agent after quota reset
```

Tailscale IPs from [`CONNECTION-PLAN.md`](../../CONNECTION-PLAN.md):
MacBook `100.95.66.29`, Mini `100.112.109.40`. Bind to the Mini’s tailnet IP
instead of `0.0.0.0` if you want the port off every other NIC.

---

## Mini: start the backend

Run on **projects-mac-mini**, after `apply-local.sh` has MiniMax in
`~/.hermes/.env`. Credentials stay in that file (`chmod 600`). Never Drive, never git.

```bash
# 1. Dashboard login (Tailscale / LAN only — not the public internet)
cat >> ~/.hermes/.env <<'EOF'
HERMES_DASHBOARD_BASIC_AUTH_USERNAME=admin
HERMES_DASHBOARD_BASIC_AUTH_PASSWORD=choose-a-strong-password
HERMES_DASHBOARD_BASIC_AUTH_SECRET=
EOF
# put a stable secret in SECRET so Desktop stays signed in across Mini reboots:
#   openssl rand -base64 32
chmod 600 ~/.hermes/.env

# 2. Listen where the MacBook can reach it
hermes serve --host 0.0.0.0 --port 9119
# or:  hermes serve --host 100.112.109.40 --port 9119
```

Keep `hermes serve` up (tmux, launchd, or `serve-mini.sh`). Desktop cannot
start it for you.

Username/password is **trusted-network only**. Fortinet historically blocked
Tailscale from the MacBook — if the tailnet still does not reach the Mini, use
**Connect via SSH** (`tumeloramaphosa@100.112.109.40` or the Mini’s LAN name)
instead of opening `:9119` to the internet.

Public / VPS bind → OAuth (Nous Portal): `hermes dashboard register`, then
Desktop **Sign in with Nous Research**. Do not put Basic Auth on a public IP.

Messaging (Telegram / Slack / Discord) is a **different** long-running Hermes
process. `hermes serve` is only the Desktop/API backend.

---

## MacBook: point Desktop at the Mini

1. Settings → **Gateways** → **Remote gateway** (or Add connection → Remote).
2. Name: `projects-mac-mini`.
3. Gateway URL: `http://100.112.109.40:9119` (or `http://projects-mac-mini:9119`).
4. Sign in with the Basic Auth user/password from the Mini `.env`.
5. **Test** — must say Reachable (HTTP **and** `/api/ws`). Then Save.
6. Sessions sidebar → switch to `projects-mac-mini`. Factory chats, cron, and
   `dispatch-cursor.sh` now run on the Mini’s disk and keys.

Optional launch override (still sign in once in the UI):

```bash
HERMES_DESKTOP_REMOTE_URL=http://100.112.109.40:9119 hermes desktop
```

Encrypt saved tokens: Settings → Gateways → **Encrypt saved secrets with the OS
keychain**.

---

## Probe (from MacBook, on the tailnet)

```bash
curl -sS --max-time 3 http://100.112.109.40:9119/api/status \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("auth_required"), d.get("auth_providers"))'
# expect: True ['basic']   (or oauth if you registered Nous)
```

| Symptom | Fix |
| --- | --- |
| Connection refused / timeout | `hermes serve` not running, bound to `127.0.0.1`, or Fortinet still eating Tailscale. Bind `0.0.0.0` / tailnet IP, or use SSH mode. |
| 401 / Invalid credentials | Username or password ≠ Mini `.env`. Same generic error for both. |
| Signed out every Mini reboot | Set `HERMES_DASHBOARD_BASIC_AUTH_SECRET` to a stable value. |
| Test HTTP ok, chat dead | `/api/ws` blocked (proxy / old Hermes WS origin guard). Update Mini + Desktop together; Test must pass the WebSocket leg. |
| No Sign in button, asks for a session token | Basic Auth provider not loaded — both USERNAME and PASSWORD (or hash) must be in the Mini `.env` that `hermes serve` actually read. |

---

## What not to do

- Do not pick **Hermes Cloud** for the factory. Nous-hosted agents cannot see
  Agentcyberpunk7 Drive, MiniMax Token Plan, or `CURSOR_API_KEY` on the Mini.
- Do not expose `:9119` on a public interface with Basic Auth.
- Do not run a second OpenClaw next to this `hermes serve`.
- Do not spawn extra Cursor Cloud Agents while Pro is capped (reset ~3 Oct 2026
  20:06). Hermes on the Mini implements until Spending shows headroom.
- Do not commit dashboard passwords. `env.example` has empty placeholders only.
