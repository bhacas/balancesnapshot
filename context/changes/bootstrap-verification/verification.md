---
bootstrapped_at: 2026-06-05T08:37:00Z
starter_id: 10x-astro-starter
starter_name: 10x Astro Starter (Astro + Supabase + Cloudflare)
project_name: balance-snapshot
language_family: js
package_manager: npm
cwd_strategy: git-clone
bootstrapper_confidence: first-class
phase_3_status: ok
audit_command: npm audit --json
---

## Hand-off

```yaml
---
starter_id: 10x-astro-starter
package_manager: npm
project_name: balance-snapshot
hints:
  language_family: js
  team_size: solo
  deployment_target: cloudflare-pages
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: first-class
  path_taken: standard
  quality_override: false
  self_check_answers: null
  has_auth: true
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
---
```

The recommended default for a Web App in JavaScript/TypeScript is 10x Astro Starter. This project is a solo effort with a short 1-week timeline, so a batteries-included, agent-friendly stack with auth, database, and edge deploy out of the box is ideal. It provides a strong typed foundation (TypeScript + Zod) and has first-class bootstrapper confidence, ensuring smooth scaffolding. Auth is required for standard login, which Supabase handles natively, while payments, realtime, AI, and background jobs are out of scope. CI runs on GitHub Actions with auto-deploy-on-merge to Cloudflare Pages.

## Pre-scaffold verification

| Signal             | Value                              | Severity | Notes                              |
| ------------------ | ---------------------------------- | -------- | ---------------------------------- |
| npm package        | not run                            | not run  | git-clone strategy                 |
| GitHub repo        | przeprogramowani/10x-astro-starter last pushed 2026-05-17T10:33:39Z | fresh    | from card.docs_url                 |

## Scaffold log

**Resolved invocation**: `git clone https://github.com/przeprogramowani/10x-astro-starter .bootstrap-scaffold && cd .bootstrap-scaffold && npm install`
**Strategy**: git-clone
**Exit code**: 0
**Files moved**: 31456
**Conflicts (.scaffold siblings)**: none
**.gitignore handling**: moved silently
**.bootstrap-scaffold cleanup**: deleted

## Post-scaffold audit

**Tool**: npm audit --json
**Summary**: 0 CRITICAL, 1 HIGH, 9 MODERATE, 0 LOW
**Direct vs transitive**: 0/0/2/0 direct of total 0/1/9/0

#### HIGH findings

- devalue: 5.6.3 - 5.8.0, GHSA-77vg-94rm-hx3p, Svelte devalue: DoS via sparse array deserialization, fix available

#### MODERATE findings

- @astrojs/check: >=0.9.3, fix available 0.9.2
- @astrojs/language-server: >=2.14.0, fix available 0.9.2
- @cloudflare/vite-plugin: <=0.0.0-fff677e35 || 0.0.7 - 1.37.2, fix available
- miniflare: <=0.0.0-fff677e35 || 3.20250204.0 - 4.20260518.0, fix available
- volar-service-yaml: <=0.0.70, fix available 0.9.2
- wrangler: <=0.0.0-kickoff-demo || 3.108.0 - 4.93.0, fix available
- ws: 8.0.0 - 8.20.0, GHSA-58qx-3vcg-4xpx, ws: Uninitialized memory disclosure, fix available
- yaml: 2.0.0 - 2.8.2, GHSA-48c2-rrv3-qjmp, yaml is vulnerable to Stack Overflow via deeply nested YAML collections, fix available 0.9.2
- yaml-language-server: 1.11.1-08d5f7b.0 - 1.21.1-f1f5a94.0 || 1.22.1-0ae5603.0 - 1.22.1-fc5f874.0, fix available 0.9.2

#### LOW / INFO findings

none

## Hints recorded but not acted on

| Hint                       | Value                              |
| -------------------------- | ---------------------------------- |
| bootstrapper_confidence    | first-class                        |
| quality_override           | false                              |
| path_taken                 | standard                           |
| self_check_answers         | null                               |
| team_size                  | solo                               |
| deployment_target          | cloudflare-pages                   |
| ci_provider                | github-actions                     |
| ci_default_flow            | auto-deploy-on-merge               |
| has_auth                   | true                               |
| has_payments               | false                              |
| has_realtime               | false                              |
| has_ai                     | false                              |
| has_background_jobs        | false                              |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified — happy hacking.

Useful manual steps in the meantime:
- `git init` (if you have not already) to start your own repo history.
- Review any `.scaffold` siblings the conflict policy created and decide which version of each file to keep.
- Address audit findings per your project's risk tolerance — the full breakdown is in this log.
