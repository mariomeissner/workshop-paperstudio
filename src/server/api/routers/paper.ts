import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc';

export const paperRouter = createTRPCRouter({
  // Public queries
  getPaper: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return {
        paper: await ctx.prisma.paper.findUnique({
          where: {
            id: input.id,
          },
        }),
      };
    }),

  topRecent: publicProcedure
    .input(z.object({ take: z.number() }))
    .query(async ({ ctx, input }) => {
      return {
        papers: await ctx.prisma.paper.findMany({
          orderBy: {
            updateDate: 'desc',
          },
          take: input.take,
        }),
      };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        papers: await ctx.prisma.paper.findMany({
          where: {
            OR: [
              { title: { contains: input.query, mode: 'insensitive' } },
              { abstract: { contains: input.query, mode: 'insensitive' } },
            ],
          },
          take: 10,
        }),
      };
    }),

  // Tag-related queries
  getUserTagsOnPaper: protectedProcedure
    .input(z.object({ userId: z.string(), paperId: z.number() }))
    .query(async ({ ctx, input }) => {
      const tagsOnPaper = await ctx.prisma.tagOnPaper.findMany({
        where: {
          paperId: input.paperId,
          tag: {
            userId: input.userId,
          },
        },
        select: {
          tag: true,
        },
      });
      return {
        tags: tagsOnPaper.map((tagOnPaper) => tagOnPaper.tag),
      };
    }),

  addUserTagToPaper: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        paperId: z.number(),
        tagId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Confirm that the tag is owned by the user
      const tag = await ctx.prisma.tag.findUnique({
        where: {
          id: input.tagId,
        },
      });
      if (!tag || tag.userId !== input.userId || tag.name !== input.name) {
        throw new Error('No valid tag found');
      }
      const createdTag = await ctx.prisma.tagOnPaper.create({
        data: {
          paperId: input.paperId,
          tagId: input.tagId,
        },
        select: {
          tag: true,
        },
      });
      return {
        tag: createdTag.tag,
      };
    }),

  removeMultipleUserTagsOnPaper: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        paperId: z.number(),
        tagIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return {
        tags: await ctx.prisma.tagOnPaper.deleteMany({
          where: {
            paperId: input.paperId,
            tagId: {
              in: input.tagIds,
            },
          },
        }),
      };
    }),

  removeUserTagOnPaper: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        paperId: z.number(),
        tagId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return {
        tags: await ctx.prisma.tagOnPaper.delete({
          where: {
            tagId_paperId: {
              tagId: input.tagId,
              paperId: input.paperId,
            },
          },
        }),
      };
    }),

  createTag: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        paperId: z.optional(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return {
        tag: await ctx.prisma.tag.create({
          data: {
            name: input.name,
            userId: input.userId,

            // create TagOnPaper if paperId is provided
            ...(input.paperId && {
              TagOnPaper: {
                create: {
                  paperId: input.paperId,
                },
              },
            }),
          },
        }),
      };
    }),
});
