# MCP Token Bloat Reduction

> Reference: "Strategies to reduce MCP token bloat" by Eddy Says Hi
> Source: https://www.youtube.com/watch?v=BK169j7wQas

## Purpose

Optimize MCP (Model Context Protocol) tool usage to minimize token consumption, reduce costs, and improve response speed across all Claude Code sessions.

## Strategies

### 1. Minimize Tool Descriptions
- Keep MCP tool descriptions concise and specific
- Avoid redundant parameter descriptions
- Use short, clear names for tools and parameters

### 2. Reduce Tool Call Overhead
- Batch related operations into single tool calls when possible
- Avoid unnecessary tool invocations — check if data is already available in context
- Use targeted queries (specific file paths, line ranges) instead of broad searches

### 3. Response Filtering
- Request only the fields/data you need from tool responses
- Use pagination and limits on large result sets
- Filter at the source rather than post-processing large payloads

### 4. Context Window Management
- Prefer dedicated tools (Read, Grep, Glob) over Bash equivalents — they produce leaner output
- Use sub-agents for research tasks to avoid polluting the main context window
- Summarize large tool outputs before passing them forward

### 5. Skill-Specific Optimization
- When using multiple skill sources (superpowers, denchclaw, claude-mem), only load relevant skills for the current task
- Use progressive disclosure (claude-mem's 3-layer search) instead of dumping full context
- Prefer skill composition over monolithic prompts

### 6. MCP Server Configuration
- Only enable MCP servers needed for the current workflow
- Configure tool-level permissions to reduce the tool catalog sent per request
- Use caching for frequently accessed resources

## When to Apply

Invoke this skill when:
- Sessions are running slow or hitting context limits
- Token costs are higher than expected
- Working with multiple MCP servers simultaneously
- Tool responses are returning excessive data

## Quick Checklist

- [ ] Are all enabled MCP servers actually needed right now?
- [ ] Am I using dedicated tools instead of Bash for file operations?
- [ ] Am I requesting specific data rather than broad queries?
- [ ] Can I delegate research to a sub-agent to protect main context?
- [ ] Am I using progressive disclosure for memory/search results?
