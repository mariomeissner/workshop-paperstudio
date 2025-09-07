import { libraryRouter } from '~/server/api/routers/library';
import { listRouter } from '~/server/api/routers/list';
import { paperRouter } from '~/server/api/routers/paper';
import { userRouter } from '~/server/api/routers/user';
import { createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  paper: paperRouter,
  library: libraryRouter,
  list: listRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
