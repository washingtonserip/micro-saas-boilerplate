# Micro SaaS Boilerplate

A modern, production-ready Micro SaaS starter built with Next.js, tRPC, and Drizzle ORM. Get your SaaS up and running in minutes with authentication, payments, and a fully-configured monorepo architecture.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

![Micro SaaS Boilerplate](./cover.png)

## Features

- **Modern Stack** - Next.js 16, React 19, TypeScript, TailwindCSS v4
- **Authentication Built-in** - Better Auth with email/password, email verification, password reset
- **Payment Integration** - Stripe subscriptions with free trials and customer portal
- **Type-Safe APIs** - End-to-end type safety with tRPC v11
- **Database Ready** - Drizzle ORM with PostgreSQL, automatic schema migrations
- **Beautiful UI** - 40+ shadcn/ui components with Radix UI primitives
- **Monorepo Architecture** - Turborepo for optimal build caching and task running
- **Docker Support** - Local PostgreSQL + pgAdmin setup included
- **Developer Experience** - Hot reload, type checking, linting, formatting
- **Production Ready** - Optimized for Vercel deployment with automatic migrations

## What's Included

### Authentication System

- Email & password authentication
- Email verification on signup
- Password reset flow
- Session management (7-day sessions)
- Type-safe auth client and server APIs
- Protected routes and middleware ready

### Payment & Subscription System

- Stripe integration via Better Auth plugin
- Multiple pricing tiers (Free, Starter, Pro)
- Monthly and annual billing
- 14-day free trials
- Stripe Customer Portal
- Subscription lifecycle webhooks
- Feature gating components and hooks
- Trial abuse prevention

### Developer Tools

- Complete monorepo setup with Turborepo
- Type-safe database queries with Drizzle ORM
- Drizzle Studio for database management
- Docker Compose for local development
- ESLint and Prettier configured
- TypeScript strict mode
- AI coding assistant ready (CLAUDE.md)

### UI Components (40+)

Accordion, Alert Dialog, Avatar, Badge, Button, Card, Checkbox, Collapsible, Command, Context Menu, Dialog, Dropdown Menu, Form, Input, Label, Menubar, Navigation Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Sheet, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Toggle, Tooltip, and more!

## Tech Stack

| Category         | Technology               |
| ---------------- | ------------------------ |
| Framework        | Next.js 16 (App Router)  |
| Language         | TypeScript 5.9           |
| Styling          | TailwindCSS v4           |
| UI Components    | shadcn/ui + Radix UI     |
| API Layer        | tRPC v11                 |
| Database         | PostgreSQL (Drizzle ORM) |
| Authentication   | Better Auth              |
| Payments         | Stripe                   |
| Email            | Resend                   |
| Monorepo         | Turborepo                |
| Package Manager  | pnpm                     |
| Containerization | Docker Compose           |

## Project Structure

```
micro-saas-boilerplate/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App router pages
│       │   ├── (auth)/         # Auth pages (sign-in, sign-up, reset-password)
│       │   ├── dashboard/      # Dashboard with subscription management
│       │   ├── pricing/        # Pricing page
│       │   ├── payment/        # Payment success pages
│       │   └── api/            # API routes (tRPC, Better Auth)
│       ├── components/         # App-specific components
│       └── lib/                # App utilities (auth, stripe, trpc)
├── packages/
│   ├── api/                    # tRPC API layer (@repo/api)
│   │   └── src/routers/        # API routers (post, stripe)
│   ├── db/                     # Drizzle ORM + schemas (@repo/db)
│   │   ├── src/schema/         # Database schemas (auth, stripe, posts)
│   │   └── migrations/         # SQL migrations
│   ├── ui/                     # Shared UI components (@repo/ui)
│   │   └── src/components/     # shadcn/ui components
│   ├── eslint-config/          # Shared ESLint configs
│   └── typescript-config/      # Shared TypeScript configs
├── docker-compose.yml          # PostgreSQL + pgAdmin
├── CLAUDE.md                   # AI coding assistant guide
├── STRIPE_SETUP_GUIDE.md       # Detailed Stripe setup
└── package.json                # Root workspace config
```

## Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **pnpm** 9.0.0 or higher
- **Docker** (optional, for local database)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/washingtonserip/micro-saas-boilerplate.git
cd micro-saas-boilerplate
```

#### 2. Install dependencies

```bash
pnpm install
```

#### 3. Set up environment variables

```bash
# Copy root env
cp .env.example .env

