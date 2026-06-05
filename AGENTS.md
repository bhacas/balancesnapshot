# Repository Guidelines

BalanceSnapshot is an Astro 6 SSR app using React 19, Tailwind 4, Supabase auth, and shadcn/ui, deployed to Cloudflare Workers. 

## Hard Rules & Agent Instructions
- **SSR Config:** API routes must export `const prerender = false`.
- **Styling:** Do not concatenate class strings manually; use the `cn()` helper.
- **React:** Do not use Next.js directives like `"use client"`.
- **Immutability:** Do not write to `context/archive/` (archived changes are immutable).

## Build and Development Commands
- `npm run dev` — Start Astro dev server.
- `npm run build` — Run Astro build process.
- `npm run lint` — Run ESLint static analysis.
- `npm run format` — Format code with Prettier.

## Coding Style & Naming Conventions
- **Environment:** Node 22 (`@.nvmrc`).
- **Formatting:** `@.prettierrc.json`
- **Linting:** Strict and stylistic type checking enabled (`@eslint.config.js`). Prefix unused variables or arguments with an underscore `_`.
- **Imports:** Use absolute imports with the `@/*` alias pointing to `./src/*` (`@tsconfig.json`).

## Project Structure & Module Organization
- `@src/layouts/` & `@src/pages/`: Astro pages and layouts.
- `@src/pages/api/`: API routes.
- `@src/components/`: Astro & React components (shadcn/ui located in `@src/components/ui/`).
- `@src/lib/`: Services and helpers.
- `@src/types.ts`: Shared entity/DTO types.

## Testing Guidelines
No automated tests are currently configured or required.

## Commit & Pull Request Guidelines
- Commit convention is to be defined.
- CI gate runs on `push` and `pull_request` to `master`, requiring `npm run lint` and `npm run build` to succeed (`@.github/workflows/ci.yml`).
