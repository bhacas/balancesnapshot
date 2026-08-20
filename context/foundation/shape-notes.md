---
context_type: greenfield
product_type: Web App
tech_preferences:
  language_family: TypeScript / Node
timeline_budget:
  mvp_weeks: 1
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6]
  frs_drafted: 5
  quality_check_status: accepted
---

## Vision & Problem Statement

The current landscape of budgeting apps is too high-friction, forcing people into a daily transaction grind, while banking apps are intentionally siloed. This leaves users with data trapped across multiple platforms and missing the capability to easily see their true net worth. We are building a simple tool that takes a monthly "snapshot" of total wealth from all scattered sources, providing the big picture of a user's real wealth-building trend without the exhaustion of transaction categorization.

## User & Persona

- **Primary Persona**: Salaried professionals trying to build wealth and track financial goals.

## Access Control

Standard Login (email + password / OAuth / passwordless). Flat user model (all accounts are standard users, no special admin/member roles visible to users).

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

## Functional Requirements

- FR-001: User can add, edit, and delete accounts, grouping them by type. Priority: must-have
- FR-002: User can flag accounts as either assets or liabilities. Priority: must-have
- FR-003: User can create, edit, delete, and backdate a monthly "snapshot" by manually entering the current balance for each account. Priority: must-have
- FR-004: User can view a dashboard that calculates and displays their true Net Worth. Priority: must-have
- FR-005: User can view visual charts (line/pie) representing their financial trend. Priority: nice-to-have

## User Stories

- Given I am a logged-in user, when I add an account, then it is classified correctly as an asset or liability.
- Given I have set up my accounts, when a new month begins, then I can create a snapshot by entering my current balances.
- Given I have created a snapshot, when I realize I made a mistake or forgot an account, then I can edit or delete that snapshot.
- Given I have saved snapshots, when I open the dashboard, then I see my true Net Worth calculated and charted over time.

## Business Logic

- **True Net Worth Calculation**: Net Worth must be strictly calculated as `Sum of all Assets - Sum of all Liabilities` across the latest snapshot.
- **Balance Carry-Over**: If an account balance is not explicitly entered in a new snapshot, the system must implicitly carry over the balance from the most recent snapshot.

## Data Model

- **User**: Represents the account owner.
- **Account**: Has a name, type (Asset vs. Liability), and grouping category (e.g., Cash, Crypto).
- **Snapshot**: Represents a specific point in time (e.g., month-end) belonging to a User.
- **SnapshotEntry**: Joins a Snapshot and an Account with a recorded `balance`.

## Non-Goals

- Tracking individual transactions (income/expenses).
- Direct integrations with banks (Open Banking/PSD2).
- Multi-currency support and dynamic exchange rate conversion.
- Advanced investment forecasting or inflation calculation.

## Stack Openness

- **Product Type**: Responsive Web App
- **Language Family**: TypeScript / Node (Fullstack JS/TS)
