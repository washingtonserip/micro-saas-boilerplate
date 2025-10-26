import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Lazy initialization to avoid connecting at module evaluation time
let _db: PostgresJsDatabase<typeof schema> | null = null;

function getDatabase() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const client = postgres(process.env.DATABASE_URL);
    _db = drizzle(client, { schema });
  }
  return _db;
}

// Export a proxy that lazily initializes the database
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get: (_, prop) => {
    const database = getDatabase();
    return database[prop as keyof typeof database];
  },
});

// Export the type of the db instance for use in other packages
export type Database = PostgresJsDatabase<typeof schema>;
