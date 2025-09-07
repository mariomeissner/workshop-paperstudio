import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const libraryRouter = createTRPCRouter({
  getEntries: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        libraryEntries: await ctx.prisma.libraryEntry.findMany({
          where: {
            userId: input.userId,
          },
          include: {
            paper: {
              include: {
                tags: {
                  include: {
                    tag: true,
                  },
                },
              },
            },
          },
        }),
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
        libraryEntry: await ctx.prisma.libraryEntry.upsert({
          where: {
            paperId_userId: {
              userId: input.userId,
              paperId: input.paperId,
            },
          },
          update: {
            wantToRead: input.wantToRead,
          },
          create: {
            paperId: input.paperId,
            userId: input.userId,
            wantToRead: input.wantToRead ?? false,
          },
        }),
      };
    }),

  // mutation to remove a paper from a library
  removeEntry: protectedProcedure
    .input(z.object({ userId: z.string(), paperId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return {
        libraryEntry: await ctx.prisma.libraryEntry.delete({
          where: {
            paperId_userId: {
              userId: input.userId,
              paperId: input.paperId,
            },
          },
        }),
      };
    }),

  // Check if a paper is in a user's library
  getEntry: protectedProcedure
    .input(z.object({ userId: z.string(), paperId: z.number() }))
    .query(async ({ ctx, input }) => {
      const entry = await ctx.prisma.libraryEntry.findFirst({
        where: {
          userId: input.userId,
          paperId: input.paperId,
        },
      });
      return {
        entry,
      };
    }),
});
