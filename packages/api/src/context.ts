import { db, type Database } from '@repo/db';
import { auth } from '../../../apps/web/lib/auth';
import type { Session } from '../../../apps/web/lib/auth';

/**
 * Creates context for tRPC procedures
 * This will be available in all tRPC procedures
 *
 * @param opts - Options including headers for session extraction
 */
export const createContext = async (opts: { headers: Headers }) => {
  // Get session from Better Auth using request headers
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    db,
    session: session || null,
  };
};

export type Context = {
  db: Database;
  session: Session | null;
};
