import type { NextRequest } from 'next/server';
import { resetAndSeedDatabase } from '@/lib/seed-data';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return Response.json({ success: false }, { status: 401 });
  }

  try {
    const summary = await resetAndSeedDatabase();

    return Response.json({ success: true, summary });
  } catch (error) {
    console.error('Demo database reset failed:', error);

    return Response.json(
      { success: false, message: 'Failed to reset demo data.' },
      { status: 500 }
    );
  }
}