# Copy web app env
cp .env apps/web/.env.local
```

#### 4. Generate Better Auth secret

```bash
npx @better-auth/cli secret
```

Copy the generated secret and add it to `apps/web/.env.local`:

```env
BETTER_AUTH_SECRET=your_generated_secret_here
```

#### 5. Start the database (using Docker)

```bash
docker compose up -d
```

This starts:

- **PostgreSQL** on `localhost:5432`
- **pgAdmin** on `localhost:5050` (login: `admin@admin.com` / `admin`)

#### 6. Run database migrations

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/micro_saas_boilerplate" pnpm --filter @repo/db db:migrate
```

#### 7. Start development server

```bash
pnpm dev
```

The app will be running at **[http://localhost:3000](http://localhost:3000)**

### First Steps

1. Visit [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up" to create an account
3. Check console logs for verification email (Resend not configured yet)
4. Explore the dashboard at [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

**Note:** Stripe and Resend are optional for initial development. See setup guides below to enable payments and emails.

## Authentication

This boilerplate uses **[Better Auth](https://www.better-auth.com/)** for authentication, providing:

- Email & password authentication
- Email verification on signup
- Password reset functionality
- Session management
- Type-safe auth APIs
- Automatic database table management

### Auth Pages

- `/sign-up` - User registration
- `/sign-in` - User login
- `/reset-password` - Password reset

### Usage Examples

**Client-side:**

```typescript
import { authClient } from "@/lib/auth-client";

// Sign up
await authClient.signUp.email({
  email: "user@example.com",
  password: "SecurePass123",
  name: "John Doe",
});

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "SecurePass123",
});

// Get current session
const session = await authClient.getSession();
```

**Server-side:**

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});
```

### Email Configuration (Optional)

To enable email verification and password reset emails:

1. Sign up for [Resend](https://resend.com) (free tier available)
2. Get your API key
3. Add to `apps/web/.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

## Stripe Integration

Full Stripe subscription management is included via the **Better Auth Stripe plugin**.

### Features

- Subscription checkout sessions
- Customer portal for managing subscriptions
- Free trial support (14 days)
- Multiple pricing tiers
- Webhook handling (automatic)
- Feature gating components
- Subscription status tracking

### Quick Setup

See **[STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md)** for detailed instructions.

**Quick version:**

1. Create Stripe account and products
2. Get API keys from Stripe Dashboard
3. Add to `apps/web/.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxxxx
   STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
   ```
4. Start Stripe webhook forwarding (for local dev):
   ```bash
   stripe listen --forward-to http://localhost:3000/api/auth/stripe/webhook
   ```

### Usage Example

```tsx
import {
  useHasAccess,
  RequireSubscription,
} from "@/lib/stripe/subscription-guards";

// Guard a component by subscription tier
<RequireSubscription requiredPlan="starter">
  <PremiumFeature />
</RequireSubscription>;

// Or check access programmatically
const { hasAccess, plan } = useHasAccess("pro");

if (hasAccess) {
  // Show pro features
}
```

## Available Pages

This boilerplate includes example pages to demonstrate the full stack:

| Route                     | Description                         |
| ------------------------- | ----------------------------------- |
| `/`                       | Home/landing page with navigation   |
| `/landing-page`           | Full marketing landing page example |
| `/sign-up`                | User registration                   |
| `/sign-in`                | User login                          |
| `/reset-password`         | Password reset flow                 |
| `/dashboard`              | Protected dashboard layout          |
| `/dashboard/subscription` | Subscription management page        |
| `/pricing`                | Pricing tiers with Stripe checkout  |
| `/payment/success`        | Payment confirmation page           |
| `/trpc-demo`              | tRPC example with CRUD operations   |

## Available Scripts

### Root Scripts

```bash
pnpm dev              # Start all apps in development mode
pnpm build            # Build all apps and packages
pnpm lint             # Lint all packages
pnpm format           # Format code with Prettier
pnpm check-types      # Run TypeScript type checking
```

### Database Scripts

```bash
# Generate migrations from schema changes
DATABASE_URL="<your_db_url>" pnpm --filter @repo/db db:generate

# Run pending migrations (production workflow)
DATABASE_URL="<your_db_url>" pnpm --filter @repo/db db:migrate

# Push schema directly to DB (dev only)
DATABASE_URL="<your_db_url>" pnpm --filter @repo/db db:push

# Open Drizzle Studio GUI (localhost:4983)
DATABASE_URL="<your_db_url>" pnpm --filter @repo/db db:studio

# Drop migrations
DATABASE_URL="<your_db_url>" pnpm --filter @repo/db db:drop
```

### Web App Scripts

```bash
pnpm --filter web dev     # Start Next.js dev server
pnpm --filter web build   # Build for production
pnpm --filter web start   # Start production server
```

## Package Details

### `@repo/api`

tRPC router and procedures with full type safety. Located in `packages/api/`.

**Key Features:**

- Type-safe API routes
- React Query integration
- Zod validation
- Database integration via Drizzle

**Available Routers:**

- `post` - Example CRUD operations
- `stripe` - Subscription and billing management

### `@repo/db`

Database layer using Drizzle ORM with PostgreSQL.

**Key Features:**

- Type-safe database queries
- Automatic schema migrations
- Drizzle Studio support
- Connection pooling
- Lazy initialization (Proxy pattern)

**Schemas:**

- `auth.ts` - Better Auth tables (managed automatically)
- `stripe.ts` - Stripe customer and subscription tables (managed automatically)
- `posts.ts` - Example application table

### `@repo/ui`

Shared component library based on shadcn/ui with 40+ components.

**Import Pattern:**

```typescript
import { Button } from "@repo/ui/button";
import { Card, CardHeader, CardContent } from "@repo/ui/card";
import { Dialog } from "@repo/ui/dialog";
```

All components are fully customizable and built with Radix UI primitives.

## Database Management

### Using Drizzle Studio

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/micro_saas_boilerplate" pnpm --filter @repo/db db:studio
```

Opens a web interface at `localhost:4983` for managing your database visually.

### Using pgAdmin

If using Docker Compose, pgAdmin is available at `localhost:5050`:

- **Email:** `admin@admin.com`
- **Password:** `admin`

To connect to PostgreSQL in pgAdmin:

1. Right-click "Servers" → "Register" → "Server"
2. **Name:** Micro SaaS
3. **Host:** `host.docker.internal` (or `postgres` if inside Docker network)
4. **Port:** `5432`
5. **Username:** `postgres`
6. **Password:** `postgres`

## Development Workflow

### Adding a New Feature

1. **Database Schema** - Define or modify in `packages/db/src/schema/`

   ```typescript
   // packages/db/src/schema/tasks.ts
   import { pgTable, serial, text, boolean } from "drizzle-orm/pg-core";

   export const tasks = pgTable("tasks", {
     id: serial("id").primaryKey(),
     title: text("title").notNull(),
     completed: boolean("completed").default(false),
   });
   ```

2. **Export Schema** - Add to `packages/db/src/schema/index.ts`

   ```typescript
   export * from "./tasks";
   ```

3. **Generate Migration**

   ```bash
   DATABASE_URL="<url>" pnpm --filter @repo/db db:generate
   ```

4. **Apply Migration**

   ```bash
   DATABASE_URL="<url>" pnpm --filter @repo/db db:migrate
   ```

5. **Create tRPC Router** - Add procedures in `packages/api/src/routers/task.ts`

   ```typescript
   import { router, publicProcedure } from "../trpc";
   import { tasks } from "@repo/db";

   export const taskRouter = router({
     getAll: publicProcedure.query(async ({ ctx }) => {
       return ctx.db.select().from(tasks);
     }),
   });
   ```

6. **Register Router** - Add to `packages/api/src/routers/index.ts`

   ```typescript
   import { taskRouter } from "./task";

   export const appRouter = router({
     task: taskRouter,
     // ... other routers
   });
   ```

7. **Use in Frontend** - Call from your components
   ```typescript
   const { data: tasks } = trpc.task.getAll.useQuery();
   ```

## Deployment

### Vercel (Recommended)

This boilerplate is optimized for Vercel with automatic database migrations.

#### Prerequisites

A PostgreSQL database from one of:

- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon](https://neon.tech) (recommended for free tier)
- [Supabase](https://supabase.com/database)
- [Railway](https://railway.app)

#### Steps

1. **Push code to GitHub**

   ```bash
   git push origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure build settings**
   - **Root Directory:** `apps/web`
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `pnpm build` (default)
   - **Install Command:** `pnpm install` (default)

4. **Add environment variables**

   Required:

   ```env
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   BETTER_AUTH_SECRET=<generate with: npx @better-auth/cli secret>
   BETTER_AUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

   Optional (for emails):

   ```env
   RESEND_API_KEY=re_xxxxx
   ```

   Optional (for payments):

   ```env
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxxxx
   STRIPE_STARTER_YEARLY_PRICE_ID=price_xxxxx
   STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
   STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
   ```

5. **Deploy**

   Click "Deploy" - migrations will run automatically during build.

6. **Configure Stripe Webhooks (if using Stripe)**

   In Stripe Dashboard:
   - Go to **Developers** → **Webhooks**
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/auth/stripe/webhook`
   - Events: Select all `customer.*` and `checkout.*` events
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

#### How Migrations Work

The `packages/db/package.json` includes a `postinstall` script:

```json
"postinstall": "[ -n \"$DATABASE_URL\" ] && drizzle-kit migrate || echo 'Skipping migrations'"
```

This automatically runs migrations when `DATABASE_URL` is present (production), ensuring your schema is always up-to-date.

### Docker

Build and run the production container:

```bash
pnpm build
docker build -t micro-saas-boilerplate .
docker run -p 3000:3000 micro-saas-boilerplate
```

## Customization

### Styling

TailwindCSS v4 is configured in `packages/ui/`. Customize your theme:

- **Global styles:** `packages/ui/src/styles/`
- **Tailwind config:** `packages/ui/tailwind.config.js`
- **Theme tokens:** Modify CSS variables in the styles

### Branding

Update the following for your brand:

1. **App name:** `apps/web/lib/auth.ts` (Better Auth config)
2. **Logo:** `apps/web/public/` and components
3. **Colors:** `packages/ui/src/styles/` (CSS variables)
4. **Favicon:** `apps/web/app/favicon.ico`
5. **Metadata:** `apps/web/app/layout.tsx`

### Subscription Plans

Edit plans in `apps/web/lib/auth.ts`:

```typescript
subscription: {
  plans: [
    {
      name: "starter",
      priceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
      freeTrial: { days: 14 },
    },
    // Add more plans...
  ];
}
```

## AI Coding Assistant

This project includes **CLAUDE.md** for AI coding assistants like Claude Code. This file contains:

- Project architecture overview
- Common commands and workflows
- Development best practices
- Key technical decisions

If you're using an AI coding assistant, point it to CLAUDE.md for context-aware assistance.

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to PostgreSQL

**Solution:**

```bash
# Check if Docker is running
docker ps

# Restart database
docker compose down
docker compose up -d

# Verify connection
psql postgresql://postgres:postgres@localhost:5432/micro_saas_boilerplate
```

### Migration Errors

**Problem:** Migration fails with "relation already exists"

**Solution:**

```bash
# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d

# Re-run migrations
DATABASE_URL="<url>" pnpm --filter @repo/db db:migrate
```

### Type Errors After Schema Changes

**Problem:** TypeScript errors after modifying database schema

**Solution:**

```bash
# Regenerate types
pnpm check-types

# Or restart Next.js dev server
# (press Ctrl+C and run pnpm dev again)
```

### Stripe Webhooks Not Working Locally

**Problem:** Stripe webhooks not received during development

**Solution:**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks (keep this running)
stripe listen --forward-to http://localhost:3000/api/auth/stripe/webhook

# Copy the webhook secret (whsec_...) to .env.local
```

### Email Not Sending

**Problem:** Verification or reset emails not being sent

**Solution:**

1. Check if `RESEND_API_KEY` is set in `apps/web/.env.local`
2. Verify your API key in [Resend Dashboard](https://resend.com/api-keys)
3. Check console logs for email content during development:
   ```bash
   # Emails are logged to console when Resend is not configured
   ```

### Build Fails on Vercel

**Problem:** Vercel build fails with migration errors

**Solution:**

1. Check that `DATABASE_URL` is set in Vercel environment variables
2. Ensure SSL is enabled: `?sslmode=require` in connection string
3. Check build logs for specific error
4. Test migrations locally first:
   ```bash
   DATABASE_URL="<your_vercel_db_url>" pnpm --filter @repo/db db:migrate
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation as needed
5. Run `pnpm lint` and `pnpm check-types` before committing

## License

MIT License - feel free to use this for your own projects.

## Author

Created by **[Washington Serip](https://github.com/washingtonserip)**

## Useful Links

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Better Auth Documentation](https://www.better-auth.com)
- [Stripe Documentation](https://stripe.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Turborepo Documentation](https://turborepo.com)
- [TailwindCSS Documentation](https://tailwindcss.com)

### Deployment Guides

- [Vercel Deployment](https://vercel.com/docs)
- [Neon Database Guide](https://neon.tech/docs/introduction)
- [Stripe Testing](https://stripe.com/docs/testing)

## Support

If you find this helpful, please give it a star on [GitHub](https://github.com/washingtonserip/micro-saas-boilerplate)!

---

**Happy Building!**
