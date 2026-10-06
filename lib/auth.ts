import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from './db';

/**
 * Returns the current user's DB record.
 * If the user exists in Clerk but not yet in our DB, it is created on the fly
 * (just-in-time provisioning).
 * Throws 'UNAUTHORIZED' when there is no active Clerk session.
 */
export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHORIZED');

  // Try to find by Clerk user ID (stored as User.id)
  let user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    // JIT provision: fetch profile from Clerk and create a DB row
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error('UNAUTHORIZED');

    const email =
      clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) throw new Error('UNAUTHORIZED');

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      clerkUser.username ||
      email.split('@')[0];

    user = await db.user.upsert({
      where:  { id: userId },
      update: {},
      create: {
        id:    userId,
        name,
        email,
        passwordHash: '', // not used — Clerk owns credentials
      },
    });
  }

  return user;
}

/**
 * Returns the current user and asserts they have the ADMIN role.
 * Throws 'UNAUTHORIZED' or 'FORBIDDEN' accordingly.
 */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return user;
}

/** Lightweight check — returns the session user record or null. */
export async function getSession() {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}
