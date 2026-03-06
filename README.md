# Smart Finance Tracker

A modern personal finance web app built with React, Vite, Tailwind CSS, and Recharts.

It works like a smart spreadsheet: you track income and expenses by month, get automatic totals, visualize trends, forecast future months, and keep everything saved locally in your browser.

## Highlights

- Monthly tabs with add, duplicate, and delete actions
- Category-based expense tracking with editable labels and icons
- Automatic calculations:
  - total expenses
  - monthly remaining cash
  - cumulative savings
- Forecast engine (weighted average + trend adjustment)
- Dedicated recurring benefits tracking (separate from cash savings)
- Interactive charts:
  - expense breakdown pie chart
  - savings trend line chart
  - benefits breakdown/trend charts
- Import/Export support:
  - JSON
  - CSV
- Local persistence via browser localStorage
- Currency switcher
- Multi-language UI: English, French, Arabic, Spanish, Russian
- Locale-aware month and number/currency formatting
- RTL support for Arabic (mirrored layout behavior)
- Responsive design for desktop and mobile

## Tech Stack

- React
- Vite
- Tailwind CSS
- Recharts
- ESLint

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development

```bash
npm run dev
```

Open the local URL shown in your terminal (usually `http://localhost:5173`).

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Project Structure

```text
src/
  components/
    charts/
  utils/
  App.jsx
  i18n.js
```

## Data and Persistence

- App state is persisted in `localStorage`.
- You can back up and restore data using JSON/CSV import-export.

## Notes

- Benefits balances are intentionally tracked separately from cash savings.
- Forecast output depends on historical data quality and should be treated as an estimate, not financial advice.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
