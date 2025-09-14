# Repository Guidelines

## Project Structure & Module Organization

- `src/pages/` Next.js routes (file-based). Keep page files minimal; delegate UI to components.
- `src/components/` Reusable React components (PascalCase filenames), colocate small styles.
- `src/server/` Server-side code (tRPC/NextAuth, utilities) only imports from `src/**`.
- `src/utils/`, `src/context/`, `src/scripts/` Helpers, context providers, one-off tasks.
- `prisma/` Prisma schema, seeds, and data (`schema.prisma`, `seed.ts`, `seed_data.csv`).
- `public/` Static assets; served at the site root.
- Env validation lives in `src/env.mjs` (strict Zod schema).

## Major Package Versions

- **Next.js**: 13.x (React 18.2.0)
- **tRPC**: 10.x (client, server, react-query)
- **Prisma**: 4.x (client + CLI)
- **NextAuth.js**: 4.x (with Prisma adapter)
- **Mantine UI**: 6.x (core, hooks, next)
- **React Query**: 4.x (@tanstack/react-query)
- **AI SDK**: 4.x (with OpenAI integration)
- **Zod**: 3.x (schema validation)
- **TypeScript**: 4.x
- **Emotion**: 11.x (CSS-in-JS)

## Build, Test, and Development Commands

- Install: `npm i` (enforced via only-allow).
- Lint: `npm lint` (Next + TypeScript rules).
- Build: `npm build`
- Prisma (SQLite local):
  - Generate: `npm run prisma generate`
  - Reset schema: `npm run db:reset`
  - Seed demo data: `npm run db:seed`

## Coding Style & Naming Conventions

- Formatting: Prettier (2 spaces, single quotes, semicolons, trailing commas). Staged files auto-formatted via Husky + pretty-quick.
- Linting: ESLint (`next/core-web-vitals`, `@typescript-eslint`), prefer inline type imports; prefix unused args with `_`.
- Imports: Absolute alias `~/*` (see `tsconfig.json`). Imports are sorted (prettier sort-imports).
- Naming: Components `PascalCase`, hooks `useX`, helpers `camelCase`. Pages and API routes follow Next.js file naming.

## Testing Guidelines

- No test runner is configured. Validate changes by running `npm run lint`, `npm run build`, and exercising affected routes locally.
- If adding tests, prefer Playwright for e2e or Vitest/Jest for unit tests; place under `src/**/__tests__` and mirror file paths.
