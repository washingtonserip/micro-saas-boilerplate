import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();

// Export reusable router and procedure helpers
export const router = t.router;

// Public procedure - no authentication required
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use((opts) => {
  const { ctx } = opts;

  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      session: ctx.session, // Type-safe session (non-null)
    },
  });
});

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use((opts) => {
  const { ctx } = opts;

  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }

  return opts.next({
    ctx,
  });
});
