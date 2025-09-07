import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const userRouter = createTRPCRouter({
  getUserTags: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const tags = await ctx.prisma.tag.findMany({
        where: {
          userId: input.userId,
        },
      });
      return {
        tags,
      };
    }),
});
