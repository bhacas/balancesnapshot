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

## Why this stack

The recommended default for a Web App in JavaScript/TypeScript is 10x Astro Starter. This project is a solo effort with a short 1-week timeline, so a batteries-included, agent-friendly stack with auth, database, and edge deploy out of the box is ideal. It provides a strong typed foundation (TypeScript + Zod) and has first-class bootstrapper confidence, ensuring smooth scaffolding. Auth is required for standard login, which Supabase handles natively, while payments, realtime, AI, and background jobs are out of scope. CI runs on GitHub Actions with auto-deploy-on-merge to Cloudflare Pages.
