import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc';

export const listRouter = createTRPCRouter({
  // Queries
  getList: publicProcedure
    .input(z.object({ listId: z.string() }))
    .query(async ({ ctx, input }) => {
      const list = await ctx.db.lists.getList(input.listId);
      if (!!list && !list.public && list.userId !== ctx.session?.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to make this request',
        });
      }
      return {
        list,
      };
    }),

  getUserLists: protectedProcedure.query(async ({ ctx }) => {
    const lists = await ctx.db.lists.getUserLists(ctx.session.user.id);
    return {
      lists,
    };
  }),

  getUserListsWherePaper: protectedProcedure
    .input(z.object({ paperId: z.number() }))
    .query(async ({ ctx, input }) => {
      const lists = await ctx.db.lists.getUserListsContainingPaper(
        ctx.session.user.id,
        input.paperId,
      );
      return {
        lists,
      };
    }),

  // Mutations
  createList: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        paperId: z.number().optional(),
        privacy: z.enum(['public', 'private']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.lists.createList({
        userId: ctx.session.user.id,
        name: input.name,
        isPublic: input.privacy === 'public',
        paperId: input.paperId,
      });
      return {
        list,
      };
    }),

  deleteList: protectedProcedure
    .input(z.object({ listId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.lists.getList(input.listId);
      if (!list) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'This list does not exist',
        });
      }
      if (list.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to delete this list',
        });
      }
      await ctx.db.lists.deleteList(input.listId);
      return {
        list,
      };
    }),

  addPaperToList: protectedProcedure
    .input(z.object({ listId: z.string(), paperId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.lists.getList(input.listId);
      if (!list) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'This list does not exist',
        });
      }
      if (list.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to add papers to this list',
        });
      }
      const alreadyInList = list.entries.some(
        (entry) => entry.paperId === input.paperId,
      );
      if (alreadyInList) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This paper is already in this list',
        });
      }
      await ctx.db.lists.addPaperToList(input.listId, input.paperId);
    }),

  removeSinglePaperFromList: protectedProcedure
    .input(z.object({ listId: z.string(), paperId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.lists.getList(input.listId);
      if (!list) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'This list does not exist',
        });
      }
      if (list.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to remove papers from this list',
        });
      }
      await ctx.db.lists.removePaperFromList(input.listId, input.paperId);
    }),

  removeMultiplePapersFromList: protectedProcedure
    .input(z.object({ listId: z.string(), paperIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.lists.getList(input.listId);
      if (!list) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'This list does not exist',
        });
      }
      if (list.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to remove papers from this list',
        });
      }
      const removed = await ctx.db.lists.removeMultipleFromList(
        input.listId,
        input.paperIds,
      );
      if (!removed) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This paper is not in this list',
        });
      }
    }),

  changePrivacy: protectedProcedure
    .input(
      z.object({ listId: z.string(), privacy: z.enum(['public', 'private']) }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.lists.getList(input.listId);
      if (!list) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'This list does not exist',
        });
      }
      if (list.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to change this list',
        });
      }
      await ctx.db.lists.changePrivacy(
        input.listId,
        input.privacy === 'public',
      );
    }),
});
