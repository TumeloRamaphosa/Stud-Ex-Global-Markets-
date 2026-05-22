#!/usr/bin/env python3
"""
Stud-Ex Second Brain Daily Sync
Runs daily to absorb data from all platforms into Pinecone.

Usage:
  python sync_brain.py                    # full sync
  python sync_brain.py --source instagram # sync only instagram
  python sync_brain.py --source obsidian  # sync only obsidian

Cron (run daily at 6am):
  0 6 * * * cd /path/to/scripts && python3 sync_brain.py >> brain_sync.log 2>&1
"""

import os, json, hashlib, glob, re, time, argparse
from datetime import datetime
from pathlib import Path

try:
    from pinecone import Pinecone
except ImportError:
    print("pip install pinecone-client")
    exit(1)

try:
    import requests
except ImportError:
    print("pip install requests")
    exit(1)

PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY", "pcsk_362DQk_TgKVV7qVQ3A3yGZuXi4VsZf3hgPDaMRyqLsEq65CmnFKC2nuDTzDReRhL3CayLj")
PINECONE_INDEX = os.environ.get("PINECONE_INDEX", "studex-memory")
COMPOSIO_API_KEY = os.environ.get("COMPOSIO_API_KEY", "ak_9VgEnxDAmT3lhUBfD8Yf")
OBSIDIAN_VAULT = os.environ.get("OBSIDIAN_VAULT", os.path.expanduser("~/Documents/Obsidian Vault/2nd Brain"))

IG_ACCOUNT = "108d0d24-67ed-4f96-9605-ebda529f383f"
GMAIL_ACCOUNT = "0977bda7-635e-4ce8-8572-5ea6ffe62cd2"
DISCORD_ACCOUNT = "10c06475-462d-4283-8bee-fbe86b9c6430"

COMPOSIO_BASE = "https://backend.composio.dev/api/v2"

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.index(PINECONE_INDEX)


def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def make_embedding(text: str) -> list[float]:
    """Generate a deterministic pseudo-embedding for text (1536 dims).
    Replace with real embedding API (OpenAI, Cohere, etc.) for production."""
    h = hashlib.sha256(text.encode()).hexdigest()
    dims = 1536
    vec = []
    for i in range(dims):
        seed = int(h[(i * 2) % 64:(i * 2 + 2) % 64 + 2], 16)
        vec.append((seed / 255.0) * 2 - 1)
    return vec


def composio_exec(action: str, account_id: str, input_data: dict = None) -> dict:
    """Execute a Composio action."""
    try:
        res = requests.post(
            f"{COMPOSIO_BASE}/actions/{action}/execute",
            headers={"x-api-key": COMPOSIO_API_KEY, "Content-Type": "application/json"},
            json={"connectedAccountId": account_id, "input": input_data or {}},
            timeout=30,
        )
        return res.json()
    except Exception as e:
        log(f"  ERROR: {e}")
        return {"successful": False, "error": str(e)}


def sync_instagram():
    """Pull Instagram posts into Pinecone."""
    log("Syncing Instagram...")
    data = composio_exec("INSTAGRAM_GET_USER_MEDIA", IG_ACCOUNT)
    posts = data.get("data", {}).get("data", [])
    if not posts:
        log("  No posts found")
        return 0

    records = []
    for p in posts[:25]:
        text = f"Instagram {p.get('media_type', 'POST')}: {p.get('caption', 'No caption')} | Likes: {p.get('like_count', 0)} | Comments: {p.get('comments_count', 0)}"
        vec_id = f"ig-{p['id']}"
        records.append({
            "id": vec_id,
            "values": make_embedding(text),
            "metadata": {
                "title": (p.get("caption") or "Instagram post")[:80],
                "content": text[:500],
                "type": "instagram_post",
                "source": "instagram",
                "mediaType": p.get("media_type", ""),
                "likes": p.get("like_count", 0),
                "comments": p.get("comments_count", 0),
                "permalink": p.get("permalink", ""),
                "createdAt": p.get("timestamp", datetime.now().isoformat()),
                "syncedAt": datetime.now().isoformat(),
            },
        })

    if records:
        index.upsert(records=records)
        log(f"  Absorbed {len(records)} Instagram posts")
    return len(records)


