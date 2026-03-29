---
name: transcribe-youtube
description: Transcribe a YouTube video and provide a formatted breakdown of its content.
user_invocable: true
arguments:
  - name: url
    description: YouTube video URL or video ID
    required: true
---

# YouTube Video Transcription Skill

## Purpose
Transcribe a YouTube video from its URL or video ID, then provide a structured breakdown of its content.

## Steps

1. **Extract the video ID** from the provided URL or use it directly if already an ID.

2. **Run the transcription script**:
   ```bash
   python3 scripts/transcribe_youtube.py "<url>" --format sections
   ```
   This fetches the video's auto-generated captions/transcript and formats them into time-based sections.

3. **Present the results** to the user with:
   - Video title and link
   - A high-level summary of the video's content
   - Section-by-section breakdown with timestamps
   - Key takeaways or action items (if applicable)

## Available Formats

The script supports multiple output formats via the `--format` flag:
- `timestamped` — Every line with its timestamp (default)
- `plain` — Full transcript as plain text, no timestamps
- `sections` — Grouped into 1-minute sections with headers
- `json` — Structured JSON output with all metadata

## Example Usage

User: `/transcribe-youtube https://youtu.be/abc123def45`

Response should include:
1. Video title and metadata
2. Brief summary (2-3 sentences)
3. Detailed section-by-section breakdown
4. Key points / takeaways

## Error Handling

- If the `youtube-transcript-api` package is not installed, the script will auto-install it.
- If no transcript is available (e.g., captions disabled), inform the user and suggest alternatives.
- If the URL format is unrecognized, ask the user to provide a valid YouTube URL or video ID.

## Notes
- This uses YouTube's auto-generated captions when manual captions aren't available.
- Transcript quality depends on the video's audio clarity and language.
- The script requires Python 3 and internet access.
