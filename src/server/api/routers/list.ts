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
      const list = await ctx.prisma.list.findUnique({
        where: {
          id: input.listId,
        },
        include: {
          entries: {
            include: {
              paper: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
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
    const lists = await ctx.prisma.list.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });
    return {
      lists,
    };
  }),

  getUserListsWherePaper: protectedProcedure
    .input(z.object({ paperId: z.number() }))
    .query(async ({ ctx, input }) => {
      const lists = await ctx.prisma.list.findMany({
        where: {
          userId: ctx.session.user.id,
          entries: {
            some: {
              paperId: input.paperId,
            },
          },
        },
      });
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
      const list = await ctx.prisma.list.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
          public: input.privacy === 'public',
          entries: {
            create: input.paperId
              ? [
                  {
                    paperId: input.paperId,
                  },
                ]
              : [],
          },
        },
      });
      return {
        list,
      };
    }),

  deleteList: protectedProcedure
    .input(z.object({ listId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: {
          id: input.listId,
        },
      });
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
      await ctx.prisma.list.delete({
        where: {
          id: input.listId,
        },
      });
      return {
        list,
      };
    }),

  addPaperToList: protectedProcedure
    .input(z.object({ listId: z.string(), paperId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: {
          id: input.listId,
        },
      });
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
      const entry = await ctx.prisma.listEntry.findFirst({
        where: {
          listId: input.listId,
          paperId: input.paperId,
        },
      });
      if (entry) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This paper is already in this list',
        });
      }
      await ctx.prisma.listEntry.create({
        data: {
          listId: input.listId,
          paperId: input.paperId,
        },
      });
    }),

  removeSinglePaperFromList: protectedProcedure
    .input(z.object({ listId: z.string(), paperId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: {
          id: input.listId,
        },
        select: {
          userId: true,
        },
      });
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
      await ctx.prisma.listEntry.deleteMany({
        where: {
          listId: input.listId,
          paperId: input.paperId,
        },
      });
    }),

  removeMultiplePapersFromList: protectedProcedure
    .input(z.object({ listId: z.string(), paperIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: {
          id: input.listId,
        },
        select: {
          userId: true,
        },
      });
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
      try {
        await ctx.prisma.listEntry.deleteMany({
          where: {
            listId: input.listId,
            paperId: {
              in: input.paperIds,
            },
          },
        });
      } catch (e) {
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
      const list = await ctx.prisma.list.findUnique({
        where: {
          id: input.listId,
        },
        select: {
          userId: true,
        },
      });
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
      await ctx.prisma.list.update({
        where: {
          id: input.listId,
        },
        data: {
          public: input.privacy === 'public',
        },
      });
    }),
});
