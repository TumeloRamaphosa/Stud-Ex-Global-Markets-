#!/usr/bin/env python3
"""
YouTube Video Transcriber
Fetches transcript/captions from a YouTube video and outputs formatted results.

Usage:
    python3 scripts/transcribe_youtube.py <youtube_url_or_video_id> [--format FORMAT]

Formats: timestamped (default), plain, sections, json
"""

import sys
import re
import json
import argparse


def extract_video_id(url_or_id: str) -> str:
    """Extract YouTube video ID from various URL formats or a raw ID."""
    patterns = [
        r'(?:youtu\.be/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com/watch\?.*v=)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com/embed/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com/shorts/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com/v/)([a-zA-Z0-9_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url_or_id)
        if match:
            return match.group(1)
    # Assume it's already a video ID
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url_or_id):
        return url_or_id
    raise ValueError(f"Could not extract video ID from: {url_or_id}")


def fetch_video_title(video_id: str) -> str:
    """Fetch video title via YouTube oEmbed API."""
    try:
        import urllib.request
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return data.get("title", "Unknown Title")
    except Exception:
        return "Unknown Title"


class TranscriptSegment:
    """Simple container for a transcript segment."""
    def __init__(self, start: float, duration: float, text: str):
        self.start = start
        self.duration = duration
        self.text = text


def fetch_transcript_fallback(video_id: str):
    """Fallback: fetch transcript by parsing YouTube's timedtext XML endpoint."""
    import urllib.request
    import xml.etree.ElementTree as ET

    # Try to get the video page to find caption track URLs
    page_url = f"https://www.youtube.com/watch?v={video_id}"
    req = urllib.request.Request(page_url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    })

    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    # Extract timedtext URL from page source
    caption_match = re.search(r'"captionTracks":\s*\[(.*?)\]', html)
    if not caption_match:
        raise RuntimeError("No captions found for this video.")

    caption_data = caption_match.group(1)
    url_match = re.search(r'"baseUrl":\s*"(.*?)"', caption_data)
    if not url_match:
        raise RuntimeError("Could not extract caption URL.")

    caption_url = url_match.group(1).replace("\\u0026", "&")
    # Ensure we get XML format
    if "fmt=" not in caption_url:
        caption_url += "&fmt=srv3"

    req2 = urllib.request.Request(caption_url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    with urllib.request.urlopen(req2, timeout=15) as resp2:
        xml_data = resp2.read().decode("utf-8", errors="replace")

    root = ET.fromstring(xml_data)
    segments = []
    for elem in root.iter():
        if elem.tag in ("text", "p"):
            start = float(elem.get("start", elem.get("t", 0)))
            # Convert milliseconds to seconds if needed (srv3 uses ms)
            if start > 100000:
                start = start / 1000.0
            dur = float(elem.get("dur", elem.get("d", 0)))
            if dur > 100000:
                dur = dur / 1000.0
            text = elem.text or ""
            # Handle nested spans
            if not text.strip():
                text = " ".join(s.text or "" for s in elem if s.text)
            text = text.strip()
            if text:
                segments.append(TranscriptSegment(start, dur, text))

    if not segments:
        raise RuntimeError("Transcript was empty.")
    return segments


def fetch_transcript(video_id: str):
    """Fetch transcript using youtube_transcript_api, with fallback."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError:
        print("Installing youtube-transcript-api...", file=sys.stderr)
        import subprocess
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "youtube-transcript-api"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        from youtube_transcript_api import YouTubeTranscriptApi

    try:
        api = YouTubeTranscriptApi()
        return api.fetch(video_id=video_id)
    except Exception as e:
        print(f"Primary method failed ({e}), trying fallback...", file=sys.stderr)
        try:
            return fetch_transcript_fallback(video_id)
        except Exception as e2:
            print(f"Fallback also failed: {e2}", file=sys.stderr)
            raise RuntimeError(
                f"Could not fetch transcript for video {video_id}. "
                f"Primary: {e} | Fallback: {e2}\n"
                "This may be due to IP blocking on cloud environments, "
                "or the video may not have captions available."
            ) from e2


def format_timestamp(seconds: float) -> str:
    """Convert seconds to MM:SS or HH:MM:SS format."""
    total = int(seconds)
    hrs = total // 3600
    mins = (total % 3600) // 60
    secs = total % 60
    if hrs > 0:
        return f"{hrs:02d}:{mins:02d}:{secs:02d}"
    return f"{mins:02d}:{secs:02d}"


def format_timestamped(transcript) -> str:
    """Format with timestamps on each line."""
    lines = []
    for snippet in transcript:
        ts = format_timestamp(snippet.start)
        lines.append(f"[{ts}] {snippet.text}")
    return "\n".join(lines)


def format_plain(transcript) -> str:
    """Plain text without timestamps."""
    return " ".join(snippet.text for snippet in transcript)


def format_sections(transcript, interval_seconds: int = 60) -> str:
    """Group transcript into time-based sections."""
    sections = []
    current_section_start = 0
    current_texts = []

    for snippet in transcript:
        section_index = int(snippet.start) // interval_seconds
        expected_start = section_index * interval_seconds

        if expected_start != current_section_start and current_texts:
            header = format_timestamp(current_section_start)
            end = format_timestamp(current_section_start + interval_seconds)
            sections.append(f"### [{header} - {end}]\n{' '.join(current_texts)}")
            current_texts = []
            current_section_start = expected_start
        elif not current_texts:
            current_section_start = expected_start

        current_texts.append(snippet.text)

    if current_texts:
        header = format_timestamp(current_section_start)
        sections.append(f"### [{header}+]\n{' '.join(current_texts)}")

    return "\n\n".join(sections)


def format_json(transcript, title: str, video_id: str) -> str:
    """Output as JSON."""
    data = {
        "video_id": video_id,
        "title": title,
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "segments": [
            {
                "start": snippet.start,
                "duration": snippet.duration,
                "text": snippet.text,
            }
            for snippet in transcript
        ],
    }
    return json.dumps(data, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Transcribe a YouTube video")
    parser.add_argument("url", help="YouTube URL or video ID")
    parser.add_argument(
        "--format", "-f",
        choices=["timestamped", "plain", "sections", "json"],
        default="timestamped",
        help="Output format (default: timestamped)",
    )
    parser.add_argument(
        "--section-interval", "-s",
        type=int,
        default=60,
        help="Section interval in seconds for 'sections' format (default: 60)",
    )
    args = parser.parse_args()

    video_id = extract_video_id(args.url)
    title = fetch_video_title(video_id)

    print(f"# {title}", file=sys.stderr)
    print(f"# Video ID: {video_id}", file=sys.stderr)
    print(f"# URL: https://www.youtube.com/watch?v={video_id}", file=sys.stderr)
    print("", file=sys.stderr)

    transcript = fetch_transcript(video_id)

    if args.format == "timestamped":
        output = format_timestamped(transcript)
    elif args.format == "plain":
        output = format_plain(transcript)
    elif args.format == "sections":
        output = format_sections(transcript, args.section_interval)
    elif args.format == "json":
        output = format_json(transcript, title, video_id)

    # Print header to stdout too
    print(f"# {title}")
    print(f"**Video:** https://www.youtube.com/watch?v={video_id}")
    print()
    print(output)


if __name__ == "__main__":
    main()