def sync_gmail():
    """Pull recent emails into Pinecone."""
    log("Syncing Gmail...")
    data = composio_exec("GMAIL_FETCH_EMAILS", GMAIL_ACCOUNT, {"max_results": 20})
    emails = data.get("data", {}).get("messages", data.get("data", {}).get("emails", []))
    if not emails:
        log("  No emails found")
        return 0

    records = []
    for e in emails[:15]:
        subject = e.get("subject", "")
        sender = e.get("from", {})
        if isinstance(sender, dict):
            sender = sender.get("text", "")
        snippet = e.get("snippet", e.get("text", ""))[:200]
        text = f"Email from {sender}: {subject} — {snippet}"
        vec_id = f"email-{hashlib.md5(text.encode()).hexdigest()[:12]}"

        records.append({
            "id": vec_id,
            "values": make_embedding(text),
            "metadata": {
                "title": subject[:80] or "Email",
                "content": text[:500],
                "type": "email",
                "source": "gmail",
                "sender": str(sender)[:100],
                "createdAt": e.get("date", datetime.now().isoformat()),
                "syncedAt": datetime.now().isoformat(),
            },
        })

    if records:
        index.upsert(records=records)
        log(f"  Absorbed {len(records)} emails")
    return len(records)


def sync_obsidian():
    """Parse Obsidian vault markdown files into Pinecone."""
    log(f"Syncing Obsidian vault: {OBSIDIAN_VAULT}")
    vault_path = Path(OBSIDIAN_VAULT)
    if not vault_path.exists():
        log(f"  Vault not found at {OBSIDIAN_VAULT}")
        log("  Set OBSIDIAN_VAULT env var to your vault path")
        return 0

    md_files = list(vault_path.rglob("*.md"))
    log(f"  Found {len(md_files)} markdown files")

    records = []
    for f in md_files[:100]:
        try:
            content = f.read_text(encoding="utf-8", errors="ignore")
            if len(content.strip()) < 10:
                continue

            title = f.stem
            rel_path = str(f.relative_to(vault_path))

            # Extract tags
            tags = re.findall(r"#(\w+)", content)
            # Extract wikilinks
            links = re.findall(r"\[\[([^\]]+)\]\]", content)

            text = f"Obsidian note: {title}. Tags: {', '.join(tags[:10])}. Links: {', '.join(links[:10])}. Content: {content[:300]}"
            vec_id = f"obsidian-{hashlib.md5(rel_path.encode()).hexdigest()[:12]}"

            records.append({
                "id": vec_id,
                "values": make_embedding(text),
                "metadata": {
                    "title": title[:80],
                    "content": content[:500],
                    "type": "note",
                    "source": "obsidian",
                    "path": rel_path,
                    "tags": json.dumps(tags[:20]),
                    "links": json.dumps(links[:20]),
                    "createdAt": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                    "syncedAt": datetime.now().isoformat(),
                },
            })
        except Exception as e:
            log(f"  Error reading {f.name}: {e}")

    if records:
        # Batch upsert in chunks of 50
        for i in range(0, len(records), 50):
            batch = records[i:i+50]
            index.upsert(records=batch)
        log(f"  Absorbed {len(records)} Obsidian notes")
    return len(records)


def sync_discord():
    """Pull Discord server info into Pinecone."""
    log("Syncing Discord...")
    data = composio_exec("DISCORD_LIST_MY_GUILDS", DISCORD_ACCOUNT)
    guilds = data.get("data", {}).get("details", [])

    records = []
    for g in guilds:
        text = f"Discord server: {g.get('name', '')}. Owner: {g.get('owner', False)}."
        vec_id = f"discord-{g.get('id', '')}"
        records.append({
            "id": vec_id,
            "values": make_embedding(text),
            "metadata": {
                "title": g.get("name", "Discord server")[:80],
                "content": text,
                "type": "discord",
                "source": "discord",
                "owner": g.get("owner", False),
                "createdAt": datetime.now().isoformat(),
                "syncedAt": datetime.now().isoformat(),
            },
        })

    if records:
        index.upsert(records=records)
        log(f"  Absorbed {len(records)} Discord servers")
    return len(records)


def main():
    parser = argparse.ArgumentParser(description="Stud-Ex Second Brain Daily Sync")
    parser.add_argument("--source", choices=["instagram", "gmail", "obsidian", "discord", "all"], default="all")
    args = parser.parse_args()

    log("=" * 50)
    log("STUD-EX SECOND BRAIN DAILY SYNC")
    log("=" * 50)

    total = 0
    sources = [args.source] if args.source != "all" else ["instagram", "gmail", "obsidian", "discord"]

    for source in sources:
        try:
            if source == "instagram":
                total += sync_instagram()
            elif source == "gmail":
                total += sync_gmail()
            elif source == "obsidian":
                total += sync_obsidian()
            elif source == "discord":
                total += sync_discord()
        except Exception as e:
            log(f"ERROR syncing {source}: {e}")

    # Get final stats
    stats = index.describe_index_stats()
    log("=" * 50)
    log(f"SYNC COMPLETE: {total} items absorbed")
    log(f"Total vectors in brain: {stats.get('total_vector_count', 'unknown')}")
    log("=" * 50)


if __name__ == "__main__":
    main()
