import { db, type Database } from '@repo/db';
import { auth } from '../../../apps/web/lib/auth';
import type { Session } from '../../../apps/web/lib/auth';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

/**
 * Creates context for tRPC procedures
 * This will be available in all tRPC procedures
 *
 * @param opts - Options from tRPC fetch adapter
 */
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Get session from Better Auth using request headers
  const session = await auth.api.getSession({
    headers: opts.req.headers,
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
