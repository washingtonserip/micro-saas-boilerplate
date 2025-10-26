import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres client
const client = postgres(process.env.DATABASE_URL);

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export the type of the db instance for use in other packages
export type Database = typeof db;
