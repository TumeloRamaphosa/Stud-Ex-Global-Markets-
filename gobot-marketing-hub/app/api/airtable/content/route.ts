import { NextResponse } from 'next/server';
import {
  listContentRecords,
  createContentRecord,
  updateContentRecord,
  deleteContentRecord,
  getTodaysScheduledPosts,
  getPostsByStatus,
} from '@/lib/airtable';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const status = searchParams.get('status');

  try {
    if (action === 'today') {
      const records = await getTodaysScheduledPosts();
      return NextResponse.json({ records });
    }

    if (status) {
      const records = await getPostsByStatus(status as any);
      return NextResponse.json({ records });
    }

    const records = await listContentRecords(undefined, [
      { field: 'Scheduled Date', direction: 'desc' },
    ]);
    return NextResponse.json({ records });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch records';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const record = await createContentRecord({
      ...body,
      'Created At': new Date().toISOString(),
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { recordId, ...fields } = body;

    if (!recordId) {
      return NextResponse.json({ error: 'recordId is required' }, { status: 400 });
    }

    const record = await updateContentRecord(recordId, fields);
    return NextResponse.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const recordId = searchParams.get('recordId');

  if (!recordId) {
    return NextResponse.json({ error: 'recordId is required' }, { status: 400 });
  }

  try {
    await deleteContentRecord(recordId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
