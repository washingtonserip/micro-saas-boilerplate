import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { posts, eq } from '@repo/db';

export const postRouter = router({
  // Get all posts
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(posts).orderBy(posts.createdAt);
  }),

  // Get post by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error('Post not found');
      }

      return result[0];
    }),

  // Create new post
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(posts)
        .values({
          title: input.title,
          content: input.content,
        })
        .returning();

      return result[0];
    }),

  // Delete post
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});
