# BalanceSnapshot - MVP

## Core Problem

Complex budgeting apps (which require categorizing every transaction) quickly exhaust users, while banking apps only show a fragment of their finances. There is a lack of a simple tool that takes a "snapshot" of total wealth from all scattered sources once a month, showing the real wealth-building trend.

## Minimum Feature Set

- **Account/asset management**: Freely adding, editing, deleting, and grouping (e.g., cash, deposits, crypto).
- **Assets vs. Liabilities classification**: Ability to flag accounts as either assets (what you own) or liabilities (what you owe, e.g., credit cards, loans). The system uses this to automatically calculate the true Net Worth (Total Assets - Total Liabilities).
- **Monthly "snapshot" screen**: Allows manual entry of the current balance for each account on a given day.
- **Simple Financial Goals**: The ability to set a target amount (e.g., "Emergency Fund" or "New Car") and link specific accounts to it. The system calculates and displays the goal completion percentage with each new snapshot.
- **Reminder mechanism**: A simple system alert or email on the first day of the month, prompting the user to fill in missing balances.
- **Simple dashboard**: A line chart showing the trend of total true Net Worth over time, a pie chart showing the current asset allocation, and a progress bar for defined financial goals.

## Out of Scope for MVP

- Tracking individual transactions (income and expenses) and building a balance sheet from them.
- Direct integration with banks (Open Banking/PSD2) – this requires certificates and external providers, which would kill the agility of the MVP.
- Multi-currency support and dynamic exchange rate conversion (at launch, we assume a single base currency for the entire portfolio).
- Advanced investment forecasting or inflation calculation.

## Success Criteria

- A user is able to add 3 different accounts (including at least one liability), set up 1 financial goal, and take their first monthly "snapshot" in under 2 minutes.
- The system correctly calculates the true Net Worth and dynamically updates the goal progress upon snapshot creation.
