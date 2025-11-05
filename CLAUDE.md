# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Micro SaaS boilerplate built with a monorepo architecture using Turborepo. The stack includes Next.js 16 with App Router, tRPC v11 for type-safe APIs, Drizzle ORM with PostgreSQL, Better Auth for authentication, Stripe for payments, and shadcn/ui components with TailwindCSS v4.

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
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/micro_saas_boilerplate" pnpm --filter @repo/db db:generate

# Run migrations (production workflow - creates migrations/ folder)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/micro_saas_boilerplate" pnpm --filter @repo/db db:migrate

# Push schema directly to DB (dev only, skip for production)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/micro_saas_boilerplate" pnpm --filter @repo/db db:push

# Open Drizzle Studio GUI at localhost:4983
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/micro_saas_boilerplate" pnpm --filter @repo/db db:studio

# Drop migrations
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/micro_saas_boilerplate" pnpm --filter @repo/db db:drop
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

### Better Auth Commands
```bash
# Generate a new secret for BETTER_AUTH_SECRET
npx @better-auth/cli secret

# Or use the dedicated generate-secret command
npx @better-auth/cli generate-secret
```

### Stripe Development
```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local dev server (keep running during development)
stripe listen --forward-to http://localhost:3000/api/auth/stripe/webhook
```

## Architecture Details

### Authentication Layer (Better Auth)

Better Auth is configured in `apps/web/lib/auth.ts` with:

- **Adapter**: Drizzle adapter connected to PostgreSQL
- **Email/Password Auth**: Enabled with 8-128 character passwords
- **Email Verification**: Sends verification emails via Resend on signup
- **Password Reset**: Email-based password reset flow
- **Session Management**: 7-day sessions, updates every 24 hours
- **Stripe Integration**: Better Auth Stripe plugin for subscription management

**Auth Schema**: `packages/db/src/schema/auth.ts`
- Tables: `user`, `session`, `account`, `verification`
- Auto-created by Better Auth adapter

**Client Usage**:
```typescript
import { authClient } from "@/lib/auth-client";

// Sign up
await authClient.signUp.email({ email, password, name });

// Sign in
await authClient.signIn.email({ email, password });

// Get session
const session = await authClient.getSession();
```

**Server Usage**:
```typescript
import { auth } from "@/lib/auth";

const session = await auth.api.getSession({ headers: await headers() });
```

### Stripe Integration

Stripe is integrated via the Better Auth Stripe plugin (`@better-auth/stripe`):

- **Configuration**: `apps/web/lib/auth.ts` (stripePlugin)
- **Schema**: `packages/db/src/schema/stripe.ts`
  - Tables: `stripe_customer`, `stripe_subscription`
  - Automatically managed by Better Auth
- **tRPC Router**: `packages/api/src/routers/stripe.ts`
  - Procedures: `getSubscriptionStatus`, `createCheckoutSession`, `createBillingPortalSession`, `hasActiveSubscription`
- **Client Helpers**: `apps/web/lib/stripe/`
  - `helpers.ts`: Utility functions for Stripe operations
  - `subscription-guards.tsx`: React components and hooks for feature gating

**Subscription Plans**:
- **Free**: Default tier, no payment required
- **Starter**: Monthly/yearly with 14-day free trial
- **Pro**: Monthly/yearly with 14-day free trial

**Usage Example**:
```typescript
import { useHasAccess, RequireSubscription } from "@/lib/stripe/subscription-guards";

// Guard component
<RequireSubscription requiredPlan="starter">
  <PremiumFeature />
</RequireSubscription>

// Hook for access control
const { hasAccess, plan } = useHasAccess("pro");
```

**Webhook Handling**: Automatic via Better Auth Stripe plugin at `/api/auth/stripe/webhook`

### tRPC API Layer (`@repo/api`)

The tRPC setup provides end-to-end type safety between the backend and frontend:

- **Router Definition**: `packages/api/src/routers/index.ts` - Main router that combines all sub-routers
- **Procedures**: `packages/api/src/routers/*.ts` - Individual router modules
  - `post.ts`: Example CRUD operations
  - `stripe.ts`: Subscription and billing operations
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
- **Schemas**: `packages/db/src/schema/*.ts` - Define tables
  - `auth.ts`: Better Auth tables (user, session, account, verification)
  - `stripe.ts`: Stripe tables (customer, subscription)
  - `posts.ts`: Example application table
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

