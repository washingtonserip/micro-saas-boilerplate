// Export database client
export { db, type Database } from './client';

// Export all schemas and types
export * from './schema';

// Re-export commonly used drizzle-orm methods
export {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  exists,
  notExists,
  between,
  notBetween,
  like,
  notLike,
  ilike,
  notIlike,
  and,
  or,
  not,
  sql,
  desc,
  asc,
} from 'drizzle-orm';
