import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const libraryRouter = createTRPCRouter({
  getEntries: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        libraryEntries: await ctx.db.library.getEntries(input.userId),
      };
    }),

  // mutation to add a paper to a library
  upsertEntry: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        paperId: z.number(),
        wantToRead: z.optional(z.boolean()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return {
        libraryEntry: await ctx.db.library.upsertEntry({
          userId: input.userId,
          paperId: input.paperId,
          wantToRead: input.wantToRead,
        }),
      };
    }),

  // mutation to remove a paper from a library
  removeEntry: protectedProcedure
    .input(z.object({ userId: z.string(), paperId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return {
        libraryEntry: await ctx.db.library.removeEntry(
          input.userId,
          input.paperId,
        ),
      };
    }),

  // Check if a paper is in a user's library
  getEntry: protectedProcedure
    .input(z.object({ userId: z.string(), paperId: z.number() }))
    .query(async ({ ctx, input }) => {
      return {
        entry: await ctx.db.library.getEntry(input.userId, input.paperId),
      };
    }),
});
