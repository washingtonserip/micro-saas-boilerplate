# SaaS Boilerplate

A modern, production-ready SaaS starter built with Next.js, tRPC, and Drizzle ORM. Get your SaaS up and running in minutes with a fully-configured monorepo architecture.

## Features

- **Modern Stack** - Next.js 16, React 19, TypeScript, TailwindCSS v4
- **Type-Safe APIs** - End-to-end type safety with tRPC v11
- **Database Ready** - Drizzle ORM with PostgreSQL, schema migrations
- **Beautiful UI** - Full shadcn/ui component library with Radix UI primitives
- **Monorepo Architecture** - Turborepo for optimal build caching and task running
- **Docker Support** - Local PostgreSQL + pgAdmin setup included
- **Developer Experience** - Hot reload, type checking, linting, formatting

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.9 |
| Styling | TailwindCSS v4 |
| UI Components | shadcn/ui + Radix UI |
| API Layer | tRPC v11 |
| Database | PostgreSQL (Drizzle ORM) |
| Monorepo | Turborepo |
| Package Manager | pnpm |
| Containerization | Docker Compose |

## Project Structure

```
saas-boilerplate/
├── apps/
│   └── web/              # Next.js application
│       ├── app/          # App router pages
│       └── package.json
├── packages/
│   ├── api/              # tRPC API layer
│   ├── db/               # Drizzle ORM + schemas
│   ├── ui/               # Shared UI components (shadcn/ui)
│   ├── eslint-config/    # Shared ESLint configs
│   └── typescript-config/# Shared TypeScript configs
├── docker-compose.yml    # PostgreSQL + pgAdmin
└── package.json          # Root workspace config
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9.0.0+
- Docker (optional, for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/washingtonserip/saas-boilerplate.git
   cd saas-boilerplate
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Start the database** (optional - uses Docker)
   ```bash
   docker compose up -d
   ```
   This starts:
   - PostgreSQL on `localhost:5432`
   - pgAdmin on `localhost:5050` (admin@admin.com / admin)

5. **Push database schema**
   ```bash
   pnpm --filter @repo/db db:push
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

The app will be running at [http://localhost:3000](http://localhost:3000)

## Available Scripts

### Root Scripts
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Run TypeScript type checking

### Database Scripts
- `pnpm --filter @repo/db db:generate` - Generate migrations
- `pnpm --filter @repo/db db:push` - Push schema to database
- `pnpm --filter @repo/db db:studio` - Open Drizzle Studio
- `pnpm --filter @repo/db db:migrate` - Run migrations

### Web App Scripts
- `pnpm --filter web dev` - Start Next.js dev server
- `pnpm --filter web build` - Build for production
- `pnpm --filter web start` - Start production server

## Example Pages

This boilerplate includes example pages to help you get started:

- **Home** (`/`) - Landing page with navigation
- **Landing Page** (`/landing-page`) - Full landing page example
- **Dashboard** (`/dashboard`) - Dashboard layout example
- **Demo** (`/demo`) - Component showcase

## Package Details

### `@repo/api`
tRPC router and procedures with full type safety. Located in `packages/api/`.

**Key Features:**
- Type-safe API routes
- React Query integration
- Zod validation
- Database integration via Drizzle

### `@repo/db`
Database layer using Drizzle ORM with PostgreSQL.

**Key Features:**
- Type-safe database queries
- Schema migrations
- Drizzle Studio support
- Connection pooling

### `@repo/ui`
Shared component library based on shadcn/ui.

**Included Components:**
- Accordion, Alert Dialog, Avatar
- Button, Card, Checkbox, Dialog
- Dropdown Menu, Form, Input
- Select, Table, Tabs, Toast
- And 30+ more components

All components are fully customizable and built with Radix UI primitives.

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_boilerplate
```

For production, use a secure connection string with SSL.

## Database Management

### Using Drizzle Studio
```bash
pnpm --filter @repo/db db:studio
```
Opens a web interface at `localhost:4983` for managing your database.

### Using pgAdmin
If using Docker Compose, pgAdmin is available at `localhost:5050`:
- Email: `admin@admin.com`
- Password: `admin`

## Development Workflow

### Adding a New Feature

1. Create database schema in `packages/db/src/schema/`
2. Push schema changes: `pnpm --filter @repo/db db:push`
3. Add tRPC procedures in `packages/api/src/routers/`
4. Create UI components in `packages/ui/src/`
5. Build pages in `apps/web/app/`

### Creating a New Component

UI components follow the shadcn/ui pattern:

```bash
# Components are in packages/ui/src/
# Import them in your app:
import { Button } from "@repo/ui/button";
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Set the root directory to `apps/web`
4. Add environment variables
5. Deploy

### Docker

Build and run the production container:

```bash
pnpm build
docker build -t saas-boilerplate .
docker run -p 3000:3000 saas-boilerplate
```

## Customization

### Styling

TailwindCSS v4 is configured in `packages/ui/`. Customize your theme in:
- `packages/ui/src/styles/` - Global styles
- `packages/ui/tailwind.config.js` - Tailwind configuration

### Database Schema

Add or modify schemas in `packages/db/src/schema/`:

```typescript
// packages/db/src/schema/users.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

Then run `pnpm --filter @repo/db db:push` to apply changes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your own projects.

## Author

Created by [washingtonserip](https://github.com/washingtonserip)

## Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Turborepo Documentation](https://turborepo.com)
- [TailwindCSS Documentation](https://tailwindcss.com)

## Support

If you find this helpful, please give it a star on [GitHub](https://github.com/washingtonserip/saas-boilerplate)!
