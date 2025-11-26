# FinanceStats component

A reusable **Finance Statistics** component for the admin panel.

- **Tech:** React functional components + hooks, JavaScript, MUI v5, Recharts.
- **Backend:** Uses existing endpoints:
  - `GET /api/v1/finance/summary/periodic` (primary)
  - JSON shapes as in `FinancialSummaryDTO` / `PeriodicFinancialResponse`.

## Installation

Dependencies (if not already present):

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled recharts
# or
yarn add @mui/material @mui/icons-material @emotion/react @emotion/styled recharts
