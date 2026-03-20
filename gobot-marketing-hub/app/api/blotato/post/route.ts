import { NextResponse } from 'next/server';
import { publishToMultiplePlatforms, getAccounts, getPostStatus } from '@/lib/blotato';
import { updateContentRecord, logAutomation } from '@/lib/airtable';
import type { BlotaPlatform } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      text,
      mediaUrls = [],
      platforms,
      scheduledTime,
      useNextFreeSlot,
      airtableRecordId,
    } = body;

    if (!text || !platforms?.length) {
      return NextResponse.json(
        { error: 'text and platforms are required' },
        { status: 400 }
      );
    }

    // Get all connected accounts
    const accounts = await getAccounts();

    // Post to all selected platforms
    const results = await publishToMultiplePlatforms(
      accounts,
      text,
      mediaUrls,
      platforms as BlotaPlatform[],
      scheduledTime,
      useNextFreeSlot
    );

    // Update Airtable record if provided
    if (airtableRecordId) {
      const submissionIds = results
        .filter((r) => r.submissionId)
        .map((r) => r.submissionId);

      const allSuccess = results.every((r) => !r.error);

      await updateContentRecord(airtableRecordId, {
        Status: scheduledTime ? 'Scheduled' : allSuccess ? 'Posted' : 'Failed',
        'Blotato Submission IDs': JSON.stringify(submissionIds),
        ...(scheduledTime ? {} : { 'Posted Date': new Date().toISOString() }),
      });

      // Log the automation
      await logAutomation({
        'Action Type': 'Multi-Platform Post',
        'Action Details': `Posted to ${platforms.join(', ')}. ${results.filter((r) => !r.error).length}/${platforms.length} successful.`,
        Status: allSuccess ? 'Success' : 'Failed',
        'Triggered By': 'GoBot Marketing Hub',
        'Triggered At': new Date().toISOString(),
        'Content Record ID': airtableRecordId,
        ...(results.some((r) => r.error)
          ? { 'Error Message': results.filter((r) => r.error).map((r) => `${r.platform}: ${r.error}`).join('; ') }
          : {}),
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get('submissionId');

  if (!submissionId) {
    return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
  }

  try {
    const status = await getPostStatus(submissionId);
    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
