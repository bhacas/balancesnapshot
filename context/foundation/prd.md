---
project: BalanceSnapshot
version: 1
status: draft
created: 2026-06-05
context_type: greenfield
product_type: Web App
target_scale: # TODO: target_scale — see Open Questions
timeline_budget:
  mvp_weeks: 1
---

## Vision & Problem Statement
The current landscape of budgeting apps is too high-friction, forcing people into a daily transaction grind, while banking apps are intentionally siloed. This leaves users with data trapped across multiple platforms and missing the capability to easily see their true net worth. We are building a simple tool that takes a monthly "snapshot" of total wealth from all scattered sources, providing the big picture of a user's real wealth-building trend without the exhaustion of transaction categorization.

## User & Persona
- **Primary Persona**: Salaried professionals trying to build wealth and track financial goals.

## Success Criteria

### Primary
1. User logs in.
2. User adds accounts (Assets and Liabilities).
3. User takes their first monthly "snapshot" by entering the current balances.
4. System calculates and displays their true Net Worth.

### Secondary
- Simple visual charts (line/pie) for the dashboard.

### Guardrails
- Data privacy: User financial data is strictly isolated.
- Mobile responsiveness: UI must work flawlessly on phones.

## User Stories

### US-01: User adds an account
- **Given** I am a logged-in user
- **When** I add an account
- **Then** it is classified correctly as an asset or liability

### US-02: User creates a snapshot
- **Given** I have set up my accounts
- **When** a new month begins
- **Then** I can create a snapshot by entering my current balances

### US-03: User edits or deletes a snapshot
- **Given** I have created a snapshot
- **When** I realize I made a mistake or forgot an account
- **Then** I can edit or delete that snapshot

### US-04: User views the dashboard
- **Given** I have saved snapshots
- **When** I open the dashboard
- **Then** I see my true Net Worth calculated and charted over time

## Functional Requirements
- FR-001: User can add, edit, and delete accounts, grouping them by type. Priority: must-have
- FR-002: User can flag accounts as either assets or liabilities. Priority: must-have
- FR-003: User can create, edit, delete, and backdate a monthly "snapshot" by manually entering the current balance for each account. Priority: must-have
- FR-004: User can view a dashboard that calculates and displays their true Net Worth. Priority: must-have
- FR-005: User can view visual charts (line/pie) representing their financial trend. Priority: nice-to-have

## Non-Functional Requirements
# TODO: Non-Functional Requirements — see Open Questions

## Business Logic
Net Worth must be strictly calculated as `Sum of all Assets - Sum of all Liabilities` across the latest snapshot. If an account balance is not explicitly entered in a new snapshot, the system must implicitly carry over the balance from the most recent snapshot.

## Access Control
Standard Login (email + password / OAuth / passwordless). Flat user model (all accounts are standard users, no special admin/member roles visible to users).

## Non-Goals
- Tracking individual transactions (income/expenses).
- Direct integrations with banks (Open Banking/PSD2).
- Multi-currency support and dynamic exchange rate conversion.
- Advanced investment forecasting or inflation calculation.

## Open Questions
1. **target_scale** — What is the expected scale (users, qps, data_volume)?
2. **Non-Functional Requirements** — What are the measurable performance, availability, or operational targets?