- **Better Auth Integration**:
  - Auth Config: `apps/web/lib/auth.ts` - Server-side auth instance
  - Auth Client: `apps/web/lib/auth-client.ts` - Client-side auth instance
  - API Routes: `apps/web/app/api/auth/[...all]/route.ts` - Better Auth API handler

- **Usage Patterns**:
  - Client Components: `const { data } = trpc.post.getAll.useQuery()`
  - Server Components: `const posts = await trpc.post.getAll.query()`
  - Auth Client: `await authClient.signIn.email({ email, password })`
  - Auth Server: `const session = await auth.api.getSession({ headers: await headers() })`

### UI Package (`@repo/ui`)

- Based on shadcn/ui with Radix UI primitives
- Components in `packages/ui/src/components/ui/`
- Custom composed components in `packages/ui/src/components/`
- Import pattern: `import { Button } from "@repo/ui/button"`
- Styles in `packages/ui/src/styles/`

## Environment Configuration

### Root `.env`
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/micro_saas_boilerplate
```

### `apps/web/.env.local`
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/micro_saas_boilerplate

# Better Auth
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<generate with: npx @better-auth/cli secret>
BETTER_AUTH_URL=http://localhost:3000

# Resend (Email)
RESEND_API_KEY=<optional>

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Price IDs
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_STARTER_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
```

**Production**: Add `?sslmode=require` to `DATABASE_URL`

## Type Safety Flow

1. Define database schema in `@repo/db`
2. Create tRPC procedures in `@repo/api` using the schema
3. Export `AppRouter` type from `@repo/api`
4. Import `AppRouter` in Next.js app for full type inference
5. Types flow automatically through React Query hooks
6. Better Auth provides typed `Session` and `User` exports

## Development Workflow for New Features

1. **Database Schema**: Add/modify in `packages/db/src/schema/`
2. **Generate Migration**: `DATABASE_URL=<url> pnpm --filter @repo/db db:generate`
3. **Apply Migration**: `DATABASE_URL=<url> pnpm --filter @repo/db db:migrate` (or `db:push` for dev)
4. **API Procedures**: Add tRPC procedures in `packages/api/src/routers/`
5. **UI Components**: Create in `packages/ui/src/` if reusable
6. **Pages**: Build in `apps/web/app/` using App Router
7. **Type Safety**: No manual type imports needed - types flow from tRPC and Better Auth

## Adding Stripe to New Features

1. **Define Stripe Price IDs** in environment variables
2. **Update plans** in `apps/web/lib/auth.ts` (stripePlugin config)
3. **Add tRPC procedures** in `packages/api/src/routers/stripe.ts` if needed
4. **Use subscription guards** from `apps/web/lib/stripe/subscription-guards.tsx`
5. **Test locally** with Stripe CLI webhook forwarding

## Production Deployment (Vercel)

1. Set environment variables in Vercel:
   - `DATABASE_URL` (with `?sslmode=require`)
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (production URL)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, etc.
2. Root Directory: `apps/web`
3. Framework: Next.js (auto-detected)
4. Migrations run automatically via `postinstall` hook during build
5. Set up Stripe webhook endpoint in Stripe Dashboard pointing to your production URL

## Key Technical Decisions

- **Lazy DB Connection**: Database client uses Proxy pattern to avoid connecting at module evaluation time
- **Monorepo with Turborepo**: Efficient caching and task orchestration across packages
- **tRPC v11**: End-to-end type safety without code generation
- **Better Auth**: Drop-in authentication with full type safety and Drizzle integration
- **Better Auth Stripe Plugin**: Manages subscription lifecycle automatically via webhooks
- **Workspace Protocol**: Uses `workspace:*` for internal package dependencies
- **Migration Strategy**: Drizzle generates SQL migrations in `packages/db/migrations/`
- **Conditional Plugin Loading**: Stripe plugin only loads when API keys are present (allows CLI to work)

## Important Notes

- **Better Auth Tables**: Never manually modify `user`, `session`, `account`, or `verification` tables - managed by Better Auth
- **Stripe Tables**: `stripe_customer` and `stripe_subscription` are managed by Better Auth Stripe plugin
- **Email Service**: Resend API key is optional for local development (warnings will show in logs)
- **Stripe in Dev**: Use Stripe CLI for local webhook testing - keep `stripe listen` running
- **Database URL**: Must be set for migrations but can be omitted for local `pnpm install`
