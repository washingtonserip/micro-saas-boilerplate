# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Micro SaaS boilerplate built with a monorepo architecture using Turborepo. The stack includes Next.js 16 with App Router, tRPC v11 for type-safe APIs, Drizzle ORM with PostgreSQL, and shadcn/ui components with TailwindCSS v4.

**Package Manager:** pnpm 9.0.0+ (required)
**Node Version:** 18+

## Monorepo Structure

```
apps/
  web/              # Next.js application (main app)
packages/
  api/              # tRPC API layer (@repo/api)
  db/               # Drizzle ORM + schemas (@repo/db)
  ui/               # shadcn/ui components (@repo/ui)
  eslint-config/    # Shared ESLint configs
  typescript-config/# Shared TypeScript configs
```

## Common Commands

### Development
```bash
# Start all apps in dev mode (Next.js on port 3000)
pnpm dev

# Start only the web app
pnpm --filter web dev

# Build all packages and apps
pnpm build

# Type checking across all packages
pnpm check-types

# Lint all packages
pnpm lint

# Format code with Prettier
pnpm format
```

### Database Commands

**Important:** Always prefix database commands with `DATABASE_URL` when running outside of a configured Next.js environment.

```bash
# Generate migration files from schema changes
DATABASE_URL=<url> pnpm --filter @repo/db db:generate

# Run migrations (production workflow - creates migrations/ folder)
DATABASE_URL=<url> pnpm --filter @repo/db db:migrate

# Push schema directly to DB (dev only, skip for production)
DATABASE_URL=<url> pnpm --filter @repo/db db:push

# Open Drizzle Studio GUI at localhost:4983
DATABASE_URL=<url> pnpm --filter @repo/db db:studio

# Drop migrations
DATABASE_URL=<url> pnpm --filter @repo/db db:drop
```

**Note:** The `postinstall` script in `packages/db/package.json` automatically runs migrations when `DATABASE_URL` is set (used in production deployments).

### Docker Database
```bash
# Start PostgreSQL (localhost:5432) + pgAdmin (localhost:5050)
docker compose up -d

# Stop services
docker compose down
```

pgAdmin credentials: `admin@admin.com` / `admin`

## Architecture Details

### tRPC API Layer (`@repo/api`)

The tRPC setup provides end-to-end type safety between the backend and frontend:

- **Router Definition**: `packages/api/src/routers/index.ts` - Main router that combines all sub-routers
- **Procedures**: `packages/api/src/routers/*.ts` - Individual router modules (e.g., `post.ts`)
- **Context**: `packages/api/src/context.ts` - Creates context with database instance, available in all procedures
- **Base Setup**: `packages/api/src/trpc.ts` - Exports `router` and `publicProcedure` helpers

**Adding new procedures:**
1. Create or update a router in `packages/api/src/routers/`
2. Use `publicProcedure` from `../trpc` to define procedures
3. Access database via `ctx.db` in procedures
4. Add router to `appRouter` in `packages/api/src/routers/index.ts`

### Database Layer (`@repo/db`)

Uses Drizzle ORM with lazy database initialization:

- **Client**: `packages/db/src/client.ts` - Exports `db` proxy that lazily connects using `DATABASE_URL`
- **Schemas**: `packages/db/src/schema/*.ts` - Define tables (e.g., `posts.ts`)
- **Schema Index**: `packages/db/src/schema/index.ts` - Exports all schemas
- **Migrations Config**: `packages/db/drizzle.config.ts` - Points to `./migrations` output directory
- **Type Exports**: Use `$inferSelect` and `$inferInsert` for TypeScript types

**Schema workflow:**
1. Define or modify schemas in `packages/db/src/schema/`
2. Export from `packages/db/src/schema/index.ts`
3. Generate migration: `db:generate`
4. Apply migration: `db:migrate` (production) or `db:push` (dev)

### Next.js App (`apps/web`)

- **tRPC Integration**:
  - API Route Handler: `apps/web/app/api/trpc/[trpc]/route.ts` - Uses `fetchRequestHandler`
  - React Client: `apps/web/lib/trpc/react.tsx` - Exports `trpc` (React Query hooks) and `TRPCProvider`
  - Vanilla Client: `apps/web/lib/trpc/client.ts` - For server-side usage
  - Root Layout: Wrap app with `TRPCProvider` for client components

- **Usage Patterns**:
  - Client Components: `const { data } = trpc.post.getAll.useQuery()`
  - Server Components: `const posts = await trpc.post.getAll.query()`

### UI Package (`@repo/ui`)

- Based on shadcn/ui with Radix UI primitives
- Components in `packages/ui/src/components/ui/`
- Custom composed components in `packages/ui/src/components/`
- Import pattern: `import { Button } from "@repo/ui/button"`
- Styles in `packages/ui/src/styles/`

## Environment Configuration

Create `.env` in root and `apps/web/.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/micro_saas_boilerplate
```

Production requires SSL: `?sslmode=require`

## Type Safety Flow

1. Define database schema in `@repo/db`
2. Create tRPC procedures in `@repo/api` using the schema
3. Export `AppRouter` type from `@repo/api`
4. Import `AppRouter` in Next.js app for full type inference
5. Types flow automatically through React Query hooks

## Development Workflow for New Features

1. **Database Schema**: Add/modify in `packages/db/src/schema/`
2. **Generate Migration**: `pnpm --filter @repo/db db:generate`
3. **Apply Migration**: `pnpm --filter @repo/db db:migrate` (or `db:push` for dev)
4. **API Procedures**: Add tRPC procedures in `packages/api/src/routers/`
5. **UI Components**: Create in `packages/ui/src/` if reusable
6. **Pages**: Build in `apps/web/app/` using App Router
7. **Type Safety**: No manual type imports needed - types flow from tRPC

## Production Deployment (Vercel)

1. Set `DATABASE_URL` environment variable in Vercel
2. Root Directory: `apps/web`
3. Framework: Next.js (auto-detected)
4. Migrations run automatically via `postinstall` hook during build

## Key Technical Decisions

- **Lazy DB Connection**: Database client uses Proxy pattern to avoid connecting at module evaluation time
- **Monorepo with Turborepo**: Efficient caching and task orchestration across packages
- **tRPC v11**: End-to-end type safety without code generation
- **Workspace Protocol**: Uses `workspace:*` for internal package dependencies
- **Migration Strategy**: Drizzle generates SQL migrations in `packages/db/migrations/`
