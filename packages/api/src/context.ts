import { db, type Database } from '@repo/db';

/**
 * Creates context for tRPC procedures
 * This will be available in all tRPC procedures
 */
export const createContext = async () => {
  return {
    db,
  };
};

export type Context = {
  db: Database;
};
