import { NextRequest, NextResponse } from 'next/server';

// Simulated database (replace with Firestore)
const campaignStore: Map<string, any> = new Map();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = campaignStore.get(params.id);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = campaignStore.get(params.id);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const updates = await req.json();

    const updated = {
      ...campaign,
      ...updates,
      updatedAt: Date.now(),
    };

    campaignStore.set(params.id, updated);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!campaignStore.has(params.id)) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    campaignStore.delete(params.id);

    return NextResponse.json(
      { message: 'Campaign deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
