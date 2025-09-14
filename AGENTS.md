# Repository Guidelines

## Project Structure & Module Organization

- `src/pages/` Next.js routes (file-based). Keep page files minimal; delegate UI to components.
- `src/components/` Reusable React components (PascalCase filenames), colocate small styles.
- `src/server/` Server-side code (tRPC/NextAuth, utilities) only imports from `src/**`.
- `src/utils/`, `src/context/`, `src/scripts/` Helpers, context providers, one-off tasks.
- `prisma/` Prisma schema, seeds, and data (`schema.prisma`, `seed.ts`, `seed_data.csv`).
- `public/` Static assets; served at the site root.
- Env validation lives in `src/env.mjs` (strict Zod schema).

## Build, Test, and Development Commands

- Install: `npm i` (enforced via only-allow).
- Lint: `npm lint` (Next + TypeScript rules).
- Build: `npm build` → `postbuild` runs `next-sitemap`.
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

## Commit & Pull Request Guidelines

- Commits: Short, imperative subject lines (e.g., "Update postgres schema", "Re-enable chat"). Group related changes.
- PRs: Include summary, rationale, and scope. Link issues if applicable. Add screenshots/gifs for UI changes. Note schema or env changes and include migration/seed steps.

## Security & Configuration Tips

- Copy `.env.example` to `.env` and fill values required by `src/env.mjs` (e.g., `DATABASE_URL`, auth providers, OpenAI).
- Do not commit secrets. Keep `SKIP_ENV_VALIDATION` off during development; never disable validation in production.
