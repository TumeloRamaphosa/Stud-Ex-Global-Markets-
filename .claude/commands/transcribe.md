# YouTube Video Transcriber

Transcribe a YouTube video from its URL.

## Instructions

Given the YouTube URL provided by the user: $ARGUMENTS

1. Use WebFetch to fetch the YouTube page and extract the video title and metadata
2. Use WebFetch to attempt to get the transcript/captions from the video page
3. If captions are not directly available from the page, try fetching from known transcript services:
   - Try: `https://www.youtube.com/watch?v=VIDEO_ID` with a prompt to extract any transcript or caption data
   - Try fetching the auto-generated captions if available
4. Format the transcript cleanly with:
   - Video title at the top
   - Timestamps (if available)
   - Clean, readable text paragraphs
5. Present the full transcript to the user

## Output Format

```
## Video: [Title]
**URL:** [YouTube URL]
**Duration:** [if available]

---

### Transcript

[timestamp] text content here...
```

## Notes
- If no captions/transcript are available, inform the user and suggest alternatives
- For long videos, present the full transcript without truncation
- Clean up auto-generated caption artifacts (duplicate lines, timing overlaps)
