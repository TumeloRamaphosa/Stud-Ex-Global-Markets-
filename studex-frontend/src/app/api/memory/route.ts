import { NextRequest, NextResponse } from "next/server";
import { buildDailyMemoryReport, getMemoryConfig, recordAgentEvent, recordAgentEvents } from "@/lib/agent-memory";

export const runtime = "nodejs";

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  const config = getMemoryConfig();
  return NextResponse.json({
    ok: true,
    service: "memory-writer",
    config: {
      obsidianWriteEnabled: config.obsidianWriteEnabled,
      obsidianDailyDir: config.obsidianDailyDir,
      tencentMemoryConfigured: Boolean(config.tencentMemoryUrl),
      ollamaUrl: config.ollamaUrl,
      ollamaModel: config.ollamaModel,
    },
  });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const action = (body.action as string) || "ingest";

  try {
    switch (action) {
      case "ingest": {
        const event = (body.event || body) as Parameters<typeof recordAgentEvent>[0];
        if (!event.agent || !event.summary) {
          return errorResponse("Missing required fields: agent, summary", 400);
        }
        const result = await recordAgentEvent(event);
        return NextResponse.json(result);
      }

      case "batch_ingest": {
        const events = Array.isArray(body.events) ? body.events : [];
        if (events.length === 0) {
          return errorResponse("Missing or empty events array", 400);
        }
        const result = await recordAgentEvents(events);
        return NextResponse.json({ ok: true, results: result });
      }

      case "daily_summary": {
        const events = Array.isArray(body.events) ? body.events : [];
        const result = await buildDailyMemoryReport(events);
        return NextResponse.json(result);
      }

      default:
        return errorResponse(`Unknown memory action: ${action}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Memory request failed";
    console.error(`[memory/${action}] Error:`, err);
    return errorResponse(message);
  }
}
