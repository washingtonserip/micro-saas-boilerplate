import { router } from '../trpc';
import { postRouter } from './post';

export const appRouter = router({
  post: postRouter,
});

// Export type definition of the API router
export type AppRouter = typeof appRouter;
