---
project: balance-snapshot
researched_at: 2026-06-05T09:00:00Z
recommended_platform: Cloudflare Workers & Pages
runner_up: Vercel
context_type: mvp
tech_stack:
  language: js
  framework: Astro
  runtime: Node 22
---

## Recommendation

**Deploy on Cloudflare Workers & Pages.**

Cloudflare offers an edge-first deployment platform that seamlessly supports our Astro tech stack, scoring a flawless 5/5 on agent-friendly criteria. It is natively configured in our 10x-astro-starter out of the box, provides a world-class CLI (`wrangler`), and integrates perfectly with AI agents via its official MCP servers. This satisfies the user's priority for high developer experience while keeping the MVP cost at $0 for up to 100k monthly requests.

## Platform Comparison

| Platform | CLI-first | Managed/Serverless | Agent-readable docs | Stable deploy API | MCP / Integration | Total |
|---|---|---|---|---|---|---|
| Cloudflare | Pass | Pass | Pass | Pass | Pass | 5 Passes |
| Vercel | Pass | Pass | Pass | Pass | Pass | 5 Passes |
| Netlify | Partial | Pass | Pass | Pass | Pass | 4 Passes |
| Railway | Partial | Pass | Pass | Pass | Pass | 4 Passes |
| Render | Partial | Pass | Pass | Pass | Pass | 4 Passes |
| Fly.io | Partial | Partial | Fail | Pass | Partial | 1 Pass |

- **Cloudflare**: First-class `wrangler` CLI, full managed edge serverless environment, published LLM docs (`llms.txt`), stable deployment, and official MCP support.
- **Vercel**: Native Next.js/Astro support with zero-config `vercel` CLI, official MCP server, and excellent developer experience.
- **Netlify**: Strong ecosystem and agent tooling, but rollbacks require the dashboard instead of a simple CLI command.
- **Railway**: Container PaaS with hosted MCP integration, but lacks a native CLI rollback feature.
- **Render**: Similar to Railway, strong container-based ecosystem with an official MCP, but CLI is still in beta without rollback commands.
- **Fly.io**: Requires writing explicit Dockerfiles for reliable Node 22 Astro deployments, lacks `llms.txt`, and requires manual image hash lookup for rollbacks.

### Shortlisted Platforms

#### 1. Cloudflare Workers & Pages (Recommended)
Key strengths include out-of-the-box compatibility with the selected Astro starter kit, global edge distribution, zero cost at MVP scale, and deep integration with agent workflows via `wrangler` and MCP.

#### 2. Vercel
Scores perfectly alongside Cloudflare with phenomenal DX and `llms.txt` support, but misses the top spot because the starter template is already pre-configured for Cloudflare's edge runtime, requiring manual adapter migration to use Vercel.

#### 3. Railway
Provides a robust container PaaS that circumvents edge-runtime Node.js limitations, making it a strong fallback if V8 Isolate compatibility issues arise. Scored third due to its lack of a CLI rollback command and the $5/mo minimum fee.

## Anti-Bias Cross-Check: Cloudflare Workers & Pages

### Devil's Advocate — Weaknesses
1. **Node.js API Compatibility**: V8 Isolates don't natively run all Node C++ modules (`fs`, `net`), breaking certain standard NPM packages even with `nodejs_compat` enabled.
2. **Image Processing**: Astro's default `sharp` image processor crashes on Cloudflare. The `cloudflare-binding` image service must be configured instead, increasing setup friction.
3. **Database Read Replication**: Supabase is external. If we ever want to co-locate SQLite using D1, D1 read replication is still in public beta (as of June 2026).
4. **Ephemeral WebSockets**: Standard Workers cannot maintain persistent WebSocket connections without handing off to Durable Objects, which adds significant architectural complexity.

### Pre-Mortem — How This Could Fail
The team deployed the Astro SSR app on Cloudflare Pages for their MVP. Six months later, the decision turned out to be a complete disaster. The team needed to parse a complex proprietary file format and imported an NPM package that relied heavily on native Node `fs` and `child_process` modules. Because Cloudflare Workers run on V8 Isolates and not a true Node environment, the library immediately crashed in production. The `nodejs_compat` flag didn't support these C++ bindings. To fix it, the team had to hastily rewrite the logic into a standalone microservice hosted on a traditional VPS, breaking their single-repo serverless architecture. Additionally, the external Supabase database was hosted in `eu-central-1`, but Cloudflare executed the SSR logic globally at the edge. The resulting cross-continent latency for every database query destroyed the UX, rendering the edge benefits completely moot.

### Unknown Unknowns
- **Request size limits**: Cloudflare Workers strictly enforce a payload limit (e.g., 100MB), which can block large file uploads unless routed correctly to R2 or external storage with pre-signed URLs.
- **CPU time limits**: Workers have strict CPU time limits (10-50ms on Free tier). Unoptimized SSR rendering can hit this limit, throwing hard 1102 errors.
- **External DB connection pooling**: Without a connection pooler, edge SSR hitting an external Supabase database can rapidly exhaust standard PostgreSQL connection limits since each global request spins up its own isolated function.

## Operational Story

- **Preview deploys**: Feature branches pushed to GitHub automatically generate preview URLs; protection via Cloudflare Access can be enabled.
- **Secrets**: Environment variables and secrets are managed via `wrangler secret put <KEY>` and stored securely in Cloudflare's backend.
- **Rollback**: Executed via `npx wrangler rollback <deployment-id>` in the CLI to instantly revert the worker state.
- **Approval**: Merging to the `master` branch requires human approval; subsequent deployment to production is fully automated.
- **Logs**: Real-time execution logs are tailed directly in the terminal via `npx wrangler tail`.

## Risk Register

| Risk | Source | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Node.js native API crashes on V8 Isolates | Pre-mortem | Medium | High | Audit NPM packages for C++ bindings; use `nodejs_compat` flag or Edge-native alternatives. |
| Global edge latency to single-region DB | Pre-mortem | High | Medium | Provision Supabase near the primary user base, or implement aggressive edge caching. |
| Payload size limit blocking uploads | Unknown unknowns | Low | High | Upload files directly to Cloudflare R2 using pre-signed URLs from the client. |
| CPU time limit exhaustion | Unknown unknowns | Low | High | Optimize Astro SSR rendering; offload heavy processing to background queues if necessary. |
| Astro `sharp` image processing fails | Devil's advocate | High | Medium | Explicitly configure Astro to use the `cloudflare-binding` image service. |

## Getting Started

1. Authenticate the CLI: `npx wrangler login`
2. Verify the project configuration in `wrangler.jsonc` (already scaffolded by the starter).
3. Ensure the Astro Cloudflare adapter is installed: `npm i @astrojs/cloudflare`
4. Deploy the application: `npx wrangler deploy`

## Out of Scope

The following were not evaluated in this research:
- Docker image configuration
- CI/CD pipeline setup
- Production-scale architecture (multi-region, HA, DR)
