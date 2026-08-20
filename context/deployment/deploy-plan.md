# Deployment Plan (MVP)

This document outlines the step-by-step plan for deploying the BalanceSnapshot MVP to Cloudflare Workers, in accordance with `infrastructure.md` and `tech-stack.md`.

## 1. Manual Setup Gates (User Action Required)

Before automated deployment can proceed, the following manual steps must be completed:

1. **Cloudflare Account & CLI**:
   - Ensure you have a Cloudflare account.
   - Authenticate the Wrangler CLI by running:
     ```bash
     npx wrangler login
     ```

2. **Supabase Project**:
   - Create a new project in the Supabase dashboard.
   - Obtain the `Project URL` and `anon public` API key (or service role key).

3. **Secret Configuration**:
   - Add the Supabase secrets to the Cloudflare Worker environment securely using Wrangler:

     ```bash
     npx wrangler secret put SUPABASE_URL
     # Paste the Supabase URL when prompted

     npx wrangler secret put SUPABASE_KEY
     # Paste the Supabase Key when prompted
     ```

## 2. Automated Steps (Agent Execution)

Once the manual setup gates are passed, the agent will execute the following:

1. **Dependency Installation**: Ensure all packages are up-to-date.
   ```bash
   npm install
   ```
2. **Type Checking & Linting**: Run static analysis to catch errors before deployment.
   ```bash
   npm run lint
   ```
3. **Build**: Generate the server output.
   ```bash
   npm run build
   ```
4. **Deploy**: Push the compiled worker and assets to Cloudflare. As defined in `infrastructure.md` and configured in `wrangler.jsonc` (which uses `"main": "@astrojs/cloudflare/entrypoints/server"` and the `assets` binding), this is a Cloudflare Workers deployment, so the exact deploy command is:
   ```bash
   npx wrangler deploy
   ```

## 3. Verification Steps

After successful deployment, the agent will:

1. Verify the output URL provided by Wrangler to ensure the application resolves correctly.
2. Monitor real-time logs for any immediate initialization errors:
   ```bash
   npx wrangler tail
   ```
