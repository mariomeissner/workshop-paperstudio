import { type GetServerSidePropsContext } from 'next';
import {
  type DefaultSession,
  type NextAuthOptions,
  getServerSession,
} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from '~/env.mjs';
import { prisma } from '~/server/db';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  // Use JWT sessions to support Credentials provider
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    session({ session, token }) {
      const t = token as { sub?: string; name?: string; email?: string };
      if (session.user) {
        session.user.id = t.sub ?? session.user.id;
        if (t.name) session.user.name = t.name;
        if (t.email) session.user.email = t.email;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Password',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const submitted = credentials?.password ?? '';
        const expected = env.DEMO_PASSWORD;

        // Very simple password check for demo purposes only
        if (!expected || submitted !== expected) {
          return null;
        }

        // Ensure a demo user exists in the database so FKs work elsewhere
        const demoUserId = 'demo-user';
        const demoEmail = 'demo@example.com';
        const demoName = 'Demo User';

        await prisma.user.upsert({
          where: { id: demoUserId },
          update: {},
          create: {
            id: demoUserId,
            email: demoEmail,
            name: demoName,
          },
        });

        return {
          id: demoUserId,
          name: demoName,
          email: demoEmail,
        };
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
