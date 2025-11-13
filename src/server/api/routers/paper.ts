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
        paper: await ctx.db.paper.getById(input.id),
      };
    }),

  topRecent: publicProcedure
    .input(z.object({ take: z.number() }))
    .query(async ({ ctx, input }) => {
      return {
        papers: await ctx.db.paper.getTopRecent(input.take),
      };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const trimmedQuery = input.query.trim();

      if (!trimmedQuery) {
        return { papers: [] };
      }

      return {
        papers: await ctx.db.paper.search({
          query: trimmedQuery,
          fields: ['title', 'abstract'],
          take: 10,
        }),
      };
    }),

  // Tag-related queries
  getUserTagsOnPaper: protectedProcedure
    .input(z.object({ userId: z.string(), paperId: z.number() }))
    .query(async ({ ctx, input }) => {
      const relations = await ctx.db.tags.getUserTagsOnPaper(
        input.userId,
        input.paperId,
      );
      return {
        tags: relations.map((relation) => relation.tag),
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
      const tag = await ctx.db.tags.getById(input.tagId);
      if (!tag || tag.userId !== input.userId || tag.name !== input.name) {
        throw new Error('No valid tag found');
      }
      const createdTag = await ctx.db.tags.attachToPaper(
        input.tagId,
        input.paperId,
      );
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
      const count = await ctx.db.tags.removeManyFromPaper(
        input.paperId,
        input.tagIds,
      );
      return {
        tags: { count },
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
      const count = await ctx.db.tags.removeFromPaper(
        input.tagId,
        input.paperId,
      );
      return {
        tags: { count },
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
      const tag = await ctx.db.tags.create({
        userId: input.userId,
        name: input.name,
      });
      if (input.paperId) {
        await ctx.db.tags.attachToPaper(tag.id, input.paperId);
      }
      return {
        tag,
      };
    }),
});
