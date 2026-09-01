# Quality Contract & Test Plan

## 1. Principles

- **Cost × Signal:** Every test must answer: *what is the cheapest test that gives a real signal for this risk?* No e2e tests unless cheaper layers fail.
- **User Concerns are Evidence:** Risks the team has lived through carry the same weight as PRD lines or hot-spot data.
- **Signal, not Knowledge:** This plan identifies risk areas based on evidence (hot-spots, docs, interviews). Code file anchors are identified later during the research phase.

## 2. Risk Map

| Risk | Failure Scenario | Impact | Likelihood | Source |
|---|---|---|---|---|
| R-01 | Silent data-loss when editing an old snapshot | High (loss of trust) | Medium | Interview Q1, PRD US-03 |
| R-02 | Dashboard crash or incorrect calculations | High (core feature broken) | High | Interview Q3, Hot-spot `src/components/NetWorthDashboard.tsx` |
| R-03 | Snapshot implicit carry-over logic breaks | High (invalid net worth) | Medium | PRD Business Logic, Roadmap S-02 |
| R-04 | Account CRUD misclassification (Asset/Liability) | Medium | Low | PRD US-01 |
| R-05 | SSR / API route failures in production (Cloudflare) | High (app offline) | Medium | AGENTS.md, Hot-spot `src/pages/api/snapshots/[id].ts` |

## 3. Phased Rollout

| Phase | Change ID | Goal | Risks Covered | Layer | Status |
|---|---|---|---|---|---|
| 1 | `test-bootstrap-snapshot-logic` | Bootstrap test runner and cover core snapshot carry-over/edit logic | R-01, R-03 | Unit / Integration | complete |
| 2 | `test-dashboard-integration` | Cover Net Worth dashboard data calculations and component stability | R-02 | Component / Integration | change opened |
| 3 | `test-accounts-api` | Cover account management and backend SSR API routes | R-04, R-05 | Integration | not started |

## 4. Stack & Constraints

- **Test Base:** `none` (No automated tests are currently configured).
- **Environment:** Node 22, Astro SSR, React 19, Supabase.

**Stack grounding tools (current session):**
- Docs: none — not available in current session; checked: 2026-08-26
- Search: `search_web` — available for general searches; checked: 2026-08-26
- Runtime/browser: none — no browser automation MCP; checked: 2026-08-26
- Provider/platform: `linear` — available for issue tracking; checked: 2026-08-26

## 5. Quality Gates

| Gate | Phase to Wire | Description |
|---|---|---|
| Linting / Formatting | Pre-existing | `npm run lint` and `npm run format` |
| Unit / Integration Tests | Phase 1 | Run on PR to `master` (requires adding to CI) |
| Component Tests | Phase 2 | Ensure dashboard renders correctly |

## 6. Cookbook

### Unit Testing Pure Logic (Phase 1)
- **Location:** Colocate test files next to the source (`src/lib/*.test.ts`).
- **Naming:** Match the source file name (`snapshot-logic.ts` -> `snapshot-logic.test.ts`).
- **Runner:** Vitest in a fast, DOM-less Node environment.
- **Reference:** `src/lib/snapshot-logic.test.ts`
- **Command:** `npm run test` or `npm run test:watch`

## 7. Negative Space (What we do NOT test)

- **External Packages:** We do not write tests for Supabase Auth or the charting library rendering (per User Interview Q5).
