import { NextResponse } from 'next/server';

// Sign-out is now handled by Clerk's <UserButton /> component.
// This route is kept for backward compatibility.
export async function POST() {
  return NextResponse.json({ ok: true });
}
