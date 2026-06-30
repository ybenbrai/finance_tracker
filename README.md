<div align="center">
  <img src="/vite.svg" width="96" height="96" alt="Finance logo" />
  <h1 align="center">Smart Finance Tracker 💰</h1>
  <p align="center">
    <strong>Personal finance tracking app — like a smart spreadsheet</strong>
    <br />
    Track income &amp; expenses by month, visualize trends, and forecast future months
  </p>
  <p align="center">
    <a href="https://ybenbrai.github.io/finance_tracker/">Live Demo</a>
    ·
    <a href="https://github.com/ybenbrai/finance_tracker/issues">Report Bug</a>
  </p>
</div>

<br />

## ✨ Features

| | |
|---|---|
| 📅 **Monthly tabs** | Add, duplicate, and delete months with ease |
| 🏷️ **Category tracking** | Editable labels and icons for every expense category |
| 🧮 **Auto calculations** | Total expenses, monthly remaining cash, cumulative savings |
| 🔮 **Forecast engine** | Weighted average + trend adjustment for future months |
| 💸 **Recurring benefits** | Tracked separately from cash savings |
| 📊 **Interactive charts** | Pie chart (expenses), line chart (savings/benefits trends) |
| 📁 **Import / Export** | JSON and CSV support |
| 💱 **Currency switcher** | Switch between multiple currencies |
| 🌍 **Multi-language** | English, Français, العربية, Español, Русский |
| 📅 **Locale-aware** | Month names and number/currency formatting |
| ↔️ **RTL support** | Arabic mirrored layout |
| 📱 **Responsive** | Desktop and mobile ready |

## 🛠️ Tech Stack

| | |
|---|---|
| **Framework** | [React 19](https://react.dev/) |
| **Build tool** | [Vite 7](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Linting** | [ESLint](https://eslint.org/) |
| **Package manager** | [npm](https://www.npmjs.com/) |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+

### Install & Run

```bash
npm install
npm run dev        # http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
├── .github/
│   └── workflows/    # GitHub Actions (deploy-pages.yml)
├── src/
│   ├── components/   # React components (tabs, cards, charts, modals, panels)
│   │   └── charts/   # Recharts chart components
│   ├── utils/        # Date helpers, forecast engine, formatting utilities
│   ├── assets/       # Static assets
│   ├── App.jsx       # Root component
│   ├── constants.js  # App-wide constants
│   ├── i18n.js       # Multi-language setup
│   ├── index.css     # Tailwind entry point
│   └── main.jsx      # App entry point
├── public/           # Static assets served at root
├── vite.config.js
└── eslint.config.js
```

## 💾 Data & Persistence

- All data is persisted in **browser `localStorage`** — no server required.
- Back up or transfer your data using **JSON / CSV import-export**.

## ⚠️ Notes

- Benefits balances are intentionally tracked separately from cash savings.
- Forecast output depends on historical data quality and should be treated as an estimate, not financial advice.

## 🌐 Deploy on GitHub Pages

This project includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that automatically deploys to GitHub Pages on every push to `main`.

Ensure the repo settings have `Source` set to `GitHub Actions` under **Settings → Pages**.

## 📄 License

MIT
