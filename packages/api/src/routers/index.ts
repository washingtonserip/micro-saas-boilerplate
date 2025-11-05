import { router } from '../trpc';
import { postRouter } from './post';
import { stripeRouter } from './stripe';

export const appRouter = router({
  post: postRouter,
  stripe: stripeRouter,
});

// Export type definition of the API router
export type AppRouter = typeof appRouter;
