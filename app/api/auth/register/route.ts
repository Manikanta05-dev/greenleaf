import { NextResponse } from 'next/server';

// Authentication is now handled by Clerk.
// This route is kept for backward compatibility but is no longer active.
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Please use Clerk authentication.' },
    { status: 410 },
  );
}
