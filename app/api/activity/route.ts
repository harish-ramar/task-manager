import { NextRequest, NextResponse } from 'next/server';
import { getActivityLogs } from '@/lib/db/queries';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    // Check if user is authenticated
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await getActivityLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}
